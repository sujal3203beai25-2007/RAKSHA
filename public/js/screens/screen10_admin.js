// public/js/screens/screen10_admin.js
// Screen 10: Admin Access Gap Analytics & NEMD Observatory

function renderScreen10(state) {
  const defaultAnalytics = {
    state: "Haryana State View",
    districtsCount: 22,
    medianResponseTimeMins: 8.2,
    responseComparisonMoM: "-14%",
    dispatchesToday: 4129,
    goldenHourAdherencePercent: 91.2,
    delayFlagsCount: 18,
    activeFleet: {
      activeAmbulances: 342,
      totalFleet: 380,
      surgeIndex: "HIGH (1.8x)",
      icuBedVacancy: 24
    },
    surgeHotspot: {
      clusterName: "Mewat District Southern Cluster",
      subSectors: "Nuh • Ferozepur Jhirka • Tauru Sector",
      status: "Severe Deficit",
      cause: "Surge in acute pediatric & geriatric respiratory cases combined with 3 BLS ambulances undergoing unscheduled chassis maintenance at Nuh depot.",
      recommendation: "Re-deploy 2 ALS units from Gurugram Reserve Hub to Nuh Sub-Division (ETA: 32 mins).",
      projectedGapOffset: "94%",
      authorized: false
    },
    referralFunnel: {
      phcToChcPercent: 62,
      chcToTertiaryPercent: 28,
      bypassRatePercent: 10
    }
  };

  const an = Object.assign({}, defaultAnalytics, (state && state.analytics) || {});
  an.activeFleet = Object.assign({}, defaultAnalytics.activeFleet, (state && state.analytics && state.analytics.activeFleet) || {});
  an.surgeHotspot = Object.assign({}, defaultAnalytics.surgeHotspot, (state && state.analytics && state.analytics.surgeHotspot) || {});
  an.referralFunnel = Object.assign({}, defaultAnalytics.referralFunnel, (state && state.analytics && state.analytics.referralFunnel) || {});

  const isAuthorized = Boolean(an.surgeHotspot.authorized);

  return `
    <div class="flex flex-col w-full pb-8">
      <!-- Administrative Context Banner -->
      <div class="px-margin-mobile pt-space-sm pb-space-xs">
        <div class="bg-surface-container-high rounded-xl p-space-md shadow-sm">
          <div class="flex items-center justify-between gap-space-xs mb-1.5">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-wide">
              <span class="material-symbols-outlined text-[13px]" style="font-variation-settings: 'FILL' 1;">insights</span>
              NEMD Observatory
            </span>
            <span class="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm bg-surface-container px-2 py-0.5 rounded-full">
              <span class="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
              Live Feed Active
            </span>
          </div>
          <h1 class="font-headline-sm text-headline-sm text-on-surface leading-tight">National Emergency Medical Dispatch (NEMD) & Health Access Observatory</h1>
          <div class="flex items-center justify-between mt-space-xs text-on-surface-variant font-label-md text-label-md">
            <div class="flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px] text-primary">location_on</span>
              <span class="font-bold text-primary">${an.state}</span>
              <span class="text-outline-variant">•</span>
              <span>${an.districtsCount} Districts Synchronized</span>
            </div>
            <button class="flex items-center gap-0.5 text-primary font-semibold hover:underline cursor-pointer" onclick="showNotificationToast('Observatory cycle toggled: 24h Rolling Window applied.')" type="button">
              <span>Today (IST)</span>
              <span class="material-symbols-outlined text-[14px]">expand_more</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Real-time Alert Banner -->
      <div class="px-margin-mobile py-space-xs">
        <div class="bg-error-container text-on-error-container rounded-xl p-space-sm flex items-center justify-between gap-space-xs shadow-sm">
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-8 h-8 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shrink-0 animate-pulse">
              <span class="material-symbols-outlined text-[18px]">warning</span>
            </div>
            <div class="min-w-0">
              <p class="font-label-lg text-label-lg font-bold truncate">Surge Alert: ${an.surgeHotspot.clusterName}</p>
              <p class="font-body-sm text-body-sm opacity-90 truncate">3 BLS Units offline • Automated reallocation recommended</p>
            </div>
          </div>
          <button class="shrink-0 px-2.5 py-1.5 rounded-lg bg-tertiary text-on-tertiary font-label-md text-label-md font-semibold active:scale-95 transition-transform cursor-pointer" onclick="document.getElementById('gap-analysis-section').scrollIntoView({behavior: 'smooth'})" type="button">
            Review
          </button>
        </div>
      </div>

      <!-- Key Performance Indicators (KPI Bento) -->
      <div class="px-margin-mobile py-space-sm">
        <div class="flex items-center justify-between mb-space-xs">
          <h2 class="font-title-md text-title-md text-on-surface flex items-center gap-1.5">
            <span class="material-symbols-outlined text-primary text-[20px]">ecg_heart</span>
            Critical Mission Metrics
          </h2>
          <span class="font-label-sm text-label-sm text-on-surface-variant">Target Benchmark: NHM-2025</span>
        </div>
        <div class="grid grid-cols-2 gap-gutter-mobile">
          <!-- KPI 1: Response Time -->
          <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="font-label-sm text-label-sm text-on-surface-variant font-medium">Median Response</span>
                <span class="material-symbols-outlined text-[16px] text-secondary">local_shipping</span>
              </div>
              <div class="flex items-baseline gap-1">
                <span class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">${an.medianResponseTimeMins}</span>
                <span class="font-label-md text-label-md text-on-surface-variant">mins</span>
              </div>
              <div class="flex items-center gap-1 mt-1 text-secondary font-label-sm text-label-sm font-semibold">
                <span class="material-symbols-outlined text-[14px]">arrow_downward</span>
                <span>14% vs last mo</span>
              </div>
            </div>
            <!-- Micro Sparkline SVG -->
            <div class="mt-2 pt-2">
              <svg class="w-full h-7 overflow-visible" preserveaspectratio="none" viewbox="0 0 100 24">
                <path d="M0,18 Q15,16 28,14 T52,9 T75,11 T100,4" fill="none" stroke="#006c4a" stroke-linecap="round" stroke-width="2.5"></path>
                <circle cx="100" cy="4" fill="#006c4a" r="3"></circle>
              </svg>
              <div class="flex justify-between items-center text-outline font-label-sm text-label-sm mt-0.5">
                <span>Benchmark &lt;10m</span>
                <span class="text-secondary font-bold">Optimized</span>
              </div>
            </div>
          </div>

          <!-- KPI 2: Total Dispatches -->
          <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="font-label-sm text-label-sm text-on-surface-variant font-medium">Dispatches Today</span>
                <span class="material-symbols-outlined text-[16px] text-primary">emergency</span>
              </div>
              <div class="flex items-baseline gap-1">
                <span class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold" id="dispatchesTodayCount">${an.dispatchesToday.toLocaleString()}</span>
                <span class="font-label-sm text-label-sm text-primary font-bold">Calls</span>
              </div>
              <div class="flex items-center gap-1 mt-1 text-primary font-label-sm text-label-sm font-semibold">
                <span class="material-symbols-outlined text-[14px]">check_circle</span>
                <span>98.4% handover</span>
              </div>
            </div>
            <div class="mt-2 pt-2">
              <div class="w-full bg-surface-container rounded-full h-2 flex overflow-hidden">
                <div class="bg-primary h-full" style="width: 78%"></div>
                <div class="bg-primary-fixed-dim h-full" style="width: 14%"></div>
                <div class="bg-tertiary h-full" style="width: 8%"></div>
              </div>
              <div class="flex justify-between items-center text-on-surface-variant font-label-sm text-label-sm mt-1">
                <span>ALS: 78%</span>
                <span>BLS: 22%</span>
              </div>
            </div>
          </div>

          <!-- KPI 3: Golden Hour -->
          <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="font-label-sm text-label-sm text-on-surface-variant font-medium">Golden Hour</span>
                <span class="material-symbols-outlined text-[16px] text-primary">timer</span>
              </div>
              <div class="flex items-baseline gap-1">
                <span class="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold">${an.goldenHourAdherencePercent}%</span>
              </div>
              <p class="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Adherence state-wide</p>
            </div>
            <div class="mt-2 pt-2">
              <div class="flex items-center gap-2">
                <div class="relative w-7 h-7 shrink-0">
                  <svg class="w-7 h-7 transform -rotate-90" viewbox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eaedff" stroke-width="4"></path>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#00685f" stroke-dasharray="91.2, 100" stroke-linecap="round" stroke-width="4"></path>
                  </svg>
                </div>
                <span class="font-label-sm text-label-sm text-secondary font-bold">+3.8% MoM gain</span>
              </div>
            </div>
          </div>

          <!-- KPI 4: Delay Flags -->
          <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="font-label-sm text-label-sm text-on-surface-variant font-medium">Delay Flags</span>
                <span class="material-symbols-outlined text-[16px] text-tertiary">report_problem</span>
              </div>
              <div class="flex items-baseline gap-1">
                <span class="font-headline-lg-mobile text-headline-lg-mobile text-tertiary font-bold">${an.delayFlagsCount}</span>
                <span class="font-label-sm text-label-sm text-on-surface-variant">incidents</span>
              </div>
              <p class="font-label-sm text-label-sm text-tertiary font-medium mt-0.5">Automated triage triggers</p>
            </div>
            <div class="mt-2 pt-2">
              <div class="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                <span class="flex items-center gap-1 text-on-surface">
                  <span class="w-2 h-2 rounded-full bg-tertiary"></span> 12 Inter-facility
                </span>
                <span class="font-bold text-tertiary">Active triage</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Heatmap & Geospatial Access Observatory Card -->
      <div class="px-margin-mobile py-space-sm">
        <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
          <div class="flex items-center justify-between mb-space-sm">
            <div>
              <span class="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">Geospatial Triage Layer</span>
              <h3 class="font-title-md text-title-md text-on-surface font-bold">Access Density & Fleet Map</h3>
            </div>
            <span class="px-2 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">satellite_alt</span>
              GPS Sync
            </span>
          </div>
          <div class="relative rounded-lg overflow-hidden shadow-inner">
            <div class="w-full h-44 bg-cover bg-center rounded-lg" data-location="Nuh, Mewat, Haryana, India" style="background-image: url('/images/mewat_map.jpg'), url('https://lh3.googleusercontent.com/aida-public/AB6AXuAjPPwo3ZmCg-Rc1xTPuvAixg4gQZ3vIzUu9imnGMiK2T5C4aS2kIHjeiL0RNyR0nJFJzUC3zAXCy_BcmB0zJWjR-i-gXqSpoGcjGWsezvkNJtOelzejt0VPGzL_VmPUW-nE6FWqF6pv3koNrh_cSZZUuleuDudKAGisKejU4ox41MzlkXYuuD9TlGPkQX7Wejf4CVckejvj5d0TXBG4pyw2irih4ZIpP8KRR8N9ujEKtOoVGU6HEfGZw')"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent flex flex-col justify-end p-space-sm text-inverse-on-surface">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-label-md text-label-md font-bold">Southern Corridor Hotspot</p>
                  <p class="font-label-sm text-label-sm opacity-80">${an.surgeHotspot.subSectors}</p>
                </div>
                <div class="flex items-center gap-1 px-2 py-1 rounded bg-tertiary text-on-tertiary font-label-sm text-label-sm font-bold">
                  <span>${an.surgeHotspot.status}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2 mt-space-sm text-center">
            <div class="bg-surface-container rounded-lg p-2">
              <p class="font-label-sm text-label-sm text-on-surface-variant">Active Ambulances</p>
              <p class="font-title-md text-title-md font-bold text-primary" id="activeAmbulanceFleet">${an.activeFleet.activeAmbulances} / ${an.activeFleet.totalFleet}</p>
            </div>
            <div class="bg-surface-container rounded-lg p-2">
              <p class="font-label-sm text-label-sm text-on-surface-variant">Surge Index</p>
              <p class="font-title-md text-title-md font-bold text-tertiary">${an.activeFleet.surgeIndex}</p>
            </div>
            <div class="bg-surface-container rounded-lg p-2">
              <p class="font-label-sm text-label-sm text-on-surface-variant">ICU Bed Vacancy</p>
              <p class="font-title-md text-title-md font-bold text-secondary">${an.activeFleet.icuBedVacancy} Beds</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Critical Gap Analysis & Heatmap Insights Card -->
      <div class="px-margin-mobile py-space-sm" id="gap-analysis-section">
        <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden">
          <div class="w-full h-1 bg-tertiary absolute top-0 left-0"></div>
          <div class="flex items-start justify-between gap-space-xs mb-space-sm">
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[22px]">crisis_alert</span>
              </div>
              <div>
                <span class="font-label-sm text-label-sm text-tertiary uppercase font-bold tracking-wider">Critical Gap Identified</span>
                <h3 class="font-title-md text-title-md text-on-surface font-bold">${an.surgeHotspot.clusterName}</h3>
              </div>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold shrink-0">
              Priority 1
            </span>
          </div>

          <!-- Cause Breakdown -->
          <div class="bg-surface-container-low rounded-lg p-space-sm mb-space-sm">
            <div class="flex items-start gap-2">
              <span class="material-symbols-outlined text-tertiary text-[18px] shrink-0 mt-0.5">info</span>
              <div>
                <p class="font-label-md text-label-md font-bold text-on-surface">Root Cause Analysis</p>
                <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  ${an.surgeHotspot.cause}
                </p>
              </div>
            </div>
          </div>

          <!-- AI Dispatch Recommendation Action Box -->
          <div class="bg-primary-container text-on-primary-container rounded-xl p-space-md shadow-sm">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="material-symbols-outlined text-[20px] text-secondary-fixed">psychology</span>
              <span class="font-label-md text-label-md font-bold text-secondary-fixed uppercase tracking-wider">RAKSHA Dispatch Engine Recommendation</span>
            </div>
            <p class="font-body-md text-body-md font-semibold text-on-primary-container">
              "${an.surgeHotspot.recommendation}"
            </p>
            <div class="mt-space-sm flex items-center justify-between gap-2 pt-2">
              <div class="text-on-primary-container font-label-sm text-label-sm opacity-90">
                Projected Gap Offset: <span class="font-bold text-white">${an.surgeHotspot.projectedGapOffset}</span>
              </div>
              <button class="px-4 py-2 rounded-lg ${isAuthorized ? 'bg-secondary text-on-secondary' : 'bg-surface-container-lowest text-primary'} font-label-md text-label-md font-bold shadow-sm active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer" id="dispatch-exec-btn" onclick="authorizeDispatchAction()" type="button" ${isAuthorized ? 'disabled' : ''}>
                <span class="material-symbols-outlined text-[16px]">${isAuthorized ? 'done' : 'send'}</span>
                <span>${isAuthorized ? 'Units Dispatched' : 'Authorize Dispatch'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Referral Network Flow -->
      <div class="px-margin-mobile py-space-sm">
        <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
          <div class="flex items-center justify-between mb-space-xs">
            <div>
              <span class="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">Patient Trajectory Flow</span>
              <h3 class="font-title-md text-title-md text-on-surface font-bold">Referral Corridor Dynamics</h3>
            </div>
            <span class="material-symbols-outlined text-outline text-[20px]">alt_route</span>
          </div>
          <p class="font-body-sm text-body-sm text-on-surface-variant mb-space-md">Live tiered routing adherence tracking across state facilities.</p>

          <div class="space-y-space-sm">
            <!-- Tier 1 to 2 -->
            <div class="bg-surface-container rounded-lg p-space-sm">
              <div class="flex justify-between items-center mb-1">
                <div class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                  <span class="font-label-md text-label-md font-bold text-on-surface">PHC → Community Health Centres (CHC)</span>
                </div>
                <span class="font-headline-sm text-headline-sm font-bold text-secondary">62%</span>
              </div>
              <p class="font-body-sm text-body-sm text-on-surface-variant mb-2">High primary stabilization adherence (1,920 transfers/week)</p>
              <div class="w-full bg-surface-dim rounded-full h-2.5 overflow-hidden">
                <div class="bg-secondary h-full rounded-full transition-all duration-500" style="width: 62%"></div>
              </div>
            </div>

            <!-- Tier 2 to 3 -->
            <div class="bg-surface-container rounded-lg p-space-sm">
              <div class="flex justify-between items-center mb-1">
                <div class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  <span class="font-label-md text-label-md font-bold text-on-surface">CHC → Tertiary (AIIMS / Safdarjung)</span>
                </div>
                <span class="font-headline-sm text-headline-sm font-bold text-primary">28%</span>
              </div>
              <p class="font-body-sm text-body-sm text-on-surface-variant mb-2">Advanced interventions & trauma referrals (868 transfers/week)</p>
              <div class="w-full bg-surface-dim rounded-full h-2.5 overflow-hidden">
                <div class="bg-primary h-full rounded-full transition-all duration-500" style="width: 28%"></div>
              </div>
            </div>

            <!-- Bypass Rate -->
            <div class="bg-secondary-container/50 rounded-lg p-space-sm">
              <div class="flex justify-between items-center mb-1">
                <div class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px] text-secondary">verified</span>
                  <span class="font-label-md text-label-md font-bold text-on-surface">Bypass Rate (Direct tertiary arrivals)</span>
                </div>
                <span class="font-headline-sm text-headline-sm font-bold text-secondary">10%</span>
              </div>
              <div class="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                <span>Direct arrivals without digital triage protocol</span>
                <span class="text-secondary font-bold inline-flex items-center gap-0.5">
                  <span class="material-symbols-outlined text-[14px]">trending_down</span>
                  Reduced by 24%
                </span>
              </div>
              <div class="w-full bg-surface-dim rounded-full h-2 mt-2 overflow-hidden">
                <div class="bg-secondary h-full rounded-full" style="width: 10%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Export & Administrative Policy Controls -->
      <div class="px-margin-mobile py-space-sm pb-space-lg">
        <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
          <div class="flex items-center gap-2 mb-space-sm">
            <div class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
              <span class="material-symbols-outlined text-[18px]">policy</span>
            </div>
            <div>
              <h3 class="font-title-md text-title-md text-on-surface font-bold">Policy & Audit Governance</h3>
              <p class="font-label-sm text-label-sm text-on-surface-variant">National Health Mission (NHM) Compliance</p>
            </div>
          </div>
          <div class="flex flex-col gap-2.5">
            <button class="w-full min-h-[48px] px-space-md rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-transform cursor-pointer" onclick="handleAuditDownloadClick()" type="button">
              <span class="material-symbols-outlined text-[20px]">download</span>
              <span>Download NHM Monthly Audit (CSV/PDF)</span>
            </button>
            <button class="w-full min-h-[48px] px-space-md rounded-lg bg-surface-container text-on-surface font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 hover:bg-surface-container-high active:scale-98 transition-all cursor-pointer" onclick="showNotificationToast('Surge threshold console: Auto-dispatch sensitivity set to Level 2.')" type="button">
              <span class="material-symbols-outlined text-[20px] text-primary">tune</span>
              <span>Configure Surge Thresholds</span>
            </button>
            <div class="mt-space-xs p-2.5 rounded-lg bg-surface-container-low text-center">
              <div class="flex items-center justify-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm">
                <span class="material-symbols-outlined text-[15px] text-secondary">verified_user</span>
                <span>Simulated National Innovation Demonstration Dataset</span>
              </div>
              <p class="font-label-sm text-label-sm text-outline mt-0.5">RAKSHA v4.2 • NDHM Certified Microservices Engine</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function authorizeDispatchAction() {
  const btn = document.getElementById('dispatch-exec-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined text-[16px] animate-spin">refresh</span> Dispatching...';
  }

  try {
    const res = await window.rakshaApi.redeployFleet();
    setTimeout(() => {
      if (btn) {
        btn.innerHTML = '<span class="material-symbols-outlined text-[16px]">done</span> Units Dispatched';
        btn.classList.remove('bg-surface-container-lowest', 'text-primary');
        btn.classList.add('bg-secondary', 'text-on-secondary');
      }
      showNotificationToast('2 ALS Units rerouted from Gurugram to Nuh Sub-Division (ETA: 32m). Dispatch ID #AMB-7719.');
    }, 900);
  } catch (e) {
    showNotificationToast("Dispatch authorized.");
  }
}

async function handleAuditDownloadClick() {
  showNotificationToast("Preparing authenticated NHM audit log export...");
  try {
    await window.rakshaApi.downloadAudit();
    showNotificationToast("Audit log downloaded successfully.");
  } catch (err) {
    showNotificationToast("Audit export error: " + err.message);
  }
}

window.renderScreen10 = renderScreen10;
window.authorizeDispatchAction = authorizeDispatchAction;
window.handleAuditDownloadClick = handleAuditDownloadClick;
