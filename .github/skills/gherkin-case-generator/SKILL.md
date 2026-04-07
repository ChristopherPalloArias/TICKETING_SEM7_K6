---
name: gherkin-case-generator
description: Maps performance scenarios into business-readable Given/When/Then formats for QA planning and documentation.
argument-hint: "<feature-name>"
---

# `gherkin-case-generator` [QA]

## Purpose
Translates performance technical specs into business-readable Gherkin (Given/When/Then) syntax. 

**CRITICAL CLARIFICATION:** In this k6 template, Gherkin is used strictly for QA planning, business agreement, and behavioral documentation. It does **NOT** generate executable k6 scripts natively. It maps performance expectations so non-technical stakeholders understand the test mechanics.

## Process & Flow Identification
1. Locate the approved spec in `.github/specs/`.
2. Map the scenario types (Smoke, Load, Stress, Spike).
3. Identify preconditions (Environments, Data feeds, Auth).
4. Outline the exact threshold validations in the `Then` clauses.

## Performance-Oriented Gherkin Example
```gherkin
Feature: API Load Capacity under Daily Peak Traffic

  @load-test @critical
  Scenario: Sustained 100 VU load over 5 minutes
    Given the environment target is "STAGING"
    And a pool of 500 valid synthesized user credentials
    When the system ramps up to 100 Virtual Users over 30 seconds
    And sustains the load for 4 minutes
    Then the 95th percentile response time must be < 500ms
    And the HTTP error rate must be < 1%
```

## Test Data & Environment Notes
Use the Gherkin planning explicitly to call out data prerequisites. Use scenario outlines to iterate different expected loads or targets.

## Rules
- Keep the language business-centric; avoid hardcoding raw JS or k6 internals here.
- Minimum coverage per story: 1 Smoke scenario + 1 Target Performance Scenario (Load/Stress).

## Expected Output
Generate the documentation in `docs/output/qa/<feature>-gherkin.md`.
