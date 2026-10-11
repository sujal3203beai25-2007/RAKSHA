// server/data.js
// Pre-seeded clinical, geospatial, and operational datasets for RAKSHA

const initialFacilities = [
  {
    id: "civil",
    name: "Civil Hospital Gurugram",
    nameHi: "सिविल अस्पताल गुरुग्राम",
    type: "Govt / CHC",
    address: "Sector 10A, Near Bus Stand, Gurugram, Haryana",
    distanceKm: 1.2,
    triageLoad: "Medium Triage",
    triageColor: "amber",
    pmjay: true,
    govt: true,
    icuBedsFree: 8,
    totalIcuBeds: 24,
    oxygenBedsFree: 14,
    totalOxygenBeds: 40,
    wardBedsFree: 22,
    ventilatorsFree: 3,
    avgWaitMins: 22,
    janAushadhi: true,
    bloodBank: { "O+": 4, "B+": 6, "A+": 3, "AB+": 2 },
    opdHours: "08:00 AM - 02:00 PM",
    emergencyOpen: "24x7 Open",
    wheelchairReady: true,
    ayushmanMitraDesk: "Gate 2 Desk",
    abhaSyncId: "CH-GGM-0914",
    doctorsOnDuty: 14,
    surgeDivertActive: false,
    lat: 28.4682,
    lng: 77.0299
  },
  {
    id: "fortis",
    name: "Fortis Memorial Research Institute",
    nameHi: "फोर्टिस मेमोरियल रिसर्च इंस्टीट्यूट",
    type: "Private Tertiary / PM-JAY",
    address: "Sector 44, Opp. HUDA City Centre, Gurugram",
    distanceKm: 2.8,
    triageLoad: "Low Triage",
    triageColor: "secondary",
    pmjay: true,
    govt: false,
    icuBedsFree: 12,
    totalIcuBeds: 50,
    oxygenBedsFree: 28,
    totalOxygenBeds: 80,
    wardBedsFree: 45,
    ventilatorsFree: 6,
    avgWaitMins: 10,
    janAushadhi: false,
    bloodBank: { "O+": 12, "B+": 9, "A+": 8, "AB+": 5 },
    opdHours: "09:00 AM - 08:00 PM",
    emergencyOpen: "24x7 Open",
    wheelchairReady: true,
    ayushmanMitraDesk: "Tower A, Lobby",
    abhaSyncId: "FMRI-GGM-4401",
    doctorsOnDuty: 32,
    surgeDivertActive: false,
    lat: 28.4595,
    lng: 77.0726
  },
  {
    id: "artemis",
    name: "Artemis Hospital",
    nameHi: "आर्टेमिस अस्पताल",
    type: "Super Speciality",
    address: "Sector 51, Gurugram, Haryana",
    distanceKm: 4.5,
    triageLoad: "Surge Alert",
    triageColor: "tertiary",
    pmjay: true,
    govt: false,
    icuBedsFree: 2,
    totalIcuBeds: 36,
    oxygenBedsFree: 5,
    totalOxygenBeds: 60,
    wardBedsFree: 12,
    ventilatorsFree: 1,
    avgWaitMins: 45,
    janAushadhi: false,
    bloodBank: { "O+": 2, "B+": 4, "A+": 1, "AB+": 2 },
    opdHours: "24x7 Emergency / OPD 09:00 - 17:00",
    emergencyOpen: "24x7 Open",
    wheelchairReady: true,
    ayushmanMitraDesk: "Emergency Reception",
    abhaSyncId: "ART-GGM-5120",
    doctorsOnDuty: 24,
    surgeDivertActive: false,
    lat: 28.4326,
    lng: 77.0805
  },
  {
    id: "safdarjung",
    name: "Safdarjung District General & Trauma Centre",
    nameHi: "सफदरजंग जिला अस्पताल एवं ट्रॉमा सेंटर",
    type: "District Tertiary / Apex Trauma",
    address: "Ring Road, Opp. AIIMS, New Delhi / NCR Hub",
    distanceKm: 8.4,
    triageLoad: "Critical Load (96%)",
    triageColor: "tertiary",
    pmjay: true,
    govt: true,
    icuBedsFree: 4,
    totalIcuBeds: 60,
    oxygenBedsFree: 18,
    totalOxygenBeds: 120,
    wardBedsFree: 18,
    totalEmergencyBeds: 50,
    occupiedEmergencyBeds: 48,
    ventilatorsFree: 2,
    avgWaitMins: 35,
    janAushadhi: true,
    bloodBank: { "O+": 4, "B+": 8, "A+": 2, "AB+": 3 },
    opdHours: "08:00 AM - 01:00 PM",
    emergencyOpen: "24x7 Open",
    wheelchairReady: true,
    ayushmanMitraDesk: "Trauma Gate 3",
    abhaSyncId: "NHM-DL-8812",
    doctorsOnDuty: 58,
    surgeDivertActive: false,
    lat: 28.5702,
    lng: 77.2074
  },
  {
    id: "aiims-jhajjar",
    name: "AIIMS Jhajjar (National Cancer Institute)",
    nameHi: "एम्स झज्जर",
    type: "National Apex Tertiary",
    address: "Badsa, Jhajjar, Haryana",
    distanceKm: 18.5,
    triageLoad: "Optimal",
    triageColor: "secondary",
    pmjay: true,
    govt: true,
    icuBedsFree: 6,
    totalIcuBeds: 40,
    oxygenBedsFree: 25,
    totalOxygenBeds: 100,
    wardBedsFree: 60,
    ventilatorsFree: 8,
    avgWaitMins: 15,
    janAushadhi: true,
    bloodBank: { "O+": 15, "B+": 12, "A+": 10, "AB+": 6 },
    opdHours: "08:30 AM - 04:00 PM",
    emergencyOpen: "24x7 Open",
    wheelchairReady: true,
    ayushmanMitraDesk: "Main Atrium",
    abhaSyncId: "AIIMS-JHJ-001",
    doctorsOnDuty: 45,
    surgeDivertActive: false,
    lat: 28.4891,
    lng: 76.8423
  }
];

