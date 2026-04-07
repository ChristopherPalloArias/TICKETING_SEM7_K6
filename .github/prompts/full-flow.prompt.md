---
description: 'Orchestrates the full ASDD flow: Spec -> QA & Perf -> DOC'
agent: Orchestrator
---

Initiate the full ASDD flow.

**Feature**: ${input:featureName:feature name in kebab-case}
**Requirement**: ${input:requirement:functional description of the performance feature}

**The @Orchestrator automatically executes:**

1. **[PHASE 1 - Sequential]** `Spec Generator` -> generates `.github/specs/${input:featureName}.spec.md`
2. **[PHASE 2 & 3 - Sequential]** on approved spec:
   - `QA Agent` -> strategy, risks, and executes `/implement-k6-assets` followed by `/implement-k6-script`
3. **[PHASE 4 - Optional]** `Documentation Agent` -> if requested

**The requirement can also be found in** `.github/requirements/`.
