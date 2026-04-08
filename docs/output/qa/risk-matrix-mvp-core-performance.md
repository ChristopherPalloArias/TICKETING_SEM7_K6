# Risk Matrix — MVP Core Performance (PERF-001)

**Feature:** mvp-core-performance  
**Spec Status:** APPROVED  
**Generated:** 2026-04-07  
**Analyst:** risk-identifier

---

## Executive Summary

The `mvp-core-performance` specification has **1 High-severity risk**, **3 Medium-severity risks**, and **2 Low-severity risks**. All identified risks have mitigation strategies defined below. The spec is **procedurally sound** but requires careful attention to test data volatility, environment isolation, and observability before execution.

---

## High Severity (A) — Blocking Issues

### RISK-A1: Reservation Inventory Exhaustion

**Classification:** HIGH (A)  
**Impact:** Directly invalidates the reservation creation performance test (`POST /api/v1/reservations`)

**Description:**
The spec identifies that tier inventory may be consumed during repeated load runs without a planned reset/replenishment strategy. If the test data pool is exhausted before reaching the full 30 TPS sustained load window, subsequent iterations will fail with HTTP 400/409 (insufficient inventory), causing artificially high error rates that do not reflect true backend performance.

**Evidence from Spec:**
- Section 5.2 — "inventory may be consumed during repeated runs"
- Section 6 (Risks) — "Reservation inventory exhaustion during repeated runs" classified as High severity
- Section 7, Phase 1 — "document reset strategy before production runs"

**Mitigation Strategy:**

Before executing any load runs, the QA team must:

1. **Measure tier capacity:** Query `GET /api/v1/events` in a smoke test to identify a stable event/tier pair with known inventory.
2. **Pool sizing:** Define the test data pool in `k6/data/test-data.json` with entries that have **at least 3x the peak concurrent load**:
   - `load_reservations` targets 30 TPS over 3 minutes = ~5400 reservations at peak
   - Use at least 5 distinct event/tier combinations × 1500 slots each = 7500 slots minimum
3. **Reset procedure:** Document and execute a reset script before each load run:
   - Option A: Re-seed tier inventory via backend admin API or database directly
   - Option B: Use separate test events per run (recommend for true representative baseline)
4. **Monitoring during run:** Track `http_req_failed` for status 400/409 to detect inventory exhaustion in real time
5. **Validation gate:** If load run shows >50% of failures due to 400/409, abort and extend pool or reset before retrying

**Owner:** QA Lead  
**Effort:** 4-8 hrs (discovery + implementation of reset strategy)  
**Timeline:** Must complete before first production-like load run

---

## Medium Severity (S) — Procedural Issues

### RISK-S1: Lack of Backend Observability / APM

**Classification:** MEDIUM (S)  
**Impact:** Results are difficult to correlate with backend resource saturation; false positives in latency attribution

**Description:**
The spec does not mandate observability integration (e.g., Datadog, Grafana, Application Performance Monitoring). Without backend metrics, if a test shows p95 latency > 600ms during `load_reservations`, it is unclear whether:
- The backend service itself is CPU-saturated
- The database is under lock contention
- k6 itself is the bottleneck (client-side)
- Network latency or the test environment infrastructure is the issue

**Mitigation Strategy:**

1. **Baseline observation (pre-test):**
   - Run smoke tests and record baseline backend CPU, database response time, and memory utilization
2. **Parallel dashboarding (during load):**
   - Assign a second monitor to watch backend logs, CPU, and DB metrics in real time
   - Document the correlation window (e.g., "CPU spiked to 85% during Stage 4 of load_events")
3. **Post-run artifact collection:**
   - Export k6 JSON report: `--out json=k6/reports/run-load-reservations-2026-04-07.json`
   - Collect backend logs for the same time window
   - Cross-reference latency spikes with backend events
4. **Optional: k6 Cloud or Datadog integration:**
   - Future iteration: push k6 metrics to Datadog; configure APM alerts

**Owner:** QA Lead + DevOps  
**Effort:** 2-4 hrs (monitoring setup, baseline recording)  
**Timeline:** Complete before first load run

