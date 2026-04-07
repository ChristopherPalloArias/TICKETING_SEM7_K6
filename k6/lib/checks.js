import { check } from 'k6';

/**
 * Standard reusable validation checks for API responses.
 */

export const assertStatus = (res, expectedStatus = 200) => {
  return check(res, {
    [`is status ${expectedStatus}`]: (r) => r.status === expectedStatus,
  });
};

export const assertResponseTime = (res, maxMs = 500) => {
  return check(res, {
    [`responds within ${maxMs}ms`]: (r) => r.timings.duration < maxMs,
  });
};

export const assertJsonBody = (res, validationFn, checkName = 'body meets condition') => {
  let isJson = false;
  try {
    const json = res.json();
    isJson = true;
    return check(res, {
      [checkName]: () => validationFn(json),
    });
  } catch (e) {
    return check(res, {
      'is valid json': () => isJson,
    });
  }
};
