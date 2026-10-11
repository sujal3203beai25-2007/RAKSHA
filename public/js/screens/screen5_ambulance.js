// public/js/screens/screen5_ambulance.js
// Screen 5: Emergency Ambulance Live Tracking, Interactive Leaflet Map & Telemetry

let activeAmbulanceMap = null;

function renderScreen5(state) {
  const c = state.activeCase || {
    caseId: "EMG-8821",
    status: "DISPATCHED",
    etaMins: 6,
    speedKmH: 48,
    distanceKm: 2.1,
    vehicleReg: "DL-1RX-4402",
    leadParamedic: "Neha Rawat",
    driverName: "Satnam Singh",
    driverPhone: "+91 98110 44210",
    destinationHospital: "Safdarjung Emergency Trauma Centre",
    destinationLat: 28.5684,
    destinationLon: 77.2066,
    pickupLat: 28.4732,
    pickupLon: 77.0505,
    assignedBed: "Trauma Bay 03 Reserved",
    attendingCmo: "Dr. R. K. Verma",
    isSimulated: true,
    telemetry: {
      bp: "138/88",
      spo2: 96,
      pulse: 88,
      status: "Synced"
    }
  };

  const isHi = state.language === 'HI';

  // Schedule real interactive map initialization after DOM insertion
  if (!state.is2GMode) {
    setTimeout(() => {
      initAmbulanceLiveMap(c, state);
    }, 150);
  }

  const isPending = c.status === 'RECORDED' || !c.ambulanceId;
  const etaText = c.etaMins != null ? (c.etaMins < 10 ? '0' + c.etaMins : String(c.etaMins)) : '--';
  const statusLabel = isPending ? 'PENDING DISPATCH' : (c.status || 'ACTIVE');

  return `
    <div class="flex flex-col w-full pb-8">
      <!-- Live Dispatch Priority Banner -->
      <div class="px-margin-mobile pt-3 pb-2">
        <div class="bg-tertiary-container rounded-xl p-3 shadow-md flex items-center justify-between text-on-tertiary-container relative overflow-hidden">
          <div class="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-md pointer-events-none"></div>
          <div class="flex items-center gap-space-sm min-w-0 z-10">
            <span class="relative flex h-3 w-3 shrink-0">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="font-label-sm text-label-sm tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded-full font-bold">${statusLabel}</span>
                <span class="font-label-md text-label-md font-bold truncate">Case #${c.caseId}</span>
                ${c.isSimulated ? `<span class="bg-amber-300 text-amber-950 font-label-sm text-[10px] px-1.5 py-0.2 rounded font-bold uppercase">DEMO SIMULATION</span>` : `<span class="bg-secondary text-white font-label-sm text-[10px] px-1.5 py-0.2 rounded font-bold uppercase">LIVE 108 CAD</span>`}
              </div>
              <p class="font-body-sm text-body-sm text-white/90 truncate mt-0.5">${isPending ? 'Ambulance assignment pending nearest 108 hub allocation' : `Assigned Unit • ${c.vehicleReg || 'Ambulance DL-1RX'}`}</p>
            </div>
          </div>
          <div class="shrink-0 pl-2 text-right z-10">
            <span class="font-headline-sm text-headline-sm font-bold block leading-none" id="ambulanceEtaDisplay">${etaText}</span>
            <span class="font-label-sm text-label-sm tracking-tight text-white/80">${isPending ? 'QUEUE' : 'MIN ETA'}</span>
          </div>
        </div>
      </div>

      <!-- Real Interactive Leaflet Transit Map -->
      <div class="px-margin-mobile my-2">
        <div class="relative w-full rounded-xl overflow-hidden shadow-md bg-surface-container border border-outline-variant/30">
          <div class="w-full h-64 bg-surface-container-high relative" id="ambulanceLiveLeafletMap"></div>
          <div class="absolute top-2 left-2 z-[400] bg-surface/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 text-[11px] font-semibold text-on-surface">
            <span class="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span>Live GPS Lock: ${c.vehicleReg}</span>
          </div>
          <div class="absolute bottom-2 right-2 z-[400] bg-surface/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm text-[11px] font-bold text-primary">
            <span>${c.distanceKm} km to Destination</span>
          </div>
        </div>
      </div>

      <!-- Telemetry Live Stream Card -->
      <div class="px-margin-mobile my-2">
        <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/30">
          <div class="flex items-center justify-between pb-2 border-b border-surface-container">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[20px]">monitor_heart</span>
              <h3 class="font-title-md text-title-md font-bold text-on-surface">Patient Telemetry Stream</h3>
            </div>
            <span class="font-label-sm text-label-sm px-2 py-0.5 rounded-full ${c.isSimulated ? 'bg-amber-100 text-amber-800' : 'bg-secondary-container text-on-secondary-container'} font-bold">
              ${c.isSimulated ? 'Simulated Sensor Feed' : 'Live Bluetooth Sync'}
            </span>
          </div>

          <div class="grid grid-cols-3 gap-2 mt-3 text-center">
            <div class="bg-surface-container-low p-2.5 rounded-xl flex flex-col">
              <span class="font-label-sm text-label-sm text-on-surface-variant uppercase text-[10px]">Blood Pressure</span>
              <span class="font-headline-sm text-headline-sm font-bold text-on-surface mt-1" id="vitalBpDisplay">${c.telemetry.bp || '136/86'}</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant text-[11px]">mmHg</span>
            </div>

            <div class="bg-surface-container-low p-2.5 rounded-xl flex flex-col">
              <span class="font-label-sm text-label-sm text-on-surface-variant uppercase text-[10px]">Oxygen (SpO2)</span>
              <span class="font-headline-sm text-headline-sm font-bold ${c.telemetry.spo2 < 94 ? 'text-tertiary' : 'text-secondary'} mt-1" id="vitalSpo2Display">${c.telemetry.spo2 || 96}%</span>
              <span class="font-label-sm text-label-sm text-secondary font-semibold text-[11px]">Stable</span>
            </div>

            <div class="bg-surface-container-low p-2.5 rounded-xl flex flex-col">
              <span class="font-label-sm text-label-sm text-on-surface-variant uppercase text-[10px]">Pulse Rate</span>
              <span class="font-headline-sm text-headline-sm font-bold text-primary mt-1" id="vitalPulseDisplay">${c.telemetry.pulse || 88}</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant text-[11px]">bpm</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Ambulance Crew & Hospital Intake Dossier -->
      <div class="px-margin-mobile my-2 flex flex-col gap-2.5">
        <!-- Driver & Paramedic -->
        <div class="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm border border-outline-variant/30 flex items-center justify-between">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-10 h-10 rounded-full bg-surface-container-highest text-primary flex items-center justify-center font-bold text-[14px] shrink-0">
              <span class="material-symbols-outlined text-[20px]">person</span>
            </div>
            <div class="flex flex-col min-w-0">
              <span class="font-label-sm text-label-sm text-on-surface-variant">Pilot / EMT Lead</span>
              <span class="font-label-lg text-label-lg font-bold text-on-surface truncate">${c.driverName || 'Satnam Singh'} • ${c.leadParamedic || 'Paramedic'}</span>
              <span class="font-label-sm text-label-sm text-secondary font-semibold">${c.vehicleReg}</span>
            </div>
          </div>
          <a class="px-3 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-transform" href="tel:${c.driverPhone || '+919811044210'}">
            <span class="material-symbols-outlined text-[16px]">call</span> Call Pilot
          </a>
        </div>

        <!-- Destination Trauma Centre -->
        <div class="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm border border-outline-variant/30 flex items-center justify-between">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[14px] shrink-0">
              <span class="material-symbols-outlined text-[20px]">local_hospital</span>
            </div>
            <div class="flex flex-col min-w-0">
              <span class="font-label-sm text-label-sm text-on-surface-variant">Destination Intake Hospital</span>
              <span class="font-label-lg text-label-lg font-bold text-on-surface truncate">${c.destinationHospital}</span>
              <span class="font-label-sm text-label-sm text-tertiary font-bold">${c.assignedBed || 'Trauma Bay 03 Reserved'}</span>
            </div>
          </div>
          <button class="px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-bold flex items-center gap-1 cursor-pointer" onclick="window.rakshaState.setScreen('screen-7')">
            <span class="material-symbols-outlined text-[16px]">bed</span> ER View
          </button>
        </div>
      </div>
    </div>
  `;
}