### RISK-S2: Test Environment Shared / Isolation Not Confirmed

**Classification:** MEDIUM (S)  
**Impact:** Results are noisy; baseline cannot be reproduced; SLA validation becomes unreliable

**Description:**
The spec assumes "controlled local/QA environment" but does not confirm that the test infrastructure is isolated from other teams' tests, deployments, or batch jobs. If ms-events or ms-ticketing is under load from parallel test suites, the measured p95 latency will be artificially high and non-representative of actual MVP performance.

**Evidence from Spec:**
- Section 6 (Risks) — "Shared services interference (database, queues)" classified as Medium
- Section 2.3 — States assumption but does not enforce confirmation

**Mitigation Strategy:**

1. **Pre-test environment validation:**
   - Confirm no other test suites are scheduled or running during the test window
   - Check deployment pipelines are not active
   - Verify batch jobs (data cleanup, sync tasks) are paused
2. **Baseline quiet run:**
   - Execute smoke tests at least 2x to establish a stable, quiet baseline
   - Record baseline p95 values (e.g., "smoke_events p95 = 120ms in isolation")
3. **During-run monitoring:**
   - Monitor system load metrics on both ms-events and ms-ticketing nodes
   - If sustained load >60% or interference is detected, halt the test and reschedule
4. **Documentation:**
   - Record environment state in a pre-test checklist (Appendix A)
   - Add environment metadata to k6 report JSON (see `setup()` in eventual script)

**Owner:** QA Lead + Infrastructure/DevOps  
**Effort:** 1-2 hrs (checklist creation, baseline runs)  
**Timeline:** Complete before first load run

### RISK-S3: Auth Token Expiry During Long-Duration Load Run

**Classification:** MEDIUM (S)  
**Impact:** Load test halts prematurely with 401 Unauthorized errors; SLA measurement window is incomplete

**Description:**
Both flows require `Authorization: Bearer <token>` header. The spec does not specify token TTL or refresh strategy. If a token expires during the 8-minute event availability load test or 7.5-minute reservation creation test, all subsequent requests will fail with 401, creating an artificial spike in `http_req_failed` unrelated to backend performance.

**Evidence from Spec:**
- Section 6 (Risks) — "Auth token expiry during long load runs" classified as Low (but should be Medium in execution context)
- Section 2.3 — "Authentication: Bearer token via `__ENV.AUTH_TOKEN`" — no refresh logic specified

**Mitigation Strategy:**

1. **Token validation:**
   - Verify that the test token has a TTL >> total test duration
   - Example: If load run = 8m30s, ensure token TTL ≥ 12 minutes
2. **Pre-test validation:**
   - Add a check in `setup()` to verify token is valid with `GET /api/v1/health` or similar
   - Log token expiry time for reference
3. **If token refresh required:**
   - Implement refresh logic in `k6/lib/http-client.js`:
     ```javascript
     export function ensureValidToken() {
       let token = __ENV.AUTH_TOKEN;
       // Optional: if backend supports refresh, implement here
       return token;
     }
     ```
4. **Monitoring:**
   - Track 401 status codes separately in thresholds
   - If run shows >0.1% 401 errors, investigate token expiry

**Owner:** QA Lead + Backend API Owner  
**Effort:** 1 hr (validation + optional refresh implementation)  
**Timeline:** Complete before first load run

---

## Low Severity (D) — Contextual Issues

### RISK-D1: Test Data Volatility — Reservation Payload Contracts

**Classification:** LOW (D)  
**Impact:** Script may break if backend API contract changes; test data becomes stale

**Description:**
The spec defines payload contract as:
```json
{
  "eventId": "<uuid>",
  "tierId": "<uuid>",
  "quantity": 1
}
```

However, the actual backend contract may include additional required fields (e.g., `seatPreference`, `voucherCode`, `loyaltyId`). If the test data pool does not match the current contract, all `POST /api/v1/reservations` requests will fail with 400 Bad Request.

