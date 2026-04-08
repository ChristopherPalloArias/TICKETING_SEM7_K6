# ASDD — Agent Spec-Driven Development

**ASDD** (Agent Spec Software Development) is an AI-assisted development framework that orchestrates software tasks into various phases controlled by specialized agents, with a focus on k6 performance testing in this repository.

```
Requirement → API Spec → QA & Analysis → k6 Automation → Doc (optional)
```

> This guide covers usage with **GitHub Copilot Chat** in VS Code.

---

## Requirements

| Requirement | Detail |
|---|---|
| VS Code | Any recent version |
| GitHub Copilot Chat | Extension installed and active |
| Setting enabled | `github.copilot.chat.codeGeneration.useInstructionFiles: true` |

The `.vscode/settings.json` file configures auto-discovery. If missing, create it pointing to `.github/`.

---

## Onboarding

When scaffolding a new repository, fill out these files **in order** before using agents:

| # | File | What to write |
|---|---------|-------------|
| 1 | `README.md` (root) | Describe target workloads and API scope |
| 2 | `copilot-instructions.md` | Business terms, definitions, parameters |
| 3 | `copilot-instructions.md` | DoR and DoD criteria for the team |

---

## The ASDD Flow

### Step 1 — Spec

Always generate the technical specification first:

```
@Spec Generator generate the spec for: [your requirement]
```
```
/generate-spec <feature-name>
```

The agent validates the requirement from `.github/requirements/` and outputs `specs/<feature>.spec.md` with a `DRAFT` status. Review and change to `APPROVED` before continuing.

---

### Step 2 — QA & Automation

With an `APPROVED` spec, trigger the automation suite:

```
@QA Agent execute QA and performance generation for specs/<feature>.spec.md
```

The agent will output BDD behaviors, risk matrices, and ultimately use `/implement-k6-assets` and `/implement-k6-script` to write executable load tests.

---

### Step 3 — Documentation *(Optional)*

When the scripts are ready and verified:

```
@Documentation Agent document the feature specs/<feature>.spec.md
```

---

### Full Orchestration

```
@Orchestrator run the complete flow for: [your requirement]
```
```
/asdd-orchestrate <feature-name>
```

---

## Available Agents (`@name` in Copilot Chat)

| Agent | Phase | Purpose |
|---|---|---|
| `@Orchestrator` | Entry | Coordinate the full flow (`/asdd-orchestrate status`) |
| `@Spec Generator` | Phase 1 | Validate requirement and generate tech spec |
| `@QA Agent` | Phase 2 | Gherkin, risks, and k6 automation assets |
| `@Documentation Agent` | Phase 3 | Update root README and docs |
| `@Automation Flow Proposer` | Phase 2 | ROI load automation roadmap QA |
| `@Gherkin Case Generator` | Phase 2 | Gherkin BDD behaviors for k6 execution |
| `@Git Delivery Handoff` | Phase 4 | Delivery logic and packaging |
| `@Implement K6 Assets` | Phase 3 | Foundational k6 configs, data, helpers |
| `@Implement K6 Script` | Phase 3 | Executable k6 load scenarios |
| `@Performance Analyzer` | Phase 2 | Performance CoE specialist tracking SLAs |
| `@Risk Identifier` | Phase 2 | Systemic performance bottleneck checks |

---

## Path-based Instructions

Injected automatically by Copilot when active file matches:

| Active file | instruction |
|---|---|
| `k6/**/*.js` | `instructions/k6.instructions.md` |
| `k6/**/*.json` | `instructions/k6.instructions.md` |

---

## Guidelines Reference

Loaded by agents as needed:

| Document | Content |
|---|---|
| `.github/docs/lineamientos/dev-guidelines.md` | Clean Code, SOLID, Performance conventions |
| `.github/docs/lineamientos/qa-guidelines.md` | QA strategy, Risks, Performance testing |
| `.github/docs/lineamientos/guidelines.md` | Quick reference standards |

---

## Folder Structure

```
Project Root/
│
├── docs/output/                     ← agent-generated artifacts
│   ├── qa/                          ← Gherkin, risks, test strategies
│   └── performance/                 ← Execution reports
│
├── k6/                              ← Execution logic
│   ├── config/                      ← options, env, thresholds
│   ├── lib/                         ← http clients, helpers, checks
│   ├── data/                        ← scenario test data
│   └── scenarios/                   ← actual k6 load scripts
│
└── .github/                         ← Copilot framework (self-contained)
```

## Golden Rules
1. **No code without approved spec** — `specs/<feature>.spec.md` must exist and be `APPROVED`.
2. **No unauthorized code** — agents must follow explicit commands.
3. **No assumptions** — ask before acting if requirements lack metrics or RPS targets.
4. **Transparency** — explain logic and thresholds before writing `k6` code.
