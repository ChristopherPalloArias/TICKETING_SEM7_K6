<div align="center">
  
# 🚀 TICKETING_MVP_LOAD_TEST

### Taller Semana 7: Expectativa vs. Realidad - Ejecución Ágil, MVP y Estrategia de Pruebas

**Rol / Líder QA:** Christopher Ismael Pallo Arias  
**Proyecto:** Construcción del Ticketing MVP real y su Certificación por Micro-Sprints (Fase K6)  
**Objetivo:** Vivir "el choque con la realidad" y certificar como QA el MVP funcional construido por DEV. Demostrar resiliencia, documentación guiada por riesgo (`TEST_PLAN.md`) y superar las exigencias reales de concurrencia y latencia.

<br />

### 🛠️ Technology Stack

**Performance Testing Framework**
<br />
<img src="https://img.shields.io/badge/k6-1.7.0-7D64FF?style=for-the-badge&logo=k6&logoColor=white" alt="k6" />
<img src="https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
<img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
<br />
<a href="https://skillicons.dev">
  <img src="https://skillicons.dev/icons?i=js,github,docker" alt="Automation Stack" />
</a>

</div>

---

## 📌 Panel de Entrega y Resultados Formales

> ⚠️ **ATENCIÓN EVALUADOR:** Todos los insumos obligatorios exigidos sobre la validación de latencia, escalabilidad y prevención de sobreventa se encuentran consolidados y listos para su auditoría:

- 📄 **Informe Consolidado Oficial (Markdown):** [`K6_RESULTS_REPORT.md`](./K6_RESULTS_REPORT.md) 
- 🌐 **Informe Consolidado Ejecutivo (HTML):** [`K6_RESULTS_REPORT.html`](./K6_RESULTS_REPORT.html) *(Versión con estilos corporativos)*
- 📊 **Evidencia de Ejecución Cruda:** [`Carpeta /k6/reports`](./k6/reports/) *(contiene resúmenes JSON y logs detallados que demuestran el cumplimiento del SLA y la operación segura del inventario).*
- 🚀 **Scripts de Escenarios:** Consultar la carpeta [`k6/scenarios/`](./k6/scenarios/)

---

