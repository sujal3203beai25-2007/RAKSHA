// tests/db.test.js
// Automated tests for SQLite Schema, Seed, and Persistence

const test = require('node:test');
const assert = require('node:assert');
const { db } = require('../server/db/index');
const dbService = require('../server/db');

test('Database: Schema tables exist and are accessible', () => {
  const tables = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
  `).all().map(t => t.name);

  assert.ok(tables.includes('facilities'), 'facilities table should exist');
  assert.ok(tables.includes('doctors'), 'doctors table should exist');
  assert.ok(tables.includes('emergency_cases'), 'emergency_cases table should exist');
  assert.ok(tables.includes('referrals'), 'referrals table should exist');
  assert.ok(tables.includes('ambulances'), 'ambulances table should exist');
  assert.ok(tables.includes('appointments'), 'appointments table should exist');
  assert.ok(tables.includes('asha_visits'), 'asha_visits table should exist');
  assert.ok(tables.includes('audit_logs'), 'audit_logs table should exist');
});

test('Database: Verified facilities seeded with real coordinates', () => {
  const facilities = dbService.getFacilities();
  assert.ok(facilities.length >= 8, 'Should have at least 8 seeded facilities');

  const safdarjung = dbService.getFacilityById('safdarjung');
  assert.ok(safdarjung, 'Safdarjung hospital must exist');
  assert.strictEqual(safdarjung.state, 'Delhi');
  assert.ok(safdarjung.lat > 20 && safdarjung.lat < 35, 'Latitude should be in India');
  assert.ok(safdarjung.lon > 68 && safdarjung.lon < 90, 'Longitude should be in India');
});

test('Database: Doctors are properly linked to departments', () => {
  const doctors = dbService.getDoctors();
  assert.ok(doctors.length >= 6, 'Should have at least 6 verified doctors');

  const cardiologist = doctors.find(d => d.specialty === 'Cardiology');
  assert.ok(cardiologist, 'Should have a verified cardiologist');
  assert.ok(cardiologist.qualification, 'Doctor must have verified qualification');
});

test('Database: Bed updates persist and modify facility totals', () => {
  const initial = dbService.getFacilityById('safdarjung');
  const initialIcu = initial.icuBedsFree;

  dbService.updateBedCount('safdarjung', { icuDelta: 2 });
  const afterIncrement = dbService.getFacilityById('safdarjung');
  assert.strictEqual(afterIncrement.icuBedsFree, initialIcu + 2, 'ICU beds should increase by 2');

  dbService.updateBedCount('safdarjung', { icuDelta: -2 });
  const restored = dbService.getFacilityById('safdarjung');
  assert.strictEqual(restored.icuBedsFree, initialIcu, 'ICU beds should be restored');
});

test('Database: Surge Divert protocol toggling persists', () => {
  const initial = dbService.getFacilityById('safdarjung');
  const initialDivert = initial.surgeDivertActive;

  dbService.toggleSurgeDivert('safdarjung', 'Testing protocol');
  const toggled = dbService.getFacilityById('safdarjung');
  assert.strictEqual(toggled.surgeDivertActive, !initialDivert, 'Surge divert state should flip');

  // Restore
  dbService.toggleSurgeDivert('safdarjung', 'Restoring protocol');
  const restored = dbService.getFacilityById('safdarjung');
  assert.strictEqual(restored.surgeDivertActive, initialDivert, 'Surge divert state should be restored');
});
