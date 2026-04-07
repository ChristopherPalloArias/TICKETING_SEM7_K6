---
name: asdd-orchestrate
description: Orchestrates the entire K6 ASDD flow sequentially. Enforces the strict DRAFT to APPROVED spec gate. Handles status commands.
argument-hint: "<feature-name> | status"
---

# `asdd-orchestrate`

## Purpose
Orchestrates the end-to-end Agent Spec-Driven Development (ASDD) lifecycle for k6 performance testing. Ensures that no code is generated before a technical spec is explicitly evaluated and approved by a human.

## When to Use It
- To bootstrap a new performance requirement and guide it through the entire pipeline.
- To query the current state of a feature within the pipeline (`/asdd-orchestrate status`).

## The Sequential Flow
1. **Phase 1: Requirement & Spec**
   - Agent locates the raw requirement in `.github/requirements/<feature>.md`.
   - Agent calls `generate-spec` to output `.github/specs/<feature>.spec.md` with status `DRAFT`.
   - **HARD GATE:** The flow pauses here. The user must manually review the file and change the frontmatter to `status: APPROVED` before proceeding.

2. **Phase 2: QA & Analysis**
   - Once `APPROVED`, the agent calls `risk-identifier` to classify bottlenecks.
   - The agent calls `performance-analyzer` to determine scenarios (smoke, load, stress) and baseline SLA thresholds.
   - The agent calls `automation-flow-proposer` to confirm the execution scope.

3. **Phase 3: k6 Implementation**
   - The agent calls `implement-k6-assets` to generate config, data, and helpers in `k6/config/`, `k6/lib/`, and `k6/data/`.
   - The agent calls `implement-k6-script` to orchestrate those assets into executable scenarios in `k6/scenarios/`.

4. **Phase 4: Documentation & Delivery (Optional)**
   - The agent calls `generate-project-readme` to document the completed test suite.
   - The agent calls `git-delivery-handoff` to bundle the work into standard atomic commits.

## Rules
- **Stop-on-Failure:** If any phase fails or lacks input (e.g., missing requirements), halt the process and notify the user with context.
- **No Hallucination:** Never assume an approval. If the file is `DRAFT`, refuse to execute Phase 2 or Phase 3.
- **Status Mode:** If invoked as `/asdd-orchestrate status`, list the progress of all known features inside `.github/specs/`.

## Deliverable
A continuous conversation sequence prompting the user and executing agent components sequentially.
