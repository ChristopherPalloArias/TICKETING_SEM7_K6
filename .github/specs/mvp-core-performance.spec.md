---
id: PERF-001
status: DRAFT
feature: mvp-core-performance
created: 2026-04-07
updated: 2026-04-07
author: spec-generator
version: "1.0"
---

# Technical Spec — MVP Core Performance Validation

## 1. Scope and Goal

Validate backend responsiveness and stability of the Ticketing MVP under controlled load conditions for the two most business-critical traffic paths:

- **Flow A** — Event Availability: `GET /api/v1/events`
- **Flow B** — Reservation Creation: `POST /api/v1/reservations`

The goal is to confirm that both endpoints satisfy their defined SLA thresholds expressed as p95 latency and minimum throughput (TPS) targets before MVP release. Functional correctness is already covered by the Karate DSL automation suite and is **not** in scope for these k6 scripts.

---

## 2. System Context

### 2.1 Target Endpoints

| Flow | Method | Endpoint | Description |
|------|--------|----------|-------------|
| A | GET | `/api/v1/events` | Returns published event catalog and tier availability |
| B | POST | `/api/v1/reservations` | Creates a reservation for a given event/tier combination |

### 2.2 Services Under Test

| Service | Role |
|---------|------|
| `ms-events` | Serves event and tier availability data |
| `ms-ticketing` | Handles reservation creation and inventory management |

### 2.3 Environment

- **Target:** Local / QA controlled environment
- **Base URL:** Injected via `__ENV.BASE_URL` — never hardcoded
- **Authentication:** Bearer token via `__ENV.AUTH_TOKEN` if required by the endpoint contract
- **Observability:** k6 built-in metrics exported to standard output; JSON summary saved under `k6/reports/`
- **Infrastructure assumption:** All dependent services (`ms-events`, `ms-ticketing`, required databases) are running and healthy before test execution

### 2.4 Functional Alignment

These flows are performance coverage for the following user stories and test cases already validated in Karate:

| User Story | Test Cases (reference only) |
|------------|----------------------------|
| HU-03 — Visualización de eventos y disponibilidad | TC-009, TC-010, TC-011 |
| HU-04 — Reserva y compra de entrada con pago simulado | TC-012, TC-015, TC-029 |

> **Note:** The above test cases are referenced only to justify business relevance. They must **not** be re-implemented functionally in k6.

---

## 3. Thresholds / SLOs

### 3.1 Confirmed Expectations

These are explicitly defined in the requirement and dictate pass/fail for the k6 run:

| Metric | Flow A — Event Availability | Flow B — Reservation Creation |
|--------|-----------------------------|-------------------------------|
| `http_req_duration` p95 | `< 400 ms` | `< 600 ms` |
| Minimum throughput | `≥ 80 req/s (TPS)` | `≥ 30 req/s (TPS)` |
| `http_req_failed` rate | `< 1%` | `< 1%` |

### 3.2 Candidate Expectations

These are inferred based on industry standards and require validation against the actual environment:

| Metric | Target | Rationale |
|--------|--------|-----------|
| `http_req_duration` p99 (Flow A) | `< 700 ms` | Upper guard for long-tail read latency |
| `http_req_duration` p99 (Flow B) | `< 1000 ms` | Upper guard for write-path under saturation |
| `http_req_duration` avg (Flow A) | `< 250 ms` | General responsiveness baseline |
| `http_req_duration` avg (Flow B) | `< 400 ms` | General responsiveness baseline for write operations |
| Dropped iterations | `0` | No iteration should fail to launch at target arrival rate |

> Candidate expectations should be promoted to Confirmed Expectations in a subsequent spec revision once baseline results are available.

---

## 4. Workload Model & Traffic Profile

### 4.1 Scenario Inventory

| Test Type | Flow | Scenario Key | Purpose |
|-----------|------|-------------|---------|
| Smoke | A — Events | `smoke_events` | Baseline sanity: single VU, single iteration |
| Smoke | B — Reservations | `smoke_reservations` | Baseline sanity: single VU, single iteration |
| Load | A — Events | `load_events` | Sustained load at 80 TPS target |
| Load | B — Reservations | `load_reservations` | Sustained load at 30 TPS target |

