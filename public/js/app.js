// public/js/app.js
// RAKSHA Main Application Controller & Shell with Real Location and Database Persistence

const SCREENS = [
  { id: 'screen-1', name: '1. Landing / SOS', label: 'Home', render: window.renderScreen1, nav: 'home' },
  { id: 'screen-2', name: '2. Patient Dashboard', label: 'Patient', render: window.renderScreen2, nav: 'home' },
  { id: 'screen-3', name: '3. Find Care', label: 'Find Care', render: window.renderScreen3, nav: 'find-care' },
  { id: 'screen-4', name: '4. AI Triage', label: 'Triage', render: window.renderScreen4, nav: 'ai-triage' },
  { id: 'screen-5', name: '5. Ambulance Tracking', label: 'Transit', render: window.renderScreen5, nav: 'transit' },
  { id: 'screen-6', name: '6. Referral Tracking', label: 'Referrals', render: window.renderScreen6, nav: 'referrals' },
  { id: 'screen-7', name: '7. Facility Beds', label: 'Hospital ER', render: window.renderScreen7, nav: 'dashboards' },
  { id: 'screen-8', name: '8. Driver Console', label: 'Ambulance Pilot', render: window.renderScreen8, nav: 'dashboards' },
  { id: 'screen-9', name: '9. ASHA Field Hub', label: 'ASHA Sangini', render: window.renderScreen9, nav: 'dashboards' },
  { id: 'screen-10', name: '10. Gap Analytics', label: 'State Observatory', render: window.renderScreen10, nav: 'dashboards' }
];

function initApp() {
  const state = window.rakshaState;

  // Read URL hash on load
  if (window.location.hash) {
    const hashId = window.location.hash.replace('#', '');
    if (SCREENS.some(s => s.id === hashId)) {
      state.currentScreen = hashId;
    }
  }

  // Subscribe to state changes
  state.subscribe((currentState) => {
    renderApp(currentState);
  });

  // Load initial backend data
  state.loadInitialData();

  // If no location saved, attempt auto-detection after 800ms
  if (!state.userLocation && navigator.geolocation) {
    setTimeout(() => {
      window.rakshaGeo.requestBrowserLocation()
        .then((loc) => {
          showNotificationToast(`GPS Location set: ${loc.locality}, ${loc.district}`);
        })
        .catch(() => {
          // Silent fallback - user can click location bar to set manually
        });
    }, 800);
  }

  // Initial render
  renderApp(state);
}