// Initialize Leaflet Live Map for Ambulance & Patient Corridor
function initAmbulanceLiveMap(c, state) {
  if (typeof L === 'undefined') return;

  const mapEl = document.getElementById('ambulanceLiveLeafletMap');
  if (!mapEl) return;

  if (activeAmbulanceMap) {
    activeAmbulanceMap.remove();
    activeAmbulanceMap = null;
  }

  const ambLat = c.destinationLat ? (c.destinationLat - 0.02) : 28.5484;
  const ambLon = c.destinationLon ? (c.destinationLon - 0.02) : 77.1866;
  const destLat = c.destinationLat || 28.5684;
  const destLon = c.destinationLon || 77.2066;

  try {
    const map = L.map('ambulanceLiveLeafletMap', {
      zoomControl: false,
      attributionControl: true
    }).setView([ambLat, ambLon], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // Ambulance marker
    const ambIcon = L.divIcon({
      className: 'custom-amb-pin',
      html: `<div style="width:30px;height:30px;border-radius:50%;background:#bb0112;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px rgba(187,1,18,0.8);border:2px solid #fff;"><span class="material-symbols-outlined" style="font-size:18px;">ambulance</span></div>`,
      iconSize: [30, 30]
    });
    L.marker([ambLat, ambLon], { icon: ambIcon })
      .addTo(map)
      .bindPopup(`<strong>108 ALS Ambulance</strong><br/>Reg: ${c.vehicleReg}<br/>ETA: ${c.etaMins} mins`);

    // Destination Hospital marker
    const hospIcon = L.divIcon({
      className: 'custom-hosp-pin',
      html: `<div style="width:26px;height:26px;border-radius:50%;background:#00685f;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px rgba(0,104,95,0.7);border:2px solid #fff;"><span class="material-symbols-outlined" style="font-size:16px;">local_hospital</span></div>`,
      iconSize: [26, 26]
    });
    L.marker([destLat, destLon], { icon: hospIcon })
      .addTo(map)
      .bindPopup(`<strong>${c.destinationHospital}</strong><br/>Trauma Intake Ready`);

    // Connecting green corridor polyline
    L.polyline([[ambLat, ambLon], [destLat, destLon]], {
      color: '#006c4a',
      weight: 4,
      dashArray: '6, 6',
      opacity: 0.8
    }).addTo(map);

    map.fitBounds([[ambLat, ambLon], [destLat, destLon]], { padding: [30, 30] });
    activeAmbulanceMap = map;
  } catch (err) {
    console.warn('[Leaflet] Ambulance map init error:', err);
  }
}

window.renderScreen5 = renderScreen5;
