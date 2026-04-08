# Informe de Resultados de Rendimiento (K6)
## Sistema de Venta de Entradas — Ticketing MVP

---

# 1. Identificación del informe

| Campo | Detalle |
|---|---|
| **Proyecto** | Sistema de Venta de Entradas para Obras de Teatro |
| **Versión** | MVP v1.0 |
| **Fecha** | 07/04/2026 |
| **Autor / QA** | Christopher Ismael Pallo Arias |
| **Herramienta de Prueba** | k6 |
| **Entorno de Ejecución** | Local (Docker Compose). El tráfico de carga de los escenarios (`load_events`, `load_reservations`) se inyectó a través del API Gateway en el puerto `8080`. Las operaciones de `setup()` — llamadas a los endpoints de `testability/performance/reset` e inventario — se realizaron directamente sobre los puertos de servicio: `ms-events` en `8081` y `ms-ticketing` en `8082`. |

---

# 2. Resumen ejecutivo

El objetivo de esta validación de rendimiento es verificar que los flujos transaccionales críticos del Ticketing MVP operan dentro de los umbrales de latencia y tasa de error definidos en el plan de pruebas, bajo condiciones de carga concurrente. La ejecución abarcó dos flujos: la consulta del catálogo de eventos (`GET /api/v1/events`) y la creación de reservas (`POST /api/v1/reservations`).

El ciclo de ejecución en k6 concluyó con todos los *thresholds* evaluados en estado `pass`. El backend respondió dentro de los límites de latencia establecidos para ambos flujos. En el escenario de reservas, el pool de inventario disponible se agotó durante la ejecución sostenida, generando respuestas `HTTP 409 Conflict` correctas a nivel de lógica de negocio; estas fueron excluidas del cómputo de errores mediante métricas custom y el uso de `setResponseCallback`, de modo que no afectaron el umbral de error rate.

**Conclusión ejecutiva:** Los *thresholds* definidos para p95 de latencia y tasa de error técnico se cumplieron en todos los escenarios. El sistema respondió de forma estable durante la ventana de medición del SLA.

---

# 3. Alcance de K6

Conforme a lo establecido en el plan formal (`TEST_PLAN.md`), este ciclo de rendimiento abarcó exclusivamente:

- **HU-03 (Consulta de disponibilidad):** Evaluación del *read-path* sobre el endpoint `GET /api/v1/events` bajo carga concurrente creciente.
- **HU-04 (Reserva temporal):** Evaluación del *write-path* sobre el endpoint `POST /api/v1/reservations` con contención de inventario bajo carga.

**Delimitación de alcance:** K6 evalúa parámetros no funcionales: latencia, throughput y tasa de error de red. No reemplaza la validación de reglas de negocio, estados transaccionales ni lógica de dominio, que fueron cubiertos en el ciclo funcional mediante Karate.

---

# 4. Criterios y umbrales definidos

Los umbrales de aceptación formales definidos en `TEST_PLAN.md` y configurados en `k6/config/thresholds.js` son:

1. **`GET /api/v1/events` — Escenario `load_events`:**
   - `http_req_duration{scenario:load_events}` p95 < 400 ms
   - `http_req_failed{scenario:load_events}` rate < 1%
   - **Target de llegada configurado:** 80 iteraciones/s (executor `ramping-arrival-rate`, etapa final de 3 minutos en el SLA window)

2. **`POST /api/v1/reservations` — Escenario `load_reservations`:**
   - `reservation_success_duration` p95 < 600 ms *(métrica custom sobre respuestas HTTP 201 únicamente)*
   - `http_req_failed{scenario:load_reservations}` rate < 1% *(errores técnicos: 5xx y fallos de red)*
   - **Target de llegada configurado:** 30 iteraciones/s (executor `ramping-arrival-rate`, etapa final de 3 minutos en el SLA window)

---

# 5. Escenarios ejecutados en K6

## 5.1 Smoke Test

