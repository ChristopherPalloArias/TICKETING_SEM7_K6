// k6/config/env.js
// Environment configuration — PERF-001 Section 2.3
//
// All environment-specific values are injected via k6 __ENV.
// Defaults point to a typical local Docker Compose deployment.
//
// Usage:
//   k6 run -e BASE_URL_EVENTS=http://localhost:8081 \
//          -e BASE_URL_TICKETING=http://localhost:8082 \
//          k6/scenarios/smoke.js

// ---------------------------------------------------------------------------
// Base URLs — one per service under test (spec mandates separation)
// ---------------------------------------------------------------------------
// When testing through the API Gateway (the normal path), both point to the
// gateway on port 8080.  When testing services directly (bypass gateway),
// use the individual ports.
export const BASE_URL_EVENTS    = __ENV.BASE_URL_EVENTS    || 'http://localhost:8080';
export const BASE_URL_TICKETING = __ENV.BASE_URL_TICKETING || 'http://localhost:8080';

// Direct bypass for testability/reset endpoints not exposed to the public API gateway
export const BASE_URL_EVENTS_DIRECT    = __ENV.BASE_URL_EVENTS_DIRECT    || 'http://localhost:8081';
export const BASE_URL_TICKETING_DIRECT = __ENV.BASE_URL_TICKETING_DIRECT || 'http://localhost:8082';

// ---------------------------------------------------------------------------
// Context headers
// ---------------------------------------------------------------------------
// The real backend uses X-User-Id (UUID) — NOT Bearer tokens — for buyer
// identification on reservation endpoints.  The header is optional for POST
// /api/v1/reservations (the backend generates a random UUID if missing), but
// we include it for traceability during load runs.
//
// GET /api/v1/events is fully public and requires no auth headers.
export const USER_ID = __ENV.USER_ID || '550e8400-e29b-41d4-a716-446655440099';

// ---------------------------------------------------------------------------
// Convenience aggregate
// ---------------------------------------------------------------------------
export const config = {
  baseUrlEvents:    BASE_URL_EVENTS,
  baseUrlTicketing: BASE_URL_TICKETING,
  userId:           USER_ID,
};

export default config;
