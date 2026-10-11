// tests/geo.test.js
// Automated tests for Haversine distance, geolocation calculation, and sorting

const test = require('node:test');
const assert = require('node:assert');
const { calculateDistanceKm } = require('../server/services/geoService');
const dbService = require('../server/db');

test('Geo: Haversine distance calculation is accurate', () => {
  // Distance between Safdarjung Hospital (28.5684, 77.2066) and AIIMS Delhi (28.5672, 77.2100) is approx ~0.4 km
  const dist = calculateDistanceKm(28.5684, 77.2066, 28.5672, 77.2100);
  assert.ok(dist >= 0.3 && dist <= 0.6, `Calculated distance ${dist}km should be ~0.4km`);

  // Distance between Gurugram (28.4595, 77.0266) and Safdarjung Delhi (28.5684, 77.2066) is approx ~21 km
  const distGgnToDel = calculateDistanceKm(28.4595, 77.0266, 28.5684, 77.2066);
  assert.ok(distGgnToDel >= 18 && distGgnToDel <= 26, `Calculated distance ${distGgnToDel}km should be ~21km`);

  // Same coordinates should be 0 km
  assert.strictEqual(calculateDistanceKm(28.5684, 77.2066, 28.5684, 77.2066), 0);
});

test('Geo: Null coordinates return null distance safely', () => {
  assert.strictEqual(calculateDistanceKm(null, null, 28.5, 77.2), null);
  assert.strictEqual(calculateDistanceKm(28.5, 77.2, null, null), null);
});

test('Geo: Facilities are sorted by real distance from user coordinates', () => {
  // Query from near Gurugram Civil Hospital (28.4485, 76.9945)
  const results = dbService.getFacilities({ lat: 28.4485, lon: 76.9945 });

  assert.ok(results.length > 0, 'Should return facilities');
  assert.ok(results[0].distanceKm !== undefined, 'Facilities must have distanceKm computed');

  // Verify that results are sorted in ascending order of distance
  for (let i = 0; i < results.length - 1; i++) {
    assert.ok(
      results[i].distanceKm <= results[i + 1].distanceKm,
      `Facility at index ${i} (${results[i].distanceKm}km) must be <= index ${i + 1} (${results[i + 1].distanceKm}km)`
    );
  }

  // Nearest facility to Gurugram should be Civil Hospital Gurugram (~0 km)
  assert.strictEqual(results[0].id, 'civil-gurugram');
});
