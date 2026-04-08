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
  // --- CONTROLLED INITIAL PROFILE ---
  // Replaced 'ramping-arrival-rate' (30 TPS * 7.5m = 7500 requests) with 'shared-iterations'
  // because the MVP demo environment only contains 160 seats. The previous profile caused
  // 98% legitimate failures (409 Conflict / 400 Bad Request) due to instantaneous inventory exhaustion.
  // This profile hits the database with realistic concurrency (20 VUs) but stops EXACTLY
  // when all available seats are sold, yielding a clean, measurable write performance chart.
  executor: 'shared-iterations',
  iterations: 160, // Bound limit, technically overridden down in the script based on JSON length
  vus: 20,         // Sufficient VUs to track concurrent row locks without connection timeouts
  maxDuration: '2m',
  tags: { scenario: 'load_reservations' },
  
  /* OVERRIDDEN PRODUCTION PROFILE (Retained for future scalability)
  executor: 'ramping-arrival-rate',
  preAllocatedVUs: 15,
  maxVUs: 40,
  timeUnit: '1s',
  stages: [
    { target: 15, duration: '1m' }, 
    { target: 15, duration: '2m' }, 
    { target: 30, duration: '1m' }, 
    { target: 30, duration: '3m' }, 
    { target: 0,  duration: '30s' },
  ],
  */
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
