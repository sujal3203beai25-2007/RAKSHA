# RAKSHA — Complete Real-World Healthcare Access & Emergency Platform
### Smart India Hackathon (SIH) 2026 | Clinical Civic Infrastructure

RAKSHA is an institutional-grade, full-stack, mobile-responsive, and location-aware healthcare web platform designed for nationwide public health coordination across India. It connects citizens in emergency crisis, hospital emergency departments, ambulance pilots, frontline ASHA workers, and state health mission directors into an interconnected, real-time civic healthcare access ecosystem.

Built with strict adherence to the **Clinical Civic Infrastructure** design specification outlined in `design-reference/DESIGN.md`.

---

## 🌟 Core Real-World Features & Capabilities

1. **Real Browser Geolocation & Nationwide Search:**
   - Real `navigator.geolocation` integration with secure-context (HTTPS / localhost) detection and permission handling.
   - Comprehensive fallback manual search supporting Villages, Towns, Cities, Districts, States, and 6-digit Indian PIN codes.
   - Dynamic search radius adjustment (5 km, 15 km, 30 km, 50 km).
   - Real OpenStreetMap Nominatim reverse-geocoding adapter with compliant headers, caching, and graceful failure handling.
   - Real Overpass API adapter for dynamic OpenStreetMap discovery of nearby hospitals, clinics, PHCs, CHCs, and pharmacies.
   - Accurate Haversine straight-line distance calculations.
   - OpenStreetMap directions routing and click-to-call functionality.

2. **Persistent Relational Database (SQLite with WAL Mode):**
   - Zero reliance on ephemeral in-memory state.
   - Production-ready relational SQLite database engine (`better-sqlite3`) stored at `server/data/raksha.db`.
   - Write-Ahead Logging (WAL) enabled for high concurrent read/write throughput.
   - Automatic schema initialization with 11 relational tables, strict foreign keys, indexes, and comprehensive audit logging.
   - Idempotent seeding script for verified Indian facilities and NMC-registered medical specialists.

3. **Verified Doctor Specialist Directory & Persistent OPD Booking:**
   - Dedicated searchable directory of verified medical specialists filtered by specialty (Cardiology, Paediatrics, Gynaecology, Orthopaedics, General Medicine, Neurology, Nephrology, etc.).
   - Interactive appointment booking modal that validates patient details and generates persistent appointment tokens (`OPD-YYYYMMDD-XXXX`).
   - Real database storage, status tracking, and audit logging.

4. **Honest, Safe Emergency SOS Workflow:**
   - 1-tap tactile SOS trigger capturing verified or manual GPS coordinates.
   - Direct emergency calling buttons to Indian national hotlines: **112 (National Emergency)** and **108 (Medical Ambulance)**.
   - Duplicate emergency case prevention: suppresses accidental repeated clicks within a 2-minute window and returns the active case.
   - Explicit honesty policy: in production mode (`DEMO_MODE=false`), emergency cases are recorded in the database without inventing fake ambulance dispatchers or fabricated ETAs until an authorized fleet dispatch partner confirms assignment.

5. **Real Hospital Capacity & Bed Management:**
   - Live bed matrix management (General, Oxygen, ICU, Ventilator) with real database persistence.
   - Tactical Emergency Surge Divert protocol toggling with staff credentials, audit logging, and WebSocket broadcast.
   - Clear distinction between verified hospital updates, pending reports, and cached estimates.

6. **Interactive Leaflet GIS Mapping:**
   - High-performance Leaflet.js interactive maps powered by OpenStreetMap cartography.
   - Facility discovery map with real coordinates, emergency congestion markers, and interactive popup cards.
   - Ambulance corridor tracking map with vehicle location and route polylines.

7. **Tactical Ambulance Driver Console:**
   - Real status transition pipeline: `ARRIVED_SCENE` ➔ `PATIENT_LOADED` ➔ `EN_ROUTE_HOSPITAL` ➔ `HANDOVER_COMPLETE`.
   - Backend validation, database status history, and real-time WebSocket telemetry broadcasting.

8. **Clinical Rule-Based Triage:**
   - Safe, explainable 4-step triage wizard based on American Heart Association (AHA) and Medical Council of India (MCI) danger sign protocols.
   - Real-time red flag escalation (chest pain, cyanosis, severe breathlessness) directly to Code Red with mandatory 108 referral guidance.
   - Non-diagnostic clinical disclaimers ensuring compliance with healthcare regulations.

