// k6/lib/http-client.js
// HTTP wrappers aligned to PERF-001 spec and real backend contracts

import http from 'k6/http';
import { config } from '../config/env.js';

/**
 * Build standard headers
 * The Ticketing backend uses X-User-Id for ownership verification
 * instead of Authorization Bearer tokens.
 */
function buildHeaders(additionalHeaders = {}) {
  return {
    'Content-Type': 'application/json',
    'X-User-Id': config.userId,
    ...additionalHeaders,
  };
}

/**
 * GET /api/v1/events
 * Query available published events. Read-only operation.
 * @param {number} page - page number
 * @param {number} size - page size
 * @returns {Object} k6 HTTP response object
 */
export function getEvents(page = 1, size = 10) {
  // Use explicit backend url for events
  const url = `${config.baseUrlEvents}/api/v1/events?page=${page}&size=${size}`;
  
  return http.get(url, {
    headers: {
      'Content-Type': 'application/json',
      // No X-User-Id required for public catalog reads
    },
    tags: { endpoint: 'GET /api/v1/events' },
  });
}

/**
 * POST /api/v1/reservations
 * Create a new reservation locking inventory.
 * @param {Object} payload - conforms to CreateReservationRequest
 * @returns {Object} k6 HTTP response object
 */
export function createReservation(payload) {
  // Use explicit backend url for ticketing
  const url = `${config.baseUrlTicketing}/api/v1/reservations`;
  
  return http.post(url, JSON.stringify(payload), {
    headers: buildHeaders(),
    tags: { endpoint: 'POST /api/v1/reservations' },
  });
}

/**
 * Health check — validate endpoint connectivity
 * We hit GET /api/v1/events as a proxy for holistic backend health 
 * because it requires database connectivity on the Events service.
 * @returns {Object} k6 HTTP response object
 */
export function healthCheck() {
  const url = `${config.baseUrlEvents}/api/v1/events?page=1&size=1`;
  
  return http.get(url, {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: 'healthcheck' },
  });
}

export default {
  getEvents,
  createReservation,
  healthCheck,
};
