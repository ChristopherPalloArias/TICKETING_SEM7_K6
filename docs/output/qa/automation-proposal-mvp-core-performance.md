# Automation Proposal — MVP Core Performance (PERF-001)

**Feature:** mvp-core-performance  
**Spec Status:** APPROVED  
**Generated:** 2026-04-07  
**ROI Analyst:** automation-flow-proposer

---

## Executive Summary

The MVP Core Performance specification identifies **two business-critical flows** for k6 performance testing. Both flows meet the Definition of Ready for immediate automation implementation and are prioritized as **P1 (High ROI)** based on business criticality, traffic expectations, and environment readiness.

**Recommendation:** Proceed with immediate implementation of Smoke and Load test types for both flows. Plan Stress and Spike testing for a future MVP+ release.

---

## 1. Prioritization Framework

### Weighting Factors

| Factor | Weight | Interpretation |
|--------|--------|-----------------|
| **Criticality** | 40% | Financial impact if endpoint fails under expected load |
| **Expected Traffic** | 30% | Production concurrency estimate, RPS, or user density |
| **Environment Readiness** | 20% | Availability of stable, non-PROD test infrastructure |
| **Observability Readiness** | 10% | Ability to correlate k6 metrics with backend health (CPU, DB, RAM) |

### Priority Levels

| Level | Definition | Action |
|-------|-----------|--------|
| **P1** | High ROI; immediate business value | Implement Smoke + Load in this iteration |
| **P2** | Medium ROI; operational confidence building | Plan for next iteration (MVP+ release) |
| **P3** | Low ROI; nice-to-have validation | Backlog for future cycles |
| **P4** | No current business case | Archive; revisit when traffic patterns change |

---

## 2. Flow Prioritization Matrix

### Flow A — Event Availability (`GET /api/v1/events`)

| Criterion | Assessment | Score |
|-----------|-----------|-------|
| **Criticality** | High | Buyers cannot discover events if this endpoint is degraded; direct revenue impact |
| **Expected Traffic** | High | MVP launch: potential 100-200 concurrent users during peak hours; browse behavior ahead of reservation |
| **Environment Readiness** | Yes | Controlled QA environment with ms-events and ms-ticketing services running; data is static |
| **Observability Readiness** | Partial* | Backend logs available; APM/metrics integration optional for MVP baseline |
| **Overall Priority** | **P1** | Critical path; must validate before release |
| **Recommended Test Types** | Smoke, Load | Smoke for connectivity; Load at 80 TPS to validate SLA |

### Flow B — Reservation Creation (`POST /api/v1/reservations`)

| Criterion | Assessment | Score |
|-----------|-----------|-------|
| **Criticality** | High | Core revenue transaction; if endpoint fails, no tickets can be sold; direct financial impact |
| **Expected Traffic** | Medium-High | MVP launch: potential 30-50 concurrent reservation attempts during peak; write-heavy path |
| **Environment Readiness** | Yes | Controlled QA environment; test data pool available; inventory management enabled |
| **Observability Readiness** | Partial* | Backend logs available; db transaction metrics optional for MVP baseline |
| **Overall Priority** | **P1** | Critical path; must validate before release |
| **Recommended Test Types** | Smoke, Load | Smoke for schema validation; Load at 30 TPS to validate SLA and inventory stability |

**\*Note:** Observability readiness scored as "Partial" because APM tooling (Datadog, Grafana) is not mandatory for MVP baseline but strongly recommended for troubleshooting. The spec includes risk mitigations for observability gaps (see risk-matrix.md).

---

## 3. Overall Prioritization Matrix

| Flow / Endpoint | Criticality | Traffic | Env Ready | Obs Ready | **Priority** | **Test Types** |
|-----------------|-------------|---------|-----------|-----------|-------------|---|
| `GET /api/v1/events` | High | High | Yes | Partial | **P1** | Smoke, Load |
| `POST /api/v1/reservations` | High | High | Yes | Partial | **P1** | Smoke, Load |

---

## 4. ROI Justification

### Flow A — Event Availability (GET /api/v1/events)

**Business Value:**
- **Buyer Discovery Path:** First interaction users have with the MVP. If event listing degrades, purchase funnel collapses before reservation attempt.
- **Marketing Dependency:** Event browsing is the primary engagement metric; downtime prevents marketing effectiveness during launch campaigns.
- **Baseline Comparison:** Establishing good p95 latency (< 400 ms) sets customer expectation for responsiveness.

