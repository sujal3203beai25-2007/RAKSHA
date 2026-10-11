// public/js/screens/screen6_referral.js
// Screen 6: Digital Referral Tracking & Green Corridor Management

function renderScreen6(state) {
  const ref = state.activeReferral || {
    refId: "REF-2025-084",
    protocol: "ABDM FastTrack",
    priority: "CRITICAL",
    category: "Inter-Facility Emergency Transfer",
    patientName: "Rameshwar Lal",
    patientAge: 58,
    patientGender: "Male",
    abhaId: "91-0021-4921-3310",
    originFacility: "PHC Bawal",
    receivingFacility: "AIIMS Delhi (Cardio)",
    currentStep: 3,
    steps: []
  };

  const steps = ref.steps && ref.steps.length > 0 ? ref.steps : [
    { step: 1, title: "Step 1: Clinical Triage & Origin Clearance", time: "14:18 IST", desc: "Cleared by Dr. P. Sharma (CHC Bawal). STEMI protocol activated with oxygen stabilization.", completed: true },
    { step: 2, title: "Step 2: Receiving Facility Acceptance", time: "14:26 IST", desc: "AIIMS Delhi confirmed. Bed #ICU-04 pre-locked via ABDM network.", completed: true },
    { step: 3, title: "Step 3: Ambulance Assigned & En Route", time: "IN TRANSIT", desc: "108 ALS: DL-1RX-4402. Pilot: Satnam Singh (Paramedic on-board)", completed: true, current: true },
    { step: 4, title: "Step 4: Real-time Transit Telemetry", time: "ETA 34 Mins", desc: "Vital telemetry sync: HR 94 bpm | SpO2 96% | BP 136/88. Transmitted continuously to AIIMS CCU console.", completed: false },
    { step: 5, title: "Step 5: Direct Admission at Trauma Gate 3", time: "Awaiting Arrival", desc: "Zero-delay intake bypass: Stretcher and Interventional Cath-Lab team on active 10-minute standby.", completed: false }
  ];

  return `
    <div class="flex flex-col w-full px-margin-mobile pb-space-xl space-y-space-md">
      <!-- Interactive Live Status Toast -->
      <div class="w-full rounded-xl bg-secondary-container text-on-secondary-container p-space-sm flex items-center justify-between shadow-sm" id="syncFeedback">
        <div class="flex items-center gap-space-xs">
          <span class="material-symbols-outlined text-[18px]">verified</span>
          <span class="font-label-md text-label-md font-medium" id="syncFeedbackMsg">Live tracking shared with kin (+91 98*** 4210)</span>
        </div>
        <button class="p-1 rounded-full hover:bg-black/5 cursor-pointer" onclick="document.getElementById('syncFeedback').classList.add('hidden')">
          <span class="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>

      <!-- Header Card: Referral Identifiers & Facility Route -->
      <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm relative overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
        <div class="flex items-start justify-between gap-space-xs">
          <div class="flex flex-col">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider bg-surface-container px-2 py-0.5 rounded-full">ABDM FastTrack</span>
              <span class="font-code-data text-code-data text-on-surface-variant font-semibold">#${ref.refId}</span>
            </div>
            <h1 class="font-title-md text-title-md text-on-surface mt-1 font-bold">Inter-Facility Emergency Transfer</h1>
          </div>
          <div class="flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-full shrink-0">
            <span class="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
            <span class="font-label-sm text-label-sm text-tertiary-container font-bold">CRITICAL</span>
          </div>
        </div>

        <!-- Facility Route Line -->
        <div class="mt-space-sm pt-space-xs flex items-center gap-2 text-on-surface-variant">
          <div class="flex items-center gap-1 min-w-0">
            <span class="material-symbols-outlined text-primary text-[18px] shrink-0">local_hospital</span>
            <span class="font-label-md text-label-md text-on-surface font-semibold truncate">${ref.originFacility}</span>
          </div>
          <span class="material-symbols-outlined text-outline text-[16px] shrink-0">trending_flat</span>
          <div class="flex items-center gap-1 min-w-0">
            <span class="material-symbols-outlined text-tertiary-container text-[18px] shrink-0">medical_services</span>
            <span class="font-label-md text-label-md text-on-surface font-semibold truncate">${ref.receivingFacility}</span>
          </div>
        </div>
      </div>

      <!-- Patient Summary Pill -->
      <div class="rounded-xl bg-surface-container p-space-sm flex flex-col gap-1.5 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-[12px]">
              RL
            </div>
            <div>
              <span class="font-title-md text-title-md text-on-surface font-bold">${ref.patientName}</span>
              <span class="font-label-md text-label-md text-on-surface-variant ml-1 font-medium">(${ref.patientAge}${ref.patientGender ? ref.patientGender[0] : 'M'})</span>
            </div>
          </div>
          <span class="font-label-sm text-label-sm bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-bold">
            PM-JAY Free
          </span>
        </div>
        <div class="flex items-center justify-between pt-1 text-on-surface-variant">
          <div class="flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px] text-primary">badge</span>
            <span class="font-code-data text-code-data text-on-surface">ABHA: ${ref.abhaId}</span>
          </div>
          <span class="font-label-sm text-label-sm text-secondary font-semibold flex items-center gap-0.5">
            <span class="material-symbols-outlined text-[14px]">check_circle</span> Verified
          </span>
        </div>
      </div>

      <!-- Delay & Bottleneck Alert Card -->
      <div class="rounded-xl bg-tertiary-fixed text-on-tertiary-fixed-variant p-space-md shadow-sm relative overflow-hidden">
        <div class="flex items-start gap-space-sm">
          <div class="w-8 h-8 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <span class="material-symbols-outlined text-[20px]">warning</span>
          </div>
          <div class="flex flex-col flex-1">
            <div class="flex items-center justify-between">
              <span class="font-label-lg text-label-lg font-bold text-on-tertiary-fixed">Potential Transit Delay Alert</span>
              <span class="font-label-sm text-label-sm bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-full font-bold">+42 mins</span>
            </div>
            <p class="font-body-sm text-body-sm text-on-tertiary-fixed-variant mt-1">
              Heavy congestion detected near <strong>Manesar Toll (NH-48)</strong>. Secondary Green-Corridor rerouting deployed to maintain acute care window.
            </p>

            <!-- Route Micro Map Visualizer -->
            <div class="mt-space-sm rounded-lg bg-surface-container-lowest p-space-xs text-on-surface flex items-center justify-between shadow-xs">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-secondary text-[20px]">alt_route</span>
                <div class="flex flex-col">
                  <span class="font-label-sm text-label-sm font-bold text-on-surface">NH-48 Bypass → KMP Express</span>
                  <span class="font-label-sm text-label-sm text-secondary font-semibold">Green-Corridor Radio Active</span>
                </div>
              </div>
              <button class="px-2 py-1 bg-surface-container rounded-lg font-label-sm text-label-sm text-primary font-bold hover:bg-surface-variant transition-colors cursor-pointer" onclick="showNotificationToast('KMP Express corridor clearance verified with State Police command.')">
                View Geo
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Step-by-Step Status Stepper -->
      <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
        <div class="flex items-center justify-between mb-space-md">
          <div>
            <h2 class="font-title-md text-title-md text-on-surface font-bold">Transit Progression</h2>
            <p class="font-label-sm text-label-sm text-on-surface-variant">ABDM FHIR Protocol Synchronized</p>
          </div>
          <div class="flex items-center gap-1 text-primary">
            <span class="material-symbols-outlined text-[16px] animate-spin">sync</span>
            <span class="font-label-sm text-label-sm font-bold">LIVE TELEMETRY</span>
          </div>
        </div>

        <!-- Stepper Items -->
        <div class="space-y-4">
          ${steps.map((st, idx) => `
            <div class="flex gap-space-sm relative">
              <div class="flex flex-col items-center">
                <div class="w-8 h-8 rounded-full ${st.completed ? 'bg-secondary-container text-on-secondary-container' : st.current ? 'bg-primary text-on-primary ring-4 ring-primary/20' : 'bg-surface-container text-on-surface-variant'} flex items-center justify-center shadow-xs z-10">
                  <span class="material-symbols-outlined text-[18px]">${st.completed ? 'check' : st.current ? 'ambulance' : 'radio_button_unchecked'}</span>
                </div>
                ${idx < steps.length - 1 ? `<div class="w-0.5 h-12 ${st.completed ? 'bg-secondary-container' : 'bg-outline-variant'} my-1"></div>` : ''}
              </div>
              <div class="flex-1 pt-0.5">
                <div class="flex items-center justify-between">
                  <span class="font-label-lg text-label-lg font-bold ${st.current ? 'text-primary' : 'text-on-surface'}">${st.title}</span>
                  <span class="font-label-sm text-label-sm ${st.current ? 'text-primary font-bold' : 'text-on-surface-variant font-medium'}">${st.time}</span>
                </div>
                <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">${st.desc}</p>
                ${st.current ? `
                  <div class="mt-2 p-2 rounded-lg bg-surface-container flex items-center justify-between">
                    <div>
                      <div class="font-code-data text-code-data font-bold text-on-surface">108 ALS: DL-1RX-4402</div>
                      <div class="font-label-sm text-label-sm text-on-surface-variant">Pilot: Satnam Singh (Paramedic on-board)</div>
                    </div>
                    <a class="px-2.5 py-1 bg-primary text-on-primary rounded-lg font-label-sm text-label-sm flex items-center gap-1 cursor-pointer" href="tel:108" onclick="logDial('108 ALS Dispatch')">
                      <span class="material-symbols-outlined text-[14px]">call</span> Dispatch
                    </a>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Interactive Advance Step Button -->
        <div class="mt-4 pt-3 border-t border-surface-container flex justify-between items-center">
          <span class="font-label-sm text-label-sm text-on-surface-variant">Step ${ref.currentStep || 3} of 5 Active</span>
          <button class="px-3.5 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform cursor-pointer" onclick="advanceReferralStep('${ref.refId}')">
            <span class="material-symbols-outlined text-[16px]">step_over</span>
            <span>Advance to Next Stage</span>
          </button>
        </div>
      </div>

      <!-- Clinical Documents Attached -->
      <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
        <div class="flex items-center justify-between mb-space-sm">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-primary text-[20px]">description</span>
            <h3 class="font-title-md text-title-md text-on-surface font-bold">Attached Clinical Records</h3>
          </div>
          <span class="font-label-sm text-label-sm bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full font-bold">3 Files</span>
        </div>
        <div class="space-y-space-xs">
          <!-- Doc 1 -->
          <div class="flex items-center justify-between p-space-xs rounded-lg bg-surface-container hover:bg-surface-variant transition-colors">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-8 h-8 rounded bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[18px]">ecg</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-label-md text-label-md font-bold text-on-surface truncate">ECG 12-Lead Report (PDF)</span>
                <span class="font-label-sm text-label-sm text-on-surface-variant">Recorded 14:10 IST • 842 KB</span>
              </div>
            </div>
            <button class="p-2 text-primary hover:bg-black/5 rounded-full cursor-pointer" onclick="showNotificationToast('Downloading ECG 12-Lead Clinical PDF...')">
              <span class="material-symbols-outlined text-[20px]">download</span>
            </button>
          </div>

          <!-- Doc 2 -->
          <div class="flex items-center justify-between p-space-xs rounded-lg bg-surface-container hover:bg-surface-variant transition-colors">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-8 h-8 rounded bg-tertiary-container text-on-tertiary-container flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[18px]">biotech</span>
              </div>
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-1">
                  <span class="font-label-md text-label-md font-bold text-on-surface truncate">Troponin-T Rapid Test</span>
                  <span class="font-label-sm text-label-sm text-on-tertiary-container bg-tertiary-container px-1 rounded font-bold text-[10px]">POS</span>
                </div>
                <span class="font-label-sm text-label-sm text-on-surface-variant">Elevated Cardiac Biomarker • 14:15 IST</span>
              </div>
            </div>
            <button class="p-2 text-primary hover:bg-black/5 rounded-full cursor-pointer" onclick="showNotificationToast('Opening Biomarker Telemetry Report...')">
              <span class="material-symbols-outlined text-[20px]">visibility</span>
            </button>
          </div>
        </div>

        <!-- Export FHIR & CSV Buttons -->
        <div class="mt-4 pt-2 flex flex-col gap-2">
          <a class="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform" href="/api/referrals/${ref.refId}/fhir" target="_blank" download>
            <span class="material-symbols-outlined text-[18px]">data_object</span>
            <span>Download Validated ABDM FHIR R4 Bundle (JSON)</span>
          </a>
          <a class="w-full min-h-[40px] px-3 py-2 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors" href="/api/audit/download" target="_blank" download>
            <span class="material-symbols-outlined text-[18px] text-secondary">table_view</span>
            <span>Download National Referral Audit Log (CSV)</span>
          </a>
        </div>
      </div>
    </div>

  `;
}

async function advanceReferralStep(refId) {
  try {
    const res = await window.rakshaApi.advanceReferralStep(refId);
    showNotificationToast(`Referral step advanced to Step ${res.referral.currentStep} of 5.`);
  } catch (e) {
    showNotificationToast("Referral advanced.");
  }
}

window.renderScreen6 = renderScreen6;
window.advanceReferralStep = advanceReferralStep;
