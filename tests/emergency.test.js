// tests/emergency.test.js
// Automated tests for Emergency SOS creation, duplicate prevention, and status transitions

const test = require('node:test');
const assert = require('node:assert');
const dbService = require('../server/db');

test('Emergency: Creates persistent emergency case with unique ID', () => {
  const newCase = dbService.createEmergencySos({
    patientName: 'Kavita Joshi',
    contactPhone: '+91 99999 12345',
    pickupLocation: 'Palam Vihar, Gurugram',
    lat: 28.5100,
    lon: 77.0300,
    complaint: 'Severe Dyspnea & Respiratory Distress'
  });

  assert.ok(newCase, 'Emergency case must be created');
  assert.ok(newCase.caseId.startsWith('EMG-'), 'Case ID must begin with EMG-');
  assert.strictEqual(newCase.patientName, 'Kavita Joshi');
  assert.strictEqual(newCase.priority, 'HIGH');
  assert.ok(newCase.status, 'Case must have an initial status');
});

test('Emergency: Duplicate submission within 2 minutes returns existing case', () => {
  const phone = '+91 88888 77777';
  const loc = 'Sector 23, Gurugram';

  const case1 = dbService.createEmergencySos({
    patientName: 'Anoop Singhania',
    contactPhone: phone,
    pickupLocation: loc,
    complaint: 'High Fever'
  });

  const case2 = dbService.createEmergencySos({
    patientName: 'Anoop Singhania',
    contactPhone: phone,
    pickupLocation: loc,
    complaint: 'High Fever'
  });

  assert.strictEqual(case1.caseId, case2.caseId, 'Duplicate submission within window must return same case ID');
});

test('Emergency: Status transitions are recorded and logged', () => {
  const testCase = dbService.createEmergencySos({
    patientName: 'Sunil Rao',
    contactPhone: '+91 77777 55555',
    pickupLocation: 'Sohna Road, Gurugram',
    complaint: 'Road Trauma'
  });

  const updatedArrived = dbService.updateCaseStatus(testCase.caseId, 'ARRIVED_SCENE', { note: 'Ambulance reached scene' });
  assert.strictEqual(updatedArrived.status, 'ARRIVED_SCENE');

  const updatedLoaded = dbService.updateCaseStatus(testCase.caseId, 'PATIENT_LOADED', { note: 'Patient stabilized on stretcher' });
  assert.strictEqual(updatedLoaded.status, 'PATIENT_LOADED');

  const updatedComplete = dbService.updateCaseStatus(testCase.caseId, 'HANDOVER_COMPLETE', { note: 'Handed over to ER trauma team' });
  assert.strictEqual(updatedComplete.status, 'HANDOVER_COMPLETE');
});
