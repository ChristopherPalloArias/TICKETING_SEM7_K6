---
name: implement-k6-script
description: Orchestrates k6 configurations, libs, and data into an executable performance scenario script based on the approved spec.
argument-hint: "<feature-name>"
---

# `implement-k6-script`

## Purpose
Consumes the boilerplate built by `implement-k6-assets` to construct the functional test routines inside `k6/scenarios/`.

## Inputs
- `.github/specs/<feature>.spec.md` (Must be `APPROVED`)
- Existing files in `k6/config/` and `k6/lib/`.

## Tasks
1. Identify the scenario type requested (e.g., Smoke, Load, Stress).
2. Create `k6/scenarios/<feature>-<type>.js`.
3. Import the shared `options`, `httpClient`, `ENV`, and `checks`.
4. Construct the k6 lifecycle functions:
   - **`setup()`**: (Optional) Single initialization layer for gathering test data arrays or tokens.
   - **`default()`**: The core VU iteration loop executing business APIs and performing checks.
   - **`teardown()`**: (Optional) Cleanup operations.

## Rules & Restrictions
- Use `sleep()` intuitively between transactions to simulate human pacing, as per the spec.
- **NEVER** define stages, thresholds, or options dictionaries inside the script. Always import them from `k6/config/options.js`.
- Catch exceptions locally using standard Javascript `try/catch` wrapping if dealing with complex data extraction, avoiding VU crashes.
- Do not invent missing endpoints. If the spec requests a path, use it.

## Deliverable
The compiled `.js` script inside `k6/scenarios/`, followed by an execution tip in the chat output (e.g., `k6 run k6/scenarios/<feature-load>.js`).
