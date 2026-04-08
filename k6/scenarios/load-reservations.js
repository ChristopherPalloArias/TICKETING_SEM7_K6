// k6/scenarios/load-reservations.js
// Load Test for Reservation Creation (PERF-001 Flow B)

import { check, sleep } from 'k6';
import http from 'k6/http';
import { loadReservationsOptions } from '../config/options.js';
import thresholds from '../config/thresholds.js';
import { createReservation, healthCheck } from '../lib/http-client.js';
import { checkReservationCreationResponse, checkHealthResponse } from '../lib/checks.js';
import { selectDataItem, buildReservationPayload } from '../lib/utils.js';
import { BASE_URL_EVENTS_DIRECT, BASE_URL_TICKETING_DIRECT } from '../config/env.js';
import exec from 'k6/execution';

// Dynamic Options using env vars as fallback since iterations cannot be fully async mapped yet
export const options = {
  scenarios: {
    load_reservations: Object.assign({}, loadReservationsOptions, {
      iterations: __ENV.ITERATIONS ? parseInt(__ENV.ITERATIONS) : 120
    }),
  },
  thresholds,
};

export function setup() {
  console.log('=== LOAD TEST (Reservation Creation) SETUP ===');
  console.log('⚠️ CONTROLLED PROFILE: Auto-Resetting Database and Fetching Clean Inventory');
  
  const healthRes = healthCheck();
  if (!checkHealthResponse(healthRes)) {
    throw new Error('Backend unavailable');
  }

  // 1. Reset the Ticketing Data (Reservations)
  const tkRes = http.post(`${BASE_URL_TICKETING_DIRECT}/api/v1/testability/performance/reset`);
  if (tkRes.status !== 200) console.warn('Ticketing reset failed or testability disabled:', tkRes.status);
  
  // 2. Reset the Events Data (Seats)
  const evRes = http.post(`${BASE_URL_EVENTS_DIRECT}/api/v1/testability/performance/reset`);
  if (evRes.status !== 200) console.warn('Events reset failed or testability disabled:', evRes.status);

  // 3. Fetch Fresh Inventory Payload
  const invRes = http.get(`${BASE_URL_EVENTS_DIRECT}/api/v1/testability/performance/inventory`);
  let testData = [];
  if (invRes.status === 200) {
      testData = invRes.json();
  } else {
      throw new Error(`Inventory fetch failed: ${invRes.status}`);
  }
  
  if (!testData || testData.length === 0) {
    throw new Error('Test data unavailable. Ensure the database was seeded.');
  }
  
  console.log(`✓ Data pool size accurately loaded via HTTP: ${testData.length}`);
  console.log(`Target: Process up to ${testData.length} unique writes with 20 concurrent VUs`);
  
  return { testData };
}

export default function (data) {
  const testData = data.testData;
  const iterationIndex = exec.scenario.iterationInTest;
  const dataItem = selectDataItem(testData, iterationIndex);
  
  // Notice we must transform the plain strings to the array the payload requires
  // since the java controller returned a flat mapped object
  const correctedDataItem = {
      eventId: dataItem.eventId,
      tierId: dataItem.tierId,
      seatIds: [dataItem.seatId] // Maps the singular column alias to expected array
  };

  const payload = buildReservationPayload(correctedDataItem, iterationIndex);
  
  const res = createReservation(payload);
  checkReservationCreationResponse(res);
  
  if (res.status >= 400 && __ENV.DEBUG === 'true') {
    console.warn(`Reservation failed: ${res.status} | Event: ${dataItem.eventId}`);
  }
  
  sleep(0.1);
}

export function teardown() {
  console.log('=== LOAD TEST (Reservation Creation) TEARDOWN ===');
  console.log('⚠️ Reminder: Inventory consumed. Perform data reset before next run.');
}
