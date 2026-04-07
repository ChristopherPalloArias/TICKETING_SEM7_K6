# Requirements

This directory stores the raw business requirements and technical challenges that initialize the Agent Spec-Driven Development (ASDD) framework for performance load testing.

## Folder Purpose
The purpose of this folder is to formalize unstructured challenge inputs (e.g., from emails, PDFs, or user stories) into a structured markdown document. This document acts as the single source of truth that the AI agents (like `@Spec Generator`) consume to design the technical architecture of the performance tests.

## What is `requirement-template.md`?
It is the master structural template for capturing performance requirements. It forces strict categorization of the challenge—separating confirmed facts from candidate assumptions—to ensure that the AI agents generate safe, conservative load testing specifications without inventing or hallucinating metrics.

## How the Gemini Gem Should Use It
The Gemini Gem (or any external prompt chain) must read the `requirement-template.md` as its primary system knowledge. When resolving a user's performance challenge, the Gem should duplicate the structure of this template exactly, populating the sections with the user's provided context and using `[Not provided]` for any missing information.

## Supported Challenges
This framework and template are designed to support a wide range of k6 performance engineering tasks:
- **Smoke Testing:** Verifying basic system availability and test script correctness under minimal load.
- **Load Testing:** Assessing system behavior under expected normal peak traffic.
- **Stress Testing:** Pushing the system beyond normal limits to find breaking points.
- **Spike Testing:** Evaluating survival and recovery during sudden, massive traffic surges.
- **Soak/Endurance Testing:** Checking for memory leaks and degradation over prolonged periods.
- **API/Web Performance:** Validating HTTP/REST, GraphQL, or web communication latencies.

## Rules for Writing Requirements
When generating a new requirement file, adhere strictly to these rules:
- **Conservative Generation:** Never write or invent logic that wasn't explicitly provided by the user.
- **No Fake Thresholds:** Never invent Service Level Objectives (SLOs) or thresholds (e.g., `p(95) < 200ms`) if they weren't explicitly mandated.
- **Use Placeholders:** Use `[Not provided]` whenever data is missing. Do not guess.
- **Separate Scope:** Clearly distinguish between the explicitly confirmed scope and the implied "candidate" scope that needs validation.
- **Separate Expectations:** Clearly distinguish between confirmed thresholds and candidate thresholds.

## Recommended Flow
The complete ASDD lifecycle for a performance challenge follows this sequence:
1. **Challenge Input:** Receive the raw prompt or document from the user.
2. **Requirement Generation:** Format the input using the `requirement-template.md` and save it to `.github/requirements/`.
3. **Spec Generation:** Run `/generate-spec` to translate the requirement into a technical spec.
4. **Approval:** The user reviews and changes the spec status to `APPROVED`.
5. **QA/Analysis:** Run the QA/Risk/Performance analyzers (e.g., `/performance-analyzer`) to map out the execution logic.
6. **k6 Asset Generation:** Run `/implement-k6-assets` to build configs, helpers, and thresholds in `k6/`.
7. **k6 Script Generation:** Run `/implement-k6-script` to orchestrate the load scenarios in `k6/scenarios/`.
8. **Final README Generation:** Output the final framework usage guide pointing to the scripts.

## Naming Guidance for Requirement Files
Name requirement files using lowercase `kebab-case`, clearly describing the challenge.
- **Valid:** `auth-api-spike-challenge.md`, `payment-gateway-load.md`
- **Invalid:** `Requirement1.md`, `k6_test_new.md`

## Example Usage
Once generated, the file should be saved in this directory:
`./.github/requirements/auth-api-spike-challenge.md`

The orchestrator then proceeds to parse this file to initiate the rest of the k6 ASDD lifecycle.
