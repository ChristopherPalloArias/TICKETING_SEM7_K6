---
id: PERF-001
status: APPROVED
feature: mvp-core-performance
created: 2026-04-07
updated: 2026-04-07
author: spec-generator
version: "1.1"
---

# Technical Spec — MVP Core Performance Validation

## 1. Scope and Goal

Validate the **backend performance** of the Ticketing MVP under controlled load conditions for the two most business-critical API flows:

- **Flow A — Event Availability:** `GET /api/v1/events`
- **Flow B — Reservation Creation:** `POST /api/v1/reservations`

The purpose of this specification is to verify that these endpoints sustain the response-time and throughput targets defined in the QA planning for the MVP.

This specification is **performance-only**.  
Functional correctness, business rules, state transitions, expiration logic, notifications, ticket visibility, and access control are already covered by the Karate automation suite and are **not** to be reimplemented in k6.

---

## 2. System Context

### 2.1 Target Endpoints

| Flow | Method | Endpoint | Description |
|------|--------|----------|-------------|
| A | GET | `/api/v1/events` | Returns published events and their available tiers |
| B | POST | `/api/v1/reservations` | Creates a reservation for a valid event/tier combination |

### 2.2 Services Under Test

| Service | Role |
|---------|------|
| `ms-events` | Serves event catalog and tier availability |
| `ms-ticketing` | Processes reservation creation and inventory locking |

### 2.3 Environment

- **Target environment:** Local / QA controlled environment
- **Execution mode:** Backend-only performance validation
- **Base URLs:** must be injected via environment variables, never hardcoded
  - `__ENV.BASE_URL_EVENTS`
  - `__ENV.BASE_URL_TICKETING`
- **Authentication / context headers:** only if required by the actual backend contract; must be injected via environment variables or config, never hardcoded
- **Observability:** k6 console output plus JSON summary/report artifacts under `k6/reports/`
- **Infrastructure assumption:** all dependent services and databases are up, healthy, and stable before execution

### 2.4 Functional Alignment

These performance flows are aligned to the QA strategy already defined for:

| User Story | Functional Reference Cases |
|------------|----------------------------|
| HU-03 — Visualización de eventos y disponibilidad | TC-009, TC-010, TC-011, TC-029 |
| HU-04 — Reserva y compra de entrada con pago simulado | TC-012, TC-015 |

> These test cases are referenced only to justify business relevance and performance scope.  
> They must **not** be reimplemented functionally in k6.

---

## 3. Performance Targets

### 3.1 Confirmed Targets

These targets come directly from the approved QA planning and define pass/fail for the load execution:

| Metric | Flow A — Event Availability | Flow B — Reservation Creation |
|--------|-----------------------------|-------------------------------|
| `http_req_duration` p95 | `< 400 ms` | `< 600 ms` |
| Minimum throughput target | `≥ 80 req/s` | `≥ 30 req/s` |
| `http_req_failed` rate | `< 1%` | `< 1%` |

### 3.2 Optional Secondary Indicators

These metrics are useful for analysis but are **not** primary acceptance gates unless explicitly promoted later:

| Metric | Flow A | Flow B | Purpose |
|--------|--------|--------|---------|
| `http_req_duration` p99 | `< 700 ms` | `< 1000 ms` | Long-tail latency visibility |
| `http_req_duration` avg | `< 250 ms` | `< 400 ms` | General responsiveness reference |
| dropped iterations | `0` | `0` | Detect rate-generation instability |

---

## 4. Workload Model and Traffic Profile

## 4.1 Scenario Inventory

| Test Type | Flow | Scenario Key | Purpose |
|-----------|------|-------------|---------|
| Smoke | Events | `smoke_events` | Quick connectivity and contract sanity check |
| Smoke | Reservations | `smoke_reservations` | Quick write-path sanity check with one valid payload |
| Load | Events | `load_events` | Sustained read-load validation at 80 req/s |
| Load | Reservations | `load_reservations` | Sustained write-load validation at 30 req/s |

## 4.2 Smoke Profile

Smoke tests are not functional replacements for Karate. They only confirm that:
- the endpoint is reachable
- the configuration is valid
- the payload/header contract is usable before load starts

| Parameter | Value |
|-----------|-------|
| Executor | `shared-iterations` |
| VUs | `1` |
| Iterations | `1` |
| Max Duration | `30s` |

## 4.3 Load Profile — Flow A: Event Availability

**Executor:** `ramping-arrival-rate`

| Stage | Start Rate | End Rate | Duration | Purpose |
|-------|-----------|---------|---------|---------|
| 1 | 0 req/s | 40 req/s | 1m | Warm-up |
| 2 | 40 req/s | 40 req/s | 2m | Stabilization at 50% |
| 3 | 40 req/s | 80 req/s | 1m | Ramp to target |
| 4 | 80 req/s | 80 req/s | 3m | Primary SLA window |
| 5 | 80 req/s | 0 req/s | 30s | Cool-down |

- **Time unit:** `1s`
- **Pre-allocated VUs:** `20`
- **Max VUs:** `60`

## 4.4 Load Profile — Flow B: Reservation Creation

**Executor:** `ramping-arrival-rate`

| Stage | Start Rate | End Rate | Duration | Purpose |
|-------|-----------|---------|---------|---------|
| 1 | 0 req/s | 15 req/s | 1m | Warm-up |
| 2 | 15 req/s | 15 req/s | 2m | Stabilization at 50% |
| 3 | 15 req/s | 30 req/s | 1m | Ramp to target |
| 4 | 30 req/s | 30 req/s | 3m | Primary SLA window |
| 5 | 30 req/s | 0 req/s | 30s | Cool-down |

