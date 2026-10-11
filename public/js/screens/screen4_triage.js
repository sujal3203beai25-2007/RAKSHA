// public/js/screens/screen4_triage.js
// Screen 4: Digital AI Triage & Clinical Urgency Guidance

function renderScreen4(state) {
  const isHi = state.language === 'HI';
  const t = state.triage || {};
  const res = t.result || {
    priorityCode: "MODERATE-PRIORITY (Yellow / पीला कोड)",
    urgencyLevel: "moderate",
    windowTime: "< 6 Hours (Non-Critical)",
    token: "RAKSHA-8842-YC",
    recommendation: "Visit your nearest Sub-District Hospital (SDH) or Community Health Centre within 6 hours. Do not delay if respiratory effort increases."
  };

  const isRed = res.urgencyLevel === 'critical';
  const isYellow = res.urgencyLevel === 'moderate';

  return `
    <div class="flex flex-col w-full px-margin-mobile pb-space-lg gap-space-md">
      <!-- Safety Banner / Non-Diagnostic Warning -->
      <div class="rounded-xl bg-surface-container-high p-space-md flex flex-col gap-space-xs shadow-sm">
        <div class="flex items-start gap-space-sm">
          <div class="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shrink-0 mt-0.5">
            <span class="material-symbols-outlined text-on-secondary-container text-[20px]" style="font-variation-settings: 'FILL' 1;">shield_with_heart</span>
          </div>
          <div class="flex flex-col flex-1 min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-label-lg text-label-lg text-primary font-bold">Non-Diagnostic Triage AI</span>
              <span class="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">आयुष्मान भारत Verified</span>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-snug">
              This intelligent routing system assesses urgent care needs and directs you to certified medical centres. It does <span class="font-semibold text-on-surface">not</span> replace professional clinical diagnosis.
            </p>
          </div>
        </div>
        <div class="mt-1 rounded-lg bg-error-container p-2.5 flex items-center gap-2">
          <span class="material-symbols-outlined text-error text-[20px] shrink-0" style="font-variation-settings: 'FILL' 1;">emergency</span>
          <p class="font-label-md text-label-md text-on-error-container font-medium leading-tight">
            For severe trauma, unresponsiveness, or choking, trigger immediate SOS.
          </p>
        </div>
      </div>

      <!-- Step Progress Indicator -->
      <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col gap-space-xs">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="font-label-sm text-label-sm uppercase px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold tracking-wider">Step 2 of 4</span>
            <span class="font-label-md text-label-md text-on-surface font-semibold">Primary Symptoms & Risk Flags</span>
          </div>
          <span class="font-code-data text-code-data text-primary font-bold" id="progressPercent">65%</span>
        </div>
        <div class="w-full h-2 rounded-full bg-surface-container overflow-hidden mt-1">
          <div class="h-full bg-primary rounded-full transition-all duration-500" style="width: 65%;"></div>
        </div>
        <div class="flex justify-between items-center text-on-surface-variant font-label-sm text-label-sm mt-0.5">
          <span>1. Identity</span>
          <span class="text-primary font-semibold">2. Triage & Signs</span>
          <span>3. Vitals</span>
          <span>4. Facility Match</span>
        </div>
      </div>

      <!-- Question 1: Patient Target Role -->
      <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col gap-space-sm">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[20px]">group</span>
          <label class="font-title-md text-title-md text-on-surface font-semibold">Who are you checking symptoms for?</label>
        </div>
        <p class="font-body-sm text-body-sm text-on-surface-variant -mt-1">
          कौटुंबिक अथवा समुदाय रुग्ण निवडा (Select recipient)
        </p>
        <div class="grid grid-cols-3 gap-2 mt-1" id="recipientRoleGroup">
          <button class="role-btn flex flex-col items-center justify-center p-2.5 rounded-xl ${t.role === 'self' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'} shadow-sm transition-all duration-200 cursor-pointer" onclick="window.rakshaState.setTriageRole('self')" type="button">
            <span class="material-symbols-outlined text-[24px]">person</span>
            <span class="font-label-md text-label-md mt-1 font-bold">Self</span>
            <span class="font-label-sm text-label-sm opacity-90">स्वतःसाठी</span>
          </button>
          <button class="role-btn flex flex-col items-center justify-center p-2.5 rounded-xl ${t.role === 'family' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'} transition-all duration-200 cursor-pointer" onclick="window.rakshaState.setTriageRole('family')" type="button">
            <span class="material-symbols-outlined text-[24px]">family_restroom</span>
            <span class="font-label-md text-label-md mt-1 font-semibold">Family</span>
            <span class="font-label-sm text-label-sm opacity-80">कुटुंब</span>
          </button>
          <button class="role-btn flex flex-col items-center justify-center p-2.5 rounded-xl ${t.role === 'asha' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'} transition-all duration-200 cursor-pointer" onclick="window.rakshaState.setTriageRole('asha')" type="button">
            <span class="material-symbols-outlined text-[24px]">assignment_ind</span>
            <span class="font-label-md text-label-md mt-1 font-semibold">ASHA Case</span>
            <span class="font-label-sm text-label-sm opacity-80">आशा सहाय्य</span>
          </button>
        </div>
      </div>

      <!-- Question 2: Primary Symptoms Selector -->
      <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col gap-space-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">medical_services</span>
            <label class="font-title-md text-title-md text-on-surface font-semibold">Select primary symptom(s)</label>
          </div>
          <span class="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-primary font-bold" id="selectedCountBadge">${t.symptoms.length} Selected</span>
        </div>
        <p class="font-body-sm text-body-sm text-on-surface-variant -mt-1">
          Tap all applicable health complaints (Multiple choice allowed)
        </p>

        <!-- Multi-select symptom chips -->
        <div class="grid grid-cols-2 gap-2 mt-1" id="symptomsList">
          <!-- Chip: Fever -->
          <button class="symptom-chip flex items-start gap-2.5 p-3 rounded-xl ${t.symptoms.includes('fever') ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container text-on-surface-variant'} text-left transition-all duration-150 cursor-pointer" onclick="window.rakshaState.toggleTriageSymptom('fever')" type="button">
            <span class="material-symbols-outlined text-[22px] shrink-0" style="font-variation-settings: 'FILL' 1;">thermostat</span>
            <div class="flex flex-col min-w-0">
              <span class="font-label-lg text-label-lg font-bold leading-tight">Fever &gt; 3 days</span>
              <span class="font-label-sm text-label-sm opacity-80 mt-0.5">ताप ३ दिवसांपेक्षा जास्त</span>
            </div>
          </button>

          <!-- Chip: Chest Tightness -->
          <button class="symptom-chip flex items-start gap-2.5 p-3 rounded-xl ${t.symptoms.includes('chest') ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container text-on-surface-variant'} text-left transition-all duration-150 cursor-pointer" onclick="window.rakshaState.toggleTriageSymptom('chest')" type="button">
            <span class="material-symbols-outlined text-[22px] shrink-0">cardiology</span>
            <div class="flex flex-col min-w-0">
              <span class="font-label-lg text-label-lg font-bold leading-tight">Chest Tightness</span>
              <span class="font-label-sm text-label-sm opacity-80 mt-0.5">छातीत जडपणा</span>
            </div>
          </button>

          <!-- Chip: Shortness of Breath -->
          <button class="symptom-chip flex items-start gap-2.5 p-3 rounded-xl ${t.symptoms.includes('breath') ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container text-on-surface-variant'} text-left transition-all duration-150 cursor-pointer" onclick="window.rakshaState.toggleTriageSymptom('breath')" type="button">
            <span class="material-symbols-outlined text-[22px] shrink-0">air</span>
            <div class="flex flex-col min-w-0">
              <span class="font-label-lg text-label-lg font-bold leading-tight">Short of Breath</span>
              <span class="font-label-sm text-label-sm opacity-80 mt-0.5">श्वास लागणे</span>
            </div>
          </button>

          <!-- Chip: Acute Abdominal Pain -->
          <button class="symptom-chip flex items-start gap-2.5 p-3 rounded-xl ${t.symptoms.includes('abdomen') ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container text-on-surface-variant'} text-left transition-all duration-150 cursor-pointer" onclick="window.rakshaState.toggleTriageSymptom('abdomen')" type="button">
            <span class="material-symbols-outlined text-[22px] shrink-0">personal_injury</span>
            <div class="flex flex-col min-w-0">
              <span class="font-label-lg text-label-lg font-bold leading-tight">Abdominal Pain</span>
              <span class="font-label-sm text-label-sm opacity-80 mt-0.5">तीव्र पोटदुखी</span>
            </div>
          </button>

          <!-- Chip: Pediatric Dehydration -->
          <button class="symptom-chip flex items-start gap-2.5 p-3 rounded-xl ${t.symptoms.includes('pediatric') ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container text-on-surface-variant'} text-left transition-all duration-150 cursor-pointer" onclick="window.rakshaState.toggleTriageSymptom('pediatric')" type="button">
            <span class="material-symbols-outlined text-[22px] shrink-0">child_care</span>
            <div class="flex flex-col min-w-0">
              <span class="font-label-lg text-label-lg font-bold leading-tight">Pediatric Loss</span>
              <span class="font-label-sm text-label-sm opacity-80 mt-0.5">बाळाचे निर्जलीकरण</span>
            </div>
          </button>

          <!-- Chip: Snake Bite / Poisoning -->
          <button class="symptom-chip flex items-start gap-2.5 p-3 rounded-xl ${t.symptoms.includes('toxin') ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container text-on-surface-variant'} text-left transition-all duration-150 cursor-pointer" onclick="window.rakshaState.toggleTriageSymptom('toxin')" type="button">
            <span class="material-symbols-outlined text-[22px] shrink-0">pest_control</span>
            <div class="flex flex-col min-w-0">
              <span class="font-label-lg text-label-lg font-bold leading-tight">Snake / Poison</span>
              <span class="font-label-sm text-label-sm opacity-80 mt-0.5">सर्पदंश / विषबाधा</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Question 3: Red Flag Critical Checklist -->
      <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col gap-space-sm">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-tertiary text-[20px]" style="font-variation-settings: 'FILL' 1;">warning</span>
          <label class="font-title-md text-title-md text-on-surface font-semibold">Do you notice any danger signs?</label>
        </div>
        <p class="font-body-sm text-body-sm text-on-surface-variant -mt-1">
          गंभीर धोक्याची लक्षणे (Check any present right now)
        </p>
        <div class="flex flex-col gap-2 mt-1">
          <label class="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low cursor-pointer active:bg-surface-container transition-colors">
            <input class="danger-flag w-5 h-5 rounded text-primary focus:ring-0 accent-primary cursor-pointer" ${t.dangerFlags.includes('cyanosis') ? 'checked' : ''} onchange="window.rakshaState.toggleTriageDangerFlag('cyanosis')" type="checkbox"/>
            <div class="flex flex-col min-w-0 flex-1">
              <span class="font-label-lg text-label-lg text-on-surface font-semibold">Bluish lips, tongue or pale fingernails</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant">ओठ किंवा चेहरा निळसर पडणे (Cyanosis)</span>
            </div>
            <span class="material-symbols-outlined text-outline-variant text-[20px]">air</span>
          </label>

          <label class="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low cursor-pointer active:bg-surface-container transition-colors">
            <input class="danger-flag w-5 h-5 rounded text-primary focus:ring-0 accent-primary cursor-pointer" ${t.dangerFlags.includes('confusion') ? 'checked' : ''} onchange="window.rakshaState.toggleTriageDangerFlag('confusion')" type="checkbox"/>
            <div class="flex flex-col min-w-0 flex-1">
              <span class="font-label-lg text-label-lg text-on-surface font-semibold">Confusion, slurred speech or unresponsiveness</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant">भ्रम किंवा शुद्ध हरपणे</span>
            </div>
            <span class="material-symbols-outlined text-outline-variant text-[20px]">psychology_alt</span>
          </label>

          <label class="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low cursor-pointer active:bg-surface-container transition-colors">
            <input class="danger-flag w-5 h-5 rounded text-primary focus:ring-0 accent-primary cursor-pointer" ${t.dangerFlags.includes('fluids') ? 'checked' : ''} onchange="window.rakshaState.toggleTriageDangerFlag('fluids')" type="checkbox"/>
            <div class="flex flex-col min-w-0 flex-1">
              <span class="font-label-lg text-label-lg text-on-surface font-semibold">Repeated vomiting, inability to retain fluids</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant">पाणी टिकू न शकणे किंवा सतत उलट्या</span>
            </div>
            <span class="material-symbols-outlined text-outline-variant text-[20px]">water_drop</span>
          </label>
        </div>
      </div>

      <!-- AI Real-Time Triage Output Preview Card -->
      <div class="rounded-xl ${isRed ? 'bg-red-50 border border-red-200' : isYellow ? 'bg-surface-container-low' : 'bg-emerald-50 border border-emerald-200'} p-space-md shadow-sm flex flex-col gap-space-sm transition-all duration-300" id="triageResultCard">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2">
            <div class="w-3.5 h-3.5 rounded-full ${isRed ? 'bg-tertiary' : isYellow ? 'bg-amber-500' : 'bg-secondary'} animate-pulse shrink-0"></div>
            <div>
              <span class="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Preliminary Triage Code</span>
              <h3 class="font-headline-sm text-headline-sm ${isRed ? 'text-tertiary' : isYellow ? 'text-amber-800' : 'text-secondary'} font-bold leading-tight" id="triageLevelTitle">
                ${res.priorityCode}
              </h3>
            </div>
          </div>
          <div class="px-2 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">bolt</span>
            <span>AI Engine 3.2</span>
          </div>
        </div>

        <!-- Recommended Next Steps & Clinical Pathway -->
        <div class="p-3 rounded-lg bg-surface-container-lowest flex flex-col gap-1.5 shadow-sm">
          <div class="flex items-center gap-2 text-primary font-label-lg text-label-lg font-bold">
            <span class="material-symbols-outlined text-[18px]">navigation</span>
            <span>Recommended Action Pathway:</span>
          </div>
          <p class="font-body-md text-body-md text-on-surface leading-snug" id="triageRecommendationText">
            ${res.recommendation}
          </p>
        </div>

        <!-- Digital Token Metadata -->
        <div class="grid grid-cols-2 gap-2 text-on-surface">
          <div class="p-2.5 rounded-lg bg-surface-container-lowest flex flex-col">
            <span class="font-label-sm text-label-sm text-on-surface-variant font-medium">Tele-Consult Token</span>
            <span class="font-code-data text-code-data font-bold text-primary mt-0.5">${res.token}</span>
          </div>
          <div class="p-2.5 rounded-lg bg-surface-container-lowest flex flex-col">
            <span class="font-label-sm text-label-sm text-on-surface-variant font-medium">Optimal Window</span>
            <span class="font-code-data text-code-data font-bold ${isRed ? 'text-tertiary' : 'text-secondary'} mt-0.5">${res.windowTime}</span>
          </div>
        </div>

        <!-- Reassurance Notice -->
        <div class="flex items-center gap-2.5 pt-1">
          <div class="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-on-secondary-container text-[16px]">support_agent</span>
          </div>
          <p class="font-label-sm text-label-sm text-on-surface-variant">
            ASHA Worker Smt. Sunita Patil has received a live notification for your sector (Karanj PHC cluster).
          </p>
        </div>
      </div>

      <!-- Action CTA Buttons Grid -->
      <div class="flex flex-col gap-2.5 mt-1">
        <!-- Primary Forward Button -->
        <button class="w-full min-h-[48px] px-space-md py-3 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-transform cursor-pointer" onclick="window.rakshaState.setScreen('screen-3')" type="button">
          <span>Continue to Facility Matching</span>
          <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>

        <!-- Urgent SOS Dispatch (Secondary High Contrast) -->
        <button class="w-full min-h-[48px] px-space-md py-3 rounded-xl bg-surface-container-lowest text-tertiary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-error-container hover:text-on-error-container active:scale-[0.99] transition-all cursor-pointer" onclick="triggerSosModal()" type="button">
          <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">e911_emergency</span>
          <span>Escalate to 108 Emergency Ambulance</span>
        </button>

        <!-- ASHA Worker Collaboration Share -->
        <button class="w-full min-h-[44px] px-space-md py-2.5 rounded-xl bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 active:bg-surface-container-high transition-colors cursor-pointer" onclick="shareTelemetryWithAsha()" type="button">
          <span class="material-symbols-outlined text-[18px]">share</span>
          <span>Share Telemetry with ASHA Worker (आशा कार्यकर्ता साझा करा)</span>
        </button>
      </div>

      <!-- Sync status footnote -->
      <div class="flex items-center justify-center gap-1.5 pt-2 text-on-surface-variant font-label-sm text-label-sm opacity-80">
        <span class="material-symbols-outlined text-[14px] text-secondary">wifi_protected_setup</span>
        <span>Zero-Data SMS Fallback Protocol Ready</span>
      </div>
    </div>
  `;
}

function shareTelemetryWithAsha() {
  showNotificationToast("Telemetry & symptoms successfully shared with ASHA Sangini Sunita Patil.");
}

window.renderScreen4 = renderScreen4;
window.shareTelemetryWithAsha = shareTelemetryWithAsha;
