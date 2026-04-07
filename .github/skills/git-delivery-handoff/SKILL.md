---
name: git-delivery-handoff
description: Orchestrates atomic, intent-based conventional commits mapping explicitly to k6 configuration, scenarios, and SLA thresholds.
argument-hint: "[optional: branch-name]"
---

# `git-delivery-handoff`

## Purpose
Prepares standard, high-quality git commit bundles and PR descriptions prior to delivery. Enforces intent-based isolation of changes.

## Intent-Based Commit Grouping (Atomicity Rules)
Never bundle configuration changes, data updates, and scenario scripts into a single massive commit. Group logically:
1. **Config & Assets:** `k6/config/*` and `k6/lib/*`
2. **Data Seeds:** `k6/data/*`
3. **Execution Scripts:** `k6/scenarios/*`
4. **Docs & Framework:** `docs/`, `README.md`, `.github/`

## Conventional Commit Standards for Performance
Use strictly conventional prefixes aligned to performance deliverables:
- `feat(scenario): add payment gateway load test`
- `perf(thresholds): tighten p95 sla validation to 300ms`
- `fix(data): resolve empty seed collisions in auth payload`
- `chore(config): update default ENV urls for staging`
- `docs(spec): approve traffic requirements for black friday`

## Pre-Push Checklist
- [ ] No hardcoded passwords or secrets in `k6/config/` or `k6/data/`.
- [ ] Spec status is `APPROVED`.
- [ ] Scripts pass local smoke validation.

## Deliverable
Generate `docs/output/delivery/<feature>-handoff.md` containing:
- Recommended branch name (e.g., `perf/payment-gateway-load`).
- The exact segmented `git add` and `git commit` terminal commands.
- A proposed Pull Request description template summarizing thresholds and metrics tested.
