---
description: 'Executes the Spec Generator Agent to translate a business requirement into a technical load test specification.'
agent: Spec Generator
---

Run the Spec Generator Agent to create the technical specification for the requirement.

**Feature**: ${input:featureName:feature name in kebab-case}

**Prerequisite:** A requirement must exist in `.github/requirements/${input:featureName}.md` (or provide the text via chat).

**Instructions for @Spec Generator:**

1. Read `.github/docs/lineamientos/dev-guidelines.md`.
2. Read the tech stack: `.github/instructions/k6.instructions.md`.
3. Read the domain dictionary: `.github/copilot-instructions.md`.
4. Generate the spec with mandatory YAML frontmatter.
5. Save in `.github/specs/${input:featureName}.spec.md`.