function renderApp(state) {
  const currentScreenObj = SCREENS.find(s => s.id === state.currentScreen) || SCREENS[0];
  const isHi = state.language === 'HI';
  const loc = state.userLocation;

  // 1. Render Top Persona Quick-Switcher Bar
  const roleBar = document.getElementById('roleBar');
  if (roleBar) {
    roleBar.innerHTML = `
      <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-margin-mobile">
        <span class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider shrink-0 flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px] text-primary">view_carousel</span>
          Screens:
        </span>
        ${SCREENS.map(sc => `
          <button class="role-pill-btn shrink-0 cursor-pointer ${sc.id === state.currentScreen ? 'active' : ''}" onclick="window.rakshaState.setScreen('${sc.id}')">
            ${sc.name}
          </button>
        `).join('')}
      </div>
    `;
  }

  // 2. Render Header with Real Location
  const headerContainer = document.getElementById('headerContainer');
  if (headerContainer) {
    const locationText = loc
      ? `${loc.locality || loc.district}${loc.pincode ? ' (' + loc.pincode + ')' : ''}`
      : 'Set Location / स्थान चुनें';

    headerContainer.innerHTML = `
      <div class="h-20 px-margin-mobile flex flex-col justify-between py-space-xs">
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-space-xs cursor-pointer" onclick="window.rakshaState.setScreen('screen-1')">
            <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold shadow-sm">
              <span class="material-symbols-outlined text-[20px]">shield_with_heart</span>
            </div>
            <div class="flex flex-col">
              <div class="flex items-center gap-1.5">
                <span class="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">RAKSHA</span>
                <span class="font-label-sm text-label-sm px-1.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-bold">108/112</span>
              </div>
              <span class="font-label-sm text-label-sm text-on-surface-variant truncate max-w-[130px] font-semibold">${currentScreenObj.label}</span>
            </div>
          </div>

          <div class="flex items-center gap-space-xs">
            <!-- Language Switcher -->
            <button class="min-h-[44px] px-2.5 py-1 rounded-full bg-surface-container flex items-center gap-1 text-on-surface-variant hover:text-on-surface font-label-md text-label-md cursor-pointer transition-colors" onclick="window.rakshaState.toggleLanguage()" type="button">
              <span class="${!isHi ? 'font-bold text-primary' : ''}">EN</span>
              <span class="text-outline-variant">|</span>
              <span class="${isHi ? 'font-bold text-primary' : ''}">हिंदी</span>
            </button>
            <!-- Server Connection Settings -->
            <button class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0 cursor-pointer text-primary shadow-sm hover:opacity-90" onclick="showServerConfigModal()" title="Backend Connection Settings" type="button">
              <span class="material-symbols-outlined text-[18px]">dns</span>
            </button>
            <!-- User / Role Avatar -->
            <button class="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 cursor-pointer text-on-primary shadow-sm hover:opacity-90" onclick="showRoleModal()" title="Switch Persona / Role">
              <span class="material-symbols-outlined text-[18px]">person</span>
            </button>
          </div>
        </div>

        <!-- Real Location & Sub-header -->
        <div class="flex items-center justify-between w-full px-1">
          <div class="flex items-center gap-1 cursor-pointer min-w-0" onclick="showLocationModal()" title="Change Location">
            <span class="material-symbols-outlined text-[15px] ${loc ? 'text-primary' : 'text-amber-600'} shrink-0">location_on</span>
            <span class="font-label-sm text-label-sm text-on-surface font-semibold truncate max-w-[180px]">
              ${locationText}
            </span>
            <span class="material-symbols-outlined text-[13px] text-outline shrink-0">arrow_drop_down</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1 cursor-pointer" onclick="window.rakshaState.toggle2GMode()" title="Toggle 2G Lite Mode">
              <span class="w-2 h-2 rounded-full ${state.is2GMode ? 'bg-amber-500' : 'bg-secondary'} animate-pulse"></span>
              <span class="font-label-sm text-label-sm ${state.is2GMode ? 'text-amber-800 font-bold' : 'text-secondary font-medium'}">
                ${state.is2GMode ? '2G Lite' : '2G Sync'}
              </span>
            </div>
            <div class="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm cursor-pointer" onclick="showQrModal('Aarav Sharma', '91-4821-9920-1124')">
              <span class="material-symbols-outlined text-[13px] text-primary">verified</span>
              <span>ABHA</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 3. Render Active Screen
  const mainContainer = document.getElementById('screenContainer');
  if (mainContainer && currentScreenObj.render) {
    mainContainer.innerHTML = currentScreenObj.render(state);
  }

  // 4. Render Bottom Navigation Bar
  const navContainer = document.getElementById('bottomNavContainer');
  if (navContainer) {
    const activeNav = currentScreenObj.nav;
    navContainer.innerHTML = `
      <div class="flex justify-around items-center h-16 px-space-xs">
        <button class="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors cursor-pointer ${activeNav === 'home' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}" onclick="window.rakshaState.setScreen('screen-1')">
          <span class="material-symbols-outlined text-[22px]">local_hospital</span>
          <span class="font-label-sm text-label-sm">Home</span>
        </button>

        <button class="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors cursor-pointer ${activeNav === 'find-care' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}" onclick="window.rakshaState.setScreen('screen-3')">
          <span class="material-symbols-outlined text-[22px]">near_me</span>
          <span class="font-label-sm text-label-sm">Find Care</span>
        </button>

        <button class="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors cursor-pointer ${activeNav === 'ai-triage' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}" onclick="window.rakshaState.setScreen('screen-4')">
          <span class="material-symbols-outlined text-[22px]">health_and_safety</span>
          <span class="font-label-sm text-label-sm">Triage</span>
        </button>

        <button class="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors cursor-pointer ${activeNav === 'referrals' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}" onclick="window.rakshaState.setScreen('screen-6')">
          <span class="material-symbols-outlined text-[22px]">sync_alt</span>
          <span class="font-label-sm text-label-sm">Referrals</span>
        </button>

        <button class="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors cursor-pointer ${activeNav === 'dashboards' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}" onclick="showRoleModal()">
          <span class="material-symbols-outlined text-[22px]">badge</span>
          <span class="font-label-sm text-label-sm">Roles</span>
        </button>
      </div>
    `;
  }

  // Scroll to top on screen change
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// Global Micro-interactions & Modals

function showNotificationToast(message) {
  const toast = document.getElementById('appToast');
  const toastText = document.getElementById('appToastText');
  if (!toast || !toastText) return;

  toastText.textContent = message;
  toast.classList.remove('hidden', 'translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 4000);
}

function copyAbhaId(id) {
  navigator.clipboard?.writeText(id);
  showNotificationToast(`ABHA ID ${id} copied to clipboard!`);
}

function logDial(service) {
  showNotificationToast(`Calling ${service} emergency direct link...`);
}

// Location Modals & Geolocation Handlers
function showLocationModal() {
  const modal = document.getElementById('locationModal');
  if (modal) modal.classList.remove('hidden');
}

function closeLocationModal() {
  const modal = document.getElementById('locationModal');
  if (modal) modal.classList.add('hidden');
}

async function detectUserGpsLocation() {
  closeLocationModal();
  showNotificationToast("Accessing device GPS coordinates...");

  try {
    const loc = await window.rakshaGeo.requestBrowserLocation();
    showNotificationToast(`Location Detected: ${loc.locality}, ${loc.district} (${loc.state})`);
  } catch (err) {
    showNotificationToast(err.message);
    showLocationModal();
  }
}

let locationSearchDebounce = null;

function handleLocationInput(val) {
  clearTimeout(locationSearchDebounce);
  const container = document.getElementById('locationSearchResults');
  if (!container) return;

  const query = val ? val.trim() : '';
  if (query.length < 2) {
    container.classList.add('hidden');
    container.innerHTML = '';
    return;
  }

  locationSearchDebounce = setTimeout(async () => {
    try {
      const results = await window.rakshaApi.searchLocation(query);
      if (results && results.length > 0) {
        container.innerHTML = results.map(item => `
          <button class="w-full text-left p-2 rounded-lg hover:bg-surface-container-high text-on-surface flex flex-col cursor-pointer transition-colors" onclick="selectLocationObj(${JSON.stringify(item).replace(/"/g, '&quot;')})">
            <span class="font-label-md text-label-md font-bold text-primary truncate">${item.locality || item.displayName.split(',')[0]}</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant truncate text-[11px]">${item.displayName}</span>
          </button>
        `).join('');
        container.classList.remove('hidden');
      } else {
        container.innerHTML = `<div class="p-2 text-[11px] text-on-surface-variant text-center">No matching location found.</div>`;
        container.classList.remove('hidden');
      }
    } catch (e) {
      container.classList.add('hidden');
    }
  }, 350);
}

async function selectLocationObj(item) {
  const container = document.getElementById('locationSearchResults');
  if (container) container.classList.add('hidden');
  closeLocationModal();

  showNotificationToast(`Setting location: ${item.locality || item.displayName.split(',')[0]}...`);
  try {
    const loc = await window.rakshaGeo.setManualLocation(item);
    showNotificationToast(`Location Active: ${loc.locality}, ${loc.district} ${loc.pincode}`);
  } catch (err) {
    showNotificationToast(err.message);
  }
}

async function selectPresetLocation(query) {
  const input = document.getElementById('manualLocationInput');
  if (input) input.value = query;
  const container = document.getElementById('locationSearchResults');
  if (container) container.classList.add('hidden');

  closeLocationModal();
  showNotificationToast(`Resolving location: "${query}"...`);

  try {
    const loc = await window.rakshaGeo.setManualLocation(query);
    showNotificationToast(`Location Active: ${loc.locality}, ${loc.district} ${loc.pincode}`);
  } catch (err) {
    showNotificationToast(err.message);
    showLocationModal();
  }
}

async function submitManualLocation() {
  const input = document.getElementById('manualLocationInput');
  const query = input ? input.value : '';
  if (!query) {
    showNotificationToast("Please enter a village, district, or PIN code.");
    return;
  }

  const container = document.getElementById('locationSearchResults');
  if (container) container.classList.add('hidden');

  closeLocationModal();
  showNotificationToast(`Resolving location: "${query}"...`);

  try {
    const loc = await window.rakshaGeo.setManualLocation(query);
    showNotificationToast(`Location set: ${loc.locality}, ${loc.district} ${loc.pincode}`);
  } catch (err) {
    showNotificationToast(err.message);
    showLocationModal();
  }
}

function setAppRadius(radiusKm, btn) {
  window.rakshaGeo.setSearchRadius(radiusKm);

  // Update active button state
  document.querySelectorAll('#radiusButtonsGroup .radius-btn').forEach(b => {
    b.classList.remove('bg-primary', 'text-on-primary', 'font-bold');
    b.classList.add('bg-surface-container', 'text-on-surface', 'font-semibold');
  });

  if (btn) {
    btn.classList.add('bg-primary', 'text-on-primary', 'font-bold');
    btn.classList.remove('bg-surface-container', 'text-on-surface');
  }

  showNotificationToast(`Search radius updated to ${radiusKm} km.`);
}

function showLocationPrompt() {
  showLocationModal();
}

function showQrModal(name, abhaId) {
  const modal = document.getElementById('qrModal');
  if (!modal) return;
  document.getElementById('qrModalName').textContent = name;
  document.getElementById('qrModalAbha').textContent = abhaId;
  modal.classList.remove('hidden');
}

function closeQrModal() {
  const modal = document.getElementById('qrModal');
  if (modal) modal.classList.add('hidden');
}

function showTeleconsultModal() {
  showNotificationToast("Connecting to eSanjeevani 2.0 National Telemedicine Node. Dr. V. Sen queued (Wait time: 2 mins).");
}

function showRoleModal() {
  const modal = document.getElementById('roleModal');
  if (modal) modal.classList.remove('hidden');
}

function closeRoleModal() {
  const modal = document.getElementById('roleModal');
  if (modal) modal.classList.add('hidden');
}

// Emergency SOS Trigger with Audio Tone Synthesizer
function playEmergencyTone() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3);
    osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.8);
  } catch (e) {
    console.log('Audio Context not available');
  }
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
window.escapeHtml = escapeHtml;

function triggerSosModal() {
  playEmergencyTone();
  if (navigator.vibrate) {
    navigator.vibrate([100, 50, 200, 50, 300]);
  }

  const modal = document.getElementById('sosModal');
  if (modal) {
    const loc = window.rakshaState ? window.rakshaState.userLocation : null;
    const locDesc = loc ? (loc.displayName || `${loc.locality}, ${loc.district}`) : 'GPS Coordinates (Current Device)';
    const locEl = modal.querySelector('p strong');
    if (locEl) locEl.textContent = locDesc;
    modal.classList.remove('hidden');
  }
}

function closeSosModal() {
  const modal = document.getElementById('sosModal');
  if (modal) modal.classList.add('hidden');
}

async function confirmSosDispatch() {
  closeSosModal();
  showNotificationToast("PERSISTING EMERGENCY SOS CASE IN NATIONAL REGISTRY...");

  const state = window.rakshaState || {};
  const loc = state.userLocation;
  const pickupLocation = loc ? (loc.displayName || `${loc.locality}, ${loc.district}`) : "Current GPS Detected Location";
  const lat = loc ? loc.lat : null;
  const lon = loc ? loc.lon : null;

  const profile = state.patientProfile || {};
  const user = state.currentUser || {};
  const patientName = user.name || profile.name || "Aarav Sharma";
  const contactPhone = user.phone || profile.emergencyContact || "+91 98110 44210";

  try {
    const res = await window.rakshaApi.triggerSos({
      patientName,
      contactPhone,
      pickupLocation,
      lat,
      lon,
      complaint: "Acute Emergency SOS Trigger"
    });

    window.rakshaState.activeCase = res.case;
    showNotificationToast(`Case #${res.case.caseId} Created in SQLite! Dial 112/108 if immediate life threat.`);

    setTimeout(() => {
      window.rakshaState.setScreen('screen-5');
    }, 800);
  } catch (e) {
    showNotificationToast("Error logging SOS: " + e.message);
    window.rakshaState.setScreen('screen-5');
  }
}

