// k6/scenarios/load-events.js
// Load Test for Event Availability (PERF-001 Flow A)

import { check, sleep } from 'k6';
import { loadEventsOptions } from '../config/options.js';
import { loadEventsThresholds } from '../config/thresholds.js';
import { getEvents, healthCheck } from '../lib/http-client.js';
import { checkEventAvailabilityResponse, checkHealthResponse } from '../lib/checks.js';

// Export strictly the load_events scenario, disabling others.
export const options = {
  scenarios: {
    load_events: loadEventsOptions,
  },
  thresholds: loadEventsThresholds,
};

export function setup() {
  console.log('=== LOAD TEST (Event Availability) SETUP ===');
  console.log('Target: 80 TPS, p95 < 400ms, error rate < 1%');
  
  const healthRes = healthCheck();
  if (!checkHealthResponse(healthRes)) {
    console.error('❌ Backend health check failed.');
    throw new Error('Backend unavailable');
  }
  
  console.log('✓ Backend health check passed');
  return { ready: true };
}

export default function () {
  const res = getEvents(1, 10);
  checkEventAvailabilityResponse(res);
  
  // Minimal pacing. Arrival rate executor pushes the RPS, not the VU loop.
  sleep(0.1);
}

export function teardown() {
  console.log('=== LOAD TEST (Event Availability) TEARDOWN ===');
}
