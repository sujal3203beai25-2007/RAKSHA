// tests/fhir.test.js
// Automated tests for HL7 FHIR R4 Bundle structure and ABDM compliance

const test = require('node:test');
const assert = require('node:assert');
const { generateReferralFhirBundle } = require('../server/services/fhirService');

test('FHIR: Generates valid FHIR R4 Bundle with Patient and ServiceRequest resources', () => {
  const mockReferral = {
    ref_id: 'REF-2026-TEST',
    patient_name: 'Pooja Varma',
    patient_age: 34,
    patient_gender: 'Female',
    abha_id: '91-4412-8891-2201',
    pmjay_eligible: 1,
    origin_facility_id: 'CHC Pataudi',
    receiving_facility_id: 'Safdarjung Hospital',
    reason: 'Post-Partum Hemorrhage Emergency Transfer',
    status: 'IN_TRANSIT',
    priority: 'CRITICAL'
  };

  const bundle = generateReferralFhirBundle(mockReferral);

  assert.strictEqual(bundle.resourceType, 'Bundle', 'Must be a FHIR Bundle');
  assert.strictEqual(bundle.type, 'collection', 'Bundle type must be collection');
  assert.strictEqual(bundle.identifier.value, 'REF-2026-TEST');
  assert.ok(bundle.entry && bundle.entry.length === 2, 'Bundle must contain Patient and ServiceRequest entries');

  // Verify Patient resource
  const patientEntry = bundle.entry.find(e => e.resource.resourceType === 'Patient');
  assert.ok(patientEntry, 'Must contain Patient resource');
  assert.strictEqual(patientEntry.resource.name[0].text, 'Pooja Varma');
  assert.strictEqual(patientEntry.resource.gender, 'female');
  assert.strictEqual(patientEntry.resource.identifier[0].value, '91-4412-8891-2201');

  // Verify ServiceRequest resource
  const serviceEntry = bundle.entry.find(e => e.resource.resourceType === 'ServiceRequest');
  assert.ok(serviceEntry, 'Must contain ServiceRequest resource');
  assert.strictEqual(serviceEntry.resource.status, 'active');
  assert.strictEqual(serviceEntry.resource.intent, 'order');
  assert.strictEqual(serviceEntry.resource.priority, 'stat');
});
