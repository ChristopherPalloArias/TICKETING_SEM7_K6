// k6/config/thresholds.js
// SLA threshold definitions — PERF-001 Section 3.1 (Confirmed) & 3.2 (Candidate)
//
// ── IMPORTANT: threshold exports are split by scenario ────────────────────────
// Each scenario script imports ONLY the thresholds that correspond to the metrics
// it generates. Mixing thresholds from other scenarios causes k6 to fail at init
// with "no metric name found" when a custom metric (e.g. reservation_success_duration)
// is referenced in a script that never defines it.
//
// ── Flow B — reservation_success_duration note ────────────────────────────────
// `reservation_success_duration` is a custom Trend defined in load-reservations.js.
// Its threshold must only appear in smokeThresholds_reservations / loadThresholds_reservations
// AND only when imported by load-reservations.js itself.
// ─────────────────────────────────────────────────────────────────────────────

// ── Smoke thresholds ──────────────────────────────────────────────────────────

export const smokeThresholds = {
  'http_req_duration{scenario:smoke_events}':       ['p(95) < 500'],
  'http_req_duration{scenario:smoke_reservations}': ['p(95) < 800'],
};

// ── Load thresholds — Flow A (only what load-events.js generates) ─────────────

export const loadEventsThresholds = {
  'http_req_duration{scenario:load_events}': [
    'p(95) < 400',  // ✓ Confirmed SLA (PERF-001 §3.1)
    'p(99) < 700',  // ◇ Candidate — long-tail guard
  ],
  'http_req_failed{scenario:load_events}': ['rate < 0.01'], // ✓ < 1% error rate
};

// ── Load thresholds — Flow B (only what load-reservations.js generates) ───────
//
// Uses `reservation_success_duration` (custom Trend, defined in load-reservations.js)
// instead of `http_req_duration{scenario:load_reservations}` because:
//   - Inventory (~120 seats) is exhausted in ~8s at warm-up rate
//   - Post-exhaustion 409 responses are correct business behavior, not technical failures
//   - Measuring p95 over 201+409 mixed traffic produces ~2.72s (contention artifact),
//     not the actual write-path SLA (~30ms observed for successful requests)
//   - `reservation_success_duration` records duration only for HTTP 201 responses
//   - 409 responses are counted separately in `reservation_inventory_conflict` (Counter)
//   - `http.setResponseCallback` in load-reservations.js excludes 409 from http_req_failed

export const loadReservationsThresholds = {
  'reservation_success_duration': [
    'p(95) < 600',   // ✓ Confirmed SLA (PERF-001 §3.1) — 201 responses only
    'p(99) < 1000',  // ◇ Candidate — long-tail guard
  ],
  'http_req_failed{scenario:load_reservations}': ['rate < 0.01'], // ✓ < 1% true technical failures
};

// ── Legacy aggregate export (kept for reference; do NOT use in individual scripts) ──
export const thresholds = {
  ...smokeThresholds,
  ...loadEventsThresholds,
  ...loadReservationsThresholds,
};

export default thresholds;
