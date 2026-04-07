import http from 'k6/http';
import { ENV } from '../config/env.js';

/**
 * Generic HTTP client wrapper to encapsulate common headers and auth.
 */

const buildHeaders = (customHeaders = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (ENV.AUTH_TOKEN) {
    defaultHeaders['Authorization'] = `Bearer ${ENV.AUTH_TOKEN}`;
  }

  return Object.assign({}, defaultHeaders, customHeaders);
};

export const httpClient = {
  get: (path, headers = {}, params = {}) => {
    return http.get(`${ENV.BASE_URL}${path}`, {
      headers: buildHeaders(headers),
      ...params,
    });
  },
  post: (path, body, headers = {}, params = {}) => {
    return http.post(`${ENV.BASE_URL}${path}`, JSON.stringify(body), {
      headers: buildHeaders(headers),
      ...params,
    });
  },
  put: (path, body, headers = {}, params = {}) => {
    return http.put(`${ENV.BASE_URL}${path}`, JSON.stringify(body), {
      headers: buildHeaders(headers),
      ...params,
    });
  },
  del: (path, body = null, headers = {}, params = {}) => {
    const args = { headers: buildHeaders(headers), ...params };
    if (body) args.body = JSON.stringify(body);
    return http.del(`${ENV.BASE_URL}${path}`, null, args);
  }
};
