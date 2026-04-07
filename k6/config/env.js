/**
 * Resolves properties from environment variables or applies sensible defaults.
 * Do not hardcode secrets here; always read from __ENV.
 */

export const ENV = {
  BASE_URL: __ENV.BASE_URL || 'https://example.com/api',
  AUTH_TOKEN: __ENV.AUTH_TOKEN || '',
  VUS: __ENV.VUS ? parseInt(__ENV.VUS) : 1,
  DURATION: __ENV.DURATION || '5s',
};
