// k6/scenarios/smoke.js
// Combined Smoke Test for MVP Core Performance Validation (PERF-001)

import { check, sleep } from 'k6';
import { smokeEventsOptions, smokeReservationsOptions } from '../config/options.js';
import thresholds from '../config/thresholds.js';
import { getEvents, createReservation, healthCheck } from '../lib/http-client.js';
import { checkEventAvailabilityResponse, checkReservationCreationResponse, checkHealthResponse } from '../lib/checks.js';
import { loadSharedData, buildReservationPayload } from '../lib/utils.js';

// We dynamically assign options so k6 only runs the scenarios intended for smoke test.
export const options = {
  scenarios: {
    smoke_events: smokeEventsOptions,
    smoke_reservations: smokeReservationsOptions,
  },
  thresholds,
};

// Relative to the scenarios directory where k6 open() resolves
const testData = loadSharedData('../data/test-data.json');

export function setup() {
  console.log('=== SMOKE TEST SETUP ===');
  
  const healthRes = healthCheck();
  const healthOk = checkHealthResponse(healthRes);
  
  if (!healthOk) {
    console.error('❌ Backend health check failed. Aborting smoke tests.');
    // Let k6 know setup failed, it will stop execution
    throw new Error('Backend unavailable: GET /api/v1/events returned non-200');
  }
  
  console.log('✓ Backend health check passed');
  return { ready: true };
}

export default function () {
  const scenario = __ENV.SCENARIO;
  
  if (!scenario || scenario === 'smoke_events') {
    const eventsRes = getEvents(1, 1);
    checkEventAvailabilityResponse(eventsRes);
  }
  
  if (!scenario || scenario === 'smoke_reservations') {
    // Only attempt if there is actual data
    if (testData.length > 0) {
      const testItem = testData[0];
      const payload = buildReservationPayload(testItem, 1);
      const reservationRes = createReservation(payload);
      checkReservationCreationResponse(reservationRes);
    } else {
      console.error('Test data pool is empty. Please populate k6/data/test-data.json');
    }
  }
  
  sleep(1);
}

export function teardown() {
  console.log('=== SMOKE TEST TEARDOWN ===');
}
