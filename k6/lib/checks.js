// k6/lib/checks.js
// Standardized check/assertion functions aligned to PERF-001 spec

import { check } from 'k6';

/**
 * Validate Event Availability (GET /api/v1/events) response
 * Checks: Status 200, response handles JSON safely
 */
export function checkEventAvailabilityResponse(response) {
  return check(response, {
    'GET /api/v1/events — Status is 200': (r) => r.status === 200,
    'GET /api/v1/events — Response is JSON': (r) => {
      try {
        const body = r.json();
        return body !== null;
      } catch (e) {
        return false;
      }
    },
    'GET /api/v1/events — Response time is acceptable': (r) => r.timings.duration < 1000,
  });
}

/**
 * Validate Reservation Creation (POST /api/v1/reservations) response
 * Checks: Status 201, response contains id
 */
export function checkReservationCreationResponse(response) {
  return check(response, {
    'POST /api/v1/reservations — Status is 201': (r) => r.status === 201,
    'POST /api/v1/reservations — Response contains reservation id': (r) => {
      try {
        const reservation = r.json();
        // The real ReservationResponse has an 'id' field, not nested inside 'data', and not called 'reservationId'
        return reservation && reservation.id !== undefined;
      } catch (e) {
        return false;
      }
    },
    'POST /api/v1/reservations — Response time is acceptable': (r) => r.timings.duration < 2000,
  });
}

/**
 * Validate error responses
 * Tracks semantic errors (400, 409) separately from network errors
 */
export function checkErrorResponse(response) {
  const is4xx = response.status >= 400 && response.status < 500;
  const is5xx = response.status >= 500;
  
  return check(response, {
    'Non-5xx status': (r) => r.status < 500,
    'Detailed error logging': (r) => {
      if ((is4xx || is5xx) && __ENV.DEBUG === 'true') {
        console.warn(`[${r.request.method}] ${r.request.url} returned ${r.status}: ${r.body}`);
      }
      return true; // Always pass; logging is informational
    },
  });
}

/**
 * Health check validation
 * Verifies backend is reachable
 */
export function checkHealthResponse(response) {
  return check(response, {
    'Health check — Status is 200': (r) => r.status === 200,
  });
}

export default {
  checkEventAvailabilityResponse,
  checkReservationCreationResponse,
  checkErrorResponse,
  checkHealthResponse,
};
