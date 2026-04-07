import { sleep } from 'k6';
import { getOptions } from '../config/options.js';
import { httpClient } from '../lib/http-client.js';
import { assertStatus, assertResponseTime } from '../lib/checks.js';

/**
 * TEMPLATE: Generic Smoke Test
 * Verifies basic connectivity and baseline latency without heavy load.
 * 
 * Execution: k6 run k6/scenarios/smoke.js
 */

export const options = getOptions('smoke');

export function setup() {
  // Initialization hook
  return { initialized: true };
}

export default function (data) {
  // 1. Send request using wrapped generic client
  const res = httpClient.get('/status');

  // 2. Validate response
  assertStatus(res, 200);
  assertResponseTime(res, 500);

  // 3. User pace simulation
  sleep(1);
}

export function teardown(data) {
  // Cleanup resources if necessary
}