9. **Digital Referrals, HL7 FHIR R4 & Audit Exports:**
   - Multi-stage clinical transfer workflow with real status advancement.
   - Standard-compliant **HL7 FHIR R4 JSON Bundle** (`Bundle`, `Patient`, `ServiceRequest`) generation and instant browser download.
   - CSV audit log export for administrative compliance.

10. **ASHA Frontline Worker Hub:**
    - Household survey visit registration modal with direct database persistence.
    - Offline queue resilience with sync status indicators.
    - Daily village metrics backed by real database records.

11. **Real Administrative Analytics:**
    - SQL database aggregations (`COUNT(*)`, emergency breakdown, bed utilization, ASHA counts) on `/api/analytics`.
    - Emergency surge redeployment authorization workflow.

12. **Role-Based Security & Production Hardening:**
    - Password hashing using `bcryptjs` and token-based authentication using `jsonwebtoken`.
    - Role-based authorization (`patient`, `doctor`, `driver`, `hospital_staff`, `asha`, `admin`).
    - API rate-limiting using `express-rate-limit`.
    - Security headers (CSP, X-Frame-Options, X-Content-Type-Options).

---

## 💻 Setup & Running Instructions (Windows & VS Code)

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later
- **Git**

### Step 1: Clone and Navigate
```powershell
cd c:\Users\gupta\OneDrive\Documents\Desktop\RAKSHA
```

### Step 2: Install Dependencies
```powershell
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
cp .env.example .env
```
Ensure your `.env` contains:
```ini
PORT=3000
NODE_ENV=development
DEMO_MODE=true
DATABASE_PATH=./server/data/raksha.db
JWT_SECRET=raksha_clinical_civic_secret_jwt_key_2026_sih
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
OVERPASS_BASE_URL=https://overpass-api.de/api/interpreter
SESSION_SECRET=raksha_session_secure_key_sih2026
```
> **Note on DEMO_MODE:**
> - `DEMO_MODE=true` enables sample vehicle telemetry and mock ASHA household records for hackathon evaluation and demonstration.
> - `DEMO_MODE=false` runs in strict production mode with zero synthetic records, zero simulated vehicles, and strict verification indicators.

### Step 4: Seed Database (Optional / Automatic)
The database automatically initializes schema and verified healthcare facilities on server startup. To re-seed manually:
```powershell
node server/db/seed.js
```

### Step 5: Start the Server
```powershell
npm start
```
The server will start at:
```
http://localhost:3000
```

### Step 6: Run Automated Tests
RAKSHA includes a test suite covering database persistence, geo distance calculations, emergency duplicates, rule-based triage, FHIR R4 generation, and REST APIs:
```powershell
npm test
```
All 23 automated tests should pass with 0 failures.

---

## 📱 The 10 Connected Screens

| Screen # | Screen Name | Target Persona | Key Real Implementations |
|---|---|---|---|
| **1** | **Public Landing & Emergency SOS** | Citizen / Bystander | Real GPS detection, 112/108 quick dial, persistent SOS, nearby facilities list. |
| **2** | **Patient Health Dashboard** | Citizen / Patient | Patient profile, verified ABHA card state, Doctor Specialist Directory with OPD booking. |
| **3** | **Find Care Facilities** | Caregiver / Kin | Interactive Leaflet GIS map with OSM tiles, Overpass discovery, radius filter, directions, calling. |
| **4** | **Digital AI Triage** | Citizen / Triage Nurse | AHA/MCI rule-based red flag engine, Code Red escalation, non-diagnostic disclaimers. |
| **5** | **Emergency Ambulance Tracking** | Citizen / Dispatcher | Interactive Leaflet tracking map, route polyline, live telemetry stream, ER trauma bay reservation. |
| **6** | **Digital Referral Tracking** | Doctor / Kin | 5-stage clinical transfer stepper, advance step action, HL7 FHIR R4 JSON download, CSV audit log download. |
| **7** | **Facility Bed & ER Dashboard** | Medical Superintendent | Live bed matrix increment/decrement with database persistence, Emergency Surge Divert toggle. |
| **8** | **Ambulance Driver Console** | Ambulance Pilot / EMT | Real tactical status transition HUD (`ARRIVED_SCENE` ➔ `PATIENT_LOADED` ➔ `EN_ROUTE_HOSPITAL` ➔ `HANDOVER_COMPLETE`). |
| **9** | **ASHA Frontline Worker Hub** | ASHA Sangini | Household visit registration modal, direct database persistence, offline queue with sync indicator. |
| **10** | **Admin Access Gap Analytics** | State Health Director | Live database SQL aggregations, response metrics, surge redeployment authorization. |

---

## 🗄️ Database Architecture

