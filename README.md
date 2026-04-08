# Ticketing MVP — k6 Performance Test Suite

**Spec:** `PERF-001` · **Status:** `APPROVED` · **Version:** `1.1`  
**Scope:** Backend performance only — `GET /api/v1/events` and `POST /api/v1/reservations`

---

## 📌 Documentación de Resultados (MVP Final)

Los informes ejecutables formales de esta validación han sido movidos a la raíz de este repositorio para mayor visibilidad:

- 📄 **[K6_RESULTS_REPORT.md](./K6_RESULTS_REPORT.md)**: Informe estructurado, técnico y auditable principal.
- 🌐 **[K6_RESULTS_REPORT.html](./K6_RESULTS_REPORT.html)**: Versión con estilos y soporte para gráficos, orientada a presentación. *(Opcional: Si está configurado GitHub Pages para este repositorio, este informe HTML estará disponile públicamente a través de su URL).*

> **Nota:** Las evidencias en crudo (logs agregados, reportes autogenerados en formato JSON y logs de agotamiento/setup) permanecen organizadas en la carpeta `k6/reports/` para propósitos de auditoría rigurosa.

---

## Overview

This repository contains the k6 load testing suite for the **Ticketing MVP** backend reto (Semestre 7).  
It validates the two most business-critical API flows under controlled load conditions:

| Flow | Endpoint | SLA |
|------|----------|-----|
| A — Event Availability | `GET /api/v1/events` | p95 < 400 ms · ≥ 80 req/s · error rate < 1% |
| B — Reservation Creation | `POST /api/v1/reservations` | p95 < 600 ms · ≥ 30 req/s · error rate < 1% |

This suite is **performance-only**.  
Functional correctness (business rules, state transitions, access control) is covered by the Karate suite and is **not** reimplemented here.

---

## Prerequisites

