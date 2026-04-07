import { thresholds } from './thresholds.js';
import { ENV } from './env.js';

/**
 * Reusable options for different types of performance tests.
 */
export const smokeOptions = {
  vus: 1,
  duration: '10s',
  thresholds: thresholds.smoke,
};

export const loadOptions = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ],
  thresholds: thresholds.load,
};

export const getOptions = (type = 'smoke') => {
  switch (type) {
    case 'load':
      return loadOptions;
    case 'smoke':
    default:
      return smokeOptions;
  }
};
