// public/js/screens/screen3_facilities.js
// Screen 3: Find Care Facilities & Real-Time Bed Directory with Interactive Leaflet Map

let currentFilter = 'all';
let currentSearch = '';
let activeFacilityMap = null;

function renderScreen3(state) {
  const isHi = state.language === 'HI';
  const facilities = state.facilities || [];
  const userLoc = state.userLocation;

  // Filter facilities based on current active filter & search text
  const filtered = facilities.filter(item => {
    let matchesFilter = true;
    if (currentFilter === 'govt') matchesFilter = item.govt;
    else if (currentFilter === 'pmjay') matchesFilter = item.pmjay;
    else if (currentFilter === 'icu') matchesFilter = item.icuBedsFree > 0;
    else if (currentFilter === 'oxygen') matchesFilter = item.oxygenBedsFree > 0;
    else if (currentFilter === 'blood') matchesFilter = item.bloodBank && item.bloodBank['O+'] > 0;

    let matchesSearch = true;
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      matchesSearch = (item.name && item.name.toLowerCase().includes(q)) ||
                      (item.address && item.address.toLowerCase().includes(q)) ||
                      (item.category && item.category.toLowerCase().includes(q)) ||
                      (item.district && item.district.toLowerCase().includes(q));
    }
    return matchesFilter && matchesSearch;
  });

  // Schedule real interactive map initialization after DOM insertion
  if (!state.is2GMode) {
    setTimeout(() => {
      initFacilityLeafletMap(state, filtered);
    }, 150);
  }

  return `
    <div class="flex flex-col w-full pb-8">
      <!-- Interactive Top Action Area -->
      <div class="px-margin-mobile pt-space-sm pb-space-xs flex flex-col gap-space-sm">
        <!-- Live Operational Banner with Real Location & 2G Toggle -->
        <div class="flex items-center justify-between bg-surface-container p-2.5 rounded-xl shadow-sm">
          <div class="flex items-center gap-2 min-w-0">
            <span class="relative flex h-2.5 w-2.5 shrink-0">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
            </span>
            <div class="flex flex-col min-w-0">
              <span class="font-label-sm text-label-sm text-on-surface font-bold uppercase tracking-wider truncate">
                ${userLoc ? `${userLoc.locality}, ${userLoc.district} (${userLoc.lat.toFixed(3)}, ${userLoc.lon.toFixed(3)})` : 'Set Location to Discover Nearby Hospitals'}
              </span>
              <span class="font-body-sm text-body-sm text-on-surface-variant text-[11px] leading-tight truncate">
                ${filtered.length} Healthcare centres within ${state.searchRadiusKm || 15} km radius
              </span>
            </div>
          </div>
          <!-- 2G Mode Toggle -->
          <button class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full ${state.is2GMode ? 'bg-primary text-on-primary' : 'bg-surface text-primary'} shadow-sm active:scale-95 transition-all text-left shrink-0 cursor-pointer" id="toggle-compact-btn" onclick="window.rakshaState.toggle2GMode()" type="button">
            <span class="material-symbols-outlined text-[16px]">signal_cellular_alt_1_bar</span>
            <span class="font-label-sm text-label-sm font-semibold">${state.is2GMode ? '2G Active' : '2G Compact'}</span>
          </button>
        </div>

        ${state.isLoadingFacilities ? `
          <div class="p-3 rounded-xl bg-primary/10 border border-primary/30 flex items-center gap-2 text-primary font-label-md text-label-md animate-pulse">
            <span class="material-symbols-outlined text-[20px] animate-spin">sync</span>
            <span>Querying OpenStreetMap Overpass & National Directory for ${userLoc ? userLoc.locality : 'location'}...</span>
          </div>
        ` : ''}

        <!-- Search Input Bar with Voice & Radius Switcher -->
        <div class="flex items-center gap-2">
          <div class="relative flex-1">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary">
              <span class="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input class="w-full h-12 pl-10 pr-10 rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-md text-body-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" id="directory-search" oninput="handleFacilitySearch(this.value)" placeholder="${isHi ? 'अस्पताल, पीएचसी/सीएचसी, आईसीयू खोजें...' : 'Search hospitals, PHC/CHC, ICU, blood bank...'}" type="search" value="${currentSearch}"/>
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button class="text-on-surface-variant hover:text-primary p-1 rounded-full active:scale-90 transition-transform cursor-pointer" onclick="startVoiceSearch()" title="Voice Search (Hindi / English)" type="button">
                <span class="material-symbols-outlined text-[20px]">mic</span>
              </button>
            </div>
          </div>
          <button class="h-12 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-primary font-label-md text-label-md font-bold shadow-sm shrink-0 cursor-pointer" onclick="showLocationModal()" title="Change Search Radius & Location">
            <span class="material-symbols-outlined text-[20px]">tune</span>
          </button>
        </div>

        <!-- Filter Chips Horizontal Scroll -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-margin-mobile px-margin-mobile">
          <button class="filter-chip shrink-0 px-3.5 py-1.5 rounded-full ${currentFilter === 'all' ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container text-on-surface'} font-label-md text-label-md flex items-center gap-1.5 shadow-sm transition-all cursor-pointer" onclick="setFacilityFilter('all')">
            <span class="material-symbols-outlined text-[15px]">apps</span>
            <span>All (${facilities.length})</span>
          </button>
          <button class="filter-chip shrink-0 px-3.5 py-1.5 rounded-full ${currentFilter === 'govt' ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container text-on-surface'} font-label-md text-label-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer" onclick="setFacilityFilter('govt')">
            <span class="material-symbols-outlined text-[15px] ${currentFilter === 'govt' ? 'text-white' : 'text-secondary'}">account_balance</span>
            <span>Govt / Free</span>
          </button>
          <button class="filter-chip shrink-0 px-3.5 py-1.5 rounded-full ${currentFilter === 'pmjay' ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container text-on-surface'} font-label-md text-label-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer" onclick="setFacilityFilter('pmjay')">
            <span class="material-symbols-outlined text-[15px] ${currentFilter === 'pmjay' ? 'text-white' : 'text-primary'}">verified_user</span>
            <span>PM-JAY Empanelled</span>
          </button>
          <button class="filter-chip shrink-0 px-3.5 py-1.5 rounded-full ${currentFilter === 'icu' ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container text-on-surface'} font-label-md text-label-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer" onclick="setFacilityFilter('icu')">
            <span class="material-symbols-outlined text-[15px] ${currentFilter === 'icu' ? 'text-white' : 'text-secondary'}">bed</span>
            <span>ICU Available</span>
          </button>
          <button class="filter-chip shrink-0 px-3.5 py-1.5 rounded-full ${currentFilter === 'oxygen' ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container text-on-surface'} font-label-md text-label-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer" onclick="setFacilityFilter('oxygen')">
            <span class="material-symbols-outlined text-[15px] ${currentFilter === 'oxygen' ? 'text-white' : 'text-primary'}">air</span>
            <span>Oxygen 24x7</span>
          </button>
          <button class="filter-chip shrink-0 px-3.5 py-1.5 rounded-full ${currentFilter === 'blood' ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container text-on-surface'} font-label-md text-label-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer" onclick="setFacilityFilter('blood')">
            <span class="material-symbols-outlined text-[15px] ${currentFilter === 'blood' ? 'text-white' : 'text-tertiary'}">bloodtype</span>
            <span>Blood Bank (O+)</span>
          </button>
        </div>
      </div>

      <!-- Real Interactive Leaflet Map Container -->
      ${state.is2GMode ? `
        <div class="px-margin-mobile my-space-xs">
          <div class="p-3 rounded-xl bg-surface-container text-on-surface-variant flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[20px]">satellite_alt</span>
              <span class="font-label-md text-label-md font-semibold">2G Compact Mode: Map Imagery Suppressed for Fast Loading</span>
            </div>
            <button class="text-primary font-label-sm text-label-sm underline font-bold cursor-pointer" onclick="window.rakshaState.toggle2GMode()">Show Map</button>
          </div>
        </div>
      ` : `
        <div class="px-margin-mobile my-space-xs" id="map-section">
          <div class="relative w-full rounded-xl overflow-hidden shadow-sm border border-outline-variant/30">
            <div class="w-full h-64 bg-surface-container-high relative" id="facilityLeafletMap"></div>
            <div class="absolute bottom-2 left-2 z-[400] bg-surface/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-semibold text-on-surface flex items-center gap-1 shadow-sm">
              <span class="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span>OpenStreetMap Live Tiles</span>
            </div>
            <button class="absolute top-2 right-2 z-[400] bg-surface/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-primary flex items-center gap-1 shadow-sm cursor-pointer hover:bg-surface" onclick="searchLiveOsmFacilities()">
              <span class="material-symbols-outlined text-[14px]">travel_explore</span>
              <span>Refresh OSM Query</span>
            </button>
          </div>
        </div>
      `}

      <!-- Facility Cards List Header -->
      <div class="px-margin-mobile pt-space-xs pb-1 flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <span class="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider">
            Verified Healthcare Centres
          </span>
          <span class="px-2 py-0.5 rounded-full bg-surface-container text-primary text-[11px] font-bold">
            ${filtered.length} found
          </span>
        </div>
        <span class="font-label-sm text-label-sm text-on-surface-variant">
          ${userLoc ? 'Sorted by actual distance' : 'National Directory'}
        </span>
      </div>

      <!-- Facility Cards Directory List -->
      <div class="flex flex-col gap-3 px-margin-mobile mt-1" id="facilitiesListContainer">
        ${filtered.length === 0 ? `
          <div class="p-8 text-center bg-surface-container-lowest rounded-xl shadow-sm flex flex-col items-center">
            <span class="material-symbols-outlined text-outline text-[40px] mb-2">domain_disabled</span>
            <p class="font-title-md text-title-md font-bold text-on-surface">No Facilities Match Your Filters</p>
            <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">Try expanding your search radius or search nationwide via OpenStreetMap Overpass.</p>
            <button class="mt-4 px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold cursor-pointer" onclick="searchLiveOsmFacilities()">
              Search Nationwide via Live OpenStreetMap
            </button>
          </div>
        ` : filtered.map((item, idx) => {
          const isDivert = Boolean(item.surgeDivertActive);
          const hasBeds = item.icuBedsFree !== undefined;
          const mapLat = item.lat || 28.5684;
          const mapLon = item.lon || 77.2066;
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapLat},${mapLon}`;

          return `
            <div class="facility-card bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/30 relative flex flex-col gap-2 transition-all hover:shadow-md" id="card-${item.id}">
              <!-- Top Header & Badges -->
              <div class="flex items-start justify-between gap-2">
                <div class="flex flex-col min-w-0">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="font-label-sm text-label-sm px-2 py-0.5 rounded-full ${item.govt ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container text-on-surface'} font-bold">
                      ${item.govt ? 'Govt / Public' : 'Private'}
                    </span>
                    <span class="font-label-sm text-label-sm text-on-surface-variant truncate">${item.category || 'Hospital'}</span>
                  </div>
                  <h3 class="font-title-md text-title-md font-bold text-on-surface mt-1 leading-snug">${item.name}</h3>
                  <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5 flex items-center gap-1 truncate">
                    <span class="material-symbols-outlined text-[15px] text-primary shrink-0">location_on</span>
                    <span>${item.address}</span>
                  </p>
                </div>

                <!-- Distance Pill -->
                <div class="text-right shrink-0">
                  <span class="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-title-md text-title-md font-bold block leading-none">
                    ${item.distanceKm != null ? `${item.distanceKm} km` : 'NCR'}
                  </span>
                  <span class="font-label-sm text-label-sm text-on-surface-variant text-[10px] uppercase font-semibold">Haversine</span>
                </div>
              </div>

              <!-- Surge Divert Alert if active -->
              ${isDivert ? `
                <div class="p-2 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 text-[12px] font-semibold">
                  <span class="material-symbols-outlined text-[16px] text-amber-700">warning</span>
                  <span>Surge Divert Active: Non-critical emergency arrivals currently rerouted.</span>
                </div>
              ` : ''}

              <!-- Real Live Capacity Grid -->
              ${hasBeds ? `
                <div class="grid grid-cols-3 gap-2 py-1.5 px-2 bg-surface-container-low rounded-lg mt-1">
                  <div class="flex flex-col">
                    <span class="font-label-sm text-label-sm text-on-surface-variant uppercase text-[10px]">ICU Beds</span>
                    <span class="font-label-md text-label-md font-bold ${item.icuBedsFree > 0 ? 'text-secondary' : 'text-error'}">
                      ${item.icuBedsFree > 0 ? `${item.icuBedsFree} Available` : 'Full (0)'}
                    </span>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-label-sm text-label-sm text-on-surface-variant uppercase text-[10px]">Oxygen Beds</span>
                    <span class="font-label-md text-label-md font-bold ${item.oxygenBedsFree > 0 ? 'text-primary' : 'text-error'}">
                      ${item.oxygenBedsFree > 0 ? `${item.oxygenBedsFree} Free` : 'Occupied'}
                    </span>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-label-sm text-label-sm text-on-surface-variant uppercase text-[10px]">Blood Bank</span>
                    <span class="font-label-md text-label-md font-bold text-on-surface">
                      ${item.bloodBank && item.bloodBank['O+'] ? `${item.bloodBank['O+']} Units O+` : 'Enquire'}
                    </span>
                  </div>
                </div>
              ` : `
                <div class="py-1 px-2 bg-surface-container rounded-lg text-[11px] text-on-surface-variant flex items-center justify-between">
                  <span>Source: ${item.source || 'OpenStreetMap Registry'}</span>
                  <span class="text-primary font-semibold">Capacity: Hospital Self-Reported</span>
                </div>
              `}

              <!-- Operational Action Buttons -->
              <div class="flex items-center gap-2 pt-1 border-t border-surface-container mt-1">
                <a class="flex-1 py-2 px-3 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-bold flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors" href="${directionsUrl}" target="_blank" rel="noopener noreferrer">
                  <span class="material-symbols-outlined text-[16px] text-primary">directions</span>
                  <span>Directions</span>
                </a>

                ${item.phone ? `
                  <a class="py-2 px-3 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-bold flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors" href="tel:${item.phone}">
                    <span class="material-symbols-outlined text-[16px] text-secondary">call</span>
                    <span>Call</span>
                  </a>
                ` : ''}

                <button class="flex-1 py-2 px-3 rounded-lg ${item.isBookable !== false && !item.id.startsWith('osm-') && !item.id.startsWith('nom-') ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'} font-label-md text-label-md font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform cursor-pointer" onclick="handleFacilityBooking('${item.id}')">
                  <span class="material-symbols-outlined text-[16px]">calendar_today</span>
                  <span>${item.isBookable !== false && !item.id.startsWith('osm-') && !item.id.startsWith('nom-') ? 'Book OPD' : 'OPD In-Person'}</span>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// Initialize Leaflet Map
function initFacilityLeafletMap(state, facilities) {
  if (typeof L === 'undefined') return;

  const mapEl = document.getElementById('facilityLeafletMap');
  if (!mapEl) return;

  // Clean up existing map instance if any
  if (activeFacilityMap) {
    activeFacilityMap.remove();
    activeFacilityMap = null;
  }

  const uLat = state.userLocation ? state.userLocation.lat : 28.5684;
  const uLon = state.userLocation ? state.userLocation.lon : 77.2066;

  try {
    const map = L.map('facilityLeafletMap', {
      zoomControl: true,
      attributionControl: true
    }).setView([uLat, uLon], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // User position marker (Blue pulse)
    if (state.userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: `<div style="width:16px;height:16px;border-radius:50%;background:#00685f;border:3px solid #ffffff;box-shadow:0 0 10px rgba(0,104,95,0.8);"></div>`,
        iconSize: [16, 16]
      });
      L.marker([uLat, uLon], { icon: userIcon })
        .addTo(map)
        .bindPopup(`<strong>Your Location</strong><br/>${state.userLocation.locality || state.userLocation.displayName}`)
        .openPopup();
    }

    // Facility Markers
    const bounds = [];
    if (state.userLocation) bounds.push([uLat, uLon]);

    facilities.slice(0, 30).forEach(fac => {
      if (fac.lat != null && fac.lon != null) {
        bounds.push([fac.lat, fac.lon]);
        const isIcu = fac.icuBedsFree > 0;
        const color = isIcu ? '#006c4a' : '#00685f';

        const facIcon = L.divIcon({
          className: 'custom-fac-pin',
          html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);">+</div>`,
          iconSize: [22, 22]
        });

        const safeName = window.escapeHtml ? window.escapeHtml(fac.name) : fac.name;
        const safeCat = window.escapeHtml ? window.escapeHtml(fac.category || 'Hospital') : (fac.category || 'Hospital');
        const marker = L.marker([fac.lat, fac.lon], { icon: facIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:Inter,sans-serif;font-size:12px;">
            <strong style="font-size:13px;color:#131b2e;">${safeName}</strong><br/>
            <span style="color:#6d7a77;">${safeCat}</span><br/>
            ${fac.icuBedsFree != null ? `<strong>ICU Beds:</strong> ${fac.icuBedsFree} free<br/>` : ''}
            <a href="https://www.google.com/maps/dir/?api=1&destination=${fac.lat},${fac.lon}" target="_blank" rel="noopener noreferrer" style="color:#00685f;font-weight:bold;text-decoration:underline;">Get Directions</a>
          </div>
        `);
      }
    });

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }

    activeFacilityMap = map;
  } catch (err) {
    console.warn('[Leaflet] Map init error:', err);
  }
}

// Live Nationwide OpenStreetMap Search
async function searchLiveOsmFacilities() {
  const state = window.rakshaState;
  const lat = state.userLocation ? state.userLocation.lat : 28.5684;
  const lon = state.userLocation ? state.userLocation.lon : 77.2066;

  showNotificationToast("Querying OpenStreetMap Overpass Live API across India...");

  try {
    const res = await window.rakshaApi.getNearbyFacilities(lat, lon, state.searchRadiusKm || 20);
    if (res.facilities && res.facilities.length > 0) {
      state.facilities = res.facilities;
      showNotificationToast(`Discovered ${res.facilities.length} healthcare centres from live OpenStreetMap!`);
      state.notify();
    } else {
      showNotificationToast("No additional OSM records found in this radius. Try 50km radius.");
    }
  } catch (err) {
    showNotificationToast("Live query error: " + err.message);
  }
}

function setFacilityFilter(filter) {
  currentFilter = filter;
  window.rakshaState.notify();
}

function handleFacilitySearch(val) {
  currentSearch = val;
  window.rakshaState.notify();
}

function startVoiceSearch() {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = window.rakshaState.language === 'HI' ? 'hi-IN' : 'en-IN';
    showNotificationToast("Listening for voice search (Hindi/English)...");
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      currentSearch = transcript;
      showNotificationToast(`Recognized: "${transcript}"`);
      window.rakshaState.notify();
    };
    recognition.start();
  } else {
    showNotificationToast("Voice Search not supported in this browser. Please type hospital name.");
  }
}

function handleFacilityBooking(facilityId) {
  const state = window.rakshaState;
  const fac = state && state.facilities ? state.facilities.find(f => f.id === facilityId) : null;
  if (!fac) return;
  if (fac.isBookable === false || fac.id.startsWith('osm-') || fac.id.startsWith('nom-')) {
    showNotificationToast("Direct online OPD token booking is reserved for verified empanelled hospitals in the national directory. For external map listings, please use Call or Directions.");
    return;
  }
  showAppointmentModal(fac.id, fac.name);
}

window.renderScreen3 = renderScreen3;
window.setFacilityFilter = setFacilityFilter;
window.handleFacilitySearch = handleFacilitySearch;
window.startVoiceSearch = startVoiceSearch;
window.searchLiveOsmFacilities = searchLiveOsmFacilities;
window.handleFacilityBooking = handleFacilityBooking;