- **Time unit:** `1s`
- **Pre-allocated VUs:** `15`
- **Max VUs:** `40`

> These workload profiles are intentionally moderate and aligned to the MVP QA targets.  
> They are not intended as stress-to-failure or soak profiles.

---

## 5. Test Data Strategy

## 5.1 Flow A — Event Availability (`GET /api/v1/events`)

| Property | Decision |
|----------|---------|
| Data type | Read-only |
| Source | Events already published in the controlled environment |
| Mutation required | No |
| Reset required | No |
| Collision risk | None |

Strategy:
- Use stable environment data
- Do not mutate event state during this scenario
- Avoid optional filters unless the backend contract already uses them consistently

## 5.2 Flow B — Reservation Creation (`POST /api/v1/reservations`)

| Property | Decision |
|----------|---------|
| Data type | Write / inventory-affecting |
| Source | `k6/data/test-data.json` with prevalidated event/tier combinations |
| Mutation required | Yes |
| Reset required | Yes, or equivalent replenishment strategy |
| Collision risk | Medium to High |

Strategy:
- Use a controlled pool of valid `{ eventId, tierId, quantity }` combinations
- Prefer tiers with enough quota to tolerate repeated writes during the scenario
- If inventory can be exhausted, document one of these approaches:
  1. reset data between runs
  2. replenish event/tier pool before execution
  3. seed sufficiently large reservation targets for load execution

### 5.2.1 Payload Contract

Payloads must come from the real backend contract already validated in the project. No invented fields are allowed.

Reference payload structure:

```json
{
  "eventId": "<uuid>",
  "tierId": "<uuid>",
  "quantity": 1
}
````

### 5.2.2 Headers / Context

Headers must reflect the real contract used by the backend.
If authorization or context headers are required, they must be passed through environment variables or configuration helpers.

Examples:

* `Content-Type: application/json`
* `Authorization: Bearer <token>` only if actually required
* or test-context headers if that is how the environment is configured

## 5.3 SharedArray Strategy

* Load `k6/data/test-data.json` once through `SharedArray`
* Rotate data deterministically across iterations
* Recommended indexing pattern:

```javascript
data[exec.scenario.iterationInTest % data.length]
```

This avoids naive repetition while keeping the scenario reproducible.

---

## 6. Constraints and Risks

| Risk                                                  | Severity | Mitigation                                                                |
| ----------------------------------------------------- | -------- | ------------------------------------------------------------------------- |
| Reservation inventory exhaustion during repeated runs | High     | Seed enough valid event/tier pairs and document reset strategy            |
| Local machine resource limits distort latency/TPS     | Medium   | Document environment characteristics and avoid parallel noisy workloads   |
| Shared services interference during k6 execution      | Medium   | Ensure no other heavy suites are running at the same time                 |
| Backend service unhealthy before execution            | High     | Use `setup()` health checks and abort early if unhealthy                  |
| Data collisions on reservation flow                   | High     | Use a sufficiently large data pool and avoid hammering one exhausted pair |
| Auth or context token expiry during execution         | Low      | Use stable credentials/context valid for the whole run                    |
| Overriding VU/rate profiles without validation        | Medium   | Keep profile values controlled and tied to this spec                      |

---

## 7. Implementation Tasks

## Phase 1 — Foundational Assets (`/implement-k6-assets`)

* [ ] Create environment config for:

  * `BASE_URL_EVENTS`
  * `BASE_URL_TICKETING`
  * optional auth/context values
* [ ] Create reusable threshold configuration
* [ ] Create scenario/options configuration
* [ ] Create `k6/data/test-data.json`
* [ ] Create reusable HTTP client helpers for:

  * `getEvents()`
  * `createReservation(payload)`
* [ ] Create reusable check helpers
* [ ] Create utility helpers for SharedArray loading and data selection

## Phase 2 — Executable Scripts (`/implement-k6-script`)

* [ ] `k6/scenarios/smoke-events.js`
* [ ] `k6/scenarios/smoke-reservations.js`
* [ ] `k6/scenarios/load-events.js`
* [ ] `k6/scenarios/load-reservations.js`

## Phase 3 — Evidence and Operational Notes

* [ ] Save execution outputs into `k6/reports/`
* [ ] Document data reset/replenishment procedure for reservation runs
* [ ] Document execution commands in a short README if needed

---

## 8. Acceptance Criteria Traceability

| Acceptance Criterion                            | Coverage in this Spec |
| ----------------------------------------------- | --------------------- |
| Scenario exists for `GET /api/v1/events`        | Sections 4.1, 4.3, 7  |
| Scenario exists for `POST /api/v1/reservations` | Sections 4.1, 4.4, 7  |
| Thresholds align to approved QA targets         | Section 3.1           |
| Backend-only scope maintained                   | Sections 1 and 2      |
| No hardcoded secrets                            | Sections 2.3 and 7    |
| Test data strategy documented                   | Section 5             |
| Clear execution evidence generated              | Section 7             |
| Read and write flows remain separated           | Sections 4 and 7      |
| Karate is not functionally reimplemented        | Sections 1 and 2.4    |
| Risks and assumptions are documented            | Section 6             |

---

## 9. Non-Goals

This spec does **not** attempt to validate:

* frontend rendering
* UI workflows
* login/register throughput
* payment performance
* notifications performance
* ticket retrieval performance
* scheduler performance
* complete business-state validation

Those concerns are either:

* already handled elsewhere in the project, or
* intentionally outside this MVP performance scope.

---

## 10. Approval Notes

Before moving this spec from `DRAFT` to `APPROVED`, confirm:

1. the real reservation payload shape matches the expected backend contract
2. required headers/context are known and documented
3. valid seed data exists for load execution
4. the team accepts the stated k6 scope as backend-only performance validation