- **Executor:** `shared-iterations` (1 VU, 1 iteración por flujo)
- **Objetivo:** Verificar la disponibilidad básica del entorno antes de inyectar carga sostenida. Confirma que los servicios responden con códigos esperados y que el inventario fue correctamente inicializado por el `setup()`.
- **Qué valida:** `HTTP 200` en `GET /api/v1/events`, `HTTP 201` en `POST /api/v1/reservations`, estructura JSON válida en las respuestas, y tiempo de respuesta dentro de límites de pre-carga.
- **Métricas clave observadas:**
  - `http_req_duration{scenario:smoke_events}` p95: **21.33 ms**
  - `http_req_duration{scenario:smoke_reservations}` p95: **80.85 ms**
  - *Checks* aprobados: **7 / 7**
- **Interpretación:** El entorno respondió correctamente en condiciones mínimas. Los tiempos de respuesta se encuentran muy por debajo de los límites del plan. El inventario fue confirmado por el `setup()` antes de proceder a carga.
- **Estado:** ✓ **Aprobado**

---

## 5.2 Load Test — Event Availability

- **Executor:** `ramping-arrival-rate`
- **Perfil de carga (stages):**
  - Warm-up: 40 iteraciones/s durante 1 min
  - Estabilización: 40 iteraciones/s durante 2 min
  - Rampa a pico: hasta 80 iteraciones/s durante 1 min
  - **SLA window:** 80 iteraciones/s durante 3 min
  - Cool-down: 0 en 30 s
- **Objetivo:** Evaluar el comportamiento del endpoint `GET /api/v1/events` bajo un régimen de carga creciente hasta el target de 80 iteraciones/s, midiendo latencia y estabilidad.
- **Qué valida:** Capacidad de respuesta serializada del catálogo bajo concurrencia. Ausencia de errores técnicos.
- **Métricas clave observadas:**
  - `http_req_duration{scenario:load_events}` p95: **14.30 ms** (umbral: < 400 ms)
  - `http_req_failed{scenario:load_events}` rate: **0.00%** (umbral: < 1%)
  - Iteraciones completadas: **25,200**
  - Promedio observado de iteraciones/s (global): **~56 iter/s**
- **Interpretación del throughput:** El target configurado es de 80 iteraciones/s en la etapa de SLA window. El promedio global observado de ~56 iter/s refleja el promedio sobre la duración total del test, incluyendo las etapas de warm-up y rampa donde el rate configurado era inferior a 80. Este valor no debe compararse directamente con el target de la SLA window como si fueran equivalentes. La latencia p95 de 14.30 ms, que es el indicador definido como umbral formal, se mantuvo dentro del límite en todo momento.
- **Estado:** ✓ **Aprobado**

---

## 5.3 Load Test — Reservation Creation

- **Executor:** `ramping-arrival-rate`
- **Perfil de carga (stages):**
  - Warm-up: 15 iteraciones/s durante 1 min
  - Estabilización: 15 iteraciones/s durante 2 min
  - Rampa a pico: hasta 30 iteraciones/s durante 1 min
  - **SLA window:** 30 iteraciones/s durante 3 min
  - Cool-down: 0 en 30 s
- **Objetivo:** Evaluar el comportamiento del endpoint `POST /api/v1/reservations` bajo el target de 30 iteraciones/s, midiendo latencia de escritura exitosa y estabilidad del sistema bajo contención de inventario.
- **Qué valida:** Tiempo de procesamiento de reservas confirmadas (HTTP 201), contención correcta de inventario ante solicitudes concurrentes, y ausencia de errores técnicos.
- **Setup:** El `setup()` invocó los endpoints de `testability/performance/reset` en `ms-ticketing` (puerto `8082`) y `ms-events` (puerto `8081`). El pool de inventario disponible al inicio de la ejecución fue de **10,120 cupos únicos**.
- **Métricas clave observadas:**
  - `reservation_success_duration` p95: **25.87 ms** (umbral: < 600 ms)
  - `reservation_success_duration` p99: **30.65 ms**
  - `http_req_failed{scenario:load_reservations}` rate: **0.00%** (umbral: < 1%)
  - Iteraciones completadas: **9,449**
  - Promedio observado de iteraciones/s (global): **~21 iter/s**