**Technical Value:**
- **Read-Heavy Workload:** Naturally scales well; testing 80 TPS is achievable on modest infrastructure.
- **Stateless Cache-Friendly:** No inventory mutation; results are highly reproducible across runs.
- **Data Stability:** Uses published events already seeded in the environment; no reset proceduresneeded.

**ROI Score:** ⭐⭐⭐⭐⭐ (Very High)

### Flow B — Reservation Creation (POST /api/v1/reservations)

**Business Value:**
- **Revenue Transaction:** Direct financial impact; every failed reservation = lost ticket sale.
- **System Bottleneck:** Write-path is typically the first to saturate under load; early detection prevents outages.
- **Inventory Integrity:** Performance testing doubles as a data consistency check (no overselling under concurrent writes).

**Technical Value:**
- **Write-Path Validation:** Identifies database contention, locking, or query optimization issues.
- **Concurrency Safety:** Validates that concurrent reservation attempts are serialized correctly (no double-selling).
- **Error Rate Measurement:** Distinguishes between network errors (transient) and semantic errors (400 Bad Request, 409 Conflict).

**ROI Score:** ⭐⭐⭐⭐⭐ (Very High)

---

## 5. Test Type Recommendations

### Immediate (This Iteration)

| Test Type | Flow A | Flow B | Rationale |
|-----------|--------|--------|-----------|
| **Smoke** | ✓ Req'd | ✓ Req'd | Validate connectivity, schema, script correctness before committing load tests |
| **Load** | ✓ Req'd | ✓ Req'd | Measure SLA compliance at expected traffic levels (80 TPS, 30 TPS) |
| **Stress** | ◇ Future | ◇ Future | Out of scope for MVP baseline; plan for MVP+ hardening phase |

### Future (MVP+ Release)

| Test Type | Flow A | Flow B | Rationale |
|-----------|--------|--------|-----------|
| **Spike** | ◇ Plan | ◇ Plan | Test sudden 2x-3x traffic surge (flash sale scenario); validate graceful degradation |
| **Soak** | ◇ Consider | ◇ Consider | Long-duration (30m-2h) tests to detect memory leaks; lower priority |
| **Chaos** | ◇ Consider | ◇ Consider | Inject infrastructure faults (db timeout, 50x errors); advanced testing |

---

## 6. Implementation Scope Confirmation

### In Scope (This Iteration)

- ✅ Smoke tests for both flows (connectivity + schema validation)
- ✅ Load tests at published SLA targets (80 TPS, 30 TPS)
- ✅ k6 configuration with explicit thresholds
- ✅ Reusable helpers and data scaffolding
- ✅ Risk mitigation procedures (inventory reset, observability hooks)
- ✅ JSON report generation and threshold evaluation

### Out of Scope (Future Iterations)

- ❌ Stress testing (breaking points)
- ❌ Spike testing (sudden traffic surges)
- ❌ Soak testing (durability over hours)
- ❌ Chaos testing (fault injection)
- ❌ Multi-region or distributed k6 execution
- ❌ Frontend performance (UI rendering, page load time)
- ❌ Login/auth performance (covered separately if needed)
- ❌ Payment gateway performance (external dependency)

---

## 7. Environment Readiness Checklist

**Status:** ✅ Ready for implementation

Before executing any k6 scenarios, confirm:

- [ ] `ms-events` service is running and healthy (`GET /api/v1/health`)
- [ ] `ms-ticketing` service is running and healthy (`GET /api/v1/health`)
- [ ] At least one published event exists with multiple tier options
- [ ] Backend database is accessible and not under maintenance
- [ ] Test environment is isolated from prod and from other team tests
- [ ] No automated deployments scheduled during test window
- [ ] Auth token with sufficient TTL is available (see risk-matrix.md RISK-S3)
- [ ] k6 CLI (v0.40+) is installed on test client

---

## 8. Observability Readiness Assessment

**Current Status:** Partial  
**Gap:** APM/monitoring integration is optional for MVP baseline but recommended for troubleshooting.

### What We Have (Good Enough for MVP)
- ✅ k6 JSON output with raw latency metrics
- ✅ Backend application logs (can be reviewed post-test)
- ✅ HTTP status codes (can diagnose errors)

### What Would Be Ideal (MVP+)
- ⚠️ Real-time Datadog or Grafana dashboard during load test
- ⚠️ Database query profiling (slow query log)
- ⚠️ APM instrumentation to correlate k6 latency with backend span timing