const initialEmergencyCases = [
  {
    caseId: "EMG-8821",
    status: "DISPATCHED", // DISPATCHED, ARRIVED, ONBOARD, IN_TRANSIT, DELAYED, ADMITTED
    code: "CODE_RED_ALS",
    priority: "HIGH",
    patientName: "Rameshwar Lal",
    patientAge: 58,
    patientGender: "Male",
    abhaId: "91-2384-9912",
    bloodGroup: "O+",
    reportedEmergency: "Acute Sub-sternal Chest Pain, Dyspnea • Cardiac STEMI Alert",
    pickupLocation: "Near Govt Primary School, Village Bilaspur, NH-48 Service Road",
    destinationFacilityId: "safdarjung",
    destinationHospital: "Safdarjung Emergency Trauma Centre",
    assignedBed: "Trauma Bay 03 Reserved",
    attendingCmo: "Dr. R. K. Verma",
    ambulanceId: "AMB-44",
    vehicleReg: "DL-1RX-4402",
    fleetName: "108 ALS Vehicle #44 (St. John Fleet)",
    leadParamedic: "Neha Rawat",
    driverName: "Vikram Singh",
    driverId: "DRV-882",
    etaMins: 6,
    distanceKm: 3.4,
    speedKmH: 48,
    transitRoute: "Ring Road Flyover • Clear Green Corridor",
    sirenOn: true,
    telemetry: {
      bp: "138/88",
      spo2: 91,
      pulse: 88,
      status: "Synced",
      o2PressureBar: 85,
      defibArmed: true
    },
    timestamps: {
      dispatchedAt: new Date(Date.now() - 8 * 60000).toISOString(),
      arrivedAt: null,
      patientBoardedAt: null,
      admittedAt: null
    },
    delayReported: false,
    delayReason: null
  }
];

const initialReferrals = [
  {
    refId: "REF-2025-084",
    protocol: "ABDM FastTrack",
    priority: "CRITICAL",
    category: "Inter-Facility Emergency Transfer",
    patientName: "Rameshwar Lal",
    patientAge: 58,
    patientGender: "Male",
    abhaId: "91-0021-4921-3310",
    pmjayEligible: true,
    originFacility: "PHC Bawal / Sub-District Hospital Rewari",
    receivingFacility: "AIIMS New Delhi (Cardiology OPD / CCU)",
    receivingBed: "#ICU-04",
    currentStep: 3, // 1 to 5
    totalSteps: 5,
    progressPercent: 60,
    steps: [
      {
        step: 1,
        title: "Clinical Triage & Origin Clearance",
        time: "14:18 IST",
        desc: "Cleared by Dr. P. Sharma (CHC Bawal). STEMI protocol activated with oxygen stabilization.",
        completed: true
      },
      {
        step: 2,
        title: "Receiving Facility Acceptance",
        time: "14:26 IST",
        desc: "AIIMS Delhi confirmed. Bed #ICU-04 pre-locked via ABDM network.",
        completed: true
      },
      {
        step: 3,
        title: "Ambulance Assigned & En Route",
        time: "14:31 IST",
        desc: "108 ALS Unit DL-1RX-4402 en route with paramedic on-board.",
        completed: true,
        current: true
      },
      {
        step: 4,
        title: "Real-time Transit Telemetry",
        time: "ETA 34 Mins",
        desc: "Vital telemetry sync: HR 94 bpm | SpO2 96% | BP 136/88. Streamed continuously to AIIMS CCU console.",
        completed: false
      },
      {
        step: 5,
        title: "Direct Admission at Trauma Gate 3",
        time: "Awaiting Arrival",
        desc: "Zero-delay intake bypass: Stretcher and Interventional Cath-Lab team on active 10-minute standby.",
        completed: false
      }
    ],
    transitVoucher: "PASS #8841",
    delayAlert: {
      active: true,
      extraMinutes: 42,
      location: "Manesar Toll (NH-48)",
      mitigationRoute: "NH-48 Bypass → KMP Express (Green-Corridor Radio Active)"
    },
    attachedFiles: [
      { name: "12-Lead ECG Report (PDF)", size: "842 KB", date: "14 Oct 2025", type: "ecg" },
      { name: "Troponin-T Rapid Test", size: "Positive Flag", date: "14 Oct 2025", type: "lab" },
      { name: "Digital Referral Intake Slip #4902", size: "ABDM Verified", date: "14 Oct 2025", type: "slip" }
    ]
  }
];