## 📋 Tabla de Contenidos
1. [Contexto del Reto](#-contexto-del-reto)
2. [Arquitectura y Estructura del Framework](#️-arquitectura-y-estructura-del-framework)
3. [Instrucciones de Clonado y Setup de Backend](#-instrucciones-de-clonado-y-setup-de-backend)
4. [Ejecución de las Pruebas de Carga](#️-ejecución-de-las-pruebas-de-carga)
5. [Consideraciones Técnicas y Retos Avanzados Resueltos](#-consideraciones-técnicas-y-retos-avanzados-resueltos)
6. [Sobre la Orquestación ASDD](#-sobre-la-orquestación-asdd)

---

## 🎯 Contexto del Proyecto: El Choque con la Realidad

Este repositorio corresponde a la certificación de rendimiento (**k6**) dentro de la **Fase 3: Estrategia de Calidad** exigida para el Taller 7. Tras diseñar la utopía en la Semana 6, nuestro objetivo de equipo fue construir y testear las piezas críticas seleccionadas del Backlog para entregar un **MVP funcional y valioso**.

Mientras DEV implementaba y lidiaba con la curva real de los Story Points mediante *micro-sprints* iterativos de 2 días, desde el rol de QA se redactó e impuso la arquitectura formal de calidad (`TEST_PLAN.md` y `TEST_CASES.md`).

Para asegurar que nuestro MVP no solo "funcione en local" sino que tolere agresividad concurrente y sostenga su disponibilidad de negocio, la Estrategia de Calidad exigió validar sin concesiones dos flujos neurálgicos bajo un SLA formal:

| Flujo Evaluado | Método y Endpoint | Umbrales Exigidos (SLA) |
|---|---|---|
| **Catálogo de Eventos** | `GET /api/v1/events` | Latencia p95 < 400 ms · Target TPS: 80 · Errores < 1% |
| **Reserva de Tickets** | `POST /api/v1/reservations` | Latencia p95 < 600 ms · Target TPS: 30 · Errores < 1% |

La suite certifica el **read-path** (consulta masiva concurrente) y el **write-path** (compra de entradas y contención inteligente del inventario sin sobreventas ni interrupciones del hilo de ejecución).

---

## 🏗️ Arquitectura y Estructura del Framework

| Capa | Paquete / Ruta | Responsabilidad |
|---|---|---|
| 📄 **Scenarios** | `k6/scenarios/` | Scripts de ejecución (`load-events.js`, `load-reservations.js`, `smoke.js`). Orquestan VUs, inyectan configuración y definen el ciclo de uso. |
| ⚙️ **Config** | `k6/config/` | Configuración modularizada de umbrales formales (`thresholds.js`), variables de entorno dinámicas y perfiles de despliegue (`options.js`). |
| 🛠️ **Librerías** | `k6/lib/` | Utilidades core, validadores de respuesta (`checks.js`) e interceptores de red HTTP aislados. |
| 📊 **Reportes** | `k6/reports/` | Salidas generadas nativas, volcados puros de logs JSON para comprobación de resultados. |

---

## ⚡ Instrucciones de Clonado y Setup de Backend

> ⚠️ **Crítico:** Las pruebas K6 son severas y exigen que la infraestructura objetivo (el clúster de microservicios) esté aprovisionada, sana y provista con semillas de inventario suficientes.

### 1. Clonar y Levantar el Clúster Backend
El proyecto del backend y sus bases de datos operan mediante `docker-compose` en un repositorio hermano.

```bash
# Cambiarse a un directorio base
cd /alguna/ruta/local

# Clonar el ecosistema de Backend
git clone https://github.com/ChristopherPalloArias/TICKETING_SEM7.git
cd TICKETING_SEM7

# Configurar el archivo de variables de entorno global
cp .env.template .env
```

Abre el archivo `.env` suministrado en el Backend y verifica las credenciales de PostgreSQL, RabbitMQ, puertos y demás variables requeridas según tu máquina local.

```bash
# Levantar de forma orquestada el Gateway, Microservicios y Base de Datos Requerida:
docker-compose up -d --build
```
*Asegúrate de que el API Gateway está listo respondiendo en el puerto `8080`, `ms-events` en `8081`, y `ms-ticketing` en `8082`.*

---

### 2. Preparar el Entorno de Automatización K6

```bash
# Desde otro terminal, clonar e ingresar a este repositorio K6
git clone https://github.com/ChristopherPalloArias/TICKETING_SEM7_K6.git
cd TICKETING_SEM7_K6

# Instalar K6 (si no se dispone globalmente)
# K6 corre de manera nativa sin necesidad de node_modules.
# Verificar instalación:
k6 version
```

---

## ▶️ Ejecución de las Pruebas de Carga

Con el ecosistema Backend ejecutándose vigorosamente, podemos golpear el clúster usando la suite. Los comandos inyectan variables de entorno cruciales que enrutan el tráfico principal por el API Gateway y delegan comandos de reseteo (*setup*) a los puertos directos.

### Prueba 1: Smoke Test (Aseguramiento de Configuración)
Verifica que las rutas, contratos y payloads cumplen lo básico antes de la carga extrema.
```bash
k6 run \
  -e BASE_URL_EVENTS=http://localhost:8080 \
  -e BASE_URL_TICKETING=http://localhost:8080 \
  -e BASE_URL_EVENTS_DIRECT=http://localhost:8081 \
  -e BASE_URL_TICKETING_DIRECT=http://localhost:8082 \
  k6/scenarios/smoke.js
```

### Prueba 2: Load Test - Disponibilidad de Eventos (80 TPS)
Inyecta carga paramétrica creciente controlada sobre el catálogo. Requiere de 7m 30s.
```bash
k6 run \
  -e BASE_URL_EVENTS=http://localhost:8080 \
  -e BASE_URL_TICKETING=http://localhost:8080 \
  k6/scenarios/load-events.js
```

### Prueba 3: Load Test - Creación de Reservas (30 TPS + Agotamiento)
Ataca agresivamente el sistema simulando compras extremas de inventario. El log de inicialización imprimirá la matriz inyectada de 10,120 tickets.
```bash
k6 run \
  -e BASE_URL_EVENTS=http://localhost:8080 \
  -e BASE_URL_TICKETING=http://localhost:8080 \
  -e BASE_URL_EVENTS_DIRECT=http://localhost:8081 \
  -e BASE_URL_TICKETING_DIRECT=http://localhost:8082 \
  k6/scenarios/load-reservations.js
```

> **Generación de Reportes Dinámicos:** Para volcar las tablas analíticas y el consolidado JSON a los archivos de evidencia en vez de solo la consola, añade el flag final:
> `--out json=k6/reports/load-resultado.json`

---

## 🧩 Consideraciones Técnicas y Retos Avanzados Resueltos

* **Executor de Llegada Dinámica Constante (`ramping-arrival-rate`):**  
  Para certificar el SLA exigido de inyectar agresivamente 80 y 30 TPS, se desechó por completo el ciclado ingenuo de VUs iterativos y se implementó un *Schedule* rítmico matemático constante. VUs son puestos en pool pre-alojado de contención o en rampa para soportar la embestida estricta de llegadas asíncronas sobre el backend.

* **Estrategia Inteligente sobre HTTP 409 (Contención de Inventario):**  
  Un acercamiento defectuoso para testear el endpoint de reservas registraría las respuestas de "Agotado" (`HTTP 409 Conflict`) como falencias técnicas. Como el sistema de Ticketing implementa prevención de sobreventa activa (comportamiento de negocio deseado), la automatización K6 emplea un interceptor `setResponseCallback` discriminatorio y asertivo; derivando la métrica en dos vías:
  1. `reservation_success_duration`: Recoge el 100% de los `HTTP 201`, comprobando la latencia del Write-path.
  2. `reservation_inventory_conflict`: Recoge los topes transaccionales cuando la semilla inicial de **10,120 cupos únicos** se aproxima al colapso. Esta estrategia salvaguarda el Threshold técnico contra fallas netamente aplicativas.

* **Inyección Transaccional Transversal en Setup():**  
  Para asegurar 7m 30s ininterrumpidos en etapa madura (Target SLA stage), la automatización explora de antemano el escenario utilizando funciones de ciclo vital (`setup()`) para comunicarse vía backend por detrás del Gateway con un reseteo de entorno (`/testability/performance/reset`). 

## 🤖 Sobre la Orquestación ASDD

Para más detalle sobre las directrices de Calidad Preventiva impulsadas por Especificaciones controladas por Agente AI que enmarcan la evolución del proyecto, consulta la bitácora madre interna en [`.github/README_ASDD.md`](.github/README_ASDD.md).
