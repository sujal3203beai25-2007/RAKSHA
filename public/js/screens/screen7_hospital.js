// public/js/screens/screen7_hospital.js
// Screen 7: Facility Bed & Emergency Superintendent Console

function renderScreen7(state) {
  const fac = (state.facilities && state.facilities.find(f => f.id === 'safdarjung')) || {
    name: "Safdarjung District General",
    abhaSyncId: "NHM-DL-8812",
    surgeDivertActive: false,
    occupiedEmergencyBeds: 48,
    totalEmergencyBeds: 50,
    icuBedsFree: 4,
    ventilatorsFree: 2,
    wardBedsFree: 18,
    bloodBank: { "O+": 4, "B+": 8, "A+": 2 }
  };

  const isDivertActive = fac.surgeDivertActive;
  const occ = fac.occupiedEmergencyBeds || 48;
  const tot = fac.totalEmergencyBeds || 50;
  const occPercent = Math.min(100, Math.round((occ / tot) * 100));

  return `
    <div class="flex flex-col w-full pb-8">
      <!-- Offline & SMS Sync Resilience Bar -->
      <div class="px-margin-mobile pt-space-xs pb-space-xs">
        <div class="flex items-center justify-between px-space-md py-space-xs rounded-lg bg-surface-container-high text-on-surface">
          <div class="flex items-center gap-space-xs">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
            </span>
            <span class="font-label-sm text-label-sm text-on-surface-variant font-medium">Sync: 60s (SMS Fallback Ready)</span>
          </div>
          <div class="flex items-center gap-1 font-label-sm text-label-sm text-secondary font-semibold">
            <span class="material-symbols-outlined text-[15px]" style="font-variation-settings: 'FILL' 1;">sms</span>
            <span>Mesh GSM 2G</span>
          </div>
        </div>
      </div>

      <!-- Medical Facility Header Card -->
      <div class="px-margin-mobile pt-space-xs">
        <div class="p-space-md rounded-xl bg-surface-container shadow-sm flex flex-col gap-space-xs">
          <div class="flex items-start justify-between gap-space-xs">
            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm tracking-wide uppercase">District Tertiary</span>
                <span class="font-label-sm text-label-sm text-on-surface-variant">${fac.abhaSyncId}</span>
              </div>
              <h1 class="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight truncate mt-1">${fac.name}</h1>
              <p class="font-label-md text-label-md text-on-surface-variant flex items-center gap-1 mt-0.5">
                <span class="material-symbols-outlined text-[16px] text-primary">local_hospital</span>
                <span>Medical Superintendent & Triage In-Charge Portal</span>
              </p>
            </div>
            <div class="p-2 rounded-lg bg-surface-container-lowest shadow-sm flex flex-col items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-primary text-[24px]">domain_verification</span>
              <span class="font-label-sm text-label-sm text-primary font-semibold">Verified</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Critical Emergency Surge Divert Strip -->
      <div class="px-margin-mobile pt-space-sm">
        <div class="p-space-md rounded-xl ${isDivertActive ? 'bg-amber-100 border border-amber-300' : 'bg-surface-container-lowest'} shadow-sm flex items-center justify-between transition-colors duration-300" id="surgeDivertCard">
          <div class="flex items-center gap-space-sm">
            <div class="w-10 h-10 rounded-full ${isDivertActive ? 'bg-amber-200 text-amber-900' : 'bg-surface-container text-on-surface-variant'} flex items-center justify-center shrink-0 transition-colors duration-300" id="divertIconBadge">
              <span class="material-symbols-outlined text-[22px]">alt_route</span>
            </div>
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <span class="font-label-lg text-label-lg font-bold text-on-surface">Surge Divert Protocol</span>
                <span class="px-1.5 py-0.5 rounded font-label-sm text-label-sm ${isDivertActive ? 'bg-amber-600 text-white animate-pulse' : 'bg-surface-container-high text-on-surface-variant'} font-bold uppercase" id="divertStatusChip">
                  ${isDivertActive ? 'ACTIVE (DIVERTING)' : 'Standby'}
                </span>
              </div>
              <span class="font-label-sm text-label-sm text-on-surface-variant" id="divertSubtitle">
                ${isDivertActive ? 'Inbound non-criticals rerouted to CHC Pataudi & SDH' : 'Direct inbound non-criticals to secondary CHCs'}
              </span>
            </div>
          </div>
          <!-- Toggle Button -->
          <button aria-label="Toggle Emergency Surge Divert" class="w-14 h-8 rounded-full ${isDivertActive ? 'bg-amber-600' : 'bg-surface-variant'} flex items-center p-1 transition-colors duration-300 relative focus:outline-none cursor-pointer" onclick="toggleHospitalSurgeDivert()" type="button">
            <div class="w-6 h-6 rounded-full bg-surface-container-lowest shadow-sm transform transition-transform duration-300 ${isDivertActive ? 'translate-x-6' : 'translate-x-0'}" id="toggleKnob"></div>
          </button>
        </div>
      </div>

      <!-- Live Capacity Grid -->
      <div class="px-margin-mobile pt-space-md">
        <div class="flex items-center justify-between mb-space-xs">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-primary text-[20px]">dataset</span>
            <h2 class="font-title-md text-title-md text-on-surface font-bold">Live Bed Matrix</h2>
          </div>
          <span class="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-semibold animate-pulse">Critical Load</span>
        </div>

        <!-- Bed Capacity Hero Block: Emergency Beds High Alert -->
        <div class="p-space-md rounded-xl bg-error-container text-on-error-container shadow-sm mb-space-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[24px]">crisis_alert</span>
              <span class="font-label-lg text-label-lg font-bold uppercase tracking-wider">Total Emergency Beds</span>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-tertiary text-on-tertiary font-label-sm text-label-sm font-bold">${occPercent}% CRITICAL</span>
          </div>
          <div class="flex items-baseline justify-between mt-space-sm">
            <div class="flex items-baseline gap-1">
              <span class="font-display-hero-mobile text-display-hero-mobile font-bold tracking-tight">${occ}</span>
              <span class="font-title-md text-title-md font-medium opacity-80">/ ${tot} Occupied</span>
            </div>
            <div class="text-right">
              <span class="font-headline-sm text-headline-sm font-bold">${tot - occ < 10 ? '0' + (tot - occ) : (tot - occ)}</span>
              <span class="font-label-sm text-label-sm block opacity-90">Beds Left</span>
            </div>
          </div>
          <div class="w-full h-2.5 bg-on-error-container/20 rounded-full mt-space-xs overflow-hidden">
            <div class="h-full bg-tertiary rounded-full transition-all duration-300" style="width: ${occPercent}%;"></div>
          </div>
          <div class="flex justify-between items-center mt-2 text-on-error-container font-label-sm text-label-sm">
            <span>Red Zone Overflow: Active</span>
            <span class="font-semibold underline cursor-pointer hover:opacity-80" onclick="expediteStepDown()">Expedite Step-Down →</span>
          </div>
        </div>

        <!-- Secondary KPI 3-Column Grid -->
        <div class="grid grid-cols-3 gap-gutter-mobile mb-space-sm">
          <!-- Oxygen ICU Beds -->
          <div class="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="material-symbols-outlined text-secondary text-[20px]" style="font-variation-settings: 'FILL' 1;">air</span>
              <span class="w-2 h-2 rounded-full bg-secondary"></span>
            </div>
            <div class="mt-2">
              <span class="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">${fac.icuBedsFree < 10 ? '0' + fac.icuBedsFree : fac.icuBedsFree}</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant block mt-0.5 leading-tight font-medium">O2 ICU Free</span>
            </div>
            <div class="mt-2 pt-1 flex items-center justify-between">
              <span class="font-label-sm text-label-sm text-secondary font-bold">Optimum</span>
              <button class="text-primary text-[12px] font-bold" onclick="simulateBedTweak('icu', 1)">+1</button>
            </div>
          </div>

          <!-- Ventilator Units -->
          <div class="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="material-symbols-outlined text-primary text-[20px]">respiratory_rate</span>
              <span class="w-2 h-2 rounded-full bg-primary-container"></span>
            </div>
            <div class="mt-2">
              <span class="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">${fac.ventilatorsFree < 10 ? '0' + fac.ventilatorsFree : fac.ventilatorsFree}</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant block mt-0.5 leading-tight font-medium">Ventilators</span>
            </div>
            <div class="mt-2 pt-1 flex items-center justify-between">
              <span class="font-label-sm text-label-sm text-on-surface-variant font-bold">Amber alert</span>
              <button class="text-primary text-[12px] font-bold" onclick="simulateBedTweak('vent', 1)">+1</button>
            </div>
          </div>

          <!-- General Wards -->
          <div class="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="material-symbols-outlined text-outline text-[20px]">single_bed</span>
              <span class="w-2 h-2 rounded-full bg-outline-variant"></span>
            </div>
            <div class="mt-2">
              <span class="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">${fac.wardBedsFree}</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant block mt-0.5 leading-tight font-medium">Ward Beds</span>
            </div>
            <div class="mt-2 pt-1 flex items-center justify-between">
              <span class="font-label-sm text-label-sm text-secondary font-bold">Stable</span>
              <button class="text-primary text-[12px] font-bold" onclick="simulateBedTweak('ward', 1)">+1</button>
            </div>
          </div>
        </div>

        <!-- Blood Reserve Live Stock Bar -->
        <div class="p-space-md rounded-xl bg-surface-container-low shadow-sm">
          <div class="flex items-center justify-between mb-space-xs">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-tertiary text-[18px]" style="font-variation-settings: 'FILL' 1;">bloodtype</span>
              <span class="font-label-lg text-label-lg font-bold text-on-surface">Emergency Blood Stock Bank</span>
            </div>
            <span class="font-label-sm text-label-sm text-on-surface-variant font-medium">Rotary Reserve</span>
          </div>
          <div class="grid grid-cols-3 gap-gutter-mobile">
            <div class="p-space-xs rounded-lg bg-surface-container-lowest flex items-center justify-between">
              <div class="flex flex-col">
                <span class="font-label-sm text-label-sm text-on-surface-variant font-bold">O+ Group</span>
                <span class="font-title-md text-title-md text-on-surface font-bold">04 <span class="font-label-sm text-label-sm font-normal text-on-surface-variant">Units</span></span>
              </div>
              <span class="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
            </div>
            <div class="p-space-xs rounded-lg bg-surface-container-lowest flex items-center justify-between">
              <div class="flex flex-col">
                <span class="font-label-sm text-label-sm text-on-surface-variant font-bold">B+ Group</span>
                <span class="font-title-md text-title-md text-on-surface font-bold">08 <span class="font-label-sm text-label-sm font-normal text-on-surface-variant">Units</span></span>
              </div>
              <span class="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
            </div>
            <div class="p-space-xs rounded-lg bg-surface-container-lowest flex items-center justify-between">
              <div class="flex flex-col">
                <span class="font-label-sm text-label-sm text-tertiary font-bold">A+ Group</span>
                <span class="font-title-md text-title-md text-tertiary font-bold">02 <span class="font-label-sm text-label-sm font-normal text-tertiary">Low</span></span>
              </div>
              <span class="material-symbols-outlined text-tertiary text-[20px]">priority_high</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Incoming Ambulance & Referral Radar -->
      <div class="px-margin-mobile pt-space-lg">
        <div class="flex items-center justify-between mb-space-xs">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-tertiary text-[20px]">radar</span>
            <h2 class="font-title-md text-title-md text-on-surface font-bold">Incoming Queue Radar</h2>
          </div>
          <span class="font-label-sm text-label-sm text-primary font-bold px-2 py-0.5 rounded-full bg-primary-fixed">2 In-Transit</span>
        </div>
        <div class="flex flex-col gap-space-sm">
          <!-- Card 1: 108 ALS #44 STEMI Urgent -->
          <div class="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-xs relative overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-tertiary"></div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm font-bold flex items-center gap-1">
                  <span class="material-symbols-outlined text-[13px]">emergency</span>
                  <span>108 ALS #44</span>
                </span>
                <span class="font-label-sm text-label-sm text-on-surface font-semibold truncate">Severe STEMI (Cardiac)</span>
              </div>
              <div class="flex items-center gap-1 px-2 py-1 rounded bg-tertiary text-on-tertiary font-label-md text-label-md font-bold">
                <span class="material-symbols-outlined text-[14px]">timer</span>
                <span>ETA 6m</span>
              </div>
            </div>
            <div class="flex items-center justify-between pt-1">
              <div class="flex items-center gap-1.5 text-on-surface">
                <span class="material-symbols-outlined text-primary text-[18px]">meeting_room</span>
                <span class="font-body-sm text-body-sm font-semibold">Assigned: Trauma Bay 3</span>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-primary-fixed-dim text-on-primary-fixed font-label-sm text-label-sm font-bold">Cath Lab Alerted</span>
            </div>
            <div class="p-space-xs rounded-lg bg-surface-container-low flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <span>Paramedic: Neha Rawat | Vitals Telemetry Live</span>
              <button class="font-bold text-primary hover:underline cursor-pointer" onclick="showNotificationToast('ECG Stream: HR 88, ST-elevation in V1-V4 verified with Cath-Lab console.')" type="button">View ECG →</button>
            </div>
          </div>

          <!-- Card 2: CHC Pataudi Referral -->
          <div class="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-xs relative overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-container"></div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-bold flex items-center gap-1">
                  <span class="material-symbols-outlined text-[13px]">ambulance</span>
                  <span>CHC Pataudi</span>
                </span>
                <span class="font-label-sm text-label-sm text-on-surface font-semibold truncate">Maternal Hemorrhage</span>
              </div>
              <div class="flex items-center gap-1 px-2 py-1 rounded bg-surface-container-highest text-on-surface font-label-md text-label-md font-bold">
                <span class="material-symbols-outlined text-[14px]">schedule</span>
                <span>ETA 18m</span>
              </div>
            </div>
            <div class="flex items-center justify-between pt-1">
              <div class="flex items-center gap-1.5 text-on-surface">
                <span class="material-symbols-outlined text-primary text-[18px]">emergency_heat</span>
                <span class="font-body-sm text-body-sm font-semibold">OT 2 On Standby (Gyne/Obs)</span>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-bold">Blood Crossmatched</span>
            </div>
            <div class="p-space-xs rounded-lg bg-surface-container-low flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <span>Ref MD: Dr. Sunita Rao | ABHA #91-3829-1928</span>
              <button class="font-bold text-primary hover:underline cursor-pointer" onclick="showNotificationToast('Digital Referral Slip: Gravida 3 Para 2, severe PPH, 2 IV access initiated.')" type="button">Slip Details →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function toggleHospitalSurgeDivert() {
  try {
    const res = await window.rakshaApi.toggleSurgeDivert('safdarjung');
    showNotificationToast(
      res.facility.surgeDivertActive 
        ? "Surge Divert Protocol ACTIVATED. Inbound cases being routed to secondary CHCs."
        : "Surge Divert Protocol deactivated. Hospital ready for all inbound cases."
    );
  } catch (e) {
    showNotificationToast("Surge divert toggled.");
  }
}

function expediteStepDown() {
  showNotificationToast("Rerouting 3 stabilized recovery patients to Step-down Annex. 3 Emergency beds freed.");
  window.rakshaApi.updateBeds('safdarjung', { occupiedEmergencyDelta: -3 });
}

function simulateBedTweak(type, delta) {
  if (type === 'icu') window.rakshaApi.updateBeds('safdarjung', { icuDelta: delta });
  else if (type === 'vent') window.rakshaApi.updateBeds('safdarjung', { oxygenDelta: delta });
  else if (type === 'ward') window.rakshaApi.updateBeds('safdarjung', { occupiedEmergencyDelta: -delta });
  showNotificationToast(`Capacity updated (+${delta} available).`);
}

window.renderScreen7 = renderScreen7;
window.toggleHospitalSurgeDivert = toggleHospitalSurgeDivert;
window.expediteStepDown = expediteStepDown;
window.simulateBedTweak = simulateBedTweak;
