# Requirement: MVP Core Performance Validation

## Status
DRAFT

## Context
The Ticketing MVP already has functional coverage through the API automation suite implemented with Karate DSL. Functional validation has already been completed for the core business flows, including event availability, reservation lifecycle, expiration, release, notifications, and ticket visibility.

This requirement focuses exclusively on **performance validation with k6** for the backend flows identified in the test strategy as critical for system responsiveness and business value.

The goal is to validate how the backend behaves under load in the following two critical paths:
1. event availability query
2. reservation creation

This requirement does not replace functional testing and must not replicate the full set of functional test cases already covered by Karate.

---

## Business Objective
Validate that the Ticketing MVP backend supports the most business-critical traffic paths with acceptable performance under controlled load conditions.

The system must:
- respond quickly when buyers query available events
- sustain reservation creation traffic without unacceptable degradation
- remain stable under expected request rates for the MVP

---

## In Scope
This requirement includes only backend performance validation for:

### Flow 1 — Event Availability
- Query of published events and available tiers
- Endpoint target: `GET /api/v1/events`

### Flow 2 — Reservation Creation
- Creation of a valid reservation for an available tier
- Endpoint target: `POST /api/v1/reservations`

### Performance Concerns Covered
- Response time
- Throughput
- Error rate
- Stability under sustained load
- k6 configuration, assets, reusable helpers, and executable scenarios
- Execution evidence and performance output artifacts

---

## Out of Scope
The following items are explicitly out of scope for this requirement:

- Frontend performance
- UI rendering performance
- Login/register performance
- JWT authentication performance
- Payment flow performance
- Notification flow performance
- Ticket retrieval performance
- Scheduler/expiration validation
- Functional business validation already covered by Karate
- End-to-end UI testing
- Real production benchmarking
- External integrations such as SMTP or banking gateways

---

## Performance Targets

### Scenario A — Event Availability Query
- Endpoint: `GET /api/v1/events`
- SLA target: `p95 < 400 ms`
- Minimum throughput target: `80 TPS`

### Scenario B — Reservation Creation
- Endpoint: `POST /api/v1/reservations`
- SLA target: `p95 < 600 ms`
- Minimum throughput target: `30 TPS`

---

## Functional Alignment
This requirement is aligned to the test strategy already defined in `TEST_PLAN.md`:

- **HU-03** — Visualización de eventos y disponibilidad
- **HU-04** — Reserva y compra de entrada con pago simulado

Related functional test cases already covered by Karate and used only as business reference for performance scope:
- `TC-009`
- `TC-010`
- `TC-011`
- `TC-029`
- `TC-012`
- `TC-015`

These cases are not to be reimplemented functionally in k6. They are only used to justify the business relevance of the selected performance flows.

---

## Preconditions
Before performance execution, the following conditions must be met:

1. Backend services are up and healthy:
   - `ms-events`
   - `ms-ticketing`
   - required supporting infrastructure

2. The environment is running in a stable and reproducible setup.

3. Valid test data exists for:
   - published events
   - available tiers
   - at least one valid event/tier combination for reservation creation

4. Base URLs and required runtime configuration values are provided through environment variables or k6 config files.

5. No secrets are hardcoded in scripts.

---

## Assumptions
- Performance tests will run against a controlled local/QA environment.
- Performance results are valid only for the tested environment and infrastructure.
- Event data used for reservation scenarios may need reset or replenishment between runs.
- Reservation scenarios should use known-valid payloads and headers already aligned with the backend contract.
- The purpose is not to validate full business correctness, but rather backend responsiveness and stability.

---

## Data Strategy
The k6 implementation must define a clear and maintainable data strategy.

### For `GET /api/v1/events`
- Use published events already present in the test environment
- Prefer stable data that does not require mutation during execution

### For `POST /api/v1/reservations`
- Use valid event and tier identifiers prepared in advance
- Avoid random payloads that could break the backend contract
- Prevent data collisions and inventory exhaustion where possible
- Document whether the scenario requires:
  - seeded reusable data
  - dynamic lookup of event/tier IDs
  - reset strategy between runs

---

## Required Deliverables
The implementation generated from this requirement must produce:

- Technical specification file for the feature
- k6 configuration files
- Reusable k6 assets/helpers
- Executable k6 scenarios
- Threshold configuration
- Report or output artifacts under the expected project structure
- Optional documentation update if required by the repository flow

---

## Acceptance Criteria
1. A k6 scenario exists for `GET /api/v1/events`.
2. A k6 scenario exists for `POST /api/v1/reservations`.
3. Thresholds are explicitly declared and aligned to:
   - `GET /api/v1/events` → `p95 < 400 ms`, `80 TPS`
   - `POST /api/v1/reservations` → `p95 < 600 ms`, `30 TPS`
4. The implementation uses backend-only scope and does not drift into frontend performance.
5. Scripts use configurable base URLs and do not hardcode secrets.
6. Test data strategy is explicitly documented.
7. The scripts produce clear execution output and evidence artifacts.
8. The generated solution keeps clear separation between:
   - read scenario
   - write scenario
9. The generated solution does not attempt to reimplement the full Karate functional suite in k6.
10. Any assumptions, blockers, or data limitations are documented explicitly.

---

## Risks
- Reservation inventory may be consumed during repeated runs if data reset is not planned.
- Local environment limitations may affect latency and TPS measurements.
- Shared infrastructure noise may distort results.
- Reservation write flow may require careful coordination of seeded data to avoid false failures unrelated to performance.
- Overloading the environment with unrealistic concurrency may invalidate business-useful findings.

---

## Constraints
- No expansion of scope beyond backend performance.
- No addition of payment, notifications, tickets, login, or frontend performance unless explicitly requested later.
- No assumptions about undocumented payloads or headers; reuse known backend contract inputs already validated in the project.
- No unauthorized code generation outside the approved spec flow.

---

## Notes for Spec Generation
When generating the spec from this requirement:

- Keep the scope limited to performance validation
- Use backend/API perspective only
- Treat Karate as the source of prior functional coverage
- Avoid describing k6 as a functional replacement
- Prefer clean separation between:
  - event availability performance
  - reservation creation performance
- If exact payload examples are needed, derive them from the already validated project artifacts instead of inventing them