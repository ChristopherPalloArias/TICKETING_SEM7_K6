# Copilot Instructions

## ASDD Workflow (Agent Spec-Driven Development)

This repository follows the **ASDD** flow: all functionality is executed across distinct phases orchestrated by specialized agents.

```
[Orchestrator] → [Spec Generator] → [QA & Performance] → [Doc]
```

### Flow Phases
1. **Spec**: The `spec-generator` agent parses requirements into `.github/specs/<feature>.spec.md`.
2. **QA & Script**: `qa-agent` plans the test strategy, maps risks, and executes `/implement-k6-assets` and `/implement-k6-script` to prepare automation tests.
3. **Doc (Optional)**: `documentation-agent` updates the primary technical `.md` artifacts.

### Available Skills (slash commands):
- `/asdd-orchestrate` — Executes full ASDD flow and tracks state.
- `/generate-spec` — Generates a technical spec under `.github/specs/`.
- `/gherkin-case-generator` — Generates Given-When-Then + load scenarios.
- `/risk-identifier` — Classifies application risks.
- `/automation-flow-proposer` — Proposes automation workflows and ROI.
- `/performance-analyzer` — Generates k6 testing SLA analysis matrices.
- `/generate-project-readme` — Updates the project README framework documentation.
- `/implement-k6-assets` — Generates thresholds/options/data under `k6/`.
- `/implement-k6-script` — Generates final runner code under `k6/scenarios/`.

### Requirements and Specs
- Business requirements live in `.github/requirements/`. These initiate the pipeline.
- Technical specifications live in `.github/specs/`. Each spec is a single source of truth for its implementation iteration.
- A requirement (`.md`) requires the `/generate-spec` process mapping its transition to `APPROVED` before ANY code is touched.

---

## ASDD File Map

### Agents
| Agent | Phase | Path |
|---|---|---|
| Orchestrator | Entry | `.github/agents/orchestrator.agent.md` |
| Spec Generator | Phase 1 | `.github/agents/spec-generator.agent.md` |
| QA Agent | Phase 2 | `.github/agents/qa.agent.md` |
| Documentation Agent | Phase 3 | `.github/agents/documentation.agent.md` |
| Automation Flow Proposer | Phase 2 | `.github/agents/automation-flow-proposer.agent.md` |
| Gherkin Case Generator | Phase 2 | `.github/agents/gherkin-case-generator.agent.md` |
| Git Delivery Handoff | Phase 4 | `.github/agents/git-delivery-handoff.agent.md` |
| Implement K6 Assets | Phase 3 | `.github/agents/implement-k6-assets.agent.md` |
| Implement K6 Script | Phase 3 | `.github/agents/implement-k6-script.agent.md` |
| Performance Analyzer | Phase 2 | `.github/agents/performance-analyzer.agent.md` |
| Risk Identifier | Phase 2 | `.github/agents/risk-identifier.agent.md` |

### Path-scoped Instructions
| Scope | Path | Applies to |
|---|---|---|
| k6 Performance Automation | `.github/instructions/k6.instructions.md` | `k6/**/*.js` · `k6/**/*.json` |

### Context and Guidelines
| Document | Path |
|---|---|
| Dev/Code Guidelines | `.github/docs/lineamientos/dev-guidelines.md` |
| QA Guidelines | `.github/docs/lineamientos/qa-guidelines.md` |

### Global Agent Directives
- **Golden Rules**: Enforced universally under `.github/AGENTS.md`. No modifications can violate them.
- **Active specs**: Always reference `.github/specs/` before building scripts.

---

## Domain Dictionary

Canonical terms utilized by the repository during specs, scripts, or messages:

| Term | Concept | Rejected Synonyms |
|---------|-----------|---------------------|
| **User** | Interacting authenticated client | Client, Persona |
| **Duration** | The time a test runs | Wait time |
| **VUs** | Virtual Users (threads) for the load test | Users, Threads, Connections |
| **Threshold** | SLAs that pass or fail a k6 script check | Limits, Assertions, Bounds |
| **Scenario** | Complex load sequence configured within k6 | Script, Routine |
| **Stage** | A ramp-up or ramp-down configuration point | Point |

---

## Project Overview

> See `README.md` in the project root folder.
