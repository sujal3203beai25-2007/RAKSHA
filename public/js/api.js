// public/js/api.js
// RAKSHA Client API Layer with Auto-Reconnecting WebSocket & Secure Token Storage

class RakshaApi {
  constructor() {
    const isNative = Boolean(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
    const defaultBase = isNative ? 'http://10.0.2.2:3000/api' : '/api';
    this.baseUrl = window.RAKSHA_API_BASE_URL || localStorage.getItem('raksha_api_base_url') || defaultBase;
    this.ws = null;
    this.wsListeners = new Set();
    this.reconnectTimer = null;
    this.token = localStorage.getItem('raksha_auth_token') || null;
    this.initWebSocket();
  }

  setBaseUrl(url) {
    this.baseUrl = (url || '/api').replace(/\/+$/, '');
    localStorage.setItem('raksha_api_base_url', this.baseUrl);
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
    }
    clearTimeout(this.reconnectTimer);
    this.initWebSocket();
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('raksha_auth_token', token);
    } else {
      localStorage.removeItem('raksha_auth_token');
    }
  }

  async checkConnection(targetUrl = null) {
    const base = (targetUrl || this.baseUrl).replace(/\/+$/, '');
    const url = base + '/health';
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      const data = await res.json().catch(() => ({}));
      return {
        ok: res.ok,
        status: data.status || (res.ok ? 'online' : 'error'),
        db: data.db || 'unknown',
        latencyMs: Date.now() - start
      };
    } catch (err) {
      return {
        ok: false,
        error: err.name === 'AbortError' ? 'Connection timed out' : err.message,
        latencyMs: Date.now() - start
      };
    }
  }

  // WebSocket Connection
  initWebSocket() {
    let wsUrl;
    if (this.baseUrl.startsWith('http://') || this.baseUrl.startsWith('https://')) {
      wsUrl = this.baseUrl.replace(/^http/, 'ws').replace(/\/api\/?$/, '');
    } else {
      // Relative URL on web
      if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
        console.warn('[RAKSHA Client] Native mobile app requires an explicit backend URL for WebSockets.');
        return;
      }
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${window.location.host}`;
    }

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[RAKSHA Client] WebSocket connected to telemetry stream at', wsUrl);
        clearTimeout(this.reconnectTimer);
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          this.notifyWsListeners(payload);
        } catch (e) {
          console.error('[RAKSHA Client] Error parsing WS message', e);
        }
      };

      this.ws.onclose = () => {
        this.reconnectTimer = setTimeout(() => this.initWebSocket(), 4000);
      };

      this.ws.onerror = (err) => {
        console.warn('[RAKSHA Client] WebSocket connection notice (retrying automatically)');
      };
    } catch (e) {
      this.reconnectTimer = setTimeout(() => this.initWebSocket(), 4000);
    }
  }

  onWsMessage(callback) {
    this.wsListeners.add(callback);
    return () => this.wsListeners.delete(callback);
  }

  notifyWsListeners(payload) {
    for (const listener of this.wsListeners) {
      try {
        listener(payload);
      } catch (err) {
        console.error(err);
      }
    }
  }

  // HTTP Helper
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `HTTP Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request to ${endpoint} failed:`, error.message);
      throw error;
    }
  }

  // Auth Endpoints
  async register(userData) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  async login(identifier, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Geolocation
  async reverseGeocode(lat, lon) {
    return this.request(`/geo/reverse?lat=${lat}&lon=${lon}`);
  }

  async searchLocation(q) {
    const res = await this.request(`/geo/search?q=${encodeURIComponent(q)}`);
    return res.results || [];
  }

  // Facilities
  async getFacilities({ filter = 'all', search = '', district = '', lat = null, lon = null, radiusKm = null } = {}) {
    const params = new URLSearchParams();
    if (filter && filter !== 'all') params.append('filter', filter);
    if (search) params.append('search', search);
    if (district) params.append('district', district);
    if (lat != null && lon != null) {
      params.append('lat', lat);
      params.append('lon', lon);
    }
    if (radiusKm) params.append('radiusKm', radiusKm);

    return this.request(`/facilities?${params.toString()}`);
  }

  async getNearbyFacilities(lat, lon, radiusKm = 15) {
    return this.request(`/facilities/nearby?lat=${lat}&lon=${lon}&radiusKm=${radiusKm}`);
  }

  async toggleSurgeDivert(facilityId, reason = 'Surge Divert') {
    return this.request(`/facilities/${facilityId}/surge-divert`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  async updateBeds(facilityId, { icuDelta, oxygenDelta, occupiedEmergencyDelta, note }) {
    return this.request(`/facilities/${facilityId}/beds`, {
      method: 'POST',
      body: JSON.stringify({ icuDelta, oxygenDelta, occupiedEmergencyDelta, note })
    });
  }

  // Doctors & Appointments
  async getDoctors(query = {}) {
    const params = new URLSearchParams();
    if (query.specialty) params.append('specialty', query.specialty);
    if (query.facilityId) params.append('facilityId', query.facilityId);
    if (query.search) params.append('search', query.search);
    if (query.lat != null) params.append('lat', query.lat);
    if (query.lon != null) params.append('lon', query.lon);
    if (query.radiusKm != null) params.append('radiusKm', query.radiusKm);
    return this.request(`/doctors?${params.toString()}`);
  }

  async bookOpdToken(options) {
    return this.request('/appointments/book', {
      method: 'POST',
      body: JSON.stringify(options)
    });
  }

  // Emergency SOS
  async triggerSos({ patientName, contactPhone, pickupLocation, lat, lon, complaint }) {
    return this.request('/emergency/sos', {
      method: 'POST',
      body: JSON.stringify({ patientName, contactPhone, pickupLocation, lat, lon, complaint })
    });
  }

  async getActiveCase(caseId) {
    const q = caseId ? `?caseId=${caseId}` : '';
    return this.request(`/emergency/active${q}`);
  }

  async updateCaseStatus(caseId, status, details = {}) {
    return this.request(`/emergency/${caseId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, details })
    });
  }

  // AI Triage
  async assessTriage({ role, symptoms, dangerFlags }) {
    return this.request('/triage/assess', {
      method: 'POST',
      body: JSON.stringify({ role, symptoms, dangerFlags })
    });
  }

  // Referrals
  async getReferrals() {
    return this.request('/referrals');
  }

  async getActiveReferral(refId) {
    const q = refId ? `?refId=${refId}` : '';
    return this.request(`/referrals/active${q}`);
  }

  async advanceReferralStep(refId) {
    return this.request(`/referrals/${refId}/advance`, { method: 'POST' });
  }

  // Patient Profile
  async getPatientProfile() {
    return this.request('/patient/profile');
  }

  // ASHA Hub
  async getAshaData() {
    return this.request('/asha');
  }

  async syncAshaRecords(visits = []) {
    return this.request('/asha/sync', {
      method: 'POST',
      body: JSON.stringify({ visits })
    });
  }

  // Admin Analytics
  async getAnalytics() {
    return this.request('/analytics');
  }

  async redeployFleet() {
    return this.request('/analytics/redeploy', { method: 'POST' });
  }

  async downloadAudit() {
    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    const res = await fetch(`${this.baseUrl}/audit/download`, { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Download failed: HTTP ${res.status}`);
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raksha-nhm-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

const api = new RakshaApi();
window.rakshaApi = api;