// Appointment Booking Modal Handlers
function showAppointmentModal(facilityId, facilityName) {
  const modal = document.getElementById('appointmentModal');
  if (!modal) return;

  if (facilityId && (facilityId.startsWith('osm-') || facilityId.startsWith('nom-'))) {
    showNotificationToast("Direct OPD token booking is available for verified empanelled hospitals in the national directory. For external map listings, please use Call or Directions.");
    return;
  }

  document.getElementById('bookingFacilityId').value = facilityId || 'safdarjung';
  document.getElementById('bookingFacilityName').value = facilityName || 'Safdarjung Hospital';
  modal.classList.remove('hidden');
}

function closeAppointmentModal() {
  const modal = document.getElementById('appointmentModal');
  if (modal) modal.classList.add('hidden');
}

async function submitAppointmentForm(event) {
  event.preventDefault();
  const facilityId = document.getElementById('bookingFacilityId').value;
  const department = document.getElementById('bookingDepartment').value;
  const patientName = document.getElementById('bookingPatientName').value;
  const patientPhone = document.getElementById('bookingPhone').value;
  const slot = document.getElementById('bookingSlot').value;

  if (!patientName || patientName.trim().length < 2) {
    showNotificationToast("Please enter a valid patient full name.");
    return;
  }
  if (!patientPhone || !/^\+?[0-9\s\-]{8,15}$/.test(patientPhone.trim())) {
    showNotificationToast("Please enter a valid patient contact phone number.");
    return;
  }

  showNotificationToast("Booking OPD slot in hospital registry...");

  try {
    const res = await window.rakshaApi.bookOpdToken({
      facilityId,
      department,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      appointmentDate: "Tomorrow",
      timeSlot: slot,
      reason: "OPD Consultation"
    });

    closeAppointmentModal();
    showNotificationToast(`OPD Confirmed! Token #${res.token.tokenNumber}. Slot: ${slot}. Record saved to SQLite.`);
    if (window.rakshaState && window.rakshaState.loadInitialData) {
      window.rakshaState.loadInitialData();
    }
  } catch (err) {
    showNotificationToast("Booking error: " + err.message);
  }
}

