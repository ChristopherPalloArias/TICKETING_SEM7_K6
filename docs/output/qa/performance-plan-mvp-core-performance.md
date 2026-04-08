# Performance Plan — MVP Core Performance (PERF-001)

**Feature:** mvp-core-performance  
**Spec Status:** APPROVED  
**Generated:** 2026-04-07  
**CoE Analyst:** performance-analyzer

---

## Executive Summary

This performance plan translates the `mvp-core-performance` specification into actionable test scenarios, SLA thresholds, and execution mechanics. The plan validates **two critical backend flows** under load:

1. **Event Availability** (`GET /api/v1/events`) — 80 TPS, p95 < 400 ms
2. **Reservation Creation** (`POST /api/v1/reservations`) — 30 TPS, p95 < 600 ms

Both flows will be tested with a **Smoke → Load** progression model, providing confidence in baseline behavior before committing to sustained load measurements.

---

## 1. Test Type Definitions & Selection

### Applied Test Types

| Test Type | Flow A (Events) | Flow B (Reservations) | Purpose |
|-----------|-----------------|----------------------|---------|
| **Smoke** | ✓ Included | ✓ Included | Verify connectivity, script correctness, threshold config |
| **Load** | ✓ Included | ✓ Included | Baseline SLA verification at peak sustained traffic |
| **Stress** | ◇ Future | ◇ Future | Breaking point analysis (out of scope; MVP baseline only) |
| **Spike** | ◇ Future | ◇ Future | Shock survivability (out of scope; MVP baseline only) |
| **Soak/Endurance** | ◇ Future | ◇ Future | Memory leak detection (out of scope; MVP baseline only) |

### Smoke Test Definition (Both Flows)

**Purpose:** Connectivity and correctness verification before resource-heavy load tests.

| Parameter | Value |
|-----------|-------|
| Executor | `shared-iterations` |
| VUs | 1 |
| Iterations per VU | 1 |
| Duration | Until complete (~10s) |
| Expected Outcome | Both endpoints respond successfully with correct status codes and response schema |
| Failure Criteria | Any endpoint returns non-2xx status OR response schema is invalid |

**Rationale:**
- Single-threaded execution isolates network latency from concurrency effects
- Validates endpoint connectivity before committing 20-60 VUs to load test
- Confirms script syntax and environment variables are correct
- Baseline latencies (p95 ~ 100-200 ms for reads, ~300 ms for writes expected)

### Load Test Definition — Event Availability (Flow A)

**Purpose:** Measure performance of `GET /api/v1/events` under 80 TPS sustained traffic; validate SLA compliance.

| Parameter | Value |
|-----------|-------|
| Executor | `ramping-arrival-rate` |
| Arrival Rate Stages | See Section 2.1.1 below |
| Pre-allocated VUs | 20 |
| Max VUs (buffer) | 60 |
| Time Unit | 1 second |
| Total Duration | ~8m 30s |
| Success Criteria | p95 latency ≤ 400 ms; error rate < 1% |

### Load Test Definition — Reservation Creation (Flow B)

**Purpose:** Measure performance of `POST /api/v1/reservations` under 30 TPS sustained traffic; validate SLA compliance.

| Parameter | Value |
|-----------|-------|
| Executor | `ramping-arrival-rate` |
| Arrival Rate Stages | See Section 2.2.1 below |
| Pre-allocated VUs | 15 |
| Max VUs (buffer) | 40 |
| Time Unit | 1 second |
| Total Duration | ~7m 30s |
| Success Criteria | p95 latency ≤ 600 ms; error rate < 1% |

---

## 2. Workload Modeling & Arrival Rate Stages

### 2.1 Flow A — Event Availability (80 TPS)

#### 2.1.1 Stages Configuration

