// k6/config/options.js
// k6 Options & Scenario definitions aligned to PERF-001 spec (Section 4)

import thresholds from './thresholds.js';

/**
 * Helper to export only the requested scenario based on the SCENARIO env var.
 * If running the scripts directly (e.g. k6 run load-events.js), the script itself
 * should selectively export the scenario it needs instead of everything at once.
 */

export const smokeEventsOptions = {
  executor: 'shared-iterations',
  vus: 1,
  iterations: 1,
  maxDuration: '30s',
  tags: { scenario: 'smoke_events' },
};

export const smokeReservationsOptions = {
  executor: 'shared-iterations',
  vus: 1,
  iterations: 1,
  maxDuration: '30s',
  tags: { scenario: 'smoke_reservations' },
};

export const loadEventsOptions = {
  executor: 'ramping-arrival-rate',
  preAllocatedVUs: 20,
  maxVUs: 60,
  timeUnit: '1s',
  stages: [
    { target: 40, duration: '1m' }, // Warm-up
    { target: 40, duration: '2m' }, // Stability 1 (Fixed from 3m to 2m per spec)
    { target: 80, duration: '1m' }, // Ramp to peak
    { target: 80, duration: '3m' }, // SLA Window
    { target: 0,  duration: '30s' }, // Cool-down
  ],
  tags: { scenario: 'load_events' },
};

export const loadReservationsOptions = {
  // --- SPEC-ALIGNED PROFILE (PERF-001 Section 4.4) ---
  // Executor: ramping-arrival-rate — the only executor capable of demonstrating the
  // 30 req/s throughput target committed in the SLA.
  //
  // ⚠️ KNOWN ENVIRONMENTAL CONSTRAINT:
  // The MVP demo environment contains a bounded seat inventory (~160 unique seats).
  // At 30 TPS this inventory is consumed in approximately 5 seconds.
  // The setup() function calls the testability/performance/reset endpoints on both
  // services to replenish inventory before the run. If those endpoints are unavailable
  // or the backend is not seeded with enough quota, the error rate will exceed 1%
  // starting from the moment inventory is exhausted — this must be documented as an
  // environmental limitation, NOT a k6 script defect.
  // See README.md > Limitations for full details.
  executor: 'ramping-arrival-rate',
  preAllocatedVUs: 25,
  maxVUs: 50,
  timeUnit: '1s',
  stages: [
    { target: 15, duration: '1m' },  // Warm-up ramp to 50% target
    { target: 15, duration: '2m' },  // Stabilization at 50%
    { target: 30, duration: '1m' },  // Ramp to SLA target (30 req/s)
    { target: 30, duration: '3m' },  // Primary SLA measurement window
    { target: 0,  duration: '30s' }, // Cool-down
  ],
  tags: { scenario: 'load_reservations' },
};

// When included by a master script, you can run all of them via scenarios:
export const options = {
  scenarios: {
    smoke_events: smokeEventsOptions,
    smoke_reservations: smokeReservationsOptions,
    load_events: loadEventsOptions,
    load_reservations: loadReservationsOptions,
  },
  thresholds,
};

export default options;
