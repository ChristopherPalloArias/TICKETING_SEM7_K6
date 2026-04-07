---
description: 'Executes the Documentation Agent to generate full technical documentation for the implemented load test feature.'
agent: Documentation Agent
---

Run the Documentation Agent to generate technical documentation for the feature.

**Feature**: ${input:featureName:feature name in kebab-case}

**Instructions for @Documentation Agent:**

1. Read `.github/docs/lineamientos/dev-guidelines.md`
2. Read the approved spec in `.github/specs/${input:featureName}.spec.md`
3. Review the scripts implemented in `k6/`
4. Generate the following deliverables:
   - Update `README.md` with the feature changes
   - Generate preliminary performance report in `docs/output/performance/report/` (if applicable)
5. Present a consolidated report of generated documentation.

**Prerequisite:** `.github/specs/${input:featureName}.spec.md` must exist with APPROVED status and scripts must be implemented.