| Stage | Duration | Arrival Rate Start | Arrival Rate End | VU Behavior | Purpose |
|-------|----------|-------------------|-----------------|-----------|---------|
| **Warm-up** | 1m | 0 req/s | 40 req/s | Gradual ramp to 50% | Connection pooling; cache warming |
| **Stability 1** | 3m | 40 req/s | 40 req/s | Hold steady | Baseline latency at moderate load |
| **Ramp to Peak** | 1m | 40 req/s | 80 req/s | Gradual ramp to 100% | Smooth transition; avoid thundering herd |
| **SLA Window** | 3m | 80 req/s | 80 req/s | Hold at peak | **PRIMARY SLA MEASUREMENT WINDOW** |
| **Cool-down** | 30s | 80 req/s | 0 req/s | Gradual ramp down | Graceful shutdown; drain-time validation |

**Total Duration:** 8m 30s  
**Ramp Smoothness:** ramping-arrival-rate distributes across available VUs automatically

#### 2.1.2 VU Allocation Strategy

| Phase | Pre-allocated | Max | Reasoning |
|-------|---------------|-----|-----------|
| Warm-up | 10 | 20 | Not all VUs needed yet; gradual demand |
| Stability 1 | 15 | 30 | Moderate load; stable concurrency |
| Ramp to Peak | 20 | 45 | Approach density as arrival rate climbs |
| SLA Window | 20 | 60 | **Peak demand; full buffer for variance** |
| Cool-down | 10 | 20 | Drain phase; minimal VUs needed |

**Notes:**
- k6's `ramping-arrival-rate` automatically allocates VUs as demand increases
- Pre-allocated VUs are reserved from the start; this reduces VU startup jitter
- Max VUs acts as a circuit breaker to prevent runaway concurrent load

#### 2.1.3 Expected Outcomes

| Metric | Expected | Threshold (SLA) | Note |
|--------|----------|-----------------|------|
| p50 latency | 150-200 ms | — | Baseline; informational |
| p95 latency | 300-380 ms | **≤ 400 ms** | Confirmed SLA |
| p99 latency | 450-550 ms | ≤ 700 ms | Candidate SLA; long-tail observability |
| Throughput (SLA Window) | 79-81 req/s | ≥ 80 req/s | On-target arrival rate |
| Error rate | 0-0.5% | **< 1%** | Confirmed SLA |
| Connection errors | 0 | 0 | No timeouts expected |

### 2.2 Flow B — Reservation Creation (30 TPS)

#### 2.2.1 Stages Configuration

| Stage | Duration | Arrival Rate Start | Arrival Rate End | VU Behavior | Purpose |
|-------|----------|-------------------|-----------------|-----------|---------|
| **Warm-up** | 1m | 0 req/s | 15 req/s | Gradual ramp to 50% | Backend connection pooling; warm-up |
| **Stability 1** | 2m | 15 req/s | 15 req/s | Hold steady | Baseline write latency at moderate load |
| **Ramp to Peak** | 1m | 15 req/s | 30 req/s | Gradual ramp to 100% | Smooth write scaling; avoid inventory shock |
| **SLA Window** | 3m | 30 req/s | 30 req/s | Hold at peak | **PRIMARY SLA MEASUREMENT WINDOW** |
| **Cool-down** | 30s | 30 req/s | 0 req/s | Gradual ramp down | Graceful shutdown; verify cleanup |

**Total Duration:** 7m 30s  
**Ramp Smoothness:** ramping-arrival-rate distributes writes across VUs

#### 2.2.2 VU Allocation Strategy

| Phase | Pre-allocated | Max | Reasoning |
|-------|---------------|-----|-----------|
| Warm-up | 8 | 15 | Write operations; modest demand |
| Stability 1 | 10 | 20 | Sustained write baseline |
| Ramp to Peak | 12 | 30 | Increasing write concurrency |
| SLA Window | 15 | 40 | **Peak write demand; full buffer** |
| Cool-down | 8 | 15 | Drain phase |

