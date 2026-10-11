-- server/db/schema.sql
-- RAKSHA Relational Schema for Persistent Healthcare Management

PRAGMA foreign_keys = ON;

-- 1. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'citizen', -- citizen, patient, doctor, asha, driver, hospital_admin, admin
  abha_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Patient Profiles
CREATE TABLE IF NOT EXISTS patient_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  relation TEXT DEFAULT 'Self',
  abha_id TEXT,
  pmjay_card_number TEXT,
  coverage_limit TEXT DEFAULT '₹5,00,000',
  blood_group TEXT,
  dob TEXT,
  gender TEXT,
  chronic_conditions TEXT,
  emergency_contact TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Healthcare Facilities & Hospitals
CREATE TABLE IF NOT EXISTS facilities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- Government Hospital, Private Hospital, CHC, PHC, Sub-District Hospital, Medical College, Trauma Centre
  address TEXT NOT NULL,
  locality TEXT,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  phone TEXT,
  website TEXT,
  govt INTEGER DEFAULT 1,
  pmjay INTEGER DEFAULT 1,
  total_beds INTEGER DEFAULT 0,
  icu_beds_free INTEGER DEFAULT 0,
  oxygen_beds_free INTEGER DEFAULT 0,
  emergency_beds_free INTEGER DEFAULT 0,
  occupied_emergency_beds INTEGER DEFAULT 0,
  blood_bank_json TEXT, -- JSON map: {"O+": 4, "B+": 6, ...}
  specialties_json TEXT, -- JSON array: ["Emergency", "Cardiology", ...]
  surge_divert_active INTEGER DEFAULT 0,
  source TEXT DEFAULT 'Verified Official Directory', -- 'OpenStreetMap', 'Verified Official Directory', 'Hospital Self-Reported'
  verification_status TEXT DEFAULT 'VERIFIED', -- 'VERIFIED', 'AWAITING_VERIFICATION', 'UNVERIFIED'
  last_verified DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_facilities_coords ON facilities(lat, lon);
CREATE INDEX IF NOT EXISTS idx_facilities_district ON facilities(district);

-- 4. Facility Capacity Updates Log
CREATE TABLE IF NOT EXISTS facility_capacity_updates (
  id TEXT PRIMARY KEY,
  facility_id TEXT NOT NULL,
  user_id TEXT,
  icu_delta INTEGER DEFAULT 0,
  oxygen_delta INTEGER DEFAULT 0,
  emergency_delta INTEGER DEFAULT 0,
  occupied_emergency_delta INTEGER DEFAULT 0,
  divert_status INTEGER,
  reported_by TEXT,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE
);

-- 5. Doctors & Specialists
CREATE TABLE IF NOT EXISTS doctors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL, -- General Medicine, Cardiology, Pediatrics, Gynecology, Orthopedics, Pulmonology, Neurology
  facility_id TEXT,
  qualification TEXT NOT NULL,
  experience_years INTEGER DEFAULT 5,
  consultation_type TEXT DEFAULT 'In-Person & Teleconsult', -- 'In-Person', 'Teleconsult', 'Both'
  fee_inr INTEGER DEFAULT 0,
  availability_schedule TEXT, -- JSON or human readable: 'Mon-Sat 10:00 AM - 02:00 PM'
  verified INTEGER DEFAULT 1,
  source TEXT DEFAULT 'National Medical Commission Directory',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);

-- 6. Appointments & OPD Tokens
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  patient_name TEXT NOT NULL,
  patient_phone TEXT,
  doctor_id TEXT,
  facility_id TEXT NOT NULL,
  department TEXT NOT NULL,
  appointment_date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  token_number INTEGER NOT NULL,
  status TEXT DEFAULT 'CONFIRMED', -- 'REQUESTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'
  reason TEXT,
  source TEXT DEFAULT 'Direct RAKSHA Portal',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
);

-- 7. Ambulances & Emergency Fleet
CREATE TABLE IF NOT EXISTS ambulances (
  id TEXT PRIMARY KEY,
  vehicle_reg TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'ALS', -- 'ALS', 'BLS', 'Patient Transport'
  status TEXT NOT NULL DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'DISPATCHED', 'EN_ROUTE', 'BUSY', 'MAINTENANCE'
  base_facility_id TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  paramedic_name TEXT,
  current_lat REAL,
  current_lon REAL,
  current_case_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (base_facility_id) REFERENCES facilities(id) ON DELETE SET NULL
);

