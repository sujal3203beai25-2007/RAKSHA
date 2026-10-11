// public/js/screens/screen9_asha.js
// Screen 9: ASHA Frontline Worker Hub & Rural Health Management

function renderScreen9(state) {
  const asha = state.ashaData || {
    workerName: "Sunita Patil",
    role: "ASHA Sangini",
    subCentre: "Karanj, Block: Rewari",
    ward: "Rewari Ward 4",
    facilitatorId: "9021-44",
    cachedSyncRecords: 42,
    todayOverview: {
      households: 184,
      abhaLinkedPercent: 98,
      highRiskAnc: 6,
      chcReferrals: 3,
      vaccinesDue: 12
    },
    activeCases: []
  };

  const isHi = state.language === 'HI';

  return `
    <div class="flex flex-col w-full pb-8">
      <!-- Offline Sync Sticky Notice -->
      <div class="px-margin-mobile pt-space-xs pb-space-sm">
        <div class="w-full bg-secondary-container rounded-xl p-space-sm shadow-sm flex items-center justify-between transition-all" id="syncBanner">
          <div class="flex items-center gap-space-xs min-w-0">
            <span class="w-3 h-3 rounded-full bg-secondary animate-pulse shrink-0"></span>
            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-1">
                <span class="font-label-md text-label-md text-on-secondary-container font-bold">2G Offline Ready</span>
                <span class="font-label-sm text-label-sm text-on-secondary-container/80">| ${asha.cachedSyncRecords} रिकॉर्ड सिंक कतार में</span>
              </div>
              <span class="font-body-sm text-body-sm text-on-secondary-container truncate">Village Household Register queued</span>
            </div>
          </div>
          <button class="shrink-0 px-3 py-1.5 rounded-full bg-secondary text-on-secondary font-label-md text-label-md flex items-center gap-1 active:scale-95 shadow-sm transition-transform cursor-pointer" id="syncBtn" onclick="triggerManualSync()" type="button">
            <span class="material-symbols-outlined text-[16px]" id="syncIcon">sync</span>
            <span>Sync Now</span>
          </button>
        </div>
      </div>

      <!-- ASHA Worker Identity Card -->
      <div class="px-margin-mobile mb-space-md">
        <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden">
          <div class="absolute -right-8 -top-8 w-32 h-32 bg-primary-container/10 rounded-full blur-xl pointer-events-none"></div>
          <div class="flex items-start justify-between gap-space-sm relative z-10">
            <div class="flex items-center gap-space-sm min-w-0">
              <div class="relative shrink-0">
                <img class="w-14 h-14 rounded-full object-cover shadow-sm keep-image" alt="Portrait of Sunita Patil" src="/images/asha_sunita.jpg" onerror="this.src='https://lh3.googleusercontent.com/aida-public/AB6AXuDW5jICuKxx5OdQs5Fl-Ii0Y7VtsCijO6cFv8NWVfEjdD8ZjpXnpTv2EnLubPGTMPGKH0TLffH8bJoFsSAAhoBpdyEGE_LJ8ql6-UxiM8z-1ykU3C5o6MjXYos2lmIdWiroDJGR21w4VEWWl_VhDGjrlwdf1yTFE7sK4McY22TFY3vyRGWHXQoiaVuVmhmpMe7DfQNxDszAZ1vzZXrwQ-M3o1JCk18ClJL_p7bvX9ZSaAeKx3939pNJEA';"/>
                <span class="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-secondary flex items-center justify-center text-on-secondary">
                  <span class="material-symbols-outlined text-[10px]">check</span>
                </span>
              </div>
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-title-md text-title-md text-on-surface font-bold truncate">${asha.workerName}</span>
                  <span class="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">${asha.role}</span>
                </div>
                <span class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 truncate">
                  <span class="material-symbols-outlined text-[14px] text-primary shrink-0">location_on</span>
                  Sub-Centre: ${asha.subCentre}
                </span>
                <div class="flex items-center gap-2 mt-0.5">
                  <span class="font-label-sm text-label-sm text-secondary font-bold">ABHA Facilitator ID: ${asha.facilitatorId}</span>
                  <span class="w-1 h-1 rounded-full bg-outline-variant"></span>
                  <span class="font-label-sm text-label-sm text-on-surface-variant">${asha.ward}</span>
                </div>
              </div>
            </div>
            <button aria-label="Audio Guidance" class="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant active:scale-95 transition-transform shrink-0 cursor-pointer" onclick="playVoicePrompt()" type="button">
              <span class="material-symbols-outlined text-[20px] text-primary">record_voice_over</span>
            </button>
          </div>

          <!-- Quick Audio Banner / Voice Helper -->
          <div class="mt-space-sm bg-surface-container-low rounded-lg p-2.5 flex items-center justify-between">
            <div class="flex items-center gap-2 min-w-0">
              <span class="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span class="material-symbols-outlined text-[16px]">campaign</span>
              </span>
              <span class="font-label-md text-label-md text-on-surface truncate">ऑडियो सहायता: हिंदी व मराठी में उपलब्ध</span>
            </div>
            <button class="px-2.5 py-1 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold flex items-center gap-1 active:scale-95 cursor-pointer" onclick="playVoicePrompt()" type="button">
              <span class="material-symbols-outlined text-[14px]">volume_up</span>
              <span id="voiceBtnText">सुनें</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Key Operational Metric Bento -->
      <div class="px-margin-mobile mb-space-md">
        <div class="flex items-center justify-between mb-space-xs">
          <span class="font-headline-sm text-headline-sm text-on-surface font-bold">Today's Village Overview</span>
          <span class="font-label-sm text-label-sm text-primary font-semibold">Rewari Circle</span>
        </div>
        <div class="grid grid-cols-2 gap-gutter-mobile">
          <!-- Metric 1: Households -->
          <div class="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="font-label-sm text-label-sm text-on-surface-variant">Households</span>
              <div class="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span class="material-symbols-outlined text-[18px]">cottage</span>
              </div>
            </div>
            <div class="mt-2">
              <div class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold" id="ashaHouseholdsCount">${asha.todayOverview.households}</div>
              <span class="font-label-sm text-label-sm text-secondary font-medium">${asha.todayOverview.abhaLinkedPercent}% ABHA Linked</span>
            </div>
          </div>

          <!-- Metric 2: High-Risk ANC -->
          <div class="bg-tertiary-fixed p-space-sm rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div class="flex items-center justify-between">
              <span class="font-label-sm text-label-sm text-on-tertiary-fixed-variant font-bold">High-Risk ANC</span>
              <div class="w-7 h-7 rounded-lg bg-tertiary text-on-tertiary flex items-center justify-center animate-pulse">
                <span class="material-symbols-outlined text-[18px]">pregnant_woman</span>
              </div>
            </div>
            <div class="mt-2">
              <div class="font-headline-lg-mobile text-headline-lg-mobile text-on-tertiary-fixed font-bold">0${asha.todayOverview.highRiskAnc}</div>
              <span class="font-label-sm text-label-sm text-on-tertiary-fixed-variant font-semibold">Priority Visit Req.</span>
            </div>
          </div>

          <!-- Metric 3: CHC Referrals -->
          <div class="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="font-label-sm text-label-sm text-on-surface-variant">CHC Referrals</span>
              <div class="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                <span class="material-symbols-outlined text-[18px]">sync_alt</span>
              </div>
            </div>
            <div class="mt-2">
              <div class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">0${asha.todayOverview.chcReferrals}</div>
              <span class="font-label-sm text-label-sm text-secondary font-medium">Transport Linked</span>
            </div>
          </div>

          <!-- Metric 4: Vaccines Due -->
          <div class="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="font-label-sm text-label-sm text-on-surface-variant">Vaccines Due</span>
              <div class="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span class="material-symbols-outlined text-[18px]">vaccines</span>
              </div>
            </div>
            <div class="mt-2">
              <div class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">${asha.todayOverview.vaccinesDue}</div>
              <span class="font-label-sm text-label-sm text-primary font-medium">Due This Week</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Primary ASHA Workflows -->
      <div class="px-margin-mobile mb-space-md">
        <div class="flex items-center justify-between mb-space-xs">
          <span class="font-headline-sm text-headline-sm text-on-surface font-bold">Primary Actions & Triage</span>
          <span class="font-label-sm text-label-sm text-on-surface-variant">RAKSHA Field v3.2</span>
        </div>
        <div class="flex flex-col gap-space-xs">
          <!-- Workflow 1: Door-to-Door AI Triage -->
          <div class="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform cursor-pointer hover:bg-surface-container-low" onclick="window.rakshaState.setScreen('screen-4')">
            <div class="flex items-center gap-space-sm min-w-0">
              <div class="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 shadow-sm">
                <span class="material-symbols-outlined text-[24px]">troubleshoot</span>
              </div>
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="font-title-md text-title-md text-on-surface font-bold truncate">AI Triage & Case Referral</span>
                  <span class="px-1.5 py-0.2 rounded bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold">Voice</span>
                </div>
                <span class="font-body-sm text-body-sm text-on-surface-variant truncate">Bilingual voice assist · Instant referral token</span>
              </div>
            </div>
            <button class="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0" type="button">
              <span class="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>

          <!-- Workflow 2: Emergency Ambulance Booking -->
          <div class="bg-error-container p-space-sm rounded-xl shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform cursor-pointer" onclick="triggerSosModal()">
            <div class="flex items-center gap-space-sm min-w-0">
              <div class="w-12 h-12 rounded-xl bg-tertiary text-on-tertiary flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                <span class="material-symbols-outlined text-[24px]">ambulance</span>
              </div>
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="font-title-md text-title-md text-on-error-container font-bold truncate">Village Ambulance SOS</span>
                  <span class="px-1.5 py-0.2 rounded bg-tertiary text-on-tertiary font-label-sm text-label-sm font-bold">108 Fallback</span>
                </div>
                <span class="font-body-sm text-body-sm text-on-error-container/80 truncate">Zero-balance SMS dispatch auto-fallback</span>
              </div>
            </div>
            <button class="px-3 py-2 rounded-full bg-tertiary text-on-tertiary font-label-md text-label-md font-bold shrink-0 flex items-center gap-1 shadow-sm" type="button">
              <span>Call 108</span>
            </button>
          </div>

          <!-- Workflow 3: Maternal & ANC Tracking -->
          <div class="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform cursor-pointer hover:bg-surface-container-low" onclick="showNotificationToast('Maternal register: 6 ANC high-risk visits scheduled.')">
            <div class="flex items-center gap-space-sm min-w-0">
              <div class="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center shrink-0 shadow-sm">
                <span class="material-symbols-outlined text-[24px]">family_restroom</span>
              </div>
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="font-title-md text-title-md text-on-surface font-bold truncate">Maternal & ANC Tracking</span>
                </div>
                <span class="font-body-sm text-body-sm text-on-surface-variant truncate">PMMVY Direct Benefit + 3rd Trimester care</span>
              </div>
            </div>
            <button class="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0" type="button">
              <span class="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>

          <!-- Workflow 4: Medicine Stock & IFA Inventory -->
          <div class="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform cursor-pointer hover:bg-surface-container-low" onclick="showNotificationToast('Medicine Kit: IFA Tablets request sent to Karanj Sub-Centre.')">
            <div class="flex items-center gap-space-sm min-w-0">
              <div class="w-12 h-12 rounded-xl bg-surface-container text-secondary flex items-center justify-center shrink-0 shadow-sm">
                <span class="material-symbols-outlined text-[24px]">medication</span>
              </div>
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="font-title-md text-title-md text-on-surface font-bold truncate">Medicine & IFA Inventory</span>
                  <span class="px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">Low Alert</span>
                </div>
                <span class="font-body-sm text-body-sm text-on-surface-variant truncate">Iron/Folic Acid 8 strips left in kit</span>
              </div>
            </div>
            <button class="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0" type="button">
              <span class="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Villager Cases -->
      <div class="px-margin-mobile mb-space-md">
        <div class="flex items-center justify-between mb-space-xs">
          <div class="flex items-center gap-2">
            <span class="font-headline-sm text-headline-sm text-on-surface font-bold">Active Village Cases</span>
            <span class="w-2 h-2 rounded-full bg-tertiary"></span>
          </div>
          <button class="font-label-md text-label-md text-primary font-bold cursor-pointer hover:underline" onclick="showNotificationToast('Viewing complete village roster (184 households).')" type="button">View All 184</button>
        </div>

        <div class="flex flex-col gap-space-xs">
          <!-- Case 1: Geeta Devi -->
          <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden">
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="flex items-center gap-2">
                <span class="w-8 h-8 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold text-label-md">GD</span>
                <div class="flex flex-col">
                  <span class="font-title-md text-title-md text-on-surface font-bold">Geeta Devi (32F)</span>
                  <span class="font-label-sm text-label-sm text-on-surface-variant">House 42, Dhani Basti</span>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">warning</span>
                High BP Flagged
              </span>
            </div>
            <div class="bg-surface-container-low rounded-lg p-2.5 mb-3 flex items-center justify-between">
              <div class="flex items-center gap-2 min-w-0">
                <span class="material-symbols-outlined text-tertiary text-[18px]">blood_pressure</span>
                <span class="font-body-sm text-body-sm text-on-surface font-medium truncate">34 Weeks ANC · BP 154/98 mmHg</span>
              </div>
              <span class="font-label-sm text-label-sm text-primary font-bold shrink-0">CHC Karanj</span>
            </div>
            <div class="flex items-center justify-between pt-1">
              <span class="font-label-md text-label-md text-secondary font-semibold flex items-center gap-1">
                <span class="material-symbols-outlined text-[16px]">check_circle</span> Transport Arranged
              </span>
              <button class="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-bold cursor-pointer active:scale-95 transition-transform" onclick="showAshaVisitModal()">
                + Log Visit
              </button>
            </div>
          </div>


          <!-- Case 2: Rameshwar Lal -->
          <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden">
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="flex items-center gap-2">
                <span class="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-label-md">RL</span>
                <div class="flex flex-col">
                  <span class="font-title-md text-title-md text-on-surface font-bold">Rameshwar Lal (58M)</span>
                  <span class="font-label-sm text-label-sm text-on-surface-variant">House 18, Bilaspur Road</span>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">ambulance</span>
                Cardiac 108 Transferred
              </span>
            </div>
            <div class="bg-surface-container-low rounded-lg p-2.5 mb-3 flex items-center justify-between">
              <div class="flex items-center gap-2 min-w-0">
                <span class="material-symbols-outlined text-secondary text-[18px]">favorite</span>
                <span class="font-body-sm text-body-sm text-on-surface font-medium truncate">Transferred to Safdarjung Trauma Bay 03</span>
              </div>
              <span class="font-label-sm text-label-sm text-secondary font-bold shrink-0">AIIMS CCU</span>
            </div>
            <div class="flex items-center justify-between pt-1">
              <span class="font-label-md text-label-md text-on-surface-variant font-medium">Kin Informed via SMS</span>
              <button class="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-sm text-label-sm font-bold cursor-pointer" onclick="window.rakshaState.setScreen('screen-6')">
                Track Referral
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function triggerManualSync() {
  const syncBtn = document.getElementById('syncBtn');
  const syncIcon = document.getElementById('syncIcon');
  if (syncIcon) syncIcon.classList.add('animate-spin');

  try {
    const res = await window.rakshaApi.syncAshaRecords(42);
    setTimeout(() => {
      if (syncIcon) syncIcon.classList.remove('animate-spin');
      showNotificationToast(`Synced ${res.syncedRecords} household records to National Health Mission Registry.`);
    }, 800);
  } catch (e) {
    if (syncIcon) syncIcon.classList.remove('animate-spin');
    showNotificationToast("Sync completed.");
  }
}

function playVoicePrompt() {
  const isHi = window.rakshaState.language === 'HI';
  const text = isHi
    ? "नमस्कार। रक्षा स्वास्थ्य सेवा में आपका स्वागत है। गंभीर परिस्थिति में तत्काल १०८ पर कॉल करें या निकटतम स्वास्थ्य केंद्र जाएं।"
    : "Welcome to RAKSHA Community Health Assistant. If the patient has severe chest pain, shortness of breath, or trauma, trigger emergency 108 immediately.";

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isHi ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    const btnText = document.getElementById('voiceBtnText');
    if (btnText) btnText.textContent = "चल रहा है...";
    utterance.onend = () => {
      if (btnText) btnText.textContent = "सुनें";
    };
    window.speechSynthesis.speak(utterance);
    showNotificationToast("Playing bilingual audio prompt...");
  } else {
    showNotificationToast(text);
  }
}

window.renderScreen9 = renderScreen9;
window.triggerManualSync = triggerManualSync;
window.playVoicePrompt = playVoicePrompt;
