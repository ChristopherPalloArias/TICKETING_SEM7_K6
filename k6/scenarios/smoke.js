// k6/scenarios/smoke.js
// Combined Smoke Test for MVP Core Performance Validation (PERF-001)
//
// Purpose: quick connectivity and contract sanity check only.
// Does NOT replace Karate functional validation.
//
// ⚠️ SETUP ORDER: reset endpoints are called before inventory fetch.
//    This is required because a previous load run may have exhausted the seat pool.
//    If reset endpoints are unavailable, the reservation smoke is skipped with a warning
//    (events smoke still runs — no full abort).

import { check, sleep } from 'k6';
import http from 'k6/http';
import { smokeEventsOptions, smokeReservationsOptions } from '../config/options.js';
import { smokeThresholds } from '../config/thresholds.js';
import { getEvents, createReservation, healthCheck } from '../lib/http-client.js';
import { checkEventAvailabilityResponse, checkReservationCreationResponse, checkHealthResponse } from '../lib/checks.js';
import { selectDataItem, buildReservationPayload } from '../lib/utils.js';
import { BASE_URL_EVENTS_DIRECT, BASE_URL_TICKETING_DIRECT } from '../config/env.js';
import exec from 'k6/execution';

export const options = {
  scenarios: {
    smoke_events: smokeEventsOptions,
    smoke_reservations: smokeReservationsOptions,
  },
  thresholds: smokeThresholds,
};

export function setup() {
  console.log('=== SMOKE TEST SETUP ===');

  // --- Health check (hard gate) ---
  const healthRes = healthCheck();
  if (!checkHealthResponse(healthRes)) {
    console.error('❌ Backend health check failed. Aborting smoke tests.');
    throw new Error('Backend unavailable: GET /api/v1/events returned non-200');
  }
  console.log('✓ Backend health check passed');

  // --- Reset inventory before fetching (same order as load-reservations) ---
  // Smoke MUST call reset first; otherwise a prior load run will have consumed all seats
  // and the inventory endpoint returns an empty array, causing a false abort.
  const tkRes = http.post(`${BASE_URL_TICKETING_DIRECT}/api/v1/testability/performance/reset`);
  if (tkRes.status !== 200) {
    console.warn(`[WARN] Ticketing reset not available (${tkRes.status}). Reservation smoke may be skipped.`);
  } else {
    console.log('✓ Ticketing reset successful');
  }

  const evRes = http.post(`${BASE_URL_EVENTS_DIRECT}/api/v1/testability/performance/reset`);
  if (evRes.status !== 200) {
    console.warn(`[WARN] Events reset not available (${evRes.status}). Seat pool may be stale.`);
  } else {
    console.log('✓ Events reset successful');
  }

  // --- Fetch fresh inventory ---
  const invRes = http.get(`${BASE_URL_EVENTS_DIRECT}/api/v1/testability/performance/inventory`);
  let testData = [];
  if (invRes.status === 200) {
    testData = invRes.json();
  }

  // Graceful degradation: if inventory is empty, warn but do NOT abort.
  // The events smoke still validates connectivity. Reservation smoke is skipped.
  if (!testData || testData.length === 0) {
    console.warn('[WARN] Inventory is empty. Reservation smoke will be skipped.');
    console.warn('       Ensure the database is seeded before running the smoke test.');
    return { testData: [], reservationSmokeEnabled: false };
  }

  console.log(`✓ Inventory ready: ${testData.length} seats available`);
  return { testData, reservationSmokeEnabled: true };
}

export default function (data) {
  // exec.scenario.name is the actual k6 scenario key assigned to this VU's iteration.
  // It is always set when running with named scenarios — unlike __ENV.SCENARIO which
  // requires the caller to pass it manually and silently falls back to running both blocks.
  const scenarioName = exec.scenario.name;

  if (scenarioName === 'smoke_events') {
    // ── Flow A: Event Availability ──────────────────────────────────────────
    const eventsRes = getEvents(1, 1);
    checkEventAvailabilityResponse(eventsRes);

  } else if (scenarioName === 'smoke_reservations') {
    // ── Flow B: Reservation Creation ────────────────────────────────────────
    if (!data.reservationSmokeEnabled) {
      console.warn('[SKIP] Reservation smoke skipped — no inventory available.');
      sleep(1);
      return;
    }

    // Use the first item in the pool for a single deterministic smoke reservation.
    const dataItem = data.testData[0];
    const correctedDataItem = {
      eventId: dataItem.eventId,
      tierId: dataItem.tierId,
      seatIds: [dataItem.seatId],
    };

    const payload = buildReservationPayload(correctedDataItem, 1);
    const reservationRes = createReservation(payload);
    checkReservationCreationResponse(reservationRes);

  } else {
    console.warn(`[WARN] Unknown scenario name: ${scenarioName}`);
  }

  sleep(1);
}

export function teardown() {
  console.log('=== SMOKE TEST TEARDOWN ===');
}
