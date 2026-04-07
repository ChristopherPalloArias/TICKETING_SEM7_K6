/**
 * Generic threshold definitions for various testing models.
 * Customize these based on specific SLAs defined in the tech spec.
 */

export const thresholds = {
  smoke: {
    // Ensures basic availability
    http_req_failed: ['rate<0.01'], // less than 1% errors
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
  },
  load: {
    // Expectations under normal peak traffic
    http_req_failed: ['rate<0.05'], 
    http_req_duration: ['p(95)<1000'],
  },
};
