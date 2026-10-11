// public/js/screens/screen8_driver.js
// Screen 8: Ambulance Driver & EMT Tactical Console

function renderScreen8(state) {
  const c = state.activeCase || {
    caseId: "EMG-8821",
    status: "DISPATCHED",
    etaMins: 6,
    distanceKm: 3.4,
    patientName: "Rameshwar Lal",
    patientAge: 58,
    abhaId: "91-2384-9912",
    telemetry: { spo2: 91, o2PressureBar: 85, defibArmed: true }
  };

  return `
    <div class="flex flex-col w-full gap-space-sm px-margin-mobile pb-space-lg select-none">
      <!-- Active Dispatch Alert Strip (Emergency State) -->
      <div class="relative overflow-hidden rounded-xl bg-tertiary-container text-on-tertiary-container p-space-sm shadow-md animate-pulse">
        <div class="flex items-center justify-between gap-space-xs">
          <div class="flex items-center gap-2 min-w-0">
            <span class="material-symbols-outlined text-white text-[24px] shrink-0" style="font-variation-settings: 'FILL' 1;">emergency</span>
            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="font-headline-sm text-headline-sm uppercase tracking-wide leading-tight text-white font-bold">CASE #${c.caseId}</span>
                <span class="px-2 py-0.5 rounded-full bg-surface-container-lowest text-tertiary font-label-sm text-label-sm font-bold uppercase tracking-wider">Code Red ALS</span>
              </div>
              <span class="font-label-sm text-label-sm text-tertiary-fixed font-medium truncate">ALS Vehicle #44 • Priority High Dispatch</span>
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0 bg-black/20 px-2 py-1 rounded-lg">
            <span class="material-symbols-outlined text-yellow-300 text-[18px]">volume_up</span>
            <span class="font-label-sm text-label-sm font-bold text-white tracking-wider">SIREN ON</span>
          </div>
        </div>
      </div>

      <!-- Route & Next Turn Hero Guidance Card -->
      <div class="rounded-xl bg-surface-container-lowest shadow-sm p-space-md flex flex-col gap-space-sm relative overflow-hidden">
        <!-- Top Telemetry Pill Bar -->
        <div class="flex items-center justify-between bg-surface-container-low px-3 py-2 rounded-lg">
          <div class="flex items-center gap-1.5 text-primary">
            <span class="material-symbols-outlined text-[20px]">near_me</span>
            <span class="font-label-md text-label-md font-bold uppercase">Live Nav</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-baseline gap-1">
              <span class="font-display-hero-mobile text-display-hero-mobile font-bold text-on-surface leading-none">${c.etaMins}</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant font-semibold">MIN ETA</span>
            </div>
            <span class="text-outline-variant font-body-sm text-body-sm">•</span>
            <span class="font-label-md text-label-md font-bold text-on-surface-variant">${c.distanceKm} km</span>
          </div>
        </div>

        <!-- Simulated Turn-by-Turn Instruction Banner -->
        <div class="flex items-center gap-3 bg-inverse-surface text-inverse-on-surface p-3.5 rounded-xl">
          <div class="w-12 h-12 rounded-lg bg-surface-tint flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-on-primary text-[32px]">turn_left</span>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="font-label-sm text-label-sm text-primary-fixed-dim uppercase tracking-wider font-bold">In 400 Meters</span>
            <span class="font-headline-sm text-headline-sm font-bold text-white leading-tight truncate">Turn left to Delhi-Jaipur Expy</span>
          </div>
        </div>

        <!-- Map Canvas Display -->
        <div class="w-full h-36 bg-cover bg-center rounded-lg shadow-inner relative flex flex-col justify-between p-2.5 overflow-hidden" data-location="Bilaspur NH-48 Gurugram Haryana" style="background-image: url('/images/driver_route.jpg'), url('https://lh3.googleusercontent.com/aida-public/AB6AXuAMsDCRVGhj0reXXzHeUVgEHlwlZNhC8kYBpSpNLrHxyes_XSCrCsDqFcemQYXEyHIu2hAz4EIjTYPNPxHuJl5gaOhwgfD64R7MR8--yR-s88HuL2PI_hNl3ywRDgJbgkM3fEFP9yj_cn87YERFoUo8hbkYqG0BVW_yjiVwf57p1Ph7teBuJ6W-s4toED2mH1XkT6y-uJ3q38YbRq8Olwn6cMjb8TLqnOR0OnGsB5DtYM1A8Hphp61dwA')">
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none"></div>
          <div class="relative z-10 self-start">
            <span class="inline-flex items-center gap-1 bg-surface-container-lowest/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-secondary font-label-sm text-label-sm font-bold shadow-sm">
              <span class="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
              GPS Optimal Lock
            </span>
          </div>
          <div class="relative z-10 flex items-center gap-1.5 bg-surface-container-lowest/95 backdrop-blur-sm p-1.5 rounded-lg shadow-sm">
            <span class="material-symbols-outlined text-secondary text-[18px]">traffic</span>
            <span class="font-label-sm text-label-sm text-on-surface font-semibold truncate">
              Green Corridor: 112 Signal Override Granted
            </span>
          </div>
        </div>
      </div>

      <!-- Critical Patient & Location Dossier -->
      <div class="rounded-xl bg-surface-container-lowest shadow-sm p-space-md flex flex-col gap-space-sm">
        <div class="flex items-start justify-between gap-space-xs">
          <div class="flex flex-col min-w-0">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Patient Details</span>
            <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface truncate">${c.patientName}</h2>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm font-bold text-on-surface">${c.patientAge} / Male</span>
              <span class="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">ABHA #${c.abhaId}</span>
            </div>
          </div>
          <div class="flex flex-col items-end shrink-0">
            <span class="px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold animate-pulse">
              Critical SpO2: ${c.telemetry.spo2}%
            </span>
          </div>
        </div>

        <!-- Medical Complaint Banner -->
        <div class="bg-surface-container-low rounded-lg p-2.5 flex items-start gap-2">
          <span class="material-symbols-outlined text-tertiary text-[20px] shrink-0 mt-0.5">vital_signs</span>
          <div class="flex flex-col">
            <span class="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase">Reported Emergency</span>
            <span class="font-body-md text-body-md font-semibold text-on-surface">Acute Sub-sternal Chest Pain, Dyspnea • Cardiac Alert</span>
          </div>
        </div>

        <!-- Pickup Point Card with Large Landmark Reference -->
        <div class="flex items-start gap-2.5 bg-surface-container-high/60 p-2.5 rounded-lg">
          <span class="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">location_on</span>
          <div class="flex flex-col min-w-0">
            <span class="font-label-sm text-label-sm text-primary font-bold uppercase">Pickup Landmark</span>
            <p class="font-body-md text-body-md font-medium text-on-surface line-clamp-2">
              Near Govt Primary School, Village Bilaspur, NH-48 Service Road
            </p>
          </div>
        </div>
      </div>

      <!-- Large-Format Ergonomic Tactile Action Buttons -->
      <div class="flex flex-col gap-2.5 pt-space-xs">
        <!-- Big Action 1: Scene Arrival -->
        <button class="w-full min-h-[58px] bg-secondary active:scale-[0.98] transition-transform text-on-secondary rounded-xl px-4 py-3 shadow-md flex items-center justify-between cursor-pointer" id="btn-scene-arrived" onclick="triggerSceneArrived('${c.caseId}')" type="button">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[24px]">pin_drop</span>
            </div>
            <div class="flex flex-col text-left">
              <span class="font-title-md text-title-md font-bold tracking-tight uppercase leading-snug">ARRIVED AT SCENE</span>
              <span class="font-label-sm text-label-sm text-secondary-container font-medium">रोगी के पास पहुंचे • Time Logged</span>
            </div>
          </div>
          <span class="material-symbols-outlined text-[24px]">chevron_right</span>
        </button>

        <!-- Big Action 2: On-board / Vitals Active -->
        <button class="w-full min-h-[58px] bg-primary active:scale-[0.98] transition-transform text-on-primary rounded-xl px-4 py-3 shadow-md flex items-center justify-between cursor-pointer" id="btn-patient-board" onclick="triggerPatientBoarded('${c.caseId}')" type="button">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[24px]">airline_seat_flat</span>
            </div>
            <div class="flex flex-col text-left">
              <span class="font-title-md text-title-md font-bold tracking-tight uppercase leading-snug">PATIENT ON-BOARD</span>
              <span class="font-label-sm text-label-sm text-primary-fixed-dim font-medium">Telemetry & Vitals Live Stream to ER</span>
            </div>
          </div>
          <span class="material-symbols-outlined text-[24px]">sensors</span>
        </button>

        <!-- Big Action 3: Incident / Route Delay Reporter -->
        <button class="w-full min-h-[52px] bg-surface-container-highest text-tertiary active:scale-[0.98] transition-transform rounded-xl px-4 py-2.5 flex items-center justify-between cursor-pointer" id="btn-route-delay" onclick="triggerRouteDelay('${c.caseId}')" type="button">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-[22px] text-tertiary">report_problem</span>
            <div class="flex flex-col text-left">
              <span class="font-label-lg text-label-lg font-bold uppercase text-tertiary">REPORT ROUTE BLOCK / DELAY</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant font-medium">Notify Police Highway Patrol & HQ</span>
            </div>
          </div>
          <span class="material-symbols-outlined text-[20px] text-tertiary">warning</span>
        </button>
      </div>

      <!-- Direct Rapid Communications Strip -->
      <div class="grid grid-cols-2 gap-space-xs pt-1">
        <a class="min-h-[52px] rounded-xl bg-surface-container p-3 flex items-center gap-2.5 active:bg-surface-variant transition-colors cursor-pointer" href="tel:+919876543210" onclick="logDial('Caller Contact')">
          <div class="w-9 h-9 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center shrink-0 shadow-sm">
            <span class="material-symbols-outlined text-[20px]">call</span>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="font-label-sm text-label-sm text-on-surface-variant font-semibold">Caller Contact</span>
            <span class="font-label-md text-label-md font-bold text-on-surface truncate">+91-98765-XXXX</span>
          </div>
        </a>

        <button class="min-h-[52px] rounded-xl bg-surface-container p-3 flex items-center gap-2.5 text-left active:bg-surface-variant transition-colors cursor-pointer" id="btn-er-radio" onclick="triggerErRadio()" type="button">
          <div class="w-9 h-9 rounded-full bg-surface-container-lowest text-tertiary flex items-center justify-center shrink-0 shadow-sm">
            <span class="material-symbols-outlined text-[20px]">radio</span>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="font-label-sm text-label-sm text-on-surface-variant font-semibold">ER Direct Radio</span>
            <span class="font-label-md text-label-md font-bold text-on-surface truncate">Safdarjung ER</span>
          </div>
        </button>
      </div>

      <!-- Medical Rig & Equipment Diagnostics Panel -->
      <div class="rounded-xl bg-surface-container-low p-space-sm flex items-center justify-between text-on-surface-variant">
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-secondary text-[18px]">gas_meter</span>
          <span class="font-label-sm text-label-sm font-semibold">O₂: <strong class="text-on-surface">85 bar</strong></span>
        </div>
        <span class="text-outline-variant font-body-sm text-body-sm">•</span>
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-secondary text-[18px]">electric_bolt</span>
          <span class="font-label-sm text-label-sm font-semibold">Defib: <strong class="text-on-surface">Armed</strong></span>
        </div>
        <span class="text-outline-variant font-body-sm text-body-sm">•</span>
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-primary text-[18px]">broadcast_on_home</span>
          <span class="font-label-sm text-label-sm font-semibold">Telemetry: <strong class="text-secondary">Sync OK</strong></span>
        </div>
      </div>
    </div>
  `;
}