The SQLite relational database (`server/data/raksha.db`) contains the following tables:

- **`users`**: User identities, role-based credentials (`bcryptjs` hashes).
- **`patient_profiles`**: Demographic records, ABHA IDs, PM-JAY tier, chronic conditions.
- **`facilities`**: Healthcare facilities (Government, Private, PHC, CHC, Medical College), GPS coordinates, contact, specialties, verified bed capacities.
- **`facility_capacity_updates`**: Immutable audit logs of all operational bed adjustments.
- **`doctors`**: Verified medical practitioners, NMC registration numbers, specialties, OPD schedules.
- **`appointments`**: Persistent OPD consultation requests with unique tokens.
- **`ambulances`**: Vehicle registration, equipment tier (ALS/BLS), pilot identity, live GPS coordinates.
- **`emergency_cases`**: SOS requests, caller phone, location, priority level, dispatch status.
- **`emergency_status_logs`**: Timestamped status transition audit logs for emergency cases.
- **`referrals`**: Clinical transfer requests, originating & destination facilities, clinical reason, stage.
- **`asha_visits`**: Frontline maternal, neonatal, and chronic disease screening records.
- **`audit_logs`**: System-wide administrative action logs with actor details and client IP.

---

## 🔒 Security & Privacy Implementation

- **Password Security**: Strong hashing with `bcryptjs` (salt rounds: 10).
- **Token Security**: Signed JSON Web Tokens (JWT) with configurable expiration.
- **Role-Based Access Control**: Middleware enforcement for protected routes (`requireRole`).
- **Emergency Idempotency**: Duplicate SOS requests within 2 minutes return the existing case to prevent duplicate dispatch.
- **Rate Limiting**: IP-based rate limiting on all public API endpoints (`express-rate-limit`).
- **Security Headers**: Content Security Policy, Frame Options, Content Type Options.
- **Data Minimization**: Location data is used strictly for geospatial distance calculations and emergency routing.

---

## 🌐 External Integrations & Status

| Integration | Technology / Provider | Status | Notes |
|---|---|---|---|
| **Browser Geolocation** | W3C `navigator.geolocation` | **Fully Implemented & Verified** | Native browser GPS with HTTPS/localhost detection. |
| **Reverse Geocoding** | OpenStreetMap Nominatim API | **Fully Implemented & Live** | Compliant User-Agent headers, memory caching. |
| **Facility Discovery** | OpenStreetMap Overpass API | **Fully Implemented & Live** | Dynamic nationwide discovery of healthcare amenities. |
| **Interactive Maps** | Leaflet.js v1.9.4 | **Fully Implemented & Live** | OpenStreetMap raster tile layer with custom markers. |
| **Emergency Hotlines** | Indian National Hotlines (112, 108) | **Fully Implemented & Live** | Direct telephonic triggers (`tel:112`, `tel:108`). |
| **FHIR Protocol** | HL7 FHIR R4 JSON Specification | **Fully Implemented & Live** | Standard `Bundle`, `Patient`, `ServiceRequest` export. |
| **Fleet Dispatch (CAD)** | Commercial CAD / State 108 API | **Interface Ready** | Requires state-level 108 partner API credentials for live fleet integration. |
| **ABDM / ABHA Sandbox** | NHA Ayushman Bharat Digital Mission | **Interface Ready** | Displays verified mock/sandbox state; requires NHA M1/M2/M3 production gateway keys. |

---

## 🚢 Deployment Guidelines

### Production Environment Settings
When deploying to production:
1. Set `NODE_ENV=production` in your hosting platform.
2. Set `DEMO_MODE=false` to enforce strict verification indicators and disable synthetic simulation.
3. Generate a strong, random `JWT_SECRET` (at least 32 characters).
4. Run behind a reverse proxy (e.g., Nginx, Caddy, or Cloudflare) configured with **HTTPS/TLS** (required for `navigator.geolocation` on non-localhost domains).
5. Use a process manager like **PM2**:
   ```bash
   pm2 start server/index.js --name "raksha-platform"
   ```

---

## 📜 Design Standards & UI Preservation
All visual styles strictly honor the design guidelines specified in `design-reference/DESIGN.md`:
- **Clinical Teal Primary**: `#00685f` (Accessible on light surfaces)
- **Life Safety Emerald**: `#006c4a` (Verified and available status)
- **Emergency Crimson**: `#bb0112` (Critical alerts and SOS)
- **Typography**: Plus Jakarta Sans (Headings) & Inter (Tabular and Clinical Data)
- **100% Preservation**: The original reference HTML and mockup assets in `design-reference/` remain completely intact.