-- 8. Emergency Cases & Dispatches
CREATE TABLE IF NOT EXISTS emergency_cases (
  id TEXT PRIMARY KEY,
  case_id TEXT UNIQUE NOT NULL,
  user_id TEXT,
  patient_name TEXT NOT NULL,
  contact_phone TEXT,
  pickup_address TEXT NOT NULL,
  pickup_lat REAL,
  pickup_lon REAL,
  complaint TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'HIGH', -- 'CRITICAL', 'HIGH', 'MODERATE'
  status TEXT NOT NULL DEFAULT 'RECORDED', -- 'RECORDED', 'ACKNOWLEDGED', 'DISPATCHED', 'EN_ROUTE_PICKUP', 'ARRIVED_SCENE', 'PATIENT_LOADED', 'EN_ROUTE_HOSPITAL', 'HANDOVER_COMPLETE', 'CANCELLED'
  code TEXT DEFAULT 'CODE_RED_ALS',
  ambulance_id TEXT,
  destination_facility_id TEXT,
  eta_mins INTEGER DEFAULT 10,
  distance_km REAL DEFAULT 3.0,
  speed_kmh INTEGER DEFAULT 0,
  telemetry_json TEXT, -- JSON: {"bp": "120/80", "spo2": 98, "pulse": 78, "status": "Live"}
  is_simulated INTEGER DEFAULT 0,
  dispatch_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ambulance_id) REFERENCES ambulances(id) ON DELETE SET NULL,
  FOREIGN KEY (destination_facility_id) REFERENCES facilities(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_emergency_status ON emergency_cases(status);

-- 9. Case Timeline & Status Audit Log
CREATE TABLE IF NOT EXISTS emergency_status_logs (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  status TEXT NOT NULL,
  updated_by TEXT,
  notes TEXT,
  lat REAL,
  lon REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES emergency_cases(case_id) ON DELETE CASCADE
);

-- 10. Digital Referrals & FastTrack Corridor
CREATE TABLE IF NOT EXISTS referrals (
  id TEXT PRIMARY KEY,
  ref_id TEXT UNIQUE NOT NULL,
  patient_name TEXT NOT NULL,
  patient_age INTEGER,
  patient_gender TEXT,
  abha_id TEXT,
  pmjay_eligible INTEGER DEFAULT 1,
  origin_facility_id TEXT NOT NULL,
  receiving_facility_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  priority TEXT DEFAULT 'HIGH', -- 'CRITICAL', 'HIGH', 'ROUTINE'
  category TEXT DEFAULT 'Inter-Facility Emergency Transfer',
  current_step INTEGER DEFAULT 1,
  status TEXT DEFAULT 'INITIATED', -- 'INITIATED', 'ACCEPTED', 'IN_TRANSIT', 'ADMITTED', 'REJECTED'
  fhir_bundle_json TEXT,
  steps_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (origin_facility_id) REFERENCES facilities(id) ON DELETE RESTRICT,
  FOREIGN KEY (receiving_facility_id) REFERENCES facilities(id) ON DELETE RESTRICT
);

-- 11. ASHA Frontline Worker Visits & Household Registry
CREATE TABLE IF NOT EXISTS asha_visits (
  id TEXT PRIMARY KEY,
  asha_user_id TEXT,
  worker_name TEXT NOT NULL,
  village_name TEXT NOT NULL,
  ward_no TEXT,
  household_head TEXT NOT NULL,
  member_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  abha_id TEXT,
  visit_type TEXT NOT NULL, -- 'Antenatal Care (ANC)', 'Immunization', 'NCD Screening', 'Malnutrition', 'General Follow-up'
  symptoms TEXT,
  bp_reading TEXT,
  blood_sugar TEXT,
  referral_suggested TEXT,
  synced_status TEXT DEFAULT 'SYNCED', -- 'LOCAL_DRAFT', 'SYNCED'
  visit_date TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asha_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 12. Audit Trail
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details_json TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
