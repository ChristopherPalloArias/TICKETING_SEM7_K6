---
name: generate-project-readme
description: Generates or updates the root README.md for the k6 performance testing project, applying an elegant, technical, challenge-delivery style based entirely on verified repository evidence with index and collapsible details.
argument-hint: "<feature-name | optional scope>"
---

# Skill: Generate Project README

## Purpose
The `generate-project-readme` skill generates or updates ONLY the root `README.md` for this k6 performance testing repository. Its objective is to produce a highly polished, technical, and professional deliverable that strictly follows the author's preferred presentation style, integrates clean navigation, and remains 100% evidence-driven.

## Core Rules & Constraints
1. **Target File Only:** Generate or update ONLY the root `README.md`. Do NOT modify `.github/README.md`, methodology files, requirement files, spec files, or any runtime code under `k6/`.
2. **Strict Evidence Rule:** You must NEVER invent performance results, execution evidence, thresholds, scenarios, supported environments, CI/CD pipelines, dashboards, or report publication mechanisms. Document ONLY what is explicitly backed by repository content.
3. **No Fabrication:** Do not claim that a scenario is implemented, executable, or validated unless it truly exists in the repository. Do not convert planned performance tests into completed ones.
4. **No Generic Boilerplate:** The README must describe the actual repository, not a generic k6 tutorial. If the repository is still a scaffold, state that honestly.
5. **Format Cleanliness:** Strict markdown hygiene is mandatory:
   - No stray triple backticks
   - No broken or duplicated sections
   - No dangling fences after command blocks
   - No malformed HTML blocks
6. **Language & Tone:** English only. The style must feel like a polished technical submission, not marketing copy.
7. **Repository Awareness:** If a required section lacks evidence, omit the unsupported detail or phrase it conservatively.

## Inputs and Information Sources
Read and consolidate information strictly from verified repository evidence, including:
- `.github/requirements/*.md`
- `.github/specs/*.spec.md`
- QA / analysis artifacts if they exist (for example under `docs/output/qa/`)
- `k6/config/**/*.js`
- `k6/lib/**/*.js`
- `k6/scenarios/**/*.js`
- `k6/data/**/*`
- `k6/reports/**/*`
- existing root `README.md`

If a file or artifact does not exist, do not compensate by inventing its contents.

## Author Preferences & Style
- **Identity Defaults:** Unless the repository explicitly defines a different author, use:
  - **Author:** Christopher Ismael Pallo Arias
  - **Contact:** 0995312828
  - **Email:** christopherpallo2000@gmail.com
- **Header:** Include a centered visual header (`<div align="center">`) with:
  - strong project title with emoji
  - short subtitle
  - author/contact block
  - short descriptor
  - grouped technology stack icons
- **Technology Stack Icons:** Use `skillicons.dev` grouped blocks where possible. Prefer grouped icon rendering instead of one-image-per-tech. Use the closest conservative icon match for the real stack.
- **Preferred Presentation Style:** The README should feel like a delivery-ready technical artifact, similar in polish and hierarchy to the author's preferred project README style.
- **Collapsible Details:** Use HTML `<details>` and `<summary>` blocks for long lists, scenario breakdowns, environment variable inventories, thresholds, execution variants, or verbose evidence sections.
- **Table of Contents:** Always include a clean index near the top.

## README Structure Required
The generated root `README.md` MUST follow this exact order.

### 1. Centered Header
Wrapped in `<div align="center">`.

Must include:
- **Project Title** with emoji
- **Subtitle / Context**
- **Author / Contact / Email**
- **Short project descriptor**
- **Grouped technology stack icons**

Suggested style pattern:
- title
- subtitle
- author/contact/email
- one short italic descriptor
- grouped stack sections

### 2. Table of Contents
Title:
`## 📋 Table of Contents`

Must contain concise anchor links to the main sections actually present in the README.

### 3. Challenge Context / Overview
Title:
`## 🎯 Challenge Context / Overview`

Explain:
- what this repository is
- the purpose of the k6 performance testing project/template
- whether it is a real implementation, a partially implemented scaffold, or a reusable framework
- the intended ASDD / specification-driven workflow if supported by repo evidence

Do not rewrite methodology docs. Summarize only what the repo proves.