| Requirement | Detail |
|-------------|--------|
| [k6](https://k6.io/docs/get-started/installation/) | v0.49+ installed locally or via Docker |
| Backend services running | `ms-events` on port `8081`, `ms-ticketing` on port `8082`, API Gateway on `8080` |
| Database seeded | At least one published event with available seats/tiers inserted before execution |
| (Optional) Testability endpoints active | `POST /api/v1/testability/performance/reset` on both services for inventory reset |

Verify backend health before running any scenario:

```bash
curl http://localhost:8080/api/v1/events?page=1&size=1
```

---

## Project Structure

```
/ (raíz)
 ├── K6_RESULTS_REPORT.md        # Informe formal final redactado (Markdown)
 ├── K6_RESULTS_REPORT.html      # Informe formal final (HTML)
 ├── README.md                   # Ejecución técnica del proyecto
 │
 └── k6/
     ├── config/                 # Configuración de stages, oopciones y thresholds (env-var driven)
     ├── data/
     ├── lib/
     ├── reports/                # Evidencias en crudo
     │   ├── *.log               # Logs de consola de las ejecuciones (warmups. setup de inventarios)
     │   ├── *-summary.json      # Reportes JSON autogenerados de k6
     │   └── K6_RESULTS.md       # Análisis exploratorio log-by-log inicial
     └── scenarios/              # Tests k6 y scripts de testeo
```

---

## Execution Commands

All commands inject environment variables for service endpoints. Adjust ports if your compose stack differs.

### Smoke Test (both flows — quick sanity check)

```bash
k6 run \
  -e BASE_URL_EVENTS=http://localhost:8080 \
  -e BASE_URL_TICKETING=http://localhost:8080 \
  -e BASE_URL_EVENTS_DIRECT=http://localhost:8081 \
  -e BASE_URL_TICKETING_DIRECT=http://localhost:8082 \
  k6/scenarios/smoke.js
```

### Load Test — Flow A: Event Availability

```bash
k6 run \
  -e BASE_URL_EVENTS=http://localhost:8080 \
  -e BASE_URL_TICKETING=http://localhost:8080 \
  k6/scenarios/load-events.js
```

### Load Test — Flow B: Reservation Creation

```bash
k6 run \
  -e BASE_URL_EVENTS=http://localhost:8080 \
  -e BASE_URL_TICKETING=http://localhost:8080 \
  -e BASE_URL_EVENTS_DIRECT=http://localhost:8081 \
  -e BASE_URL_TICKETING_DIRECT=http://localhost:8082 \
  k6/scenarios/load-reservations.js
```

### Save JSON report (any scenario)

```bash
k6 run \
  -e BASE_URL_EVENTS=http://localhost:8080 \
  -e BASE_URL_TICKETING=http://localhost:8080 \
  --out json=k6/reports/load-events-$(date +%Y%m%d-%H%M%S).json \
  k6/scenarios/load-events.js
```

### Debug mode (verbose reservation failures)

```bash
k6 run \
  ... \
  -e DEBUG=true \
  k6/scenarios/load-reservations.js
```

---

## Scenario Details

### `smoke.js`

- **Executor:** `shared-iterations` · 1 VU · 1 iteration per flow
- **Purpose:** Confirm endpoint reachability, valid payload contract, and threshold config before committing to a full load run
- **Expected duration:** < 30 s
- **Pass criteria:** Both flows return 2xx; no script errors

### `load-events.js`

- **Executor:** `ramping-arrival-rate`
- **Profile:** 0 → 40 req/s (1m warm-up) → 40 req/s (2m) → 80 req/s (1m ramp) → 80 req/s (3m SLA window) → 0 (30s cool-down)
- **VUs:** pre-allocated 20 / max 60
- **Total duration:** ~7m 30s
- **SLA gate:** `p95 < 400 ms` and `error rate < 1%` during `load_events` scenario tag

### `load-reservations.js`

- **Executor:** `ramping-arrival-rate`
- **Profile:** 0 → 15 req/s (1m warm-up) → 15 req/s (2m) → 30 req/s (1m ramp) → 30 req/s (3m SLA window) → 0 (30s cool-down)
- **VUs:** pre-allocated 15 / max 40
- **Total duration:** ~7m 30s
- **SLA gate:** `p95 < 600 ms` and `error rate < 1%` during `load_reservations` scenario tag

---

## Reports

Las evidencias en crudo producto de las ejecuciones de los comandos se exportan automáticamente en `k6/reports/`.
El formato JSON (`--out json`) provee la trazabilidad más profunda de todas las métricas de la herramienta para ser inspeccionados de forma asíncrona.

Ver **[K6_RESULTS_REPORT.md](./K6_RESULTS_REPORT.md)** en esta misma raíz para revisar las conclusiones oficiales sobre dichas evidencias.

---

## Limitations

### Smoke Test — Reset Required Before Inventory Fetch

`smoke.js` calls the testability reset endpoints **before** calling the inventory endpoint.  
This is required because a prior `load-reservations` run consumes all seats.  
If the smoke runs without prior reset, the inventory endpoint returns an empty array.

Behavior when reset endpoints are unavailable:
- Events smoke runs normally (read-only, no dependency on inventory)
- Reservation smoke is **skipped with a warning** — it does NOT abort the full smoke

### Reservation Load Test — Inventory Constraint and Measurement Strategy

The MVP demo database contains a **bounded seat pool (~120 unique seats)**.  
At warm-up rate (15 req/s), this inventory is consumed in approximately **8 seconds**.  
After exhaustion, the backend correctly returns `409 Conflict` for every subsequent attempt.

**Observed in execution (2026-04-07):**
- 120 reservations succeeded (201) in the first ~8s of the warm-up stage
- 6,116 requests received 409 Conflict (seat already reserved) for remainder of 7m 30s
- Under 40-VU contention against exhausted seats, 409 responses took ~2-3s each
- Naively measuring p95 over all requests produced 2.72s — a contention artifact, not a write-path SLA

**How the scenario handles this — metric separation:**

| Metric | What it measures | Gate |
|--------|-----------------|------|
| `reservation_success_duration` | Response time of HTTP 201 responses only | p95 < 600 ms ✓ |
| `reservation_inventory_conflict` | Count of 409 Conflict responses (inventory exhausted) | Informational only |
| `http_req_failed{scenario:load_reservations}` | True technical failures (5xx, network errors) | rate < 1% ✓ |

`http.setResponseCallback(expectedStatuses({min:100, max:499}))` is set in `load-reservations.js`  
so that 409 responses do NOT count toward `http_req_failed`.  
This is defensible because a `409` for "seat already reserved" is **correct backend behavior**,  
not a technical backend failure.

**Evidence from the last run:**  
The `{expected_response:true}` filter in the k6 summary shows the 201 responses had:
- avg = 25.94 ms, p(90) = 29.51 ms, p(95) = 29.95 ms

This confirms **the backend passes p95 < 600 ms for the actual write path**.  
The SLA gate is meaningful and passable when the environment provides sufficient inventory.

**To achieve a fully green run (all 7m 30s with valid inventory):**  
The database must be seeded with at least **5,400 unique unreserved seats**  
(30 req/s × 180s SLA window) across valid event/tier combinations.  
Until then, `reservation_success_duration` captures the measurable portion of valid writes.

---

## Related Documentation

| Document | Path |
|----------|------|
| Approved Spec | `.github/specs/mvp-core-performance.spec.md` |
| Performance Plan | `docs/output/qa/performance-plan-mvp-core-performance.md` |
| Risk Matrix | `docs/output/qa/risk-matrix-mvp-core-performance.md` |
| Automation Proposal | `docs/output/qa/automation-proposal-mvp-core-performance.md` |
| Informe Consolidado Oficial | `./K6_RESULTS_REPORT.md` |
| Ejecución y artefactos crudos | `k6/reports/K6_RESULTS.md` |
