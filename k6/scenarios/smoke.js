// k6/scenarios/smoke.js
// Combined Smoke Test for MVP Core Performance Validation (PERF-001)

import { check, sleep } from 'k6';
import http from 'k6/http';
import { smokeEventsOptions, smokeReservationsOptions } from '../config/options.js';
import thresholds from '../config/thresholds.js';
import { getEvents, createReservation, healthCheck } from '../lib/http-client.js';
import { checkEventAvailabilityResponse, checkReservationCreationResponse, checkHealthResponse } from '../lib/checks.js';
import { selectDataItem, buildReservationPayload } from '../lib/utils.js';
import { BASE_URL_EVENTS_DIRECT } from '../config/env.js';

// We dynamically assign options so k6 only runs the scenarios intended for smoke test.
export const options = {
  scenarios: {
    smoke_events: smokeEventsOptions,
    smoke_reservations: smokeReservationsOptions,
  },
  thresholds,
};

export function setup() {
  console.log('=== SMOKE TEST SETUP ===');
  
  const healthRes = healthCheck();
  if (!checkHealthResponse(healthRes)) {
    console.error('❌ Backend health check failed. Aborting smoke tests.');
    throw new Error('Backend unavailable: GET /api/v1/events returned non-200');
  }

  const invRes = http.get(`${BASE_URL_EVENTS_DIRECT}/api/v1/testability/performance/inventory`);
  let testData = [];
  if (invRes.status === 200) {
      testData = invRes.json();
  }

  if (!testData || testData.length === 0) {
    throw new Error('Test data unavailable. Missing seeded data.');
  }
  
  console.log('✓ Backend health check passed');
  return { testData };
}

export default function (data) {
  const scenario = __ENV.SCENARIO;
  
  if (!scenario || scenario === 'smoke_events') {
    const eventsRes = getEvents(1, 1);
    checkEventAvailabilityResponse(eventsRes);
  }
  
  if (!scenario || scenario === 'smoke_reservations') {
    const testData = data.testData;
    // Fallback to first item for smoke test
    const dataItem = testData[0];
    const correctedDataItem = {
        eventId: dataItem.eventId,
        tierId: dataItem.tierId,
        seatIds: [dataItem.seatId]
    };

    const payload = buildReservationPayload(correctedDataItem, 1);
    const reservationRes = createReservation(payload);
    checkReservationCreationResponse(reservationRes);
  }
  
  sleep(1);
}

export function teardown() {
  console.log('=== SMOKE TEST TEARDOWN ===');
}
