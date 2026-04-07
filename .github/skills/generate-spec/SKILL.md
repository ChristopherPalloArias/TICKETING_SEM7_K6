---
name: generate-spec
description: Generates a technical performance spec in .github/specs/<feature>.spec.md based on a requirement. Enforces the DRAFT status.
argument-hint: "<feature-name>"
---

# `generate-spec`

## Purpose
Translates raw business or operational requirements from `.github/requirements/` into an actionable, technical baseline specification for k6 load scenarios. This specification acts as the universal blueprint for all subsequent QA and implementation agents.

## Definition of Ready (DoR)
Before generating a spec, the source requirement must minimally express:
- Target system or endpoint boundaries.
- General goal (e.g., "ensure system survives black friday").

If the DoR is not met, prompt the user with clarifying questions before writing.

## Strict Restrictions
- **Pathing:** Output MUST always be in `.github/specs/<feature>.spec.md`.
- **Status Gate:** MUST always start with `status: DRAFT` in the frontmatter.
- **No Implementation:** DO NOT generate code in `k6/` directories during this skill execution.

## Required Frontmatter
```yaml
---
id: PERF-###
status: DRAFT
feature: <feature-name>
created: YYYY-MM-DD
updated: YYYY-MM-DD
author: spec-generator
version: "1.0"
---
```

## Required Sections
1. **Scope and Goal:** Direct summary of the performance testing objective.
2. **System Context:** Endpoints, environments, and observability tools.
3. **Thresholds / SLOs:**
   - *Confirmed Expectations:* Explicitly stipulated metrics that dictate pass/fail.
   - *Candidate Expectations:* Inferred metrics based on industry standards that require validation.
4. **Workload Model & Traffic Profile:**
   - Scenarios (e.g., Smoke, Load, Stress, Spike).
   - Arrival rates, VUs, step stages, and durations.
5. **Test Data Strategy:** Dynamic generation vs. static loading constraints.
6. **Execution Constraints & Risks:** Known bottlenecks or environment instability.
7. **Implementation Tasks:** Checklist separating config design, asset build, scenario scripting.

## Invocation Pattern
- Read `.github/requirements/<feature>.md`.
- Generate `.github/specs/<feature>.spec.md`.