### 4.2 Smoke Profile (both flows)

| Parameter | Value |
|-----------|-------|
| Executor | `shared-iterations` |
| VUs | `1` |
| Iterations | `1` |
| Max Duration | `30s` |
| Purpose | Verify connectivity, response schema, and threshold config before committing to load |

### 4.3 Load Profile — Flow A: Event Availability (80 TPS)

Executor: `ramping-arrival-rate`

| Stage | Start Rate | End Rate | Duration | Purpose |
|-------|-----------|---------|---------|---------|
| 1 | 0 req/s | 40 req/s | 1m | Warm-up ramp — 50% of target |
| 2 | 40 req/s | 40 req/s | 3m | Sustain at 50% — measure baseline stability |
| 3 | 40 req/s | 80 req/s | 1m | Ramp to SLA target |
| 4 | 80 req/s | 80 req/s | 3m | Sustain at target — primary SLA measurement window |
| 5 | 80 req/s | 0 req/s | 30s | Cool-down |

- **Pre-allocated VUs:** `20`
- **Max VUs:** `60`
- **Time Unit:** `1s`
- **Total Duration:** `~8m 30s`

### 4.4 Load Profile — Flow B: Reservation Creation (30 TPS)

Executor: `ramping-arrival-rate`

| Stage | Start Rate | End Rate | Duration | Purpose |
|-------|-----------|---------|---------|---------|
| 1 | 0 req/s | 15 req/s | 1m | Warm-up ramp — 50% of target |
| 2 | 15 req/s | 15 req/s | 2m | Sustain at 50% — measure write-path stability |
| 3 | 15 req/s | 30 req/s | 1m | Ramp to SLA target |
| 4 | 30 req/s | 30 req/s | 3m | Sustain at target — primary SLA measurement window |
| 5 | 30 req/s | 0 req/s | 30s | Cool-down |

- **Pre-allocated VUs:** `15`
- **Max VUs:** `40`
- **Time Unit:** `1s`
- **Total Duration:** `~7m 30s`

---

## 5. Test Data Strategy

### 5.1 Flow A — Event Availability (`GET /api/v1/events`)

| Property | Decision |
|----------|---------|
| Data type | Read-only, no mutation required |
| Source | Published events already seeded in the QA/local environment |
| Strategy | No test data file needed for this flow; endpoint is stateless from the test perspective |
| Reset required | No |
| Collision risk | None — read-only flow |

- Query parameters (filters, pagination) may be added if the backend contract supports them; use stable defaults derived from known environment state.

### 5.2 Flow B — Reservation Creation (`POST /api/v1/reservations`)

| Property | Decision |
|----------|---------|
| Data type | Write — creates reservations in the system |
| Source | `k6/data/test-data.json` — pre-seeded `eventId` and `tierId` pairs |
| Strategy | Use a fixed pool of known-valid event/tier pairs; iterate over them using SharedArray to avoid repetition exhaustion |
| Reset required | **Yes** — inventory may be consumed during repeated runs; a reset or replenishment strategy must be documented before production runs |
| Collision risk | Medium — concurrent writes may exhaust tier inventory if pool is too small or if no reset is in place |

**Payload Contract (derived from prior Karate validation):**

```json
{
  "eventId": "<uuid>",
  "tierId": "<uuid>",
  "quantity": 1
}
```

**Headers (minimum):**

```
Content-Type: application/json
Authorization: Bearer <token via __ENV.AUTH_TOKEN>
```

> Payloads must not be invented. Values must be sourced from the already-validated backend contract as evidenced in the Karate test suite.

### 5.3 SharedArray Usage

- Use k6's `SharedArray` from `k6/data` module to load `test-data.json` once and distribute across VUs.
- Index selection: `data[exec.scenario.iterationInTest % data.length]`

---

