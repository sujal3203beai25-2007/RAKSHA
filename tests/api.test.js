// tests/api.test.js
// Automated Integration Tests for RAKSHA REST API Endpoints

const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const express = require('express');
const cors = require('cors');

const apiRoutes = require('../server/routes');
const { db: sqliteDb } = require('../server/db/index');
const seedDatabase = require('../server/db/seed');

let server;
let baseUrl;

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
  await new Promise((resolve) => server.close(resolve));
});

test('API: /health returns healthy status and database connection', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'HEALTHY');
  assert.strictEqual(data.database, 'CONNECTED');
});

test('API: /facilities returns facilities list and handles filters', async () => {
  const res = await fetch(`${baseUrl}/facilities?filter=govt`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(data.facilities.length > 0);
  assert.ok(data.facilities.every(f => f.govt === true));
});

test('API: /doctors returns verified doctor profiles', async () => {
  const res = await fetch(`${baseUrl}/doctors?specialty=Cardiology`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(data.doctors.length > 0);
  assert.strictEqual(data.doctors[0].specialty, 'Cardiology');
});

test('API: /appointments/book creates persistent OPD appointment token', async () => {
  const res = await fetch(`${baseUrl}/appointments/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      facilityId: 'safdarjung',
      department: 'Cardiology',
      patientName: 'Kishore Kumar',
      patientPhone: '+91 98111 22334',
      appointmentDate: 'Tomorrow',
      timeSlot: '11:00 AM'
    })
  });

  assert.strictEqual(res.status, 201);
  const data = await res.json();
  assert.ok(data.success);
  assert.ok(data.token.tokenNumber > 0);
  assert.strictEqual(data.token.department, 'Cardiology');
});

test('API: /emergency/sos creates persistent emergency record', async () => {
  const res = await fetch(`${baseUrl}/emergency/sos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientName: 'Anita Desai',
      contactPhone: '+91 91234 56789',
      pickupLocation: 'Cyber City, Gurugram',
      complaint: 'Loss of Consciousness'
    })
  });

  assert.strictEqual(res.status, 201);
  const data = await res.json();
  assert.ok(data.success);
  assert.ok(data.case.caseId.startsWith('EMG-'));
});

test('API: /triage/assess evaluates risk flags safely', async () => {
  const res = await fetch(`${baseUrl}/triage/assess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'self',
      symptoms: ['chest', 'breath'],
      dangerFlags: ['cyanosis']
    })
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.urgencyLevel, 'critical');
  assert.ok(data.disclaimer);
});

test('API: /referrals/active/fhir returns valid FHIR JSON bundle download', async () => {
  const activeRef = await fetch(`${baseUrl}/referrals/active`).then(r => r.json());
  assert.ok(activeRef && activeRef.refId, 'Must have active referral');

  const res = await fetch(`${baseUrl}/referrals/${activeRef.refId}/fhir`);
  assert.strictEqual(res.status, 200);
  const bundle = await res.json();
  assert.strictEqual(bundle.resourceType, 'Bundle');
  assert.strictEqual(bundle.entry.length, 2);
});

test('API: /analytics returns database-backed aggregates', async () => {
  const res = await fetch(`${baseUrl}/analytics`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(data.activeFleet.totalFleet > 0);
  assert.ok(data.activeFleet.activeAmbulances > 0);
});