// ASHA Visit Registration Modal Handlers
function showAshaVisitModal() {
  const modal = document.getElementById('ashaVisitModal');
  if (modal) modal.classList.remove('hidden');
}

function closeAshaVisitModal() {
  const modal = document.getElementById('ashaVisitModal');
  if (modal) modal.classList.add('hidden');
}

async function submitAshaVisitForm(event) {
  event.preventDefault();
  const villageName = document.getElementById('ashaVillage').value;
  const householdHead = document.getElementById('ashaHead').value;
  const memberName = document.getElementById('ashaMember').value;
  const age = parseInt(document.getElementById('ashaAge').value, 10);
  const gender = document.getElementById('ashaGender').value;
  const visitType = document.getElementById('ashaVisitType').value;
  const bpReading = document.getElementById('ashaBp').value;
  const bloodSugar = document.getElementById('ashaSugar').value;
  const notes = document.getElementById('ashaNotes').value;

  closeAshaVisitModal();
  showNotificationToast("Syncing household visit record to database...");

  try {
    const newVisit = {
      id: `v-${Date.now()}`,
      villageName,
      wardNo: "Ward 4",
      householdHead,
      memberName,
      age,
      gender,
      visitType,
      symptoms: notes || "Routine follow-up",
      bpReading,
      bloodSugar,
      referralSuggested: notes || "None",
      visitDate: new Date().toISOString().slice(0, 10)
    };

    const res = await window.rakshaApi.syncAshaRecords([newVisit]);
    showNotificationToast(`Household visit for ${memberName} saved & synced to national registry!`);
    window.rakshaState.loadInitialData();
  } catch (err) {
    showNotificationToast("Sync error: " + err.message);
  }
}

