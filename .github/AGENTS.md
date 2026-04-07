# AGENTS.md — ASDD Project

> Canonical shared version: this file is the source of truth for shared agent guidelines.

This file defines general guidance for all AI agents working in this repository, following the **ASDD (Agent Spec-Driven Development)** workflow.

## Project Summary

> See `README.md` at the project root for automation stack and project architecture.
> See `.github/README.md` for the full ASDD framework structure.

## ASDD Workflow

**Every new performance feature must follow this pipeline:**

```
[PHASE 1 — Sequential]
spec-generator    → /generate-spec      → .github/specs/<feature>.spec.md

[PHASE 2 — Sequential]
qa-agent          → /gherkin-case-generator, /risk-identifier, /performance-analyzer

[PHASE 3 — Sequential]
qa-agent          → /implement-k6-assets, /implement-k6-script

[PHASE 4 — Optional]
documentation-agent → /generate-project-readme → README, API docs, ADRs
```

## Agent Skills (slash commands)

Skills are portable instruction sets invokable as `/command` in Copilot Chat. They work across VS Code, GitHub Copilot CLI, and Copilot coding agent.

### ASDD Core
| Skill | Slash Command | Description |
|-------|---------------|-------------|
| asdd-orchestrate | `/asdd-orchestrate` | Orchestrates the full ASDD flow or checks status |
| generate-spec | `/generate-spec` | Generates technical spec in `.github/specs/` |

### QA & Analysis
| Skill | Slash Command | Description |
|-------|---------------|-------------|
| gherkin-case-generator | `/gherkin-case-generator` | Generates Given-When-Then cases + test data |
| risk-identifier | `/risk-identifier` | Classifies risks using High/Medium/Low matrix |
| automation-flow-proposer | `/automation-flow-proposer` | Proposes testing flows and framework ROI |
| performance-analyzer | `/performance-analyzer` | Plans and analyzes performance tests |

### k6 Performance Automation
| Skill | Slash Command | Description |
|-------|---------------|-------------|
| implement-k6-assets | `/implement-k6-assets` | Generates reusable assets (config/payloads/lib) from spec |
| implement-k6-script | `/implement-k6-script` | Generates k6 script for smoke/load/stress from spec |

### Documentation
| Skill | Slash Command | Description |
|-------|---------------|-------------|
| generate-project-readme | `/generate-project-readme` | Generates or updates main README.md |
| git-delivery-handoff | `/git-delivery-handoff` | Generates standardized commit and PR messages |

## Guidelines and Context

Agents must load these files as a **first step** before generating any code:

| Document | Path | Agents |
|---|---|---|
| Dev Guidelines | `.github/docs/lineamientos/dev-guidelines.md` | All |
| QA Guidelines | `.github/docs/lineamientos/qa-guidelines.md` | QA Agent |
| Golden Rules | `.github/AGENTS.md` | All (always active) |
| Definition of Done | `.github/copilot-instructions.md` | QA Agent, Orchestrator |
| Definition of Ready | `.github/copilot-instructions.md` | Spec Generator, Orchestrator |

---

## Golden Rules

> Guiding Principle: All AI contributions must be safe, transparent, purposeful, and aligned with explicit user instructions.

### I. Code and System Integrity
- **No unauthorized code**: Do not write, generate, or suggest new code unless explicitly requested.
- **No unauthorized modifications**: Do not modify, refactor, or delete existing code, files, or structures without explicit approval.
- **Preserve existing logic**: Respect architectural patterns, coding styles, and project operational logic.

### II. Requirement Clarification
- **Mandatory clarification**: If the request is ambiguous, incomplete, or unclear, stop and ask for clarification.
- **No assumptions**: Base all actions strictly on explicit information provided by the user.

### III. Operational Transparency
- **Explain before acting**: Before any action, explain what will be done and possible implications.
- **Stop on uncertainty**: If uncertain or in conflict with these rules, stop and consult the user.
- **Purpose-driven actions**: Each action must be directly relevant to the explicit request.

---

## Inputs to ASDD Pipeline

| Type | Directory | Description |
|------|-----------|-------------|
| Business requirements | `.github/requirements/` | Input: functional feature description |
| Technical specifications | `.github/specs/` | Spec Generator output, truth source |

## Critical Rules for All Agents

1. **No implementation without a spec.** Always check `.github/specs/` first.
2. **Never commit secrets** — `.env` and API keys must be gitignored.

## Integration Notes
> See `README.md` at the project root for execution details.
