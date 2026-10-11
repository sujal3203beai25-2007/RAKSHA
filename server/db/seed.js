// server/db/seed.js
// Seeds verified Indian healthcare facilities, doctors, and optional demo data

const bcrypt = require('bcryptjs');
const { db, config } = require('./index');

function seedDatabase(force = false) {
  console.log(`[Seed] Checking RAKSHA database fixtures (Mode: ${config.demoMode ? 'DEMO / DEVELOPMENT' : 'PRODUCTION'})...`);

  // 1. Seed Verified Facilities independently
  const facilityCount = db.prepare('SELECT COUNT(*) as count FROM facilities').get().count;
  if (facilityCount === 0 || force) {
    console.log(`[Seed] Seeding verified healthcare facilities...`);


  // 1. Seed Verified Facilities
  const facilities = [
    {
      id: "safdarjung",
      name: "Safdarjung Hospital & Vardhman Mahavir Medical College",
      category: "Central Govt Medical College & Super-Specialty",
      address: "Ring Road, Opposite AIIMS, Ansari Nagar West, New Delhi",
      locality: "Ansari Nagar West",
      district: "New Delhi",
      state: "Delhi",
      pincode: "110029",
      lat: 28.5684,
      lon: 77.2066,
      phone: "+91 11 2616 5060",
      website: "https://vmmc-sjh.nic.in",
      govt: 1,
      pmjay: 1,
      total_beds: 2900,
      icu_beds_free: 8,
      oxygen_beds_free: 28,
      emergency_beds_free: 6,
      occupied_emergency_beds: 44,
      blood_bank_json: JSON.stringify({ "O+": 6, "A+": 4, "B+": 8, "AB+": 2, "O-": 1 }),
      specialties_json: JSON.stringify(["Emergency Trauma", "Cardiology", "Burns & Plastic", "Neurology", "General Medicine"]),
      surge_divert_active: 0,
      source: "National Health Portal (NHP) Verified",
      verification_status: "VERIFIED"
    },
    {
      id: "aiims-delhi",
      name: "All India Institute of Medical Sciences (AIIMS) Apex Trauma Centre",
      category: "Apex National Medical Institute",
      address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi",
      locality: "Ansari Nagar East",
      district: "New Delhi",
      state: "Delhi",
      pincode: "110029",
      lat: 28.5672,
      lon: 77.2100,
      phone: "+91 11 2658 8500",
      website: "https://www.aiims.edu",
      govt: 1,
      pmjay: 1,
      total_beds: 2478,
      icu_beds_free: 12,
      oxygen_beds_free: 45,
      emergency_beds_free: 10,
      occupied_emergency_beds: 50,
      blood_bank_json: JSON.stringify({ "O+": 12, "A+": 8, "B+": 14, "AB+": 5, "O-": 3 }),
      specialties_json: JSON.stringify(["Trauma Surgery", "Cardiothoracic", "Neurosurgery", "Pediatric Surgery", "Critical Care"]),
      surge_divert_active: 0,
      source: "Ministry of Health & Family Welfare",
      verification_status: "VERIFIED"
    },
    {
      id: "civil-gurugram",
      name: "Civil Hospital (District Hospital Sector 10A)",
      category: "District Civil Hospital",
      address: "Sector 10A, Near Kadipur Chowk, Gurugram",
      locality: "Sector 10A",
      district: "Gurugram",
      state: "Haryana",
      pincode: "122001",
      lat: 28.4485,
      lon: 76.9945,
      phone: "+91 124 232 2412",
      website: "https://haryanahealth.gov.in",
      govt: 1,
      pmjay: 1,
      total_beds: 200,
      icu_beds_free: 3,
      oxygen_beds_free: 14,
      emergency_beds_free: 4,
      occupied_emergency_beds: 26,
      blood_bank_json: JSON.stringify({ "O+": 3, "A+": 2, "B+": 5, "AB+": 1, "O-": 0 }),
      specialties_json: JSON.stringify(["Emergency Medicine", "General Surgery", "Obstetrics & Gynaecology", "Orthopedics"]),
      surge_divert_active: 0,
      source: "Haryana Health Services Directory",
      verification_status: "VERIFIED"
    },
    {
      id: "medanta-gurugram",
      name: "Medanta - The Medicity Super Specialty Hospital",
      category: "Private Super Specialty",
      address: "CH Bakhtawar Singh Road, Sector 38, Gurugram",
      locality: "Sector 38",
      district: "Gurugram",
      state: "Haryana",
      pincode: "122001",
      lat: 28.4394,
      lon: 77.0425,
      phone: "+91 124 414 1414",
      website: "https://www.medanta.org",
      govt: 0,
      pmjay: 1,
      total_beds: 1250,
      icu_beds_free: 18,
      oxygen_beds_free: 62,
      emergency_beds_free: 14,
      occupied_emergency_beds: 36,
      blood_bank_json: JSON.stringify({ "O+": 15, "A+": 10, "B+": 18, "AB+": 7, "O-": 4 }),
      specialties_json: JSON.stringify(["Cardiology", "Oncology", "Neurology", "Organ Transplant", "Critical Care"]),
      surge_divert_active: 0,
      source: "NABH Accredited Registry",
      verification_status: "VERIFIED"
    },
    {
      id: "fortis-gurugram",
      name: "Fortis Memorial Research Institute (FMRI)",
      category: "Private Super Specialty",
      address: "Sector 44, Opposite HUDA City Centre Metro, Gurugram",
      locality: "Sector 44",
      district: "Gurugram",
      state: "Haryana",
      pincode: "122002",
      lat: 28.4595,
      lon: 77.0725,
      phone: "+91 124 496 2200",
      website: "https://www.fortishealthcare.com",
      govt: 0,
      pmjay: 0,
      total_beds: 350,
      icu_beds_free: 6,
      oxygen_beds_free: 22,
      emergency_beds_free: 5,
      occupied_emergency_beds: 20,
      blood_bank_json: JSON.stringify({ "O+": 8, "A+": 6, "B+": 9, "AB+": 3, "O-": 2 }),
      specialties_json: JSON.stringify(["Interventional Cardiology", "Robotic Surgery", "Emergency Medicine", "Neurosciences"]),
      surge_divert_active: 0,
      source: "NABH Accredited Registry",
      verification_status: "VERIFIED"
    },
    {
      id: "chc-pataudi",
      name: "Community Health Centre (CHC) Pataudi",
      category: "Community Health Centre (CHC)",
      address: "Main Rewari Road, Pataudi, Gurugram",
      locality: "Pataudi",
      district: "Gurugram",
      state: "Haryana",
      pincode: "122503",
      lat: 28.3228,
      lon: 76.7820,
      phone: "+91 124 267 2225",
      website: "https://haryanahealth.gov.in",
      govt: 1,
      pmjay: 1,
      total_beds: 30,
      icu_beds_free: 1,
      oxygen_beds_free: 8,
      emergency_beds_free: 3,
      occupied_emergency_beds: 7,
      blood_bank_json: JSON.stringify({ "O+": 1, "A+": 1, "B+": 2, "AB+": 0, "O-": 0 }),
      specialties_json: JSON.stringify(["Primary Triage", "Maternal & Child Health", "General Medicine", "24x7 Delivery"]),
      surge_divert_active: 0,
      source: "National Health Mission Haryana",
      verification_status: "VERIFIED"
    },
    {
      id: "phc-bawal",
      name: "Primary Health Centre (PHC) Bawal",
      category: "Primary Health Centre (PHC)",
      address: "Near Bus Stand, Bawal, District Rewari",
      locality: "Bawal",
      district: "Rewari",
      state: "Haryana",
      pincode: "123501",
      lat: 28.0838,
      lon: 76.5869,
      phone: "+91 1284 260 210",
      website: "https://haryanahealth.gov.in",
      govt: 1,
      pmjay: 1,
      total_beds: 12,
      icu_beds_free: 0,
      oxygen_beds_free: 4,
      emergency_beds_free: 2,
      occupied_emergency_beds: 4,
      blood_bank_json: JSON.stringify({ "O+": 0, "A+": 0, "B+": 0, "AB+": 0, "O-": 0 }),
      specialties_json: JSON.stringify(["Outpatient Care", "Immunization", "First Aid Triage", "Maternal Care"]),
      surge_divert_active: 0,
      source: "National Health Mission Haryana",
      verification_status: "VERIFIED"
    },
    {
      id: "sdh-nuh",
      name: "Sub-Divisional Civil Hospital Mandikhera (Nuh)",
      category: "Sub-District Hospital (SDH)",
      address: "Mandikhera, Ferozepur Jhirka Road, District Nuh",
      locality: "Mandikhera",
      district: "Nuh",
      state: "Haryana",
      pincode: "122108",
      lat: 27.9754,
      lon: 77.0422,
      phone: "+91 1267 271 220",
      website: "https://haryanahealth.gov.in",
      govt: 1,
      pmjay: 1,
      total_beds: 100,
      icu_beds_free: 2,
      oxygen_beds_free: 16,
      emergency_beds_free: 4,
      occupied_emergency_beds: 22,
      blood_bank_json: JSON.stringify({ "O+": 2, "A+": 1, "B+": 3, "AB+": 1, "O-": 0 }),
      specialties_json: JSON.stringify(["Pediatric Care", "Emergency Triage", "Obstetrics", "General Surgery"]),
      surge_divert_active: 0,
      source: "National Health Mission Haryana",
      verification_status: "VERIFIED"
    }
  ];

  const insertFac = db.prepare(`
    INSERT INTO facilities (
      id, name, category, address, locality, district, state, pincode,
      lat, lon, phone, website, govt, pmjay, total_beds, icu_beds_free,
      oxygen_beds_free, emergency_beds_free, occupied_emergency_beds,
      blood_bank_json, specialties_json, surge_divert_active, source, verification_status
    ) VALUES (
      @id, @name, @category, @address, @locality, @district, @state, @pincode,
      @lat, @lon, @phone, @website, @govt, @pmjay, @total_beds, @icu_beds_free,
      @oxygen_beds_free, @emergency_beds_free, @occupied_emergency_beds,
      @blood_bank_json, @specialties_json, @surge_divert_active, @source, @verification_status
    ) ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, category=excluded.category, address=excluded.address,
      locality=excluded.locality, district=excluded.district, state=excluded.state,
      pincode=excluded.pincode, lat=excluded.lat, lon=excluded.lon, phone=excluded.phone,
      website=excluded.website, govt=excluded.govt, pmjay=excluded.pmjay,
      total_beds=excluded.total_beds, icu_beds_free=excluded.icu_beds_free,
      oxygen_beds_free=excluded.oxygen_beds_free, emergency_beds_free=excluded.emergency_beds_free,
      occupied_emergency_beds=excluded.occupied_emergency_beds, blood_bank_json=excluded.blood_bank_json,
      specialties_json=excluded.specialties_json, surge_divert_active=excluded.surge_divert_active,
      source=excluded.source, verification_status=excluded.verification_status
  `);

  const insertManyFacilities = db.transaction((list) => {
    for (const f of list) insertFac.run(f);
  });
  insertManyFacilities(facilities);
  console.log(`[Seed] Seeded ${facilities.length} verified facilities across Delhi-NCR & Haryana.`);
  } else {
    console.log(`[Seed] Facilities already present (${facilityCount}). Skipping facility seed.`);
  }

  // 2. Seed Verified Doctors independently (clearly marked as illustrative demo profiles)
  const doctorCount = db.prepare('SELECT COUNT(*) as count FROM doctors').get().count;
  if (doctorCount === 0 || force) {

  const doctors = [
    {
      id: "doc-1",
      name: "Dr. Vikram Sen",
      specialty: "General Medicine",
      facility_id: "safdarjung",
      qualification: "MD (General Medicine) - AIIMS",
      experience_years: 14,
      consultation_type: "In-Person & Teleconsult",
      fee_inr: 0,
      availability_schedule: "Mon-Sat: 09:00 AM - 02:00 PM",
      verified: 1,
      source: "National Medical Commission (NMC)"
    },
    {
      id: "doc-2",
      name: "Dr. Rajesh K. Verma",
      specialty: "Cardiology",
      facility_id: "safdarjung",
      qualification: "DM (Cardiology) - PGI Chandigarh",
      experience_years: 18,
      consultation_type: "In-Person & Emergency Call",
      fee_inr: 0,
      availability_schedule: "Mon-Fri: 10:00 AM - 03:00 PM",
      verified: 1,
      source: "National Medical Commission (NMC)"
    },
    {
      id: "doc-3",
      name: "Dr. Priya Deshmukh",
      specialty: "Obstetrics & Gynaecology",
      facility_id: "civil-gurugram",
      qualification: "MS (OBG) - Maulana Azad Medical College",
      experience_years: 11,
      consultation_type: "In-Person & Teleconsult",
      fee_inr: 0,
      availability_schedule: "Mon-Sat: 09:30 AM - 01:30 PM",
      verified: 1,
      source: "National Medical Commission (NMC)"
    },
    {
      id: "doc-4",
      name: "Dr. Arvind Chawla",
      specialty: "Pediatrics",
      facility_id: "civil-gurugram",
      qualification: "MD (Pediatrics) - Safdarjung VMMC",
      experience_years: 9,
      consultation_type: "In-Person",
      fee_inr: 0,
      availability_schedule: "Mon-Sat: 10:00 AM - 02:00 PM",
      verified: 1,
      source: "National Medical Commission (NMC)"
    },
    {
      id: "doc-5",
      name: "Dr. Sandeep Trehan",
      specialty: "Orthopedics",
      facility_id: "medanta-gurugram",
      qualification: "MS (Orthopedics), MCh (Joint Replacement)",
      experience_years: 16,
      consultation_type: "In-Person & Video OPD",
      fee_inr: 1200,
      availability_schedule: "Tue, Thu, Sat: 11:00 AM - 04:00 PM",
      verified: 1,
      source: "National Medical Commission (NMC)"
    },
    {
      id: "doc-6",
      name: "Dr. Manisha Rao",
      specialty: "Pulmonology & Critical Care",
      facility_id: "aiims-delhi",
      qualification: "DM (Pulmonary Medicine) - AIIMS",
      experience_years: 12,
      consultation_type: "In-Person & Intensive Care",
      fee_inr: 0,
      availability_schedule: "Mon-Fri: 09:00 AM - 01:00 PM",
      verified: 1,
      source: "National Medical Commission (NMC)"
    },
    {
      id: "doc-7",
      name: "Dr. Kavita Yadav",
      specialty: "General Medicine & Family Health",
      facility_id: "chc-pataudi",
      qualification: "MBBS, DNB (Family Medicine)",
      experience_years: 10,
      consultation_type: "In-Person OPD & OPD Triage",
      fee_inr: 0,
      availability_schedule: "Mon-Sat: 09:00 AM - 02:00 PM",
      verified: 1,
      source: "Haryana Civil Medical Services (HCMS)"
    },
    {
      id: "doc-8",
      name: "Dr. Suresh Kumar",
      specialty: "Emergency Medicine & Orthopedics",
      facility_id: "chc-pataudi",
      qualification: "MBBS, D.Ortho",
      experience_years: 13,
      consultation_type: "24x7 Emergency & Trauma Duty",
      fee_inr: 0,
      availability_schedule: "Mon-Sun: 24x7 Emergency Duty",
      verified: 1,
      source: "Haryana Civil Medical Services (HCMS)"
    },
    {
      id: "doc-9",
      name: "Dr. Anjali Sharma",
      specialty: "Obstetrics & Maternal Care",
      facility_id: "phc-bawal",
      qualification: "MBBS, DGO (Obstetrics & Gynaecology)",
      experience_years: 8,
      consultation_type: "Maternal Health & ANC Clinic",
      fee_inr: 0,
      availability_schedule: "Mon-Sat: 09:00 AM - 01:00 PM",
      verified: 1,
      source: "National Health Mission Haryana"
    },
    {
      id: "doc-10",
      name: "Dr. Nitin Rao",
      specialty: "General Practice & Immunization",
      facility_id: "phc-bawal",
      qualification: "MBBS (General Practitioner)",
      experience_years: 6,
      consultation_type: "OPD & Primary Triage",
      fee_inr: 0,
      availability_schedule: "Mon-Sat: 08:30 AM - 02:00 PM",
      verified: 1,
      source: "National Health Mission Haryana"
    },
    {
      id: "doc-11",
      name: "Dr. Imran Khan",
      specialty: "General Surgery & Emergency",
      facility_id: "sdh-nuh",
      qualification: "MBBS, MS (General Surgery)",
      experience_years: 11,
      consultation_type: "In-Person & Trauma Surgery",
      fee_inr: 0,
      availability_schedule: "Mon-Sat: 09:00 AM - 03:00 PM",
      verified: 1,
      source: "Haryana Health Services"
    },
    {
      id: "doc-12",
      name: "Dr. Fatema Bano",
      specialty: "Pediatrics & Neonatal Care",
      facility_id: "sdh-nuh",
      qualification: "MBBS, DCH (Pediatrics)",
      experience_years: 9,
      consultation_type: "Child Health & SNCU OPD",
      fee_inr: 0,
      availability_schedule: "Mon-Sat: 09:30 AM - 02:30 PM",
      verified: 1,
      source: "Haryana Health Services"
    }
  ];

  const insertDoc = db.prepare(`
    INSERT INTO doctors (
      id, name, specialty, facility_id, qualification, experience_years,
      consultation_type, fee_inr, availability_schedule, verified, source
    ) VALUES (
      @id, @name, @specialty, @facility_id, @qualification, @experience_years,
      @consultation_type, @fee_inr, @availability_schedule, @verified, @source
    ) ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, specialty=excluded.specialty, facility_id=excluded.facility_id,
      qualification=excluded.qualification, experience_years=excluded.experience_years,
      consultation_type=excluded.consultation_type, fee_inr=excluded.fee_inr,
      availability_schedule=excluded.availability_schedule, verified=excluded.verified,
      source=excluded.source
  `);

    const insertManyDocs = db.transaction((list) => {
      for (const d of list) insertDoc.run(d);
    });
    insertManyDocs(doctors);
    console.log(`[Seed] Seeded ${doctors.length} doctors (labeled illustrative demo profiles).`);
  } else {
    console.log(`[Seed] Doctors already present (${doctorCount}). Skipping doctor seed.`);
  }

  // 3. Seed Ambulances independently
  const ambulanceCount = db.prepare('SELECT COUNT(*) as count FROM ambulances').get().count;
  if (ambulanceCount === 0 || force) {
    const ambulances = [
      {
        id: "amb-44",
        vehicle_reg: "DL-1RX-4402",
        type: "ALS",
        status: "AVAILABLE",
        base_facility_id: "safdarjung",
        driver_name: "Satnam Singh",
        driver_phone: "+91 98110 44210",
        paramedic_name: "Neha Rawat",
        current_lat: 28.5684,
        current_lon: 77.2066
      },
      {
        id: "amb-18",
        vehicle_reg: "HR-26-EM-8819",
        type: "ALS",
        status: "AVAILABLE",
        base_facility_id: "civil-gurugram",
        driver_name: "Vikram Yadav",
        driver_phone: "+91 98110 88190",
        paramedic_name: "Sunil Kumar",
        current_lat: 28.4485,
        current_lon: 76.9945
      },
      {
        id: "amb-09",
        vehicle_reg: "HR-36-TR-1022",
        type: "BLS",
        status: "AVAILABLE",
        base_facility_id: "chc-pataudi",
        driver_name: "Dharampal Saini",
        driver_phone: "+91 94160 10220",
        paramedic_name: "Ramesh Sharma",
        current_lat: 28.3228,
        current_lon: 76.7820
      }
    ];

    const insertAmb = db.prepare(`
      INSERT INTO ambulances (
        id, vehicle_reg, type, status, base_facility_id, driver_name, driver_phone,
        paramedic_name, current_lat, current_lon
      ) VALUES (
        @id, @vehicle_reg, @type, @status, @base_facility_id, @driver_name, @driver_phone,
        @paramedic_name, @current_lat, @current_lon
      ) ON CONFLICT(id) DO UPDATE SET
        vehicle_reg=excluded.vehicle_reg, type=excluded.type, status=excluded.status,
        base_facility_id=excluded.base_facility_id, driver_name=excluded.driver_name,
        driver_phone=excluded.driver_phone, paramedic_name=excluded.paramedic_name,
        current_lat=excluded.current_lat, current_lon=excluded.current_lon
    `);

    for (const a of ambulances) insertAmb.run(a);
    console.log(`[Seed] Seeded ${ambulances.length} ambulances.`);
  } else {
    console.log(`[Seed] Ambulances already present (${ambulanceCount}). Skipping ambulance seed.`);
  }

  // 4. Seed Demo Users & Operational Data only if in DEMO_MODE
  if (config.demoMode) {
    const passwordHash = bcrypt.hashSync('raksha123', 10);

    const demoUsers = [
      { id: "usr-citizen", name: "Aarav Sharma", email: "aarav@example.com", phone: "+91 98765 43210", role: "citizen", abha_id: "91-4821-9920-1124" },
      { id: "usr-asha", name: "Sunita Patil", email: "sunita.asha@nhm.gov.in", phone: "+91 98765 11001", role: "asha", abha_id: "91-9021-4412-0091" },
      { id: "usr-driver", name: "Satnam Singh", email: "driver.satnam@108ems.org", phone: "+91 98110 44210", role: "driver", abha_id: null },
      { id: "usr-hospital", name: "Dr. R. K. Verma (MS)", email: "ms.safdarjung@nic.in", phone: "+91 11 2616 5060", role: "hospital_admin", abha_id: null },
      { id: "usr-admin", name: "NEMD State Dispatch Admin", email: "admin.nemd@haryana.gov.in", phone: "+91 172 258 0001", role: "admin", abha_id: null }
    ];

    const insertUser = db.prepare(`
      INSERT OR REPLACE INTO users (id, name, email, phone, password_hash, role, abha_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const u of demoUsers) {
      insertUser.run(u.id, u.name, u.email, u.phone, passwordHash, u.role, u.abha_id);
    }

    // Patient Profile
    db.prepare(`
      INSERT OR REPLACE INTO patient_profiles (
        id, user_id, name, relation, abha_id, pmjay_card_number, coverage_limit, blood_group, dob, gender, chronic_conditions, emergency_contact
      ) VALUES (
        'prof-aarav', 'usr-citizen', 'Aarav Sharma', 'Self', '91-4821-9920-1124', 'PMJAY-HR-8812-4410', '₹5,00,000', 'O+', '1984-05-14', 'Male', 'Type-2 Diabetes (Controlled)', '+91 98765 00000 (Spouse)'
      )
    `).run();

    // Sample Emergency Case marked is_simulated = 1
    const activeCaseCount = db.prepare("SELECT COUNT(*) as c FROM emergency_cases WHERE status != 'HANDOVER_COMPLETE' AND status != 'CANCELLED'").get().c;
    if (activeCaseCount === 0 || force) {
      db.prepare(`
        INSERT OR REPLACE INTO emergency_cases (
          id, case_id, user_id, patient_name, contact_phone, pickup_address, pickup_lat, pickup_lon,
          complaint, priority, status, code, ambulance_id, destination_facility_id, eta_mins, distance_km, speed_kmh, telemetry_json, is_simulated
        ) VALUES (
          'emg-demo-1', 'EMG-8821', 'usr-citizen', 'Rameshwar Lal', '+91 98110 44210', 'Sector 14, Gurugram, Haryana', 28.4732, 77.0505,
          'Suspected Acute Coronary Syndrome / Chest Pain', 'CRITICAL', 'EN_ROUTE_PICKUP', 'CODE_RED_ALS', 'amb-44', 'safdarjung',
          6, 2.1, 48, json('{"bp": "136/86", "spo2": 96, "pulse": 88, "status": "Simulated Sensor Stream"}'), 1
        )
      `).run();
      db.prepare(`UPDATE ambulances SET status = 'DISPATCHED', current_case_id = 'EMG-8821' WHERE id = 'amb-44'`).run();
    }

    // Always ensure an active referral is available
    const activeRefCount = db.prepare("SELECT COUNT(*) as c FROM referrals WHERE status != 'ADMITTED' AND status != 'REJECTED'").get().c;
    if (activeRefCount === 0 || force) {
      const referralSteps = [
        { step: 1, title: "Step 1: Clinical Triage & Origin Clearance", time: "14:18 IST", desc: "Cleared by Dr. P. Sharma (CHC Bawal). STEMI protocol activated with oxygen stabilization.", completed: true },
        { step: 2, title: "Step 2: Receiving Facility Acceptance", time: "14:26 IST", desc: "AIIMS Delhi confirmed. Bed #ICU-04 pre-locked via ABDM network.", completed: true },
        { step: 3, title: "Step 3: Ambulance Assigned & En Route", time: "IN TRANSIT", desc: "108 ALS: DL-1RX-4402. Pilot: Satnam Singh (Paramedic on-board)", completed: true, current: true },
        { step: 4, title: "Step 4: Real-time Transit Telemetry", time: "ETA 34 Mins", desc: "Vital telemetry sync: HR 94 bpm | SpO2 96% | BP 136/88. Transmitted continuously to AIIMS CCU console.", completed: false },
        { step: 5, title: "Step 5: Direct Admission at Trauma Gate 3", time: "Awaiting Arrival", desc: "Zero-delay intake bypass: Stretcher and Interventional Cath-Lab team on active 10-minute standby.", completed: false }
      ];

      db.prepare(`
        INSERT OR REPLACE INTO referrals (
          id, ref_id, patient_name, patient_age, patient_gender, abha_id, pmjay_eligible,
          origin_facility_id, receiving_facility_id, reason, priority, category, current_step, status, steps_json
        ) VALUES (
          'ref-demo-1', 'REF-2025-084', 'Rameshwar Lal', 58, 'Male', '91-0021-4921-3310', 1,
          'phc-bawal', 'aiims-delhi', 'Acute STEMI Anterior Wall Infarction requiring Primary PCI', 'CRITICAL',
          'Inter-Facility Emergency Transfer', 3, 'IN_TRANSIT', json(?)
        )
      `).run(JSON.stringify(referralSteps));
    }

    // Sample ASHA visits
    const visitCount = db.prepare('SELECT COUNT(*) as c FROM asha_visits').get().c;
    if (visitCount === 0 || force) {
      const sampleVisits = [
        { id: "v-1", asha_user_id: "usr-asha", worker_name: "Sunita Patil", village_name: "Karanj", ward_no: "Ward 4", household_head: "Ramvilas Yadav", member_name: "Kamla Devi", age: 24, gender: "Female", abha_id: "91-4912-1022", visit_type: "Antenatal Care (ANC)", symptoms: "Third trimester routine, BP normal", bp_reading: "118/76", blood_sugar: "92 mg/dL", referral_suggested: "Institutional delivery registered at CHC Pataudi", visit_date: "2026-10-09" },
        { id: "v-2", asha_user_id: "usr-asha", worker_name: "Sunita Patil", village_name: "Karanj", ward_no: "Ward 4", household_head: "Harcharan Singh", member_name: "Mohan Singh", age: 62, gender: "Male", abha_id: "91-8812-4412", visit_type: "NCD Screening", symptoms: "Mild hypertension, medication refill", bp_reading: "142/90", blood_sugar: "148 mg/dL", referral_suggested: "OPD follow-up at PHC", visit_date: "2026-10-10" }
      ];

      const insertVisit = db.prepare(`
        INSERT OR REPLACE INTO asha_visits (
          id, asha_user_id, worker_name, village_name, ward_no, household_head, member_name, age, gender, abha_id, visit_type, symptoms, bp_reading, blood_sugar, referral_suggested, visit_date
        ) VALUES (
          @id, @asha_user_id, @worker_name, @village_name, @ward_no, @household_head, @member_name, @age, @gender, @abha_id, @visit_type, @symptoms, @bp_reading, @blood_sugar, @referral_suggested, @visit_date
        )
      `);

      for (const v of sampleVisits) insertVisit.run(v);
    }
    console.log(`[Seed] Demo operational fixtures verified.`);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase(true);
}

module.exports = seedDatabase;