async function triggerSceneArrived(caseId) {
  try {
    await window.rakshaApi.updateCaseStatus(caseId, 'ARRIVED_SCENE');
    showNotificationToast("Arrived At Scene (स्थल पर पहुंचे): GPS coordinates locked.");
  } catch (e) {
    showNotificationToast("Arrived at scene logged.");
  }
}

async function triggerPatientBoarded(caseId) {
  try {
    await window.rakshaApi.updateCaseStatus(caseId, 'PATIENT_LOADED');
    showNotificationToast("Patient Loaded: 12-lead ECG and SpO2 stream active with Trauma Desk.");
  } catch (e) {
    showNotificationToast("Patient onboard logged.");
  }
}

async function triggerRouteDelay(caseId) {
  try {
    await window.rakshaApi.updateCaseStatus(caseId, 'EN_ROUTE_HOSPITAL', { reason: "En Route to Trauma Centre via Flyover" });
    showNotificationToast("En Route to Hospital: Green Corridor active with 112 Patrol.");
  } catch (e) {
    showNotificationToast("Status updated.");
  }
}

async function triggerHandoverComplete(caseId) {
  try {
    await window.rakshaApi.updateCaseStatus(caseId, 'HANDOVER_COMPLETE');
    showNotificationToast("Emergency Handover Complete! Ambulance status reset to AVAILABLE.");
  } catch (e) {
    showNotificationToast("Handover logged.");
  }
}

function triggerErRadio() {
  showNotificationToast("Intercom Channel Open: Push-to-talk channel 4 connected to Triage Officer Dr. Verma.");
}

window.renderScreen8 = renderScreen8;
window.triggerSceneArrived = triggerSceneArrived;
window.triggerPatientBoarded = triggerPatientBoarded;
window.triggerRouteDelay = triggerRouteDelay;
window.triggerHandoverComplete = triggerHandoverComplete;
window.triggerErRadio = triggerErRadio;

