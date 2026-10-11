// tests/security_audit.test.js
// Automated verification tests for Security, Role-Based Access, Geolocation, and Data Integrity

const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const config = require('../server/config');
const apiRoutes = require('../server/routes');
const dbService = require('../server/db');
const { createUniqueId } = require('../server/db/index');
const seedDatabase = require('../server/db/seed');

let server;
let baseUrl;

// Helper to generate test JWT token
function makeTestToken(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
}

test.before(async () => {
  seedDatabase(false);
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', apiRoutes);

  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}/api`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

// -------------------------------------------------------------------
// 1. Role Escalation Prevention
// -------------------------------------------------------------------
test('Security: Public registration prevents unauthorized role escalation', async () => {
  const privilegedRoles = ['admin', 'doctor', 'dispatcher', 'asha', 'hospital_admin', 'driver'];

  for (const role of privilegedRoles) {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Hacker ${role}`,
        email: `escalate_${role}_${Date.now()}@example.com`,
        password: 'Password123!',
        role
      })
    });

    assert.strictEqual(res.status, 403, `Public registration with privileged role '${role}' must return 403 Forbidden`);
    const data = await res.json();
    assert.ok(data.error.includes('Privileged role') && data.error.includes('cannot be self-assigned'));
  }
});

test('Security: Public registration succeeds for citizen role', async () => {
  const email = `citizen_${Date.now()}@example.com`;
  const res = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Rajesh Verma',
      email,
      password: 'SafePassword123!',
      role: 'citizen'
    })
  });

  assert.strictEqual(res.status, 201, 'Citizen registration should succeed with 201');
  const data = await res.json();
  assert.ok(data.token, 'Should return a valid JWT token');
  assert.strictEqual(data.user.role, 'citizen');
});

// -------------------------------------------------------------------
// 2. Unauthenticated Mutation Endpoints (401)
// -------------------------------------------------------------------
test('Security: Unauthenticated mutations return 401 Unauthorized', async () => {
  const endpoints = [
    { url: `${baseUrl}/facilities/safdarjung/surge-divert`, method: 'POST', body: { reason: 'Test' } },
    { url: `${baseUrl}/facilities/safdarjung/beds`, method: 'POST', body: { icuDelta: 1 } },
    { url: `${baseUrl}/emergency/EMG-001/status`, method: 'POST', body: { status: 'DISPATCHED' } },
    { url: `${baseUrl}/referrals/REF-001/advance`, method: 'POST', body: {} },
    { url: `${baseUrl}/asha/sync`, method: 'POST', body: { visits: [] } },
    { url: `${baseUrl}/analytics/redeploy`, method: 'POST', body: {} },
    { url: `${baseUrl}/audit/download`, method: 'GET' }
  ];

  for (const ep of endpoints) {
    const opts = { method: ep.method, headers: { 'Content-Type': 'application/json' } };
    if (ep.body) opts.body = JSON.stringify(ep.body);

    const res = await fetch(ep.url, opts);
    assert.strictEqual(res.status, 401, `Unauthenticated request to ${ep.method} ${ep.url} must return 401`);
  }
});

// -------------------------------------------------------------------
// 3. JWT in Query String Rejected (Header Only)
// -------------------------------------------------------------------
test('Security: JWT tokens in query string are rejected', async () => {
  const adminToken = makeTestToken({ id: 'usr-admin-1', role: 'admin', name: 'Test Admin' });
  const res = await fetch(`${baseUrl}/audit/download?token=${adminToken}`);
  assert.strictEqual(res.status, 401, 'Token in query string must not authenticate protected endpoints');
});

