---
name: implement-k6-assets
description: Generates strictly reusable k6 configuration, helpers, thresholds, and test data scaffolding without touching main scenarios.
argument-hint: "<feature-name>"
---

# `implement-k6-assets`

## Purpose
Extracts structural requirements from an `APPROVED` specification and builds the reusable implementation mechanics inside the `k6/` scaffold.

## Inputs
Read the source-of-truth from `.github/specs/<feature>.spec.md`.

## Strict Outputs
Update or create files ONLY in the following locations:
1. **`k6/config/env.js`:** Exported properties resolving `__ENV` defaults.
2. **`k6/config/options.js`:** Exported executor profiles mapping VUs, stages, or arrival rates.
3. **`k6/config/thresholds.js`:** Segregated arrays defining pass/fail criteria.
4. **`k6/lib/http-client.js`:** Custom HTTP wrapper mapping standard headers.
5. **`k6/lib/checks.js`:** Helper methods standardizing `k6/check` assertions.
6. **`k6/data/test-data.json`:** Mock or structured arrays required by the spec.

## Exclusions & Anti-Hallucination
- **NO Orchestration Scripts:** Do NOT write executable iterations inside `k6/scenarios/` during this step.
- **NO Business Hardcoding:** Do NOT hardcode API paths directly inside the HTTP client if they belong to iterating test logic.
- **NO Secret Leaks:** Do NOT place real tokens or keys. Use `__ENV.MOCK_TOKEN`.

## Invocation Pattern
Executed directly by the `qa-agent` after performance planning is completed but before `implement-k6-script` is run.

## Deliverable
Return a mapped summary of the configuration variables, threshold boundaries, and data objects constructed.