const initialPatientProfile = {
  abhaId: "91-4821-9920-1124",
  name: "Aarav Sharma",
  age: 38,
  gender: "Male",
  relation: "Self",
  pmjayActive: true,
  coverageLimit: "₹5,00,000",
  bloodGroup: "O+",
  emergencyContact: {
    name: "Sunita (Spouse)",
    phone: "+91 98765 43210"
  },
  chronicAlert: "Diabetic Alert",
  nextOpd: {
    date: "Tomorrow",
    time: "10:30 AM",
    facility: "Civil Hospital Rewari",
    token: "Free Queue Token #49"
  },
  assignedAsha: {
    name: "Meena Devi",
    role: "Assigned ASHA Sangini",
    sector: "Sector 4, Rewari",
    nextVisit: "In 3 days",
    phone: "108"
  },
  recentRecords: [
    { id: "rec-1", name: "12-Lead ECG Report", facility: "SDH Rewari Cardiology Unit", date: "14 Oct 2025", size: "1.2 MB", type: "PDF" },
    { id: "rec-2", name: "HbA1c & Fasting Glucose", facility: "CHC Bawal Central Pathology", date: "11 Oct 2025", size: "840 KB", type: "PDF" },
    { id: "rec-3", name: "OPD Digital Slip #4902", facility: "Dr. R. K. Verma (Cardiologist)", date: "09 Oct 2025", size: "ABHA Link", type: "SLIP" }
  ]
};

const initialAshaHub = {
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
  activeCases: [
    {
      id: "asha-c1",
      initials: "GD",
      name: "Geeta Devi",
      age: 32,
      gender: "Female",
      address: "House 42, Dhani Basti",
      flag: "High BP Flagged",
      details: "34 Weeks ANC · BP 154/98 mmHg",
      assignedFacility: "CHC Karanj",
      urgent: true
    },
    {
      id: "asha-c2",
      initials: "RL",
      name: "Rameshwar Lal",
      age: 58,
      gender: "Male",
      address: "House 18, Bilaspur Road",
      flag: "Cardiac Referral Active",
      details: "Transferred via 108 ALS to Safdarjung",
      assignedFacility: "AIIMS Delhi CCU",
      urgent: true
    },
    {
      id: "asha-c3",
      initials: "ML",
      name: "Mohan Lal",
      age: 64,
      gender: "Male",
      address: "House 9, West Para",
      flag: "TB DOTS Compliance",
      details: "Month 4 Medication Kit Synced",
      assignedFacility: "PHC Bawal",
      urgent: false
    }
  ],
  inventory: {
    ifaTablets: 8, // Low
    calciumTabs: 45,
    orsPackets: 24,
    zincSyrup: 12
  }
};

const initialNemdAnalytics = {
  state: "Haryana State View",
  districtsCount: 22,
  medianResponseTimeMins: 8.2,
  responseComparisonMoM: "-14%",
  dispatchesToday: 4129,
  handoverRatePercent: 98.4,
  alsDispatchesPercent: 78,
  blsDispatchesPercent: 22,
  goldenHourAdherencePercent: 91.2,
  goldenHourGainMoM: "+3.8%",
  delayFlagsCount: 18,
  interFacilityDelays: 12,
  activeFleet: {
    activeAmbulances: 342,
    totalFleet: 380,
    surgeIndex: "HIGH (1.8x)",
    icuBedVacancy: 24
  },
  surgeHotspot: {
    clusterName: "Mewat District Southern Cluster",
    subSectors: "Nuh • Ferozepur Jhirka • Tauru Sector",
    priority: "Priority 1",
    status: "Severe Deficit",
    cause: "Surge in acute pediatric & geriatric respiratory cases combined with 3 BLS ambulances undergoing unscheduled chassis maintenance at Nuh depot.",
    recommendation: "Re-deploy 2 ALS units from Gurugram Reserve Hub to Nuh Sub-Division (ETA: 32 mins).",
    projectedGapOffset: "94%",
    authorized: false
  },
  referralFunnel: {
    phcToChcPercent: 62,
    phcToChcTransfersPerWeek: 1920,
    chcToTertiaryPercent: 28,
    chcToTertiaryTransfersPerWeek: 868,
    bypassRatePercent: 10,
    bypassReducedPercent: 24
  }
};

module.exports = {
  initialFacilities,
  initialEmergencyCases,
  initialReferrals,
  initialPatientProfile,
  initialAshaHub,
  initialNemdAnalytics
};