- **Interpretación del throughput:** El promedio global de ~21 iter/s corresponde al promedio sobre toda la duración del test, incluyendo las etapas de warm-up (15 iter/s) y rampa. Durante la etapa de SLA window, el executor alcanzó el target configurado de 30 iteraciones/s, tal como se observa en el log de ejecución (`30.00 iters/s` sostenido a partir del minuto 4:01). El promedio global no debe interpretarse como que el sistema no alcanzó el target; el target de throughput no es un *threshold* formal evaluado por k6, y los *thresholds* definidos (latencia p95 y error rate) se cumplieron.
- **Contexto de inventario:** El pool de 10,120 cupos es suficiente para cubrir varios minutos de ejecución sostenida a 30 iter/s antes de agotarse. Las respuestas `HTTP 409` generadas una vez agotado el inventario son el comportamiento esperado de la lógica de negocio (prevención de sobreventa) y fueron contabilizadas de forma separada en la métrica `reservation_inventory_conflict`, sin afectar el threshold de error rate.
- **Estado:** ✓ **Aprobado**

---

# 6. Resultados consolidados

## Resultados de thresholds y checks

| Threshold | Escenario | Valor observado | Límite | Estado |
|---|---|:---:|:---:|:---:|
| `http_req_duration{scenario:load_events}` p95 | `load_events` | 14.30 ms | < 400 ms | ✓ Pass |
| `http_req_failed{scenario:load_events}` rate | `load_events` | 0.00% | < 1% | ✓ Pass |
| `reservation_success_duration` p95 | `load_reservations` | 25.87 ms | < 600 ms | ✓ Pass |
| `http_req_failed{scenario:load_reservations}` rate | `load_reservations` | 0.00% | < 1% | ✓ Pass |
| *Checks* smoke (7/7) | Smoke Test | 100% | 100% | ✓ Pass |

**Nota sobre el threshold de `reservation_success_duration`:** Esta métrica custom fue registrada únicamente sobre respuestas `HTTP 201`. Las respuestas `HTTP 409` fueron excluidas de este cómputo mediante `setResponseCallback`, reflejando exclusivamente el tiempo de procesamiento del *write-path* exitoso.

## Throughput configurado vs. promedio observado

El throughput no es un threshold formal evaluado por k6 en esta suite. Se documenta aquí como referencia de contexto:

| Escenario | Target configurado (SLA window) | Promedio global observado | Nota |
|---|:---:|:---:|---|
| `load_events` | 80 iter/s | ~56 iter/s | Promedio sobre duración total, incluye etapas de warm-up |
| `load_reservations` | 30 iter/s | ~21 iter/s | Promedio sobre duración total; el target se alcanzó en la SLA window |

## Métricas built-in y métricas custom relevantes

**Métricas built-in de k6:**

| Métrica | Descripción | Valor relevante observado |
|---|---|---|
| `http_req_duration` | Tiempo total de la solicitud HTTP (envío, espera, recepción) | Events p95: 14.30 ms · Reservations (global): 25.87 ms |
| `http_req_failed` | Tasa de solicitudes que resultaron en error técnico (5xx, timeouts de red) | 0.00% en ambos escenarios |
| `iterations` | Total de iteraciones del escenario completadas | Events: 25,200 · Reservations: 9,449 |
| `dropped_iterations` | Iteraciones programadas por el executor que no llegaron a iniciarse por no haber un VU disponible en el momento en que el scheduler intentó lanzarlas | Presentes en `load_reservations` durante la progresión de carga |

**Métricas custom (`load_reservations`):**

