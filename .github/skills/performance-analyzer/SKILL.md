---
name: performance-analyzer
description: Translates technical specs into performance SLA baseline models defining exactly when and how to test.
argument-hint: "<feature-name>"
---

# `performance-analyzer` [QA]

## Purpose
Produces a rigorous strategy mapping the SLA tolerances and workload modeling requirements before scripting begins. Acts as the Center of Excellence (CoE) guidance for load mechanics.

## Test Type Definitions
- **Smoke:** Minimal verification. Validates system connectivity and script correctness (1 VU, 10s).
- **Load:** Standard SLA verification. Expects peak traffic modeling over a sustained window (e.g., 200 VUs, 15m).
- **Stress:** Breaking point analysis. Drastic incremental ramps designed to identify graceful degradation thresholds.
- **Spike:** Shock survivability. Massive, immediate traffic injection followed by immediate drop-off.
- **Soak / Endurance:** Leak detection. Sustained moderate load over multiple hours to detect memory leaks or DB saturation.

## Metric Families
Analyze the spec and map the expected behavior to k6 metric families:
- **Latencies:** `http_req_duration` (p90, p95, p99)
- **Error Rates:** `http_req_failed`
- **Output:** `http_reqs`, `data_received`, `data_sent`

## Threshold Mapping
- **Confirmed Thresholds:** Firm limits strictly defined in the requirement (e.g., *p95 must be < 400ms*).
- **Candidate Thresholds:** Inferred limits assigned by the agent pending human verification (e.g., *Assuming industry standard error rate < 1%*).

## Hard Rules & Constraints
- Validate environment bounds. If the system is a small mock proxy, do not recommend 10,000 VU distributed tests.
- Correlate execution times with system cache times where possible.

## Deliverable Format
Generate `docs/output/qa/performance-plan.md` outlining the chosen test types, the VU/duration stages, and the SLA threshold matrix.