### 4. Environment and Prerequisites (Compatibility)
Title:
`## 🛠️ Environment and Prerequisites (Compatibility)`

Document only verified prerequisites, such as:
- k6 version if pinned or evidenced
- runtime requirements if truly needed
- verification commands such as `k6 version`
- any real repository-specific setup constraints

Prefer a markdown table.

Do NOT invent Java, Maven, Node, Docker, or CI dependencies unless the repo explicitly requires them.

### 5. Implemented Scope / Coverage
Title:
`## 🔍 Implemented Scope / Coverage`

Provide a top-level summary table of the implemented or scaffolded performance scenarios, based only on actual files and actual repository evidence.

This section must clearly distinguish between:
- **implemented executable scenarios**
- **planned / documented but not yet implemented scenarios**
- **analysis-only artifacts**
- **scaffold placeholders**

If the repository contains only generic starter scripts, say so honestly.

Use `<details>` blocks for expanded scenario breakdowns.

### 6. Project Structure
Title:
`## 📂 Project Structure`

Use a code-block tree and include only meaningful folders/files, such as:
- `.github/requirements/`
- `.github/specs/`
- `k6/config/`
- `k6/lib/`
- `k6/scenarios/`
- `k6/data/`
- `k6/reports/`

Do not include fake or non-existent files.

### 7. Configuration Notes
Title:
`## ⚙️ Configuration Notes`

Summarize the real repository behavior, such as:
- `__ENV` usage
- environment resolution
- options composition
- thresholds organization
- HTTP client wrappers
- checks helpers
- test data reuse
- scenario orchestration model

Base everything on `k6/config/`, `k6/lib/`, and `k6/scenarios/`.

### 8. Clone and Setup Instructions
Title:
`## ⚡ Clone and Setup Instructions`

Must be lightweight and realistic.
Typical examples are:
- `git clone`
- `cd`
- minimal prerequisite verification
- installation only if truly needed

Do not add unrelated setup steps.

### 9. Execution and Report Generation
Title:
`## ▶️ Execution and Report Generation`

Document only commands that make sense for the current repository state.

Examples may include:
- `k6 run k6/scenarios/<script>.js`
- environment variable examples using `-e`
- output/report flags only if the repo supports them or documents them

Document report locations only if they truly exist or are intentionally scaffolded.

Use collapsible blocks if the command list is long.

### 10. Observed Execution / Performance Notes
Title:
`## 📡 Observed Execution / Performance Notes`

Use this section only for evidence-backed observations, such as:
- actual mock/scaffold limitations
- known repository execution assumptions
- observed behavior already documented in artifacts
- lack of real execution evidence, if applicable

Do NOT invent latency, p95, throughput, or success-rate results.

If there is no execution evidence yet, explicitly say that the repository contains the framework structure but not validated benchmark results.

### 11. Evidence / Deliverables
Title:
`## 📊 Evidence / Deliverables`

Include this only if supported by repository evidence.

Examples:
- spec files
- requirement files
- QA analysis outputs
- scenario scripts
- thresholds definitions
- report artifacts
- delivery documentation

Use `<details>` blocks if the list is long.

### 12. Limitations / Notes
Title:
`## ⚠️ Limitations / Notes`

Document any proven constraints, such as:
- scaffold-only state
- missing CI/CD
- no published dashboard
- no hosted reports
- generic thresholds pending real calibration
- incomplete scenario coverage
- repository being a base template rather than a finished test suite

## Required README Style Details
The generated README should reflect these presentation preferences whenever supported by evidence:

- Centered professional header
- Strong section hierarchy
- Elegant technical tone
- Technology stack rendered visually
- Clear execution instructions
- Clean tables for compatibility / scope
- `<details>` blocks for verbose sections
- A visible table of contents near the start

## Invocation Parameters
Trigger this skill with:
`/generate-project-readme <feature-name>`

Examples:
- `/generate-project-readme payment-api-load`
- `/generate-project-readme checkout-spike-test`

If no feature name is provided, the skill may update the root README based on the repository's current general state.

## Post Actions (Expected Response After Update)
Upon completion, return a short summary showing:
1. exact modified files
2. whether any additional files were touched (must be NO unless explicitly justified by the user)
3. a short summary of the README improvements applied
4. any remaining repository limitations or missing evidence discovered