**Notes:**
- Reservation writes are heavier than reads (DB insert + inventory update)
- Lower max VU (40 vs 60) reflects write-operation overhead
- Test data pool must be sized to support 30 req/s × 3m SLA window = ~5400 distinct reservations minimum

#### 2.2.3 Expected Outcomes

| Metric | Expected | Threshold (SLA) | Note |
|--------|----------|-----------------|------|
| p50 latency | 250-350 ms | — | Baseline; informational |
| p95 latency | 500-580 ms | **≤ 600 ms** | Confirmed SLA |
| p99 latency | 750-950 ms | ≤ 1000 ms | Candidate SLA; write-path tail observability |
| Throughput (SLA Window) | 29-31 req/s | ≥ 30 req/s | On-target arrival rate |
| Error rate | 0-0.5% | **< 1%** | Confirmed SLA |
| Inventory exhaustion errors (400/409) | 0-1% | ≤ 1% | Correlation with data pool sizing |

---

## 3. Threshold Mapping & Acceptance Criteria

### 3.1 Confirmed Thresholds (Firm SLA Limits)

These thresholds are explicitly defined in the business requirement and dictate PASS/FAIL for the k6 test run.

#### Flow A — Event Availability

```javascript
// k6/config/thresholds.js — Event Availability
{
  'http_req_duration{scenario:smoke_events}': ['p95 < 500'], // Smoke relaxed
  'http_req_duration{scenario:load_events}': ['p95 < 400'],  // Load SLA
  'http_req_failed{scenario:load_events}': ['< 0.01'],       // 1% error rate
}
```

**Rationale:**
- Smoke threshold (500ms) is relaxed because single-threaded execution shows latencies higher than peak load
- Load threshold (400ms) is the confirmed SLA from the requirement
- Error rate threshold (< 1%) accounts for transient network hiccups

#### Flow B — Reservation Creation

```javascript
// k6/config/thresholds.js — Reservation Creation
{
  'http_req_duration{scenario:smoke_reservations}': ['p95 < 800'], // Smoke relaxed for writes
  'http_req_duration{scenario:load_reservations}': ['p95 < 600'],   // Load SLA
  'http_req_failed{scenario:load_reservations}': ['< 0.01'],        // 1% error rate
  'errors{scenario:load_reservations}': ['< 0.01'],                 // Semantic errors (e.g., 400)
}
```

**Rationale:**
- Smoke threshold (800ms) is relaxed because write-path latency is inherently higher
- Load threshold (600ms) is the confirmed SLA from the requirement
- Added `errors` metric to track semantic failures (400 Bad Request, 409 Conflict) separately from network errors

### 3.2 Candidate Thresholds (Industry Standards, Pending Validation)

These thresholds are inferred based on best practices and **are informational only** until baseline data validates them.

#### Both Flows

| Metric | Candidate Threshold | Context |
|--------|-------------------|---------|
| `http_req_duration{p99}` (Events) | ≤ 700 ms | Long-tail latency guard; typical read caching |
| `http_req_duration{p99}` (Reservations) | ≤ 1000 ms | Long-tail latency guard; write-path under saturation |
| `http_req_duration{avg}` (Events) | ≤ 250 ms | Baseline responsiveness; single-digit millisecond overhead per read |
| `http_req_duration{avg}` (Reservations) | ≤ 400 ms | Baseline responsiveness; write path (DB insert + inventory) overhead |
| `http_reqs` (both) | > target arrival rate | Confirm no dropped iterations due to VU saturation |
| `http_req_failed{scenario:*}` | 0% (aspirational) | Zero errors in smoke; < 1% in load (confirmed) |

**Promotion Path:**
- Collect baseline data during first smoke and load runs
- Compare actual p50/p95/p99 to candidate thresholds
- If actual ≤ 80% of candidate threshold, promote to Confirmed
- Document the promotion in `docs/output/performance/baseline-adjustment.md`

---