// Server Config Modal Handlers for Mobile & Local Dev
function showServerConfigModal() {
  const modal = document.getElementById('serverConfigModal');
  const input = document.getElementById('serverBaseUrlInput');
  if (!modal || !input) return;
  input.value = window.rakshaApi.baseUrl;
  testServerConnection();
  modal.classList.remove('hidden');
}

function closeServerConfigModal() {
  const modal = document.getElementById('serverConfigModal');
  if (modal) modal.classList.add('hidden');
}

function setServerPreset(url) {
  const input = document.getElementById('serverBaseUrlInput');
  if (input) {
    input.value = url;
    testServerConnection();
  }
}

async function testServerConnection() {
  const input = document.getElementById('serverBaseUrlInput');
  const statusText = document.getElementById('serverStatusText');
  if (!input || !statusText) return;

  const targetUrl = input.value.trim();
  statusText.innerHTML = '<span class="text-on-surface-variant animate-pulse">Testing connection...</span>';

  const res = await window.rakshaApi.checkConnection(targetUrl);
  if (res.ok) {
    statusText.innerHTML = '<span class="text-secondary font-bold inline-flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-secondary"></span> Connected (' + res.latencyMs + 'ms, DB: ' + escapeHtml(res.db) + ')</span>';
  } else {
    statusText.innerHTML = '<span class="text-tertiary font-bold inline-flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-tertiary"></span> Offline (' + escapeHtml(res.error || 'Failed') + ')</span>';
  }
}

