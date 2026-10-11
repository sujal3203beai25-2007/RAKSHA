// server/routes.js
// RAKSHA Production REST API Endpoints with Security, Validation, and Rate Limiting

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const db = require('./db');
const { db: sqliteDb } = require('./db/index');
const geoService = require('./services/geoService');
const fhirService = require('./services/fhirService');
const { generateToken, authenticateToken, optionalAuth, requireRole } = require('./middleware/auth');
const config = require('./config');

// Rate limiting for public APIs (120 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limit for authentication attempts (20 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limit for emergency SOS creation to prevent abuse (15 requests per 10 minutes)
const sosLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  message: { error: 'Emergency request rate exceeded. If this is a life-threatening crisis, dial 112 or 108 directly immediately.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply general rate limiting
router.use(apiLimiter);

// ----------------------------------------------------
// 1. Health & Status
// ----------------------------------------------------
router.get('/health', (req, res) => {
  let dbStatus = 'DISCONNECTED';
  try {
    const test = sqliteDb.prepare('SELECT 1 as healthy').get();
    if (test && test.healthy === 1) dbStatus = 'CONNECTED';
  } catch (e) {
    dbStatus = 'ERROR';
  }

  res.json({
    status: 'HEALTHY',
    database: dbStatus,
    demoMode: config.demoMode,
    timestamp: new Date().toISOString(),
    platform: 'RAKSHA Clinical Civic Healthcare Access Platform',
    version: '1.0.0-production'
  });
});

// ----------------------------------------------------
// 2. Authentication & Patient Identity
// ----------------------------------------------------
router.post('/auth/register', authLimiter, (req, res) => {
  const { name, email, phone, password, role = 'citizen', abhaId = null, verificationKey = null } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Name is required (minimum 2 characters).' });
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  if (!email && !phone) {
    return res.status(400).json({ error: 'Either email or phone number is required.' });
  }

  // Prevent unauthorized role escalation:
  // Public registration only allows 'citizen' or 'patient'.
  // Privileged roles (admin, hospital_admin, doctor, dispatcher, driver, asha) require a valid verificationKey
  const privilegedRoles = ['admin', 'hospital_admin', 'doctor', 'dispatcher', 'driver', 'asha'];
  let assignedRole = 'citizen';

  if (role === 'patient' || role === 'citizen') {
    assignedRole = role;
  } else if (privilegedRoles.includes(role)) {
    if (config.staffVerificationKey && verificationKey === config.staffVerificationKey) {
      assignedRole = role;
    } else {
      return res.status(403).json({
        error: `Privileged role '${role}' cannot be self-assigned via public registration without valid administrative credentials.`
      });
    }
  } else {
    assignedRole = 'citizen';
  }

  try {
    const existing = sqliteDb.prepare('SELECT id FROM users WHERE (email = ? AND email IS NOT NULL) OR (phone = ? AND phone IS NOT NULL)').get(email || null, phone || null);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email or phone number already exists.' });
    }

    const userId = `usr-${crypto.randomUUID()}`;
    const passwordHash = bcrypt.hashSync(password, 10);

    sqliteDb.prepare(`
      INSERT INTO users (id, name, email, phone, password_hash, role, abha_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, name.trim(), email || null, phone || null, passwordHash, assignedRole, abhaId || null);

    // Create baseline patient profile
    const profileId = `prof-${crypto.randomUUID()}`;
    sqliteDb.prepare(`
      INSERT INTO patient_profiles (id, user_id, name, abha_id)
      VALUES (?, ?, ?, ?)
    `).run(profileId, userId, name.trim(), abhaId || null);

    const user = { id: userId, name: name.trim(), email, phone, role: assignedRole, abhaId };
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user
    });
  } catch (err) {
    console.error('[Auth Register Error]', err.message);
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

router.post('/auth/login', authLimiter, (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email/phone and password are required.' });
  }

  try {
    const user = sqliteDb.prepare(`
      SELECT * FROM users WHERE email = ? OR phone = ?
    `).get(identifier, identifier);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials. Password incorrect.' });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        abhaId: user.abha_id
      }
    });
  } catch (err) {
    console.error('[Auth Login Error]', err.message);
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

router.get('/auth/me', authenticateToken, (req, res) => {
  const user = sqliteDb.prepare('SELECT id, name, email, phone, role, abha_id FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User profile not found.' });
  res.json({ user });
});

// ----------------------------------------------------
// 3. Geolocation & Real-time Location Resolution
// ----------------------------------------------------
router.get('/geo/reverse', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude coordinates are required.' });
  }

  const pLat = parseFloat(lat);
  const pLon = parseFloat(lon);
  if (isNaN(pLat) || pLat < -90 || pLat > 90 || isNaN(pLon) || pLon < -180 || pLon > 180) {
    return res.status(400).json({ error: 'Coordinates outside valid geographic bounds (-90..90, -180..180).' });
  }

  try {
    const location = await geoService.reverseGeocode(pLat, pLon);
    res.json(location);
  } catch (err) {
    res.status(500).json({ error: 'Failed to reverse geocode location: ' + err.message });
  }
});

router.get('/geo/search', async (req, res) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string' || q.trim().length < 2) {
    return res.status(400).json({ error: 'Search query parameter (q) must be at least 2 characters.' });
  }

  try {
    const results = await geoService.searchLocation(q.trim());
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: 'Location search error: ' + err.message });
  }
});

// ----------------------------------------------------
// 4. Healthcare Facilities Directory & Capacity
// ----------------------------------------------------
router.get('/facilities', (req, res) => {
  const { filter, search, district, lat, lon, radiusKm } = req.query;
  const list = db.getFacilities({ filter, search, district, lat, lon, radiusKm });
  res.json({
    facilities: list,
    total: list.length,
    userLocationApplied: Boolean(lat && lon)
  });
});

router.get('/facilities/nearby', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon parameters are required to find nearby facilities.' });
  }

  const uLat = parseFloat(lat);
  const uLon = parseFloat(lon);
  const radiusInput = req.query.radiusKm != null ? req.query.radiusKm : req.query.radius;
  const rad = radiusInput != null ? parseFloat(radiusInput) : 15;

  if (isNaN(uLat) || uLat < -90 || uLat > 90 || isNaN(uLon) || uLon < -180 || uLon > 180) {
    return res.status(400).json({ error: 'Coordinates outside valid geographic bounds.' });
  }
  if (isNaN(rad) || rad <= 0 || rad > 100) {
    return res.status(400).json({ error: 'Radius must be a positive number up to 100 km.' });
  }

  try {
    // 1. Fetch from local database
    const localFacilities = db.getFacilities({ lat: uLat, lon: uLon, radiusKm: rad });

    // 2. Fetch live OpenStreetMap Overpass facilities with honest fallback
    let osmFacilities = [];
    let osmSourceAvailable = true;
    try {
      osmFacilities = await geoService.fetchOverpassHospitals(uLat, uLon, rad);
    } catch (osmErr) {
      console.warn('[Facilities Nearby] OSM Provider unavailable:', osmErr.message);
      osmSourceAvailable = false;
    }

    // Merge without duplicates using stable identifier and name/proximity matching
    const combined = [...localFacilities];

    // Documented 3-tier deduplication strategy:
    // Tier 1: Exact stable identifier match
    // Tier 2: Exact normalized name match
    // Tier 3: Proximity match (<500m Haversine distance) with partial name token match
    for (const osm of osmFacilities) {
      const alreadyExists = localFacilities.some(loc => {
        if (loc.id === osm.id) return true;
        const locNorm = (loc.name || '').toLowerCase().trim();
        const osmNorm = (osm.name || '').toLowerCase().trim();
        if (locNorm && osmNorm && locNorm === osmNorm) return true;

        if (loc.lat != null && osm.lat != null && loc.lon != null && osm.lon != null) {
          const proxDist = geoService.calculateDistanceKm(loc.lat, loc.lon, osm.lat, osm.lon);
          if (proxDist != null && proxDist <= 0.5) {
            if (locNorm.includes(osmNorm) || osmNorm.includes(locNorm)) {
              return true;
            }
          }
        }
        return false;
      });

      if (!alreadyExists) {
        combined.push(osm);
      }
    }

    // Sort by real Haversine distance
    combined.sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));

    res.json({
      facilities: combined,
      total: combined.length,
      searchCenter: { lat: uLat, lon: uLon, radiusKm: rad },
      sources: osmSourceAvailable
        ? ['Verified National Directory', 'OpenStreetMap Live Overpass']
        : ['Verified National Directory (OSM external query currently unavailable)'],
      externalProviderStatus: osmSourceAvailable ? 'CONNECTED' : 'UNAVAILABLE'
    });
  } catch (err) {
    console.error('[Facilities Nearby Error]', err.message);
    res.status(500).json({ error: 'Failed to fetch nearby facilities: ' + err.message });
  }
});

router.get('/facilities/:id', (req, res) => {
  const fac = db.getFacilityById(req.params.id);
  if (!fac) return res.status(404).json({ error: 'Facility not found' });
  res.json(fac);
});

router.post('/facilities/:id/surge-divert', authenticateToken, requireRole(['admin', 'hospital_admin', 'doctor']), (req, res) => {
  const { reason } = req.body;
  const userId = req.user ? req.user.id : null;
  const updated = db.toggleSurgeDivert(req.params.id, reason, userId);
  if (!updated) return res.status(404).json({ error: 'Facility not found' });
  res.json({ success: true, facility: updated });
});

router.post('/facilities/:id/beds', authenticateToken, requireRole(['admin', 'hospital_admin']), (req, res) => {
  const { icuDelta, oxygenDelta, occupiedEmergencyDelta, note } = req.body;
  const userId = req.user ? req.user.id : null;
  const updated = db.updateBedCount(req.params.id, { icuDelta, oxygenDelta, occupiedEmergencyDelta, note, userId });
  if (!updated) return res.status(404).json({ error: 'Facility not found' });
  res.json({ success: true, facility: updated });
});

// ----------------------------------------------------
// 5. Doctors Directory & Appointments
// ----------------------------------------------------
router.get('/doctors', (req, res) => {
  const { specialty, facilityId, search, lat, lon, radiusKm } = req.query;
  const list = db.getDoctors({ specialty, facilityId, search, lat, lon, radiusKm });
  res.json({
    doctors: list,
    total: list.length,
    userLocationApplied: Boolean(lat && lon)
  });
});

router.post('/appointments/book', optionalAuth, (req, res) => {
  const { facilityId, doctorId, department, patientName, patientPhone, appointmentDate, timeSlot, reason } = req.body;

  if (!facilityId) {
    return res.status(400).json({ error: 'Facility ID is required to book an OPD token.' });
  }
  if (!patientName || typeof patientName !== 'string' || patientName.trim().length < 2) {
    return res.status(400).json({ error: 'Valid patient name is required.' });
  }
  if (!patientPhone || typeof patientPhone !== 'string' || !/^\+?[0-9\s\-]{8,15}$/.test(patientPhone.trim())) {
    return res.status(400).json({ error: 'A valid patient contact phone number is required.' });
  }
  if (!department || typeof department !== 'string') {
    return res.status(400).json({ error: 'Medical department is required.' });
  }
  if (!appointmentDate || typeof appointmentDate !== 'string') {
    return res.status(400).json({ error: 'Appointment date is required.' });
  }
  if (!timeSlot || typeof timeSlot !== 'string') {
    return res.status(400).json({ error: 'Time slot is required.' });
  }

  // Enforce that facility exists in persisted database (prevents foreign-key crashes on OSM facilities)
  const fac = sqliteDb.prepare('SELECT * FROM facilities WHERE id = ?').get(facilityId);
  if (!fac) {
    return res.status(400).json({
      error: 'OPD booking is only supported for verified, persisted healthcare facilities in the national registry. Dynamically discovered map records cannot accept direct token booking.'
    });
  }

  // If a doctor is specified, verify doctor belongs to this facility
  if (doctorId) {
    const doc = sqliteDb.prepare('SELECT * FROM doctors WHERE id = ?').get(doctorId);
    if (!doc) {
      return res.status(400).json({ error: 'Selected doctor profile was not found.' });
    }
    if (doc.facility_id && doc.facility_id !== facilityId) {
      return res.status(400).json({ error: 'The selected doctor is affiliated with a different healthcare facility.' });
    }
  }

  const userId = req.user ? req.user.id : null;
  const token = db.bookOpdToken({
    facilityId,
    doctorId: doctorId || null,
    department: department.trim(),
    patientName: patientName.trim(),
    patientPhone: patientPhone.trim(),
    appointmentDate: appointmentDate.trim(),
    timeSlot: timeSlot.trim(),
    reason: reason ? String(reason).trim() : 'OPD Consultation',
    userId
  });

  res.status(201).json({ success: true, token });
});

// ----------------------------------------------------
// 6. Emergency SOS & Ambulances
// ----------------------------------------------------
router.post('/emergency/sos', sosLimiter, optionalAuth, (req, res) => {
  const { patientName, contactPhone, pickupLocation, lat, lon, complaint } = req.body;

  if (!patientName || typeof patientName !== 'string' || patientName.trim().length < 2) {
    return res.status(400).json({ error: 'Patient name is required.' });
  }
  if (!contactPhone || typeof contactPhone !== 'string' || !/^\+?[0-9\s\-]{8,15}$/.test(contactPhone.trim())) {
    return res.status(400).json({ error: 'Valid emergency contact phone number is required.' });
  }

  const parsedLat = lat != null ? parseFloat(lat) : null;
  const parsedLon = lon != null ? parseFloat(lon) : null;

  if (parsedLat != null && (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90)) {
    return res.status(400).json({ error: 'Invalid latitude coordinate.' });
  }
  if (parsedLon != null && (isNaN(parsedLon) || parsedLon < -180 || parsedLon > 180)) {
    return res.status(400).json({ error: 'Invalid longitude coordinate.' });
  }

  const userId = req.user ? req.user.id : null;

  const newCase = db.createEmergencySos({
    patientName: patientName.trim(),
    contactPhone: contactPhone.trim(),
    pickupLocation: pickupLocation ? String(pickupLocation).trim() : 'GPS Detected Location',
    lat: parsedLat,
    lon: parsedLon,
    complaint: complaint ? String(complaint).trim() : 'Acute Medical Emergency',
    userId
  });

  res.status(201).json({
    success: true,
    case: newCase,
    emergencyHotline: '108 / 112',
    notice: 'Emergency case recorded in local emergency registry. If immediate life threat, dial 112 or 108 directly.'
  });
});

router.get('/emergency/active', optionalAuth, (req, res) => {
  const activeCase = db.getActiveCase(req.query.caseId);
  if (!activeCase) return res.json(null);

  // If specific caseId requested, return it
  if (req.query.caseId) {
    return res.json(activeCase);
  }

  // If general query without caseId:
  // In production, unauthenticated users cannot view arbitrary active cases
  if (config.isProduction && !req.user) {
    return res.status(401).json({ error: 'Authentication required to inspect active emergency cases.' });
  }

  // Citizens only see their own active case
  if (req.user && req.user.role === 'citizen') {
    if (activeCase.userId && activeCase.userId !== req.user.id) {
      return res.json(null);
    }
  }

  res.json(activeCase);
});

router.post('/emergency/:caseId/status', authenticateToken, requireRole(['admin', 'dispatcher', 'driver', 'paramedic', 'hospital_admin']), (req, res) => {
  const { status, details } = req.body;
  const user = req.user || null;
  const updated = db.updateCaseStatus(req.params.caseId, status, details, user);
  if (!updated) return res.status(404).json({ error: 'Emergency case not found' });
  res.json({ success: true, case: updated });
});

// ----------------------------------------------------
// 7. Clinical Triage Engine
// ----------------------------------------------------
router.post('/triage/assess', (req, res) => {
  const { role, symptoms = [], dangerFlags = [] } = req.body;
  const result = db.calculateTriage({ role, symptoms, dangerFlags });
  res.json(result);
});

// ----------------------------------------------------
// 8. Digital Referrals & FHIR Export
// ----------------------------------------------------
router.get('/referrals', optionalAuth, (req, res) => {
  // Clinical / administrative roles can list all referrals
  // Unauthenticated or citizen users receive an empty or filtered list in production
  if (config.isProduction && (!req.user || req.user.role === 'citizen')) {
    return res.json({ referrals: [] });
  }
  res.json({ referrals: db.getReferrals() });
});

router.get('/referrals/active', (req, res) => {
  const ref = db.getActiveReferral(req.query.refId);
  res.json(ref);
});

router.post('/referrals/:refId/advance', authenticateToken, requireRole(['admin', 'hospital_admin', 'doctor']), (req, res) => {
  const updated = db.advanceReferralStep(req.params.refId, req.user);
  if (!updated) return res.status(404).json({ error: 'Referral not found' });
  res.json({ success: true, referral: updated });
});

router.get('/referrals/:refId/fhir', (req, res) => {
  const ref = db.getActiveReferral(req.params.refId);
  if (!ref) return res.status(404).json({ error: 'Referral record not found' });

  const fhirBundle = fhirService.generateReferralFhirBundle(ref);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="raksha-fhir-${ref.refId}.json"`);
  res.json(fhirBundle);
});

// ----------------------------------------------------
// 9. ASHA Frontline Worker Hub
// ----------------------------------------------------
router.get('/asha', optionalAuth, (req, res) => {
  if (config.isProduction && (!req.user || !['admin', 'asha'].includes(req.user.role))) {
    return res.status(403).json({ error: 'Access denied. ASHA Frontline Worker credentials required.' });
  }
  const userId = req.user ? req.user.id : (config.demoMode ? 'usr-asha' : null);
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  res.json(db.getAshaData(userId));
});

router.post('/asha/sync', authenticateToken, requireRole(['admin', 'asha']), (req, res) => {
  const { visits = [] } = req.body;
  const userId = req.user.id;
  const result = db.syncAshaRecords({ visits, userId });
  res.json({ success: true, ...result });
});

// ----------------------------------------------------
// 10. Patient Profile & Records
// ----------------------------------------------------
router.get('/patient/profile', optionalAuth, (req, res) => {
  if (config.isProduction && !req.user) {
    return res.status(401).json({ error: 'Authentication required to access patient clinical record.' });
  }
  const userId = req.user ? req.user.id : (config.demoMode ? 'usr-citizen' : null);
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  res.json(db.getPatientProfile(userId));
});

// ----------------------------------------------------
// 11. Admin Gap Analytics & Audit Logs
// ----------------------------------------------------
router.get('/analytics', (req, res) => {
  res.json(db.getAnalytics());
});

router.post('/analytics/redeploy', authenticateToken, requireRole('admin'), (req, res) => {
  const userId = req.user ? req.user.id : null;
  const result = db.authorizeSurgeRedeployment(userId);
  res.json({ success: true, analytics: result });
});

router.get('/audit/logs', authenticateToken, requireRole('admin'), (req, res) => {
  const logs = sqliteDb.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100').all();
  res.json({ logs });
});

// Helper to sanitize CSV cells against formula injection (=, +, -, @, \t, \r)
function sanitizeCsvCell(val) {
  if (val == null) return '""';
  let str = String(val);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  return '"' + str.replace(/"/g, '""') + '"';
}

router.get('/audit/download', authenticateToken, requireRole('admin'), (req, res) => {
  const list = db.getReferrals();
  let csv = 'Referral ID,Patient Name,Age,Gender,ABHA ID,Origin,Receiving,Status,Step\n';
  list.forEach(r => {
    csv += [
      sanitizeCsvCell(r.refId),
      sanitizeCsvCell(r.patientName),
      r.patientAge != null ? r.patientAge : '',
      sanitizeCsvCell(r.patientGender),
      sanitizeCsvCell(r.abhaId),
      sanitizeCsvCell(r.originFacility),
      sanitizeCsvCell(r.receivingFacility),
      sanitizeCsvCell(r.status),
      r.currentStep != null ? r.currentStep : ''
    ].join(',') + '\n';
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="raksha_referral_audit.csv"');
  res.send(csv);
});

module.exports = router;

