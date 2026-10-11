// public/js/screens/screen1_landing.js
// Screen 1: Public Landing & Emergency SOS

function renderScreen1(state) {
  const isHi = state.language === 'HI';

  return `
    <div class="flex flex-col w-full pb-8">
      <!-- Integration Status Banner -->
      <div class="px-margin-mobile py-2.5 bg-surface-container flex items-center justify-between gap-space-xs">
        <div class="flex items-center gap-space-xs min-w-0">
          <span class="material-symbols-outlined text-primary text-[18px] shrink-0" style="font-variation-settings: 'FILL' 1;">shield_with_heart</span>
          <div class="flex flex-col min-w-0">
            <span class="font-label-sm text-label-sm text-on-surface truncate font-bold">
              ${isHi ? 'भारत राष्ट्रीय स्वास्थ्य मिशन एवं PM-JAY सम्बद्ध' : 'India NHM & PM-JAY Integrated Demo Mode'}
            </span>
            <span class="font-label-sm text-label-sm text-on-surface-variant truncate">
              ${isHi ? 'राष्ट्रीय स्वास्थ्य मिशन एवं आयुष्मान भारत सम्बद्ध' : 'National Health Mission & Ayushman Bharat Mesh'}
            </span>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm shrink-0 font-bold uppercase tracking-wider">Live API</span>
      </div>

      <!-- GPS Location Bar with Real Detection -->
      <div class="px-margin-mobile py-2 bg-surface-container-low flex items-center justify-between">
        <div class="flex items-center gap-1.5 min-w-0 cursor-pointer" onclick="showLocationModal()">
          <span class="material-symbols-outlined ${state.userLocation ? 'text-primary' : 'text-amber-600'} text-[16px] shrink-0 animate-bounce">location_on</span>
          <p class="font-label-md text-label-md text-on-surface truncate">
            ${state.userLocation ? (state.userLocation.locality + ', ' + state.userLocation.district + (state.userLocation.pincode ? ' (' + state.userLocation.pincode + ')' : '')) : 'Select Your Village / City / PIN'}
            <span class="text-on-surface-variant font-normal">(${state.userLocation ? state.userLocation.source : 'GPS Ready'})</span>
          </p>
        </div>
        <button class="text-primary font-label-sm text-label-sm shrink-0 underline decoration-primary font-bold cursor-pointer" onclick="showLocationModal()" type="button">
          ${isHi ? 'स्थान बदलें' : 'Change / बदलें'}
        </button>
      </div>

      <!-- Urgent Emergency Hero Module -->
      <section class="px-margin-mobile pt-space-md pb-space-lg flex flex-col items-center text-center">
        <!-- Pulsing Halo & Giant SOS Trigger -->
        <div class="relative flex items-center justify-center my-space-sm">
          <span class="absolute w-56 h-56 rounded-full bg-tertiary-container/20 animate-ping pointer-events-none"></span>
          <span class="absolute w-48 h-48 rounded-full bg-tertiary/15 animate-pulse pointer-events-none"></span>
          <button class="relative z-10 w-40 h-40 rounded-full bg-tertiary text-on-tertiary shadow-[0_8px_30px_rgba(187,1,18,0.45)] active:scale-95 transition-transform flex flex-col items-center justify-center p-3 select-none hover:shadow-[0_12px_40px_rgba(187,1,18,0.6)] cursor-pointer" id="sosPrimaryBtn" onclick="triggerSosModal()" type="button">
            <span class="material-symbols-outlined text-[44px] leading-none mb-1 animate-pulse" style="font-variation-settings: 'FILL' 1;">emergency_home</span>
            <span class="font-headline-sm text-headline-sm font-bold tracking-tight uppercase leading-tight">SOS</span>
            <span class="font-label-sm text-label-sm text-tertiary-fixed font-bold leading-none mt-0.5">आपातकालीन</span>
          </button>
        </div>

        <div class="max-w-xs mt-space-xs">
          <h2 class="font-headline-sm text-headline-sm text-on-surface font-bold leading-snug">
            ${isHi ? 'आपातकालीन सहायता (108)' : 'EMERGENCY SOS'}
          </h2>
          <p class="font-label-sm text-label-sm text-tertiary font-bold tracking-wide uppercase mt-0.5">
            आपातकालीन त्वरित सहायता
          </p>
          <p class="font-body-sm text-body-sm text-on-surface-variant mt-1.5">
            ${isHi ? 'निकटतम BLS/ALS एम्बुलेंस बुलाने या राष्ट्रीय कमांड को अलर्ट करने के लिए टैप करें।' : 'Tap to dispatch nearest BLS/ALS ambulance or alert national command.'}
          </p>
          <p class="font-label-sm text-label-sm text-on-surface-variant/80">
            निकटतम एम्बुलेंस एवं ट्रामा सेंटर तत्काल भेजें
          </p>
        </div>

        <!-- Quick Dial Single-Tap Badges -->
        <div class="w-full grid grid-cols-4 gap-2 mt-space-md">
          <a class="flex flex-col items-center justify-center py-2.5 px-1 bg-surface-container-lowest rounded-xl shadow-sm active:scale-95 transition-transform hover:bg-surface-container-low" href="tel:108" onclick="logDial('108 Ambulance')">
            <div class="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed mb-1">
              <span class="material-symbols-outlined text-[18px]">ambulance</span>
            </div>
            <span class="font-label-md text-label-md font-bold text-on-surface">108</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant text-center scale-90">Ambulance</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant scale-75 -mt-1">एम्बुलेंस</span>
          </a>

          <a class="flex flex-col items-center justify-center py-2.5 px-1 bg-surface-container-lowest rounded-xl shadow-sm active:scale-95 transition-transform hover:bg-surface-container-low" href="tel:102" onclick="logDial('102 Maternal')">
            <div class="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container mb-1">
              <span class="material-symbols-outlined text-[18px]">pregnant_woman</span>
            </div>
            <span class="font-label-md text-label-md font-bold text-on-surface">102</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant text-center scale-90">Maternal</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant scale-75 -mt-1">मातृ शिशु</span>
          </a>

          <a class="flex flex-col items-center justify-center py-2.5 px-1 bg-surface-container-lowest rounded-xl shadow-sm active:scale-95 transition-transform hover:bg-surface-container-low" href="tel:112" onclick="logDial('112 National Police')">
            <div class="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed mb-1">
              <span class="material-symbols-outlined text-[18px]">shield</span>
            </div>
            <span class="font-label-md text-label-md font-bold text-on-surface">112</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant text-center scale-90">National</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant scale-75 -mt-1">राष्ट्रीय</span>
          </a>

          <a class="flex flex-col items-center justify-center py-2.5 px-1 bg-surface-container-lowest rounded-xl shadow-sm active:scale-95 transition-transform hover:bg-surface-container-low" href="tel:104" onclick="logDial('104 Helpline')">
            <div class="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-primary mb-1">
              <span class="material-symbols-outlined text-[18px]">support_agent</span>
            </div>
            <span class="font-label-md text-label-md font-bold text-on-surface">104</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant text-center scale-90">Helpline</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant scale-75 -mt-1">हेल्पलाइन</span>
          </a>
        </div>
      </section>

      <!-- High-Trust Metric Pills -->
      <section class="px-margin-mobile pb-space-md">
        <div class="p-space-sm bg-surface-container-lowest rounded-xl shadow-sm grid grid-cols-3 divide-none gap-2 text-center">
          <div class="flex flex-col items-center justify-center p-1 bg-surface-container-low rounded-lg">
            <span class="font-title-md text-title-md font-bold text-primary">14.2K+</span>
            <span class="font-label-sm text-label-sm text-on-surface font-semibold leading-tight">Empanelled</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant scale-90">अस्पताल जुड़े</span>
          </div>
          <div class="flex flex-col items-center justify-center p-1 bg-surface-container-low rounded-lg">
            <span class="font-title-md text-title-md font-bold text-tertiary">7.4m</span>
            <span class="font-label-sm text-label-sm text-on-surface font-semibold leading-tight">Avg Dispatch</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant scale-90">औसत प्रतिक्रिया</span>
          </div>
          <div class="flex flex-col items-center justify-center p-1 bg-surface-container-low rounded-lg">
            <div class="flex items-center gap-0.5 text-secondary">
              <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">verified</span>
              <span class="font-title-md text-title-md font-bold text-secondary">ABHA</span>
            </div>
            <span class="font-label-sm text-label-sm text-on-surface font-semibold leading-tight">Verified</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant scale-90">प्रमाणित रिकॉर्ड</span>
          </div>
        </div>
      </section>

      <!-- Live Emergency Bed Snapshot with Dynamic Facility Data -->
      <section class="px-margin-mobile pb-space-md">
        <div class="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/30">
          <div class="p-space-sm flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-secondary animate-ping"></span>
              <div>
                <h3 class="font-label-lg text-label-lg font-bold text-on-surface">Nearest Live ICUs & Beds</h3>
                <p class="font-label-sm text-label-sm text-on-surface-variant">निकटतम अस्पताल बेड उपलब्धता (Real-Time)</p>
              </div>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold">
              ${(state.facilities && state.facilities.length) || 0} Nearby
            </span>
          </div>
          <div class="p-3 bg-surface-container-low flex flex-col gap-2">
            ${(() => {
              const topFac = (state.facilities && state.facilities[0]) || {
                name: "Safdarjung Hospital Emergency Trauma Centre",
                icuBedsFree: 8,
                oxygenBedsFree: 28,
                distanceKm: 2.4,
                id: "safdarjung"
              };
              return `
                <div class="bg-surface-container-lowest rounded-lg p-2.5 flex items-center justify-between shadow-sm">
                  <div class="min-w-0 pr-2">
                    <p class="font-label-md text-label-md font-bold text-on-surface truncate">${topFac.name}</p>
                    <p class="font-label-sm text-label-sm text-secondary font-medium">
                      ${topFac.oxygenBedsFree || 14} Oxygen Beds • ${topFac.icuBedsFree || 6} ICU Beds Free
                      ${topFac.distanceKm != null ? ` • ${topFac.distanceKm} km away` : ''}
                    </p>
                  </div>
                  <button class="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-transform cursor-pointer" onclick="window.rakshaState.setScreen('screen-3')" type="button">
                    <span class="material-symbols-outlined text-[14px]">directions</span> Route
                  </button>
                </div>
              `;
            })()}
          </div>
        </div>
      </section>


      <!-- Feature Banner: Zero Data Protocol -->
      <section class="px-margin-mobile pb-space-md">
        <div class="p-space-md rounded-xl bg-primary text-on-primary shadow-sm flex items-center gap-space-sm">
          <div class="w-12 h-12 rounded-full bg-on-primary/10 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[26px] text-primary-fixed">signal_cellular_alt_1_bar</span>
          </div>
          <div class="flex flex-col min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <span class="font-label-md text-label-md font-bold text-primary-fixed uppercase tracking-wider">Zero-Data AI Sync</span>
              <span class="px-1.5 py-0.2 rounded bg-primary-fixed-dim/30 text-on-primary-container font-label-sm text-label-sm">Free</span>
            </div>
            <p class="font-title-md text-title-md font-bold leading-tight mt-0.5">Works Without Active Internet</p>
            <p class="font-label-sm text-label-sm opacity-90 leading-normal">
              SMS-fallback auto-dispatches ambulance & relays GPS coordinates when offline.
            </p>
          </div>
        </div>
      </section>

      <!-- Core Services & Quick Actions Grid -->
      <section class="px-margin-mobile pb-space-md">
        <div class="flex items-center justify-between mb-space-sm">
          <div>
            <h3 class="font-title-md text-title-md font-bold text-on-surface">Emergency & Care Services</h3>
            <p class="font-label-sm text-label-sm text-on-surface-variant">त्वरित जन स्वास्थ्य सेवाएं</p>
          </div>
          <span class="font-label-sm text-label-sm text-primary font-bold">5 Available</span>
        </div>
        <div class="flex flex-col gap-2.5">
          <!-- Action 1: Find Care -->
          <div class="p-space-sm bg-surface-container-lowest rounded-xl shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform cursor-pointer hover:bg-surface-container-low" onclick="window.rakshaState.setScreen('screen-3')">
            <div class="flex items-center gap-space-sm min-w-0">
              <div class="w-11 h-11 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                <span class="material-symbols-outlined text-[24px]">local_hospital</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-label-lg text-label-lg font-bold text-on-surface truncate">Find Nearest Hospital / Beds</span>
                <span class="font-label-sm text-label-sm text-on-surface-variant">निकटतम अस्पताल एवं बेड खोजें (Govt & PM-JAY)</span>
              </div>
            </div>
            <span class="material-symbols-outlined text-outline-variant shrink-0">chevron_right</span>
          </div>

          <!-- Action 2: AI Triage -->
          <div class="p-space-sm bg-surface-container-lowest rounded-xl shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform cursor-pointer hover:bg-surface-container-low" onclick="window.rakshaState.setScreen('screen-4')">
            <div class="flex items-center gap-space-sm min-w-0">
              <div class="w-11 h-11 rounded-lg bg-secondary-container/40 flex items-center justify-center text-secondary shrink-0">
                <span class="material-symbols-outlined text-[24px]">psychology_alt</span>
              </div>
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="font-label-lg text-label-lg font-bold text-on-surface truncate">AI Symptom Guidance</span>
                  <span class="px-1.5 py-0.2 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold">Ayush + AI</span>
                </div>
                <span class="font-label-sm text-label-sm text-on-surface-variant">लक्षण जांच व प्राथमिक चिकित्सीय परामर्श</span>
              </div>
            </div>
            <span class="material-symbols-outlined text-outline-variant shrink-0">chevron_right</span>
          </div>

          <!-- Action 3: Referrals -->
          <div class="p-space-sm bg-surface-container-lowest rounded-xl shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform cursor-pointer hover:bg-surface-container-low" onclick="window.rakshaState.setScreen('screen-6')">
            <div class="flex items-center gap-space-sm min-w-0">
              <div class="w-11 h-11 rounded-lg bg-surface-variant/50 flex items-center justify-center text-on-surface shrink-0">
                <span class="material-symbols-outlined text-[24px]">sync_alt</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-label-lg text-label-lg font-bold text-on-surface truncate">Track Active Referral & Transport</span>
                <span class="font-label-sm text-label-sm text-on-surface-variant">रेफरल स्थिति एवं एम्बुलेंस लाइव ट्रैकिंग</span>
              </div>
            </div>
            <span class="material-symbols-outlined text-outline-variant shrink-0">chevron_right</span>
          </div>

          <!-- Action 4: ASHA Connect -->
          <div class="p-space-sm bg-surface-container-lowest rounded-xl shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform cursor-pointer hover:bg-surface-container-low" onclick="window.rakshaState.setScreen('screen-9')">
            <div class="flex items-center gap-space-sm min-w-0">
              <div class="w-11 h-11 rounded-lg bg-primary-fixed/50 flex items-center justify-center text-on-primary-fixed shrink-0">
                <span class="material-symbols-outlined text-[24px]">perm_contact_calendar</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-label-lg text-label-lg font-bold text-on-surface truncate">ASHA & Community Connect</span>
                <span class="font-label-sm text-label-sm text-on-surface-variant">आशा दीदी एवं ग्रामीण स्वास्थ्य कार्यकर्ता संपर्क</span>
              </div>
            </div>
            <span class="material-symbols-outlined text-outline-variant shrink-0">chevron_right</span>
          </div>

          <!-- Action 5: ABHA Locker -->
          <div class="p-space-sm bg-surface-container-lowest rounded-xl shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform cursor-pointer hover:bg-surface-container-low" onclick="window.rakshaState.setScreen('screen-2')">
            <div class="flex items-center gap-space-sm min-w-0">
              <div class="w-11 h-11 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                <span class="material-symbols-outlined text-[24px]">folder_shared</span>
              </div>
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="font-label-lg text-label-lg font-bold text-on-surface truncate">ABHA Health Locker Sync</span>
                  <span class="material-symbols-outlined text-secondary text-[16px]">lock</span>
                </div>
                <span class="font-label-sm text-label-sm text-on-surface-variant">आभा कार्ड एवं डिजिटल स्वास्थ्य पर्ची</span>
              </div>
            </div>
            <span class="material-symbols-outlined text-outline-variant shrink-0">chevron_right</span>
          </div>
        </div>
      </section>

      <!-- Photo Story: Community Impact -->
      <section class="px-margin-mobile pb-space-lg">
        <div class="relative rounded-xl overflow-hidden shadow-sm h-36 bg-gradient-to-br from-primary via-primary-container to-surface-container-high">
          <img class="w-full h-full object-cover" alt="Indian frontline female ASHA healthcare worker in a traditional uniform using a tablet to register a rural family" src="/images/village_health.jpg" onerror="this.src='https://lh3.googleusercontent.com/aida-public/AB6AXuDizFbCblmhn9u8HabuWQvEk1PixpfgvtDguaIbK0Dz8h3CSMwR_cHKic9PjQ8fhHzuPCdiHfCTuRXvQqNNRPeZGoT4tM7xK8wDsHqGvpBRk3fl_UNcqYgmfnyjFC1HIqZ0WY4ML0QOkTpEbV2ek00gDyEZPaXFeXbpLUYFuD0n7u9_e2JQ09tU6FmCP4wHFwvRwtIgLsGChzyLQpvniVL67X-vx9tYmFYD4Y5aaYsF-Ltph_sPWrTvqw';"/>
          <div class="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/40 to-transparent flex flex-col justify-end p-space-sm text-on-error">
            <span class="font-label-sm text-label-sm font-bold text-secondary-fixed uppercase tracking-wider">Jan Arogya Initiative</span>
            <h4 class="font-title-md text-title-md font-bold leading-tight">Connecting 650,000+ Villages</h4>
            <p class="font-label-sm text-label-sm opacity-90">हर नागरिक तक त्वरित जीवन रक्षा प्रणाली</p>
          </div>
        </div>
      </section>

      <!-- Legal & Clinical Demo Disclaimer -->
      <footer class="px-margin-mobile pb-space-lg text-center">
        <div class="p-space-sm bg-surface-container-low rounded-xl">
          <div class="flex items-center justify-center gap-1.5 text-on-surface-variant mb-1">
            <span class="material-symbols-outlined text-[16px]">info</span>
            <span class="font-label-sm text-label-sm font-bold uppercase tracking-wider">Clinical & System Notice</span>
          </div>
          <p class="font-label-sm text-label-sm text-on-surface-variant leading-relaxed">
            RAKSHA provides emergency coordination and triage support. It does not replace professional medical diagnosis. In critical situations, dial 108 or proceed to the closest trauma facility immediately.
          </p>
          <p class="font-label-sm text-label-sm text-on-surface-variant/75 mt-1 leading-normal">
            यह ऐप आपातकालीन मार्गदर्शन मंच है। गंभीर परिस्थिति में तत्काल 108 पर संपर्क करें।
          </p>
        </div>
        <p class="font-label-sm text-label-sm text-on-surface-variant/60 mt-3">
          Government of India • National Digital Health Mission Demo Framework
        </p>
      </footer>
    </div>
  `;
}

window.renderScreen1 = renderScreen1;
