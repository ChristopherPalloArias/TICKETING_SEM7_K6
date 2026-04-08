// k6/scenarios/load-reservations.js
// Load Test for Reservation Creation (PERF-001 Flow B)

import { check, sleep } from 'k6';
import { loadReservationsOptions } from '../config/options.js';
import thresholds from '../config/thresholds.js';
import { createReservation, healthCheck } from '../lib/http-client.js';
import { checkReservationCreationResponse, checkHealthResponse } from '../lib/checks.js';
import { loadSharedData, selectDataItem, buildReservationPayload } from '../lib/utils.js';
import exec from 'k6/execution';

// Bind the total iterations strictly to the amount of available data pool.
// This prevents k6 from wrapping around the indices and firing duplicate requests
// that would result in intentional 409 Conflicts from the server's seat locks.
const testData = loadSharedData('../data/test-data.json');

export const options = {
  scenarios: {
    load_reservations: Object.assign({}, loadReservationsOptions, {
      iterations: testData.length > 0 ? testData.length : 1
    }),
  },
  thresholds,
};

export function setup() {
  console.log('=== LOAD TEST (Reservation Creation) SETUP ===');
  console.log('⚠️ CONTROLLED PROFILE: Limiting iterations strictly to available DB seat pool.');
  console.log(`Target: Process ${testData.length} unique writes with 20 concurrent VUs`);
  
  const healthRes = healthCheck();
  if (!checkHealthResponse(healthRes)) {
    throw new Error('Backend unavailable');
  }
  
  if (!testData || testData.length === 0) {
    throw new Error('Test data unavailable');
  }
  
  console.log(`✓ Data pool size: ${testData.length}`);
  return { ready: true };
}

export default function () {
  const iterationIndex = exec.scenario.iterationInTest;
  const dataItem = selectDataItem(testData, iterationIndex);
  const payload = buildReservationPayload(dataItem, iterationIndex);
  
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
