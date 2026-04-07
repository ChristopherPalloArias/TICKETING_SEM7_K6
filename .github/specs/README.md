# Specifications

This directory contains the master technical specifications for every performance testing feature. They serve as the irrefutable source of truth for all ASDD framework agents.

## The Spec Lifecycle

Specs travel through a strict human-in-the-loop state machine. 

| Status | Owner | Meaning & Action |
|---|---|---|
| `DRAFT` | Spec Generator | Initial translation from business requirements. Requires human review. |
| `APPROVED` | User / Tech Lead | Reviewed and validated. Unlocks QA analysis and k6 asset generation. |
| `IN_PROGRESS` | Framework Agents | Currently being scripted into the `k6/` directory. |
| `IMPLEMENTED` | Documentation Agent | Delivered, executed, and documented. |

> **HARD GATE RULE:** Without an `APPROVED` status in the YAML frontmatter, absolutely no generative agents are permitted to implement code into the `k6/` scaffold.

## How to Create a Spec
1. Ensure the raw business challenge resides in `.github/requirements/<feature>.md`.
2. Invoke the agent via Copilot Chat: `@Spec Generator generate spec for <feature>`.
3. The model translates the payload into a structured `DRAFT` spec focused on endpoints, SLA thresholds, workload models, and data strategies.
4. You evaluate the constraints, replace any `[Not provided]` placeholders accurately, and switch the status to `APPROVED`.

## Required Frontmatter
The top of every specification must include the YAML block:
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

## File Naming Convention
Specs must be named strictly in lowercase kebab-case mapping the feature under test:
- `auth-service-spike.spec.md`
- `payment-gateway-load.spec.md`

## Specifications Index
*(Update this matrix when new specs are transitioned through the lifecycle)*

| Spec ID | Feature Name | Test Scope | Status |
|---------|--------------|------------|--------|
| - | - | - | - |

## Pending Requirements Waitlist
*(These requirements exist in `.github/requirements/` but have not yet been evaluated into a `DRAFT` spec)*

| Requirement File | Date Added | Action Required |
|------------------|------------|-----------------|
| - | - | Request `/generate-spec` |

## Alignment to K6 ASDD
Specs do not define Javascript implementation semantics directly. They define Target Service Level Objectives (SLOs), VU models (Ramping, Constant Arrival), Duration vectors, and Environments. The `implement-k6-*` skills map these abstract definitions strictly into runtime Javascript definitions under the `/k6` project directory.