| Métrica | Descripción | Valor observado |
|---|---|---|
| `reservation_success_duration` | Latencia exclusiva de respuestas `HTTP 201`. Métrica Trend registrada manualmente en el script; es la base del threshold de p95 | p95: 25.87 ms · p99: 30.65 ms · avg: 21.53 ms |
| `reservation_inventory_conflict` | Contador de respuestas `HTTP 409` generadas por agotamiento de inventario. Registradas como Counter separado para no contaminar `http_req_failed` | Presente; valor exacto disponible en `load-reservations-summary.json` |

---

# 7. Hallazgos relevantes

1. **Latencias dentro de los umbrales en ambos flujos:** Los valores de p95 observados (14.30 ms para eventos, 25.87 ms para reservas exitosas) se encuentran ampliamente por debajo de los límites establecidos de 400 ms y 600 ms respectivamente.

2. **Tasa de error técnico nula:** `http_req_failed` reportó 0.00% en ambos escenarios. Las respuestas `HTTP 409` derivadas del agotamiento de inventario no fueron contabilizadas como errores técnicos, conforme a la estrategia de medición implementada con `setResponseCallback`.

3. **`dropped_iterations` en el escenario de reservas:** El executor `ramping-arrival-rate` registró iteraciones no iniciadas (`dropped_iterations`) durante la progresión de carga. Esto ocurre cuando el scheduler intenta lanzar una nueva iteración pero no encuentra un VU libre en ese instante. Es un comportamiento esperado en entornos con recursos locales limitados durante fases de escalado; no indica errores de aplicación ni violación de thresholds.

4. **Comportamiento de inventario:** El pool de 10,120 cupos permitió sostener la carga durante la ventana de medición. Las respuestas `HTTP 409` posteriores al agotamiento confirman el correcto funcionamiento de la lógica de contención de inventario en el backend.

---

# 8. Interpretación final

Los resultados son consistentes con el comportamiento esperado del sistema bajo las condiciones definidas en el plan de pruebas. Los thresholds formales —latencia p95 y tasa de error técnico— se cumplieron en todos los escenarios evaluados.

El promedio global de throughput observado en ambos escenarios es inferior al target configurado en la SLA window, lo cual es inherente al uso del executor `ramping-arrival-rate` con etapas de warm-up: el promedio se calcula sobre la duración total del test, que incluye etapas en las que el rate configurado era inferior al pico. Este comportamiento no constituye un incumplimiento de los criterios de aceptación definidos.

La métrica `reservation_success_duration` proporciona una medición aislada del tiempo de procesamiento de escrituras exitosas, separada de las respuestas de contención de inventario, y es la métrica relevante para evaluar la latencia del *write-path* comprometida en el SLA.

---

# 9. Conclusión final

El ciclo de pruebas de rendimiento con k6 sobre el Ticketing MVP concluyó con todos los *thresholds* definidos en estado `pass`. El sistema respondió de forma estable durante las ventanas de medición del SLA en los dos flujos evaluados: consulta de catálogo y creación de reservas.

La validación de rendimiento correspondiente a este ciclo queda formalmente documentada y puede considerarse cerrada.

**Estado del entregable de rendimiento: APROBADO**

---

# 10. Evidencias disponibles

Los siguientes artefactos sustentan las métricas y conclusiones de este informe:

| Archivo | Contenido |
|---|---|
| `k6/config/options.js` | Definición de ejecutores, stages y configuración de escenarios |
| `k6/config/thresholds.js` | Definición formal de los thresholds evaluados |
| `k6/reports/smoke-summary.json` | Resumen JSON de la ejecución del Smoke Test |
| `k6/reports/load-events-summary.json` | Resumen JSON del Load Test — Event Availability |
| `k6/reports/load-reservations-summary.json` | Resumen JSON del Load Test — Reservation Creation |
| `k6/reports/load-reservations.log` | Log completo de la ejecución del escenario de reservas, incluyendo salida de `setup()` e inventario disponible |
