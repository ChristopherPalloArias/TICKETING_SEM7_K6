---
name: automation-flow-proposer
description: Proposes which business flows require performance testing, evaluating business criticality, traffic, and environment readiness. Outputs a prioritized ROI automation matrix.
argument-hint: "<feature-name> | <repository>"
---

# `automation-flow-proposer` [QA]

## Purpose
Identifies which application flows have the highest Return on Investment (ROI) for k6 performance testing. Prioritizes the testing roadmap and defines test-type execution models.

## Prioritization Criteria (ROI)
A flow is prioritized based on the following weighted performance factors:
1. **Criticality (High/Medium/Low):** Financial or operational impact if the endpoint crashes under load.
2. **Expected Traffic (High/Medium/Low):** Estimated concurrent usage or requests per second (RPS) in production.
3. **Environment Readiness (Yes/No):** Availability of a stable, non-production environment equipped to handle targeted stress.
4. **Observability Readiness (Yes/No):** Ability to monitor server metrics (CPU, RAM, DB Locks) during the test.

## Prioritization Matrix Format
```markdown
| Flow / Endpoint | Criticality | Traffic | Env Ready | Obs Ready | Priority | Recommended Test Type |
|-----------------|-------------|---------|-----------|-----------|----------|-----------------------|
| `POST /auth`    | High        | High    | Yes       | Yes       | P1       | Load, Stress          |
| `GET /reports`  | Medium      | Low     | Yes       | No        | P3       | Smoke                 |
```

## Performance Selection Criteria
- **Smoke:** Always P1 for validating connectivity, test scripts, and minimal thresholds.
- **Load (Expected Traffic):** P1 for standard endpoints anticipating daily concurrency peaks.
- **Stress (Breaking Point):** P2 for evaluating scaling resilience and graceful degradation.
- **Spike (Sudden Surge):** P2/P3 for highly volatile endpoints (e.g., ticket sales, flash promotions).
- **Soak (Memory/Endurance):** P3/P4 for critical background processors or long-lived connection pools.

## Definition of Ready (DoR)
- Target endpoints are documented and reachable.
- Environment baseline capacity is vaguely understood.
- Static test data is available.

## Definition of Done (DoD)
- Matrix generated and saved in `docs/output/qa/automation-proposal.md`.
- Recommended k6 test types assigned to all P1 and P2 flows.

## Rules
- **Conservative Planning:** Do not recommend Stress or Spike testing on flows completely lacking observability or stable environments.
- **Actionable Output:** Use the matrix format to present clear, undeniable facts extracted from the specification.