// -------------------------------------------------------------------
// 4. Role-based Authorisation Enforcement (403)
// -------------------------------------------------------------------
test('Security: Unauthorized citizen cannot perform administrative operations', async () => {
  const citizenToken = makeTestToken({ id: 'usr-citizen-1', role: 'citizen', name: 'Citizen User' });

  // Citizen trying to redeploy fleet
  const redeployRes = await fetch(`${baseUrl}/analytics/redeploy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${citizenToken}`
    }
  });
  assert.strictEqual(redeployRes.status, 403, 'Citizen must receive 403 Forbidden for fleet redeployment');

  // Citizen trying to update bed count
  const bedRes = await fetch(`${baseUrl}/facilities/safdarjung/beds`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${citizenToken}`
    },
    body: JSON.stringify({ icuDelta: 2 })
  });
  assert.strictEqual(bedRes.status, 403, 'Citizen must receive 403 Forbidden for bed updates');

  // Citizen trying to download audit log
  const auditRes = await fetch(`${baseUrl}/audit/download`, {
    headers: { 'Authorization': `Bearer ${citizenToken}` }
  });
  assert.strictEqual(auditRes.status, 403, 'Citizen must receive 403 Forbidden for audit downloads');
});

// -------------------------------------------------------------------
// 5. Geolocation Coordinate & Radius Validation
// -------------------------------------------------------------------
test('Geo: Backend validates coordinates and radius bounds', async () => {
  // Invalid Latitude (>90)
  const invLat = await fetch(`${baseUrl}/facilities/nearby?lat=95&lon=77.2&radius=10`);
  assert.strictEqual(invLat.status, 400);

  // Invalid Longitude (<-180)
  const invLon = await fetch(`${baseUrl}/facilities/nearby?lat=28.5&lon=-195&radius=10`);
  assert.strictEqual(invLon.status, 400);

  // Invalid Radius (>100 km)
  const invRad = await fetch(`${baseUrl}/facilities/nearby?lat=28.5&lon=77.2&radius=500`);
  assert.strictEqual(invRad.status, 400);

  // Invalid Reverse Geocode Latitude
  const invRev = await fetch(`${baseUrl}/geo/reverse?lat=120&lon=77.2`);
  assert.strictEqual(invRev.status, 400);
});

// -------------------------------------------------------------------
// 6. Doctor Radius Filter Strictness
// -------------------------------------------------------------------
test('Doctors: Radius filter never returns doctors outside the requested radius', () => {
  // Center: Safdarjung Hospital (Delhi: 28.5684, 77.2066)
  // Request radius: 0.05 km (no doctor should match within 50 meters)
  const nearbyDoctors = dbService.getDoctors({
    lat: 28.5684,
    lon: 77.2066,
    radiusKm: 0.05
  });

  // Verify that any doctor returned is strictly within 0.05 km
  for (const doc of nearbyDoctors) {
    assert.ok(doc.distanceKm <= 0.05, `Doctor distance ${doc.distanceKm} exceeds radius 0.05`);
  }

  // Doctors in Gurugram (28.4595, 77.0266) with 5km radius should not include Delhi doctors (approx 25km away)
  const gurugramDocs = dbService.getDoctors({
    lat: 28.4595,
    lon: 77.0266,
    radiusKm: 5
  });

  for (const doc of gurugramDocs) {
    assert.ok(doc.distanceKm <= 5, `Gurugram filtered doctor ${doc.name} distance ${doc.distanceKm} exceeds 5km`);
  }
});

// -------------------------------------------------------------------
// 7. Booking Protection for Unpersisted External OSM Facilities
// -------------------------------------------------------------------
test('OPD: Booking fails for unpersisted dynamic map records', async () => {
  const res = await fetch(`${baseUrl}/appointments/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      facilityId: 'osm-987654321', // Arbitrary external OpenStreetMap node
      department: 'General Medicine',
      patientName: 'Sunita Sharma',
      patientPhone: '+91 98111 22334',
      appointmentDate: 'Tomorrow',
      timeSlot: '10:00 AM'
    })
  });

  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.ok(data.error.includes('verified, persisted healthcare facilities'));
});

// -------------------------------------------------------------------
// 8. Emergency Case Allowed State Transitions
// -------------------------------------------------------------------
test('Emergency: State transition graph rejects invalid transitions', () => {
  const newCase = dbService.createEmergencySos({
    patientName: 'State Transition Test',
    contactPhone: '+91 91234 56789',
    pickupLocation: 'NH-48 Gurugram',
    complaint: 'Trauma Evaluation'
  });

  // Attempt invalid transition: jumping directly to PATIENT_LOADED from initial status without arriving
  assert.throws(() => {
    dbService.updateCaseStatus(newCase.caseId, 'PATIENT_LOADED');
  }, /Invalid status transition/);
});

// -------------------------------------------------------------------
// 9. Collision Resistance Under Rapid Writes
// -------------------------------------------------------------------
test('Integrity: Rapid consecutive updates produce unique collision-resistant IDs', () => {
  const ids = new Set();
  const count = 50;

  for (let i = 0; i < count; i++) {
    const id = createUniqueId('TEST');
    assert.ok(!ids.has(id), `Duplicate ID generated: ${id}`);
    ids.add(id);
  }

  assert.strictEqual(ids.size, count);
});
