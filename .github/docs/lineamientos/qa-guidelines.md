# 📋 QA Performance Guidelines
# Version: 1.0.0

## 1. Quality Strategy
- Start with Smoke tests to validate API connectivity before launching full Load or Stress tests.
- Always implement explicit `check()` calls to assert HTTP response statuses or data structures.
- Define a detailed `teardown()` block if the test creates persistent data.

## 2. Test Execution
- Ensure performance testing runs within an automated CI/CD pipeline rather than only local instances.
- Maintain isolated execution data files under `k6/data/`.