function saveServerConfig() {
  const input = document.getElementById('serverBaseUrlInput');
  if (!input) return;
  const newUrl = input.value.trim();
  if (!newUrl) {
    showNotificationToast('Please provide a valid server URL');
    return;
  }
  window.rakshaApi.setBaseUrl(newUrl);
  closeServerConfigModal();
  showNotificationToast('Backend server URL saved: ' + newUrl);
  window.rakshaState.loadInitialData();
}

// Android Hardware / Gesture Back Navigation Handler
if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
  window.Capacitor.Plugins.App.addListener('backButton', () => {
    const openModals = ['serverConfigModal', 'sosModal', 'qrModal', 'roleModal', 'locationModal', 'appointmentModal', 'ashaVisitModal', 'teleconsultModal'];
    for (const id of openModals) {
      const el = document.getElementById(id);
      if (el && !el.classList.contains('hidden')) {
        el.classList.add('hidden');
        return;
      }
    }
    if (window.rakshaState && window.rakshaState.currentScreen !== 'screen-1') {
      window.rakshaState.setScreen('screen-1');
      return;
    }
    window.Capacitor.Plugins.App.exitApp();
  });
}

// Expose globals
window.initApp = initApp;
window.showNotificationToast = showNotificationToast;
window.copyAbhaId = copyAbhaId;
window.logDial = logDial;
window.showLocationModal = showLocationModal;
window.closeLocationModal = closeLocationModal;
window.detectUserGpsLocation = detectUserGpsLocation;
window.submitManualLocation = submitManualLocation;
window.handleLocationInput = handleLocationInput;
window.selectLocationObj = selectLocationObj;
window.selectPresetLocation = selectPresetLocation;
window.setAppRadius = setAppRadius;
window.showLocationPrompt = showLocationPrompt;
window.showQrModal = showQrModal;
window.closeQrModal = closeQrModal;
window.showTeleconsultModal = showTeleconsultModal;
window.showRoleModal = showRoleModal;
window.closeRoleModal = closeRoleModal;
window.triggerSosModal = triggerSosModal;
window.closeSosModal = closeSosModal;
window.confirmSosDispatch = confirmSosDispatch;
window.showAppointmentModal = showAppointmentModal;
window.closeAppointmentModal = closeAppointmentModal;
window.submitAppointmentForm = submitAppointmentForm;
window.showAshaVisitModal = showAshaVisitModal;
window.closeAshaVisitModal = closeAshaVisitModal;
window.submitAshaVisitForm = submitAshaVisitForm;
window.showServerConfigModal = showServerConfigModal;
window.closeServerConfigModal = closeServerConfigModal;
window.setServerPreset = setServerPreset;
window.testServerConnection = testServerConnection;
window.saveServerConfig = saveServerConfig;

document.addEventListener('DOMContentLoaded', initApp);
