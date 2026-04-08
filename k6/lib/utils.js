// k6/lib/utils.js
// Utility helpers for test execution aligned to PERF-001 spec

import { SharedArray } from 'k6/data';



/**
 * Select a data item from shared array based on iteration index
 * Distributes selections across available items
 * @param {Array} dataArray - SharedArray data
 * @param {number} iterationIndex - current iteration number
 * @returns {Object} Selected data item
 */
export function selectDataItem(dataArray, iterationIndex) {
  if (!dataArray || dataArray.length === 0) {
    throw new Error('Data array is empty');
  }
  return dataArray[iterationIndex % dataArray.length];
}

/**
 * Generate a unique reservation payload
 * Mapped directly to CreateReservationRequest DTO: eventId, tierId, buyerEmail, seatIds
 * 
 * @param {Object} basePayload - Data from test-data.json
 * @param {number} uniqueId - identifier to ensure uniqueness for email
 * @returns {Object} Payload ready for POST
 */
export function buildReservationPayload(basePayload, uniqueId = 0) {
  return {
    eventId: basePayload.eventId,
    tierId: basePayload.tierId,
    // Ensures a unique buyer email for tracking/collision avoidance
    buyerEmail: `buyer-${__VU}-${uniqueId}@loadtest.local`,
    // If test data includes specific seats, use them. Otherwise, default fallback.
    // The backend `@Size(min = 1, max = 100)` constraint requires at least 1 seat ID.
    seatIds: basePayload.seatIds || ['00000000-0000-0000-0000-000000000000']
  };
}

/**
 * Parse response body safely
 * @param {Object} response - k6 HTTP response
 * @returns {Object|null} Parsed JSON or null if invalid
 */
export function safeJsonParse(response) {
  try {
    return response.json();
  } catch (e) {
    return null;
  }
}

export default {
  selectDataItem,
  buildReservationPayload,
  safeJsonParse,
};
