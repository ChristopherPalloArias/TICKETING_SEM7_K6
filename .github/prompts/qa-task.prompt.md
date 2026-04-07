---
description: 'Executes the QA Agent sequence to generate quality plans and k6 automation scripts based on the approved spec.'
agent: QA Agent
---

Run the QA Agent.

**Feature**: ${input:featureName:feature name in kebab-case}

**Instructions for @QA Agent:**

1. Read `.github/docs/lineamientos/qa-guidelines.md`
2. Read the spec in `.github/specs/${input:featureName}.spec.md`
3. Execute the skills to implement k6 assets and scripts.
4. Generate a consolidated report at the end.

**Prerequisite:** `.github/specs/${input:featureName}.spec.md` must exist with APPROVED status.
