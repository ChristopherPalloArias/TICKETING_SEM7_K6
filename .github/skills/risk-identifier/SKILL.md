---
name: risk-identifier
description: Classifies performance engineering bottlenecks and risks affecting test validity using an ASD matrix.
argument-hint: "<feature-name>"
---

# `risk-identifier` [QA]

## Purpose
Analyzes the approved performance specification to detect systemic risks, data volatilities, and environmental constraints that could invalidate the test results or cause false positives.

## ASD Risk Levels
- **High (A):** Blocking issue. Invalidates the test entirely (e.g., Auth mechanism prevents scaling).
- **Medium (S):** Procedural issue. Impacts results authenticity but testing can proceed (e.g., No DB monitoring observability).
- **Low (D):** Contextual issue. Nice-to-have but minimal impact (e.g., Test data is slightly static).

## Severity Factors (Performance Specific)
1. **Unrealistic Thresholds:** Specs demanding 50ms latency globally across disparate geographical nodes.
2. **Lack of Observability:** No APM, Datadog, or Grafana correlators to view backend DB/CPU telemetry.
3. **Auth Bottlenecks:** Shared single tokens causing rate limiting at the identity gateway instead of the tested API.
4. **Data Dependency Volatility:** Scripts requiring unrepeatable, unique data injections (like OTPs).
5. **Fragile Test Data:** Hardcoded user arrays that exhaust immediately.
6. **Shared Endpoint Noise:** Testing environments shared by multiple teams, creating noise in the baseline.

## Process
1. Evaluate the `APPROVED` technical spec.
2. Cross-reference dependencies against the Severity Factors.
3. Classify each identified risk on the ASD scale.
4. Provide immediate mitigation logic (e.g., "Implement dynamic data seeding in `k6/lib/utils.js`").

## Deliverable Format
Generate `docs/output/qa/risk-matrix.md` displaying the risks grouped by severity, including the defined mitigation path, before generating actual `k6/` assets.