### Mitigation for MVP
The risk-matrix.md (Section RISK-S1) documents the observability gap and mitigation:
1. Record baseline metrics in smoke test
2. Monitor backend CPU/memory during load test
3. Correlate k6 latency spikes with backend events in post-run analysis
4. Escalate to DevOps if anomalies detected

---

## 9. Data Readiness Assessment

**Status:** ✅ Ready for implementation

### Flow A — Event Availability (GET /api/v1/events)

- ✅ **Data Source:** Published events in the environment
- ✅ **Stability:** Static; no mutation needed
- ✅ **Reset Requirement:** No
- ✅ **Availability:** Confirmed in preconditions; queryable via `GET /api/v1/events`

### Flow B — Reservation Creation (POST /api/v1/reservations)

- ✅ **Data Source:** test-data.json with eventId/tierId pairs
- ⚠️ **Stability:** Volatile; inventory is consumed on each write
- ⚠️ **Reset Requirement:** Yes (documented in risk-matrix.md RISK-A1)
- ✅ **Availability:** Must be seeded before load runs; pool size = 3x peak traffic

**Action:** QA team must define and test the reset procedure (e.g., SQL script to replenish tier inventory) before first production-like load run.

---

## 10. Execution Roadmap

### Phase 1 (This Iteration) — MVP Performance Baseline

| Task | Owner | Effort | Timeline |
|------|-------|--------|----------|
| Review risk-matrix and performance-plan | QA Lead | 1h | Week 1 |
| Implement k6 assets (config, data, helpers) | QA Automation | 4-6h | Week 1 |
| Implement smoke scenarios | QA Automation | 2-3h | Week 1 |
| Execute smoke tests; validate connectivity | QA Lead | 1-2h | Week 1 |
| Implement load scenarios | QA Automation | 3-4h | Week 2 |
| Execute load tests; collect baseline | QA Lead | 2-3h | Week 2 |
| Analyze results; document findings | QA Lead | 2-3h | Week 2 |
| **Subtotal** | — | **15-22 hrs** | **2 weeks** |

### Phase 2 (MVP+ Iteration) — Advanced Testing

| Task | Owner | Effort | Timeline |
|------|-------|--------|----------|
| Implement stress scenarios | QA Automation | 4-6h | Future |
| Implement spike scenarios | QA Automation | 4-6h | Future |
| Execute stress/spike tests; document breaking points | QA Lead | 4-6h | Future |
| Integrate Datadog for real-time observability | DevOps | 4-8h | Future |
| Publish final performance report | QA Lead | 2-3h | Future |

---

## 11. Success Criteria

### MVP Baseline Success (This Iteration)

- ✅ Both Smoke tests execute without errors
- ✅ Event Availability Load test: p95 ≤ 400 ms, error rate < 1%
- ✅ Reservation Creation Load test: p95 ≤ 600 ms, error rate < 1%
- ✅ All artifacts (JSON reports, summary, analysis) saved to `k6/reports/`
- ✅ SLA thresholds defined and checked in threshold configuration
- ✅ Risk mitigations documented and procedures tested (e.g., inventory reset)

### MVP+ Success (Future Iteration)

- ✅ Stress test identifies breaking points >2x nominal SLA
- ✅ Spike test validates graceful degradation under 3x peak traffic
- ✅ Observability integration provides real-time correlation of k6 metrics to backend health
- ✅ Comprehensive performance report published with recommendations

---

## 12. Decision Gate

**Question:** Should we proceed with k6 implementation based on this automation proposal?

**Answer:** ✅ **YES, PROCEED WITH IMMEDIATE IMPLEMENTATION**

**Justification:**
1. Both flows meet P1 criteria (high criticality, high traffic, ready environment)
2. MVP launch timeline requires baseline performance validation
3. Risk mitigations are documented and actionable
4. Resource estimate (15-22 hrs) is acceptable for pre-release validation
5. Observability gaps are acceptable for MVP baseline; can be addressed in MVP+

---

## Next Steps

1. ✅ **Risk Matrix Complete** (risk-matrix.md)
2. ✅ **Performance Plan Complete** (performance-plan.md)
3. ✅ **Automation Proposal Complete** (this document)
4. ⏭️ **Implement K6 Assets** — Generate config, thresholds, helpers, test data
5. ⏭️ **Implement K6 Script** — Generate smoke and load scenarios
6. ⏭️ **Execute Tests** — Run scenarios; validate SLAs; document findings
