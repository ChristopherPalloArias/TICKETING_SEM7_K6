// k6/config/thresholds.js
// SLA threshold definitions — PERF-001 Section 3.1 (Confirmed) & 3.2 (Candidate)
//
// Thresholds use k6's tag-based filtering via scenario name.
// Each scenario script assigns its own scenario tag through options.

export const thresholds = {
  // ── Flow A — Event Availability (GET /api/v1/events) ──────────────────

  // Smoke: relaxed ceiling (single VU, cold start)
  'http_req_duration{scenario:smoke_events}': ['p(95) < 500'],

  // Load: confirmed SLA from spec Section 3.1
  'http_req_duration{scenario:load_events}': [
    'p(95) < 400',  // ✓ Confirmed SLA
    'p(99) < 700',  // ◇ Candidate (long-tail guard)
  ],
  'http_req_failed{scenario:load_events}': ['rate < 0.01'], // ✓ < 1% error rate

  // ── Flow B — Reservation Creation (POST /api/v1/reservations) ─────────

  // Smoke: relaxed ceiling for write path
  'http_req_duration{scenario:smoke_reservations}': ['p(95) < 800'],

  // Load: confirmed SLA from spec Section 3.1
  'http_req_duration{scenario:load_reservations}': [
    'p(95) < 600',   // ✓ Confirmed SLA
    'p(99) < 1000',  // ◇ Candidate (long-tail guard)
  ],
  'http_req_failed{scenario:load_reservations}': ['rate < 0.01'], // ✓ < 1% error rate
};

export default thresholds;
