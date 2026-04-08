# Test Data Strategy — k6/data

**Specification Reference:** [PERF-001](../../.github/specs/mvp-core-performance.spec.md) Section 5 (Test Data Strategy)

---

## Overview

This directory contains test data configurations for the `mvp-core-performance` k6 scenarios. Test data is organized by flow type:

- **Flow A (Event Availability):** Read-only; uses published events from the environment
- **Flow B (Reservation Creation):** Write-heavy; uses pre-seeded event/tier/seat combinations from `test-data.json`

---

## test-data.json

**Purpose:** Provides a reusable pool of valid event/tier/seat identifiers for reservation creation. Values must be real valid UUIDs (Java/Spring Boot will reject syntactically malformed UUID strings with 400 Bad Request).

**Structure:**
```json
[
  {
    "eventId": "123e4567-e89b-12d3-a456-426614174000",
    "tierId": "123e4567-e89b-12d3-a456-426614174001",
    "seatIds": ["123e4567-e89b-12d3-a456-426614174002"]
  }
]
```

### Configuration Before Execution

**⚠️ CRITICAL:** Before running load tests for `POST /api/v1/reservations`:

1. **Replace placeholder UUIDs** with actual event, tier, and available seat IDs from your database/environment. Random fake UUIDs will result in `404 Event or tier not found` or `400 Bad Request` depending on backend state.
2. **Expand the pool** to match expected load:
   - **Load test target:** 30 TPS 
   - **Peak concurrent reservations:** ~5400 attempts during 3 min SLA window
   - Provide enough distinct valid payload combinations or use identical payloads if backend lock concurrency permits overlapping writes (depends on backend idempotency or block/release seat constraints).

### Inventory Reset Procedure

Reservation endpoints consume/lock `seatIds`. If a test is run twice, the backend may reject the reservation via `409 Conflict` (Seat already locked) unless inventory is replenished or reset.

#### Direct Database Reset (DBA Access)
The most efficient method to reset state for load testing is manipulating the database:
```sql
UPDATE tickets SET status = 'AVAILABLE', reservation_id = null;
UPDATE reservations SET status = 'EXPIRED';
```
*(Exact table structures depend on the schema definition in `ms-ticketing` / `ms-events`)*

---

## Payload Contract Validation

**Validated Against Backend Implementation**
The target backend (`CreateReservationRequest.java` in `ms-ticketing`) mandates these fields:
- `eventId`: UUID
- `tierId`: UUID
- `buyerEmail`: Valid Email Formatted String
- `seatIds`: Array of UUIDs (must have min. size of 1)

**K6 Construction Mapping:**
- Standard fields `eventId`, `tierId`, `seatIds` are piped from `test-data.json`.
- `buyerEmail` is automatically synthesised by k6's `utils.js` dynamically for each iteration to avoid unique-constraint locking (e.g. `buyer-1-352@loadtest.local`).
- Identity Context `X-User-Id` header is globally configured in `env.js`.

---

**Last Updated:** 2026-04-07  
**Spec Version:** PERF-001 v1.1