**Evidence from Spec:**
- Section 5.2 — "Payloads must not be invented. Values must be sourced from already-validated backend contract as evidenced in the Karate test suite."

**Mitigation Strategy:**

1. **Contract verification:**
   - Before finalizing test data, review the latest Karate test cases for `POST /api/v1/reservations`
   - Extract the exact payload structure from a passing test case (e.g., `TC-012`)
   - Store reference payload in `k6/data/test-data-schema.json`
2. **Payload validation:**
   - In the reserved script, add a check function that validates response schema:
     ```javascript
     check(res, {
       'POST response is 201 or 200': (r) => r.status === 201 || r.status === 200,
       'POST response contains reservationId': (r) => r.json('data.reservationId') !== undefined,
     });
     ```
3. **Test data refresh:**
   - Document that test data must be refreshed whenever the backend API contract changes
   - Add a note in `k6/data/README.md`: "Last validated against Karate TC-012 as of [date]"

**Owner:** QA Lead  
**Effort:** 1-2 hrs (contract verification, payload schema doc)  
**Timeline:** Complete during asset generation phase

### RISK-D2: Load Profile Concurrency Tuning

**Classification:** LOW (D)  
**Impact:** Test may use suboptimal VU allocation; results may not reflect true system capacity

**Description:**
The spec defines `pre-allocated VUs` and `max VUs` for each scenario (e.g., 20 pre-allocated, 60 max for `load_events`). These values are estimated based on target arrival rates but have not been validated against the actual backend response times or the test client capacity.

**Mitigation Strategy:**

1. **Smoke test baseline:**
   - Run `smoke_events` and `smoke_reservations` to confirm baseline response time and memory usage on the k6 client
2. **Progressive load increases:**
   - Start with 50% of target (40 TPS events, 15 TPS reservations)
   - Monitor k6 client CPU/memory and backend response latency
   - If k6 client hits >70% CPU or 60%+ memory, the pre-allocated VUs are insufficient
3. **Adjustment:**
   - Document adjusted VU settings in `k6/config/options.js`
   - Add comment: "Tuned based on smoke test baseline; do not exceed 60 max VUs without re-validating"

**Owner:** QA Lead (with Performance Engineering input)  
**Effort:** 1-2 hrs (progressive ramp testing)  
**Timeline:** Complete during smoke test phase before committing to full load runs

---

## Risk Mitigation Checklist

Before execution of load scenarios, complete the following:

- [ ] **RISK-A1** — Measure tier capacity and size test data pool (min 7500 slots)
- [ ] **RISK-A1** — Define and test reset/replenishment procedure
- [ ] **RISK-S1** — Set up backend monitoring (logs, CPU, DB metrics)
- [ ] **RISK-S1** — Record baseline metrics in smoke test
- [ ] **RISK-S2** — Create pre-test environment isolation checklist
- [ ] **RISK-S2** — Confirm no competing tests/deployments during test window
- [ ] **RISK-S3** — Validate auth token TTL covers full test duration
- [ ] **RISK-S3** — Test token refresh logic (if applicable)
- [ ] **RISK-D1** — Verify POST payload contract against latest Karate tests
- [ ] **RISK-D2** — Complete progressive load ramp testing

---

## Summary by Severity

| Severity | Count | Status |
|----------|-------|--------|
| **High (A)** | 1 | ⚠️ Requires mitigation before load runs |
| **Medium (S)** | 3 | ⚠️ Requires planning and baseline setup |
| **Low (D)** | 2 | ✓ Manageable; address during implementation |

**Overall Risk Posture:** ACCEPTABLE with mitigations in place

---

## Next Steps

1. ✅ **Risk Matrix Complete** — This document published
2. ⏭️ **Performance Analyzer Phase** — Define concrete scenario thresholds and acceptance criteria
3. ⏭️ **Automation Flow Proposer Phase** — Confirm ROI and execution scope
4. ⏭️ **Implement K6 Assets** — Generate config with risk mitigations built-in
5. ⏭️ **Implement K6 Script** — Code scenarios with observability hooks