## 6. Execution Constraints & Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Reservation inventory exhaustion during repeated runs | High | Pre-seed enough tier slots; document and plan reset strategy before executing load runs |
| Local environment noise distorting latency measurements | Medium | Run tests on isolated infrastructure when possible; document environment specs alongside results |
| Shared services interference (database, queues) | Medium | Confirm no parallel test suites are running during k6 execution |
| `ms-events` or `ms-ticketing` unhealthy at execution time | High | Add a `setup()` health-check call before VU ramp begins; abort if check fails |
| Overloading with unrealistic concurrency | Medium | Pre-allocated VU caps are enforced per profile; do not override `maxVUs` without re-validating thresholds |
| Auth token expiry during long load runs | Low | Use a token with sufficient TTL; document expected expiry window relative to test duration |
| Data collisions on write flow | Medium | Use diverse payload pool in SharedArray; avoid identical `eventId`/`tierId` combinations being hammered simultaneously |

---

## 7. Implementation Tasks

### Phase 1 — Configuration & Assets (`/implement-k6-assets`)

- [ ] **ENV config** (`k6/config/env.js`): Export `BASE_URL`, `AUTH_TOKEN`; no defaults for secrets
- [ ] **Thresholds** (`k6/config/thresholds.js`):
  - Flow A: `http_req_duration{scenario:load_events}` p95 < 400ms, `http_req_failed{scenario:load_events}` < 1%
  - Flow B: `http_req_duration{scenario:load_reservations}` p95 < 600ms, `http_req_failed{scenario:load_reservations}` < 1%
- [ ] **Options** (`k6/config/options.js`): Export scenario blocks for smoke and load profiles; import thresholds
- [ ] **Test data** (`k6/data/test-data.json`): Define array of `{ eventId, tierId, quantity }` objects using placeholder UUIDs; document replacement requirement
- [ ] **HTTP client lib** (`k6/lib/http-client.js`): Wrapper functions `getEvents()` and `createReservation(payload)` using parameterized base URL
- [ ] **Checks lib** (`k6/lib/checks.js`): Named check blocks for status 200 (events) and status 201/200 (reservations)
- [ ] **Utils** (`k6/lib/utils.js`): SharedArray loader helper; index selection utility

### Phase 2 — Scenario Scripts (`/implement-k6-script`)

- [ ] **Smoke scenario** (`k6/scenarios/smoke.js`): Combined smoke validation for both flows with `shared-iterations`, 1 VU, 1 iteration
- [ ] **Load scenario — Events** (`k6/scenarios/load-events.js`): `ramping-arrival-rate` executor, 80 TPS target, imports from config and lib
- [ ] **Load scenario — Reservations** (`k6/scenarios/load-reservations.js`): `ramping-arrival-rate` executor, 30 TPS target, SharedArray data pool, imports from config and lib

### Phase 3 — Evidence & Documentation (optional)

- [ ] Configure `--out json=k6/reports/run-<scenario>-<date>.json` as execution argument
- [ ] Document reset/replenishment procedure for reservation inventory in a `k6/data/README.md`

---

## 8. Acceptance Criteria Traceability

| Acceptance Criterion | Spec Coverage |
|---------------------|--------------|
| k6 scenario for `GET /api/v1/events` | Section 4 — `load_events`, `smoke_events` |
| k6 scenario for `POST /api/v1/reservations` | Section 4 — `load_reservations`, `smoke_reservations` |
| Thresholds aligned to requirement | Section 3.1 — Confirmed Expectations |
| Backend-only scope | Section 1 — Scope and Goal |
| No hardcoded secrets / configurable base URL | Section 2.3, Implementation Tasks Phase 1 |
| Test data strategy documented | Section 5 |
| Clear execution output / evidence artifacts | Section 7, Phase 3 |
| Separation of read vs write scenarios | Section 4.1, Section 7 Phase 2 |
| No functional re-implementation of Karate suite | Section 1, Section 2.4 |
| Assumptions, blockers, and data limitations documented | Section 5.2, Section 6 |