## 4. Test Execution Sequence

### Phase: Smoke Testing (Pre-Validation)

**Duration:** ~15 minutes  
**Objective:** Validate script correctness and baseline connectivity before committing full load test resources

```
1. Smoke for Event Availability
   - Run k6 scenarios/smoke.js --scenario load_events --vus 1
   - Verify p95 < 500ms ✓ (candidate)
   - Verify response status 200 ✓
   - Verify response schema includes event array ✓

2. Smoke for Reservation Creation
   - Run k6 scenarios/smoke.js --scenario load_reservations --vus 1
   - Verify p95 < 800ms ✓ (candidate)
   - Verify response status 201 or 200 ✓
   - Verify response schema includes reservationId ✓

3. Environment Verification (Risk Checklist)
   - Confirm no competing tests running (RISK-S2)
   - Confirm backend services healthy (GET /health endpoints)
   - Confirm auth token validity and TTL (RISK-S3)
   - Confirm test data pool initializes correctly (RISK-A1)
   - Document baseline metrics in smoke-baseline.json
```

### Phase: Load Testing — Flow A (Event Availability)

**Duration:** ~9 minutes (including ramp-up and cool-down)  
**Command:**
```bash
k6 run k6/scenarios/load-events.js \
  --out json=k6/reports/run-load-events-$(date +%Y%m%d-%H%M%S).json \
  --summary-export=k6/reports/summary-events.json
```

**Acceptance Gate:**
- ✓ p95 latency ≤ 400 ms (CONFIRMED)
- ✓ Error rate < 1% (CONFIRMED)
- ✓ Throughput ≥ 80 req/s during SLA window
- ✓ No 50x errors from backend

**Failure Action:**
- If p95 > 400 ms: Escalate to backend team for investigation
- If error rate > 1%: Check for connectivity, auth, or environment issues
- If throughput < 80 req/s: Verify k6 client CPU/memory not saturated; increase max VUs if needed

### Phase: Load Testing — Flow B (Reservation Creation)

**Duration:** ~8 minutes (including ramp-up and cool-down)  
**Command:**
```bash
k6 run k6/scenarios/load-reservations.js \
  --out json=k6/reports/run-load-reservations-$(date +%Y%m%d-%H%M%S).json \
  --summary-export=k6/reports/summary-reservations.json
```

**Acceptance Gate:**
- ✓ p95 latency ≤ 600 ms (CONFIRMED)
- ✓ Error rate < 1% (CONFIRMED)
- ✓ Throughput ≥ 30 req/s during SLA window
- ✓ No inventory exhaustion (> 5% 40x errors)

**Failure Action:**
- If p95 > 600 ms: Check backend write-path, database lock contention
- If inventory exhaustion observed: Increase test data pool; implement reset procedure (RISK-A1 mitigation)
- If error rate > 1%: Investigate payload contract changes, backend contract drift

### Post-Execution Analysis

**Duration:** ~1 hour

```
1. JSON Report Ingestion
   - Parse k6/reports/*.json
   - Extract p50/p95/p99 latencies for each flow

2. Threshold Evaluation
   - Confirmed thresholds: PASS/FAIL determination
   - Candidate thresholds: Establish baseline for future runs

3. Correlation with Backend Metrics
   - Cross-reference k6 latency spikes with backend CPU/DB metrics
   - Identify causality: backend saturation vs. k6 client limit vs. infrastructure

4. Data Quality Assessment
   - Verify no inventory exhaustion impacts write-path results
   - Confirm smoke baseline matches load-window baseline (should be similar)

5. Evidence Artifact Generation
   - Produce k6/reports/analysis-$(date).md
   - Document findings, anomalies, and recommendations
```

---

## 5. Candidate Threshold Adjustment Workflow

If baseline data indicates thresholds require adjustment:

1. **Analyze spike correlation:** Is p95 latency increase due to backend saturation or load ramp?
2. **Validate against infrastructure:** Confirm backend CPU/DB metrics are not saturated at measured latency
3. **Promotion decision:**
   - If actual p95 ≤ 350 ms (Events) and ≤ 550 ms (Reservations): Consider lowering thresholds in next iteration
   - If actual p95 ≥ 380 ms (Events) and ≥ 580 ms (Reservations): Current thresholds are appropriate
4. **Document decision** in `docs/output/performance/baseline-adjustment.md`

---

## 6. Measurement Windows & Exclusions

### Measurement Window (SLA Evaluation)

- **Start:** 4m 30s into test (after warm-up and stability ramp)
- **End:** 7m 30s into test (3 minutes into SLA window)
- **Duration:** 3 minutes of stable, predictable load
- **Metric:** Only samples within this window are used for p95/p99 percentile calculations

**Rationale:** Warm-up and cool-down phases are excluded to avoid startup/shutdown jitter

### Excluded Periods

| Period | Reason |
|--------|--------|
| Warm-up ramp (0-2m) | VU initialization, cache warming |
| Cool-down (7m 30s-8m 30s) | Graceful shutdown, iteration drains |
| Load spikes (any anomalous drops/jumps) | Infrastructure hiccup detection |

---

## 7. Pass/Fail Decision Tree

```
Test Execution Complete
│
├─ Smoke Tests Passed?
│  ├─ NO → Fix script/environment; retry smoke
│  └─ YES → Proceed to Load Tests
│
├─ Load Test A (Events) Passed?
│  ├─ p95 ≤ 400 ms? 
│  │  ├─ NO → Investigate backend latency; retest or escalate
│  │  └─ YES ✓
│  ├─ Error Rate < 1%?
│  │  ├─ NO → Debug connectivity/auth; retest
│  │  └─ YES ✓
│  └─ Throughput ≥ 80 req/s?
│     ├─ NO → Increase k6 VU limit; retest
│     └─ YES ✓
│
├─ Load Test B (Reservations) Passed?
│  ├─ p95 ≤ 600 ms?
│  │  ├─ NO → Investigate write-path latency; retest
│  │  └─ YES ✓
│  ├─ Error Rate < 1%?
│  │  ├─ NO → Check inventory/payload contract; retest
│  │  └─ YES ✓
│  └─ Throughput ≥ 30 req/s?
│     ├─ NO → Increase k6 VU limit; retest
│     └─ YES ✓
│
└─ OVERALL RESULT
   ├─ ✓✓✓ ALL PASSED → MVP Backend Qualifies SLA; Proceed to Release
   └─ ✗ ANY FAILED → Escalate to Backend Team; Document Findings; Retest
```

---

## 8. Report & Artifact Output

All test artifacts are saved to `k6/reports/`:

| Artifact | Format | Location | Purpose |
|----------|--------|----------|---------|
| Raw metrics | JSON | `k6/reports/run-<scenario>-<timestamp>.json` | Machine-readable load test output |
| Summary | JSON | `k6/reports/summary-<scenario>.json` | Threshold evaluation results |
| Interpretation | Markdown | `k6/reports/analysis-<timestamp>.md` | Human-readable findings |
| Baseline | JSON | `k6/reports/smoke-baseline.json` | Smoke test baseline for future comparison |

**Example:** `k6/reports/run-load-events-20260407-140530.json` contains all latency buckets, error rates, and SLA evaluations for the Event Availability load test.

---

## Next Steps

1. ✅ **Risk Matrix Complete** — Mitigations identified
2. ✅ **Performance Plan Complete** — This document
3. ⏭️ **Automation Flow Proposer** — Confirm ROI and prioritization
4. ⏭️ **Implement K6 Assets** — Config, thresholds, helpers, test data
5. ⏭️ **Implement K6 Script** — Smoke and load scenarios
6. ⏭️ **Execution & Analysis** — Run tests; validate SLAs; document findings
