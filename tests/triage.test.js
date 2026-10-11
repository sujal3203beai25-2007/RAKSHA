// tests/triage.test.js
// Automated tests for Rule-Based Triage Engine and Clinical Red Flags

const test = require('node:test');
const assert = require('node:assert');
const dbService = require('../server/db');

test('Triage: Critical red flags escalate to Code Red with immediate 108 referral', () => {
  const result = dbService.calculateTriage({
    role: 'self',
    symptoms: ['chest', 'breath'],
    dangerFlags: ['cyanosis']
  });

  assert.strictEqual(result.urgencyLevel, 'critical');
  assert.ok(result.priorityCode.includes('Code Red'), 'Must be classified as Code Red');
  assert.ok(result.windowTime.includes('< 15 Mins'), 'Must require immediate window');
  assert.ok(result.disclaimer, 'Must include non-diagnostic clinical disclaimer');
});

test('Triage: Moderate symptoms escalate to Code Yellow', () => {
  const result = dbService.calculateTriage({
    role: 'family',
    symptoms: ['fever', 'cough'],
    dangerFlags: ['high_fever']
  });

  assert.strictEqual(result.urgencyLevel, 'moderate');
  assert.ok(result.priorityCode.includes('Code Yellow'), 'Must be classified as Code Yellow');
  assert.ok(result.recommendation.includes('CHC') || result.recommendation.includes('Sub-District Hospital'));
  assert.ok(result.disclaimer, 'Must include non-diagnostic disclaimer');
});

test('Triage: Mild symptoms route to Routine Code Green', () => {
  const result = dbService.calculateTriage({
    role: 'self',
    symptoms: ['headache'],
    dangerFlags: []
  });

  assert.strictEqual(result.urgencyLevel, 'routine');
  assert.ok(result.priorityCode.includes('Code Green'), 'Must be classified as Code Green');
  assert.ok(result.recommendation.includes('PHC') || result.recommendation.includes('Teleconsult'));
  assert.ok(result.disclaimer, 'Must include non-diagnostic disclaimer');
});
