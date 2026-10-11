// public/js/state.js
// RAKSHA Global Reactive State with Real Location & Real-time Synchronization

class RakshaState {
  constructor() {
    this.currentScreen = 'screen-1';
    this.language = 'EN'; // 'EN' | 'HI'
    this.is2GMode = false;
    this.userLocation = null;
    this.searchRadiusKm = 15;
    this.currentUser = null;

    try {
      const savedRad = localStorage.getItem('raksha_search_radius');
      if (savedRad) this.searchRadiusKm = parseFloat(savedRad) || 15;
      const savedLoc = localStorage.getItem('raksha_user_location');
      if (savedLoc) this.userLocation = JSON.parse(savedLoc);
    } catch (e) {}

    this.activeCase = null;
    this.activeReferral = null;
    this.facilities = [];
    this.doctors = [];
    this.patientProfile = null;
    this.ashaData = null;
    this.analytics = null;

    // Triage Wizard in-progress state
    this.triage = {
      role: 'self',
      symptoms: ['fever'],
      dangerFlags: [],
      result: null
    };

    this.listeners = new Set();
    this.isLoadingFacilities = false;
    this.requestIdCounter = 0;

    // Register WebSocket event listeners
    if (window.rakshaApi) {
      window.rakshaApi.onWsMessage((msg) => this.handleWsMessage(msg));
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this);
      } catch (err) {
        console.error(err);
      }
    }
  }

  setScreen(screenId) {
    this.currentScreen = screenId;
    window.location.hash = screenId;
    this.notify();
  }

  toggleLanguage() {
    this.language = this.language === 'EN' ? 'HI' : 'EN';
    this.notify();
  }

  async setLocation(loc, radiusKm = null) {
    this.userLocation = loc;
    if (radiusKm != null) {
      this.searchRadiusKm = Number(radiusKm) || 15;
    }

    try {
      localStorage.setItem('raksha_user_location', JSON.stringify(loc));
      if (radiusKm != null) {
        localStorage.setItem('raksha_search_radius', String(this.searchRadiusKm));
      }
    } catch (e) {}

    this.isLoadingFacilities = true;
    this.notify();

    const currentReqId = ++this.requestIdCounter;

    try {
      const rad = this.searchRadiusKm || 15;
      const [facRes, docsRes] = await Promise.all([
        window.rakshaApi.getNearbyFacilities(loc.lat, loc.lon, rad),
        window.rakshaApi.getDoctors({ lat: loc.lat, lon: loc.lon, radiusKm: rad })
      ]);

      if (currentReqId === this.requestIdCounter) {
        this.facilities = facRes.facilities || [];
        this.doctors = docsRes.doctors || [];
        this.isLoadingFacilities = false;
        this.notify();
      }
    } catch (err) {
      console.error('[State] Location data fetch error:', err);
      if (currentReqId === this.requestIdCounter) {
        this.isLoadingFacilities = false;
        this.notify();
      }
    }
  }

  async setRadius(radiusKm) {
    this.searchRadiusKm = Number(radiusKm) || 15;
    try {
      localStorage.setItem('raksha_search_radius', String(this.searchRadiusKm));
    } catch (e) {}
    if (this.userLocation && this.userLocation.lat != null && this.userLocation.lon != null) {
      await this.setLocation(this.userLocation, this.searchRadiusKm);
    } else {
      this.notify();
    }
  }

  async setSearchRadius(radiusKm) {
    return this.setRadius(radiusKm);
  }

  toggle2GMode() {
    this.is2GMode = !this.is2GMode;
    if (this.is2GMode) {
      document.body.classList.add('mode-2g');
    } else {
      document.body.classList.remove('mode-2g');
    }
    this.notify();
  }

  setTriageRole(role) {
    this.triage.role = role;
    this.recalculateTriage();
  }

  toggleTriageSymptom(symptom) {
    const idx = this.triage.symptoms.indexOf(symptom);
    if (idx >= 0) {
      this.triage.symptoms.splice(idx, 1);
    } else {
      this.triage.symptoms.push(symptom);
    }
    this.recalculateTriage();
  }

  toggleTriageDangerFlag(flag) {
    const idx = this.triage.dangerFlags.indexOf(flag);
    if (idx >= 0) {
      this.triage.dangerFlags.splice(idx, 1);
    } else {
      this.triage.dangerFlags.push(flag);
    }
    this.recalculateTriage();
  }

  async recalculateTriage() {
    try {
      const res = await window.rakshaApi.assessTriage({
        role: this.triage.role,
        symptoms: this.triage.symptoms,
        dangerFlags: this.triage.dangerFlags
      });
      this.triage.result = res;
      this.notify();
    } catch (e) {
      console.error('Failed to recalculate triage', e);
    }
  }

  async loadFacilities() {
    try {
      const params = {};
      if (this.userLocation && this.userLocation.lat && this.userLocation.lon) {
        params.lat = this.userLocation.lat;
        params.lon = this.userLocation.lon;
        params.radiusKm = this.searchRadiusKm;
      }
      const res = await window.rakshaApi.getFacilities(params);
      this.facilities = res.facilities || [];
      this.notify();
    } catch (e) {
      console.error('Error fetching facilities', e);
    }
  }

  handleWsMessage(msg) {
    if (!msg || !msg.type) return;

    switch (msg.type) {
      case 'TELEMETRY_UPDATE':
        if (this.activeCase && this.activeCase.caseId === msg.data.caseId) {
          this.activeCase.telemetry = msg.data.telemetry;
          this.activeCase.etaMins = msg.data.etaMins;
          this.activeCase.speedKmH = msg.data.speedKmH;
          this.notify();
        }
        break;

      case 'EMERGENCY_DISPATCH_CREATED':
        this.activeCase = msg.data;
        this.notify();
        break;

      case 'CASE_STATUS_UPDATED':
        if (this.activeCase && this.activeCase.caseId === msg.data.caseId) {
          this.activeCase = msg.data;
          this.notify();
        }
        break;

      case 'FACILITY_SURGE_TOGGLE':
        const fac = this.facilities.find(f => f.id === msg.data.facilityId);
        if (fac) {
          fac.surgeDivertActive = msg.data.surgeDivertActive;
          this.notify();
        }
        break;

      case 'BED_COUNT_UPDATED':
        const idx = this.facilities.findIndex(f => f.id === msg.data.id);
        if (idx >= 0) {
          this.facilities[idx] = msg.data;
          this.notify();
        }
        break;

      case 'REFERRAL_STEP_ADVANCED':
        if (this.activeReferral && this.activeReferral.refId === msg.data.refId) {
          this.activeReferral = msg.data;
          this.notify();
        }
        break;

      case 'ASHA_SYNC_COMPLETED':
        if (this.ashaData) {
          this.ashaData.cachedSyncRecords = 0;
          this.ashaData.todayOverview.households = msg.data.totalHouseholds;
          this.notify();
        }
        break;

      case 'SURGE_REDEPLOY_AUTHORIZED':
        if (this.analytics) {
          this.analytics = msg.data.analytics;
          this.notify();
        }
        break;

      default:
        break;
    }
  }

  async loadInitialData() {
    try {
      if (window.rakshaGeo && window.rakshaGeo.currentLocation) {
        this.userLocation = window.rakshaGeo.currentLocation;
      }

      const rad = this.searchRadiusKm || 15;
      const uLat = this.userLocation ? this.userLocation.lat : null;
      const uLon = this.userLocation ? this.userLocation.lon : null;

      const [facRes, caseRes, refRes, patientRes, ashaRes, analyticsRes, docsRes] = await Promise.all([
        uLat != null && uLon != null
          ? window.rakshaApi.getNearbyFacilities(uLat, uLon, rad).catch(() => window.rakshaApi.getFacilities())
          : window.rakshaApi.getFacilities(),
        window.rakshaApi.getActiveCase().catch(() => null),
        window.rakshaApi.getActiveReferral().catch(() => null),
        window.rakshaApi.getPatientProfile().catch(() => null),
        window.rakshaApi.getAshaData().catch(() => null),
        window.rakshaApi.getAnalytics().catch(() => null),
        window.rakshaApi.getDoctors(uLat != null && uLon != null ? { lat: uLat, lon: uLon, radiusKm: rad } : {}).catch(() => ({ doctors: [] }))
      ]);

      this.facilities = facRes.facilities || [];
      this.activeCase = caseRes;
      this.activeReferral = refRes;
      this.patientProfile = patientRes;
      this.ashaData = ashaRes;
      this.analytics = analyticsRes;
      this.doctors = docsRes.doctors || [];

      await this.recalculateTriage();
      this.notify();
    } catch (e) {
      console.error('Error loading initial data:', e);
    }
  }
}

const state = new RakshaState();
window.rakshaState = state;
