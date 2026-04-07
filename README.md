# k6 ASDD Framework Template

This repository provides a foundational Agent Spec-Driven Development (ASDD) structure focused purely on k6 performance and load testing.

## Overview

This repository acts as a generic scaffold. You will not find any hardcoded business implementations, fake claims, or product-specific testing scripts. It is designed to be a clean baseline for bootstrapping new load testing challenges using AI agents.

## Project Structure

- `.github/`: Contains the core ASDD framework instructions, agent prompts, and skills.
- `k6/config/`: Reusable runtime configurations and SLA thresholds.
- `k6/lib/`: Reusable HTTP clients and generic validation checks.
- `k6/data/`: Placeholder JSON schemas and payloads.
- `k6/scenarios/`: The actual executable test cycles (e.g., smoke, load).

## Next Steps

To begin automating tests for a project, utilize the ASDD components in `.github/` to generate your initial specifications based on raw business requirements. Once approved, use the framework agents to generate concrete test scenarios extending the lightweight placeholders located in the `k6/` directories.
