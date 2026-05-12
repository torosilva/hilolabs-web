# HiloLabs — Plataforma de Agentes (cómo se construye)

Este documento es el **hermano** de `AGENTS_BACKEND.md`. Aquel describe **qué** se construye (los 7 agentes, schema, prompts). Este describe **cómo** se construye: arquitectura, stack, repos, convenciones y orden de trabajo.

**Audiencia:** desarrollador(a) backend, agentes IA y founder.
**Estado:** versión 1, decisiones tomadas (ver §11 — ADRs).

---

## Índice

1. [Decisiones tomadas](#1-decisiones-tomadas)
2. [Arquitectura en capas](#2-arquitectura-en-capas)
3. [Stack confirmado](#3-stack-confirmado)
4. [Estructura del monorepo `hilolabs-platform`](#4-estructura-del-monorepo)
5. [Cómo se hace una **Skill**](#5-cómo-se-hace-una-skill)
6. [Cómo se hace un **MCP server**](#6-cómo-se-hace-un-mcp-server)
7. [Cómo se gestiona un **Agente** con ADK](#7-cómo-se-gestiona-un-agente-con-adk)
8. [Control y observabilidad](#8-control-y-observabilidad)
9. [Multi-tenancy — reglas no negociables](#9-multi-tenancy--reglas-no-negociables)
10. [Roadmap por versiones](#10-roadmap-por-versiones)
11. [ADRs (Architecture Decision Records)](#11-adrs)

---

## 1. Decisiones tomadas

| # | Decisión | Valor |
|---|---|---|
| 1 | Repos | Dos: `hilolabs-web` (frontend, este repo) y `hilolabs-platform` (backend monorepo, nuevo) |
| 2 | Orquestador | **Google ADK** (Python) |
| 3 | Lenguaje backend | Python (ADK) + TypeScript (MCPs y Console) |
| 4 | Hosting backend | **Railway** (fase 1) — migración a GCP Cloud Run / Vertex Agent Engine en fase 3 |
| 5 | Base de datos | **Supabase** (Postgres 15 + pgvector + Storage + Auth) |
| 6 | LLMs | **Claude Sonnet 4.6** (conversación), **Gemini 1.5 Pro Vision** (visión), vía LiteLLM dentro de ADK |
| 7 | Tracing | **Langfuse Cloud** vía OpenTelemetry exporter |
| 8 | Errores | **Sentry** |
| 9 | Logs estructurados | **Better Stack** (o Axiom) |
| 10 | Cadencia durable (Sales Closer) | **Temporal Cloud** |
| 11 | Email | **Resend** |
| 12 | WhatsApp | **Twilio WhatsApp Business API** |
| 13 | Storage efímero (fotos Try-On) | **Supabase Storage** con lifecycle de 24h |
| 14 | Auth Console interno | **Supabase Auth** (no Clerk, una cuenta menos) |
| 15 | Package manager | `pnpm` (workspaces) + `uv` (Python) |
| 16 | CI/CD | GitHub Actions |
| 17 | IaC | Por ahora ninguna (Railway dashboard); Terraform cuando migremos a GCP |

---

## 2. Arquitectura en capas

```
┌──────────────────────────────────────────────────────────────┐
│  CANALES                                                     │
│  WhatsApp (Twilio) │ Web (hilolabs-web) │ Email │ Console   │
└──────────┬───────────────────────────────────────────────────┘
           ▼
┌──────────────────────────────────────────────────────────────┐
│  API GATEWAY  (FastAPI en `apps/orchestrator`)               │
│  Auth · rate limit · validación · brand_id resolution       │
└──────────┬───────────────────────────────────────────────────┘
           ▼
┌──────────────────────────────────────────────────────────────┐
│  ORQUESTADOR  (Google ADK)                                   │
│  • Root agent con sub-agents y transfer                      │
│  • SessionService + MemoryService sobre Supabase             │
│  • Skills loader (lee packages/skills/)                      │
└──────┬──────────────────────┬────────────────────────────────┘
       │ instructions         │ tools
       ▼                      ▼
┌────────────────┐   ┌────────────────────────────────────────┐
│ SKILLS         │   │  MCP SERVERS (uno por integración)    │
│ packages/      │   │  • mcp-woocommerce                    │
│ skills/*       │   │  • mcp-knowledge-base                 │
│                │   │  • mcp-customer-memory                │
│ Versionadas    │   │  • mcp-whatsapp                       │
│ en git, PR     │   │  • mcp-vision                         │
│ + review       │   │  • mcp-cadence                        │
│                │   │  • mcp-analytics                      │
└────────────────┘   └──────────────┬─────────────────────────┘
                                    ▼
┌──────────────────────────────────────────────────────────────┐
│  DATA LAYER  (Supabase)                                      │
│  Postgres + pgvector · Storage (TTL 24h) · Auth (Console)   │
│  + Redis (Upstash) para cache/queues                         │
│  + Temporal Cloud para cadencias durables                    │
└──────────────────────────────────────────────────────────────┘
           ▲
           │
┌──────────┴───────────────────────────────────────────────────┐
│  CONTROL PLANE  ("Hilo Console" — apps/console)              │
│  • Logs y trazas (link a Langfuse)                           │
│  • Feature flags por marca                                   │
│  • Métricas de negocio y costos                              │
│  • Aprobaciones HITL (Content Gen, descuentos no estándar)  │
│  • CRUD de brand config (voice, políticas)                  │
└──────────────────────────────────────────────────────────────┘
```

**Principios:**
- **MCPs son reutilizables.** Un MCP por sistema externo, no por agente. El mismo `mcp-woocommerce` lo usa Customer Service, Stylist y Sales Closer.
- **Skills son intercambiables.** `brand-voice-fuxia` vs `brand-voice-otra-marca` sin tocar lógica del agente.
- **El orquestador es el único que conoce todos los agentes.** Cada agente vive aislado en su módulo.
- **MCPs corren igual en dev (Claude Code) y prod.** Tu equipo puede "hablarle" a WooCommerce de Fuxia desde Claude Code mientras programa.

---

## 3. Stack confirmado

| Capa | Tecnología | Versión target |
|---|---|---|
| Lenguaje orquestador | Python | 3.12+ |
| Framework agentes | Google ADK | última estable |
| API HTTP | FastAPI | 0.115+ |
| Multi-model wrapper | LiteLLM (vía ADK) | última |
| Lenguaje MCPs y Console | TypeScript | 5.x |
| Runtime TS | Bun (preferido) o Node 20+ | — |
| MCP SDK | `@modelcontextprotocol/sdk` | última |
| ORM (TS) | Drizzle | última |
| Migrations (Python) | Alembic | última |
| Web framework Console | Next.js 16 | igual que `hilolabs-web` |
| LLM principal | `claude-sonnet-4-6` (Anthropic API) | — |
| LLM visión | `gemini-1.5-pro` (Google AI Studio) | — |
| Embeddings | `voyage-3` o `text-embedding-3-small` | a decidir |
| DB | Supabase Postgres + pgvector | PG 15 |
| Cache/colas | Upstash Redis | — |
| Workflows durables | Temporal Cloud | — |
| Tracing | Langfuse Cloud + OTel | — |
| Errores | Sentry | — |
| Logs | Better Stack | — |
| Email | Resend | — |
| WhatsApp | Twilio WhatsApp Business API | — |
| Hosting backend | Railway | — |
| Hosting frontend | Vercel | — |
| Package managers | `pnpm` (workspaces) + `uv` | — |
| CI/CD | GitHub Actions | — |

---

## 4. Estructura del monorepo

Repo: `github.com/{org}/hilolabs-platform`

```
hilolabs-platform/
├── apps/
│   ├── orchestrator/                   ← Python · ADK · FastAPI
│   │   ├── pyproject.toml
│   │   ├── src/hilolabs/
│   │   │   ├── agents/
│   │   │   │   ├── root.py             ← root agent con routing
│   │   │   │   ├── customer_service.py
│   │   │   │   ├── stylist.py
│   │   │   │   ├── content.py
│   │   │   │   ├── sizing.py
│   │   │   │   ├── try_on.py
│   │   │   │   ├── sales_closer.py
│   │   │   │   └── executive.py
│   │   │   ├── skills/loader.py        ← lee packages/skills/*/SKILL.md
│   │   │   ├── memory/                 ← SessionService + MemoryService sobre Supabase
│   │   │   ├── mcp_clients/            ← clientes ADK hacia los MCP servers
│   │   │   ├── routing/intent.py       ← clasificador de intención
│   │   │   ├── observability.py        ← OTel → Langfuse, Sentry
│   │   │   ├── tenancy.py              ← brand_id resolution + RLS
│   │   │   └── main.py                 ← FastAPI app + ADK Runner
│   │   ├── tests/
│   │   └── eval/                       ← golden datasets *.evalset.json
│   │
│   ├── console/                        ← Next.js admin (Hilo Console)
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   │
│   └── workers/                        ← Temporal workers (Python)
│       └── src/workflows/
│           ├── sales_cadence.py        ← cadencia del Agente 6
│           └── photo_cleanup.py        ← TTL 24h fotos Try-On
│
├── packages/
│   ├── skills/                         ← Anthropic-style skills
│   │   ├── brand-voice-fuxia/
│   │   │   ├── SKILL.md
│   │   │   ├── voice-rules.md
│   │   │   ├── examples.json
│   │   │   └── policies.json
│   │   ├── sales-cadence/
│   │   ├── try-on-styling/
│   │   ├── sizing-assessment/
│   │   └── discount-guardrails/
│   │
│   ├── mcp-woocommerce/                ← TS · MCP server
│   ├── mcp-knowledge-base/             ← TS · RAG sobre pgvector
│   ├── mcp-customer-memory/            ← TS · perfil cliente
│   ├── mcp-whatsapp/                   ← TS · Twilio
│   ├── mcp-vision/                     ← TS · IDM-VTON / body classifier
│   ├── mcp-cadence/                    ← TS · interfaz a Temporal
│   ├── mcp-analytics/                  ← TS · SQL Agent (Agente 7)
│   │
│   ├── db/
│   │   ├── schema.sql                  ← schema completo
│   │   ├── migrations/                 ← Alembic/SQL versionados
│   │   ├── seed/                       ← Fuxia mock data
│   │   └── drizzle/                    ← schema espejo para Console
│   │
│   ├── shared-ts/                      ← tipos, errores, utilidades TS
│   └── shared-py/                      ← idem Python
│
├── infra/
│   ├── docker-compose.yml              ← Postgres+pgvector local
│   └── railway/                        ← railway.toml + envs
│
├── .github/
│   └── workflows/
│       ├── ci.yml                      ← lint + test + eval
│       ├── deploy-orchestrator.yml
│       └── deploy-console.yml
│
├── docs/
│   ├── LOCAL_SETUP.md                  ← cómo correrlo en tu mac
│   ├── DEPLOY.md
│   ├── DECISIONS.md                    ← ADRs vivos
│   └── RUNBOOKS/
│       ├── agent-down.md
│       └── budget-spike.md
│
├── pnpm-workspace.yaml
├── package.json                        ← scripts top-level
├── pyproject.toml                      ← uv workspace
└── README.md
```

---

## 5. Cómo se hace una **Skill**

Una skill es una **carpeta versionada en `packages/skills/`** con un `SKILL.md` arriba más archivos de apoyo.

### Anatomía

```
packages/skills/brand-voice-fuxia/
├── SKILL.md           ← descripción + cuándo disparar + frontmatter
├── voice-rules.md     ← tono, palabras prohibidas, signature
├── examples.json      ← 20 ejemplos de copy on-brand
└── policies.json      ← devoluciones, envíos
```

### `SKILL.md` template

```markdown
---
name: brand-voice-fuxia
version: 1.0.0
applies_to: ["brand:fuxia"]
loaded_by_agents: ["customer_service", "sales_closer", "content", "stylist"]
description: Loads Fuxia's tone of voice, forbidden words, signature, and brand policies. Use whenever generating text seen by a Fuxia customer.
---

# Fuxia — Voz de marca

Tono: cálido, cercano, femenino, sin cursilerías.
Palabras prohibidas: "barato", "rebaja". Usa "promo" o "edición especial".
Emojis permitidos: 💗 ✨ (moderado, máx 1 por mensaje).
Cierre: "— el equipo Fuxia"

Detalle en `voice-rules.md`; ejemplos en `examples.json`.
```

### Cómo se carga (Python, ADK)

```python
# apps/orchestrator/src/hilolabs/skills/loader.py
from pathlib import Path
import frontmatter

def load_skills(agent_id: str, brand_slug: str) -> str:
    """Concatena el contenido de las skills aplicables al system prompt."""
    skills_dir = Path(__file__).parents[3] / "packages" / "skills"
    parts = []
    for skill_path in skills_dir.iterdir():
        meta = frontmatter.load(skill_path / "SKILL.md")
        if agent_id not in meta["loaded_by_agents"]:
            continue
        if not any(f"brand:{brand_slug}" == a or a == "all" for a in meta["applies_to"]):
            continue
        parts.append(meta.content)
        # opcional: cargar archivos adicionales referenciados
    return "\n\n---\n\n".join(parts)
```

### Reglas de skills

1. **Versionadas en git.** Editar = PR + review.
2. **Frontmatter obligatorio** (`name`, `version`, `applies_to`, `loaded_by_agents`, `description`).
3. **Inmutables en runtime.** Cambios requieren redeploy o feature flag.
4. **Multi-tenant.** `applies_to` filtra por marca; nunca cruzar.
5. **Tests.** Cada skill tiene 3-5 ejemplos en `examples.json` que se usan como golden eval.

---

## 6. Cómo se hace un **MCP server**

Un MCP server es un proceso (TypeScript en este caso) que expone tools y resources por **stdio** o **SSE**. Lo consume cualquier cliente MCP: ADK, Claude Code, Claude Desktop.

### Estructura mínima

```
packages/mcp-woocommerce/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts            ← entry, wire MCP server
│   ├── tools/
│   │   ├── get-product.ts
│   │   ├── create-order.ts
│   │   ├── issue-coupon.ts
│   │   └── create-checkout-link.ts
│   ├── woo-client.ts       ← cliente WooCommerce REST
│   ├── tenancy.ts          ← resolver creds por brand_id
│   └── types.ts
├── tests/
└── README.md
```

### Esqueleto (TypeScript)

```typescript
// packages/mcp-woocommerce/src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getProduct } from "./tools/get-product.js";
import { createCheckoutLink } from "./tools/create-checkout-link.js";
import { issueCoupon } from "./tools/issue-coupon.js";

const server = new Server(
  { name: "hilolabs-woocommerce", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler("tools/list", async () => ({
  tools: [
    {
      name: "get_product_info",
      description: "Stock, tallas, precio, fotos y descripción de un producto.",
      inputSchema: {
        type: "object",
        properties: {
          brand_id: { type: "string", format: "uuid" },
          sku: { type: "string" },
        },
        required: ["brand_id", "sku"],
      },
    },
    // ...
  ],
}));

server.setRequestHandler("tools/call", async (req) => {
  const { name, arguments: args } = req.params;
  switch (name) {
    case "get_product_info":     return getProduct(args);
    case "create_checkout_link": return createCheckoutLink(args);
    case "issue_coupon":         return issueCoupon(args);
    default: throw new Error(`Unknown tool: ${name}`);
  }
});

await server.connect(new StdioServerTransport());
```

### Reglas no negociables para MCPs

1. **`brand_id` SIEMPRE en el input.** El MCP no confía en el LLM para saberlo; lo recibe explícito y lo valida.
2. **Credentials por marca** se resuelven adentro del MCP (`tenancy.ts`), nunca expuestos al agente.
3. **Versionado semántico.** Breaking change = bump major + skill side migration.
4. **Output esquematizado.** Todo tool devuelve JSON con shape estable; nunca string libre.
5. **Logueo estructurado.** Cada `tools/call` emite: `brand_id`, `agent_caller`, `tool_name`, `latency_ms`, `ok|error`.
6. **Idempotencia** en writes (crear orden, cupón) vía `Idempotency-Key`.
7. **Rate limit y circuit breaker** hacia la API externa.

### MCPs a construir, por orden

| # | MCP | Tools clave | Bloquea |
|---|---|---|---|
| 1 | `mcp-customer-memory` | get/update profile, purchase history | Todos los agentes |
| 2 | `mcp-knowledge-base` | search_kb, ingest_document | Agentes 1, 2, 6 |
| 3 | `mcp-woocommerce` | get_product, create_order, issue_coupon, checkout_link | Agentes 1, 2, 5, 6 |
| 4 | `mcp-whatsapp` | send_message, send_template | Agentes 1, 6 |
| 5 | `mcp-cadence` | schedule_touch, pause_cadence | Agente 6 |
| 6 | `mcp-vision` | analyze_body, try_on, embed_product_image | Agentes 4, 5 |
| 7 | `mcp-analytics` | run_query (SELECT-only, whitelist) | Agente 7 |

---

## 7. Cómo se gestiona un **Agente** con ADK

Cada agente vive como un **módulo Python** dentro de `apps/orchestrator/src/hilolabs/agents/`. No es un microservicio separado al inicio (sobrediseño).

### Definición canónica

```python
# apps/orchestrator/src/hilolabs/agents/customer_service.py
from google.adk.agents import LlmAgent
from google.adk.tools.mcp_tool import MCPToolset, StdioServerParameters
from hilolabs.skills.loader import load_skills

def build_customer_service_agent(brand_slug: str) -> LlmAgent:
    return LlmAgent(
        name="customer_service",
        model="claude-sonnet-4-6",
        description="Resuelve dudas de clientes finales en WhatsApp y email.",
        instruction=build_prompt(brand_slug),
        tools=[
            MCPToolset(
                connection_params=StdioServerParameters(
                    command="node",
                    args=["packages/mcp-woocommerce/dist/index.js"],
                    env={"BRAND_SLUG": brand_slug},
                )
            ),
            MCPToolset(connection_params=...),  # mcp-knowledge-base
            MCPToolset(connection_params=...),  # mcp-customer-memory
        ],
    )

def build_prompt(brand_slug: str) -> str:
    skills_content = load_skills(agent_id="customer_service", brand_slug=brand_slug)
    return f"""Eres el asistente oficial de la marca.

{skills_content}

REGLAS:
1. Responde en máximo 3 oraciones salvo que pidan detalle.
2. Si no sabes algo con seguridad, usa tool `create_human_ticket`.
3. NUNCA inventes números de pedido, fechas o políticas.
4. Si detectas frustración seria, escala con `escalate_to_human`.
"""
```

### Root agent (orquestador)

```python
# apps/orchestrator/src/hilolabs/agents/root.py
from google.adk.agents import LlmAgent
from .customer_service import build_customer_service_agent
from .stylist import build_stylist_agent
from .sales_closer import build_sales_closer_agent

def build_root_agent(brand_slug: str) -> LlmAgent:
    sub_agents = [
        build_customer_service_agent(brand_slug),
        build_stylist_agent(brand_slug),
        build_sales_closer_agent(brand_slug),
        # ... el resto
    ]
    return LlmAgent(
        name="root",
        model="claude-sonnet-4-6",  # barato, solo clasifica
        description="Router de HiloLabs.",
        instruction="""Detecta intención del mensaje y transfiere al sub-agente correcto:
- Dudas post-venta / quejas → customer_service
- Pedido de outfit / recomendación → stylist
- Interés en comprar / preguntas pre-venta → sales_closer
- ...""",
        sub_agents=sub_agents,
    )
```

### Registry y feature flags

Cada agente expone su `AgentDef` (id, model, skills, mcps, feature_flag). El root lee `brands.feature_flags` antes de incluir sub-agents en la lista. Apagar un agente para una marca = `UPDATE brands SET feature_flags = jsonb_set(feature_flags, '{agent_sales_closer}', 'false') WHERE slug='fuxia'`.

### Evals por agente

```
apps/orchestrator/eval/
├── customer_service.evalset.json     ← 30-50 casos
├── customer_service.rubric.md
├── stylist.evalset.json
└── ...
```

CI corre `uv run adk eval` en cada PR que toque agentes o skills. Si pass rate baja > 5%, no mergea.

---

## 8. Control y observabilidad

### 8.1 Tracing (Langfuse vía OpenTelemetry)

ADK emite OTel automático. Configuramos exporter a Langfuse:

```python
# apps/orchestrator/src/hilolabs/observability.py
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from langfuse.otel import LangfuseSpanExporter

provider = TracerProvider()
provider.add_span_processor(BatchSpanProcessor(LangfuseSpanExporter()))
trace.set_tracer_provider(provider)
```

Cada request del orquestador = 1 trace. Spans dentro: LLM calls (con tokens y costo), tool calls (con args y resultado), skill loads, DB queries.

### 8.2 Tabla `llm_calls`

Ya definida en `AGENTS_BACKEND.md` §4.1. Pintada en el Console con filtros por marca, agente, día.

### 8.3 Hilo Console (`apps/console`)

Next.js app con Supabase Auth. Vistas mínimas v1:

- **Tenants:** CRUD de brands, voice config, feature flags, discount policy.
- **Conversations:** tabla de últimas 1000 con drill-down a Langfuse.
- **Costs:** $/día por marca y agente, alertas si > umbral.
- **Approvals:** queue HITL (Content Gen drafts, descuentos no estándar).
- **Eval results:** último run de golden datasets por agente.

### 8.4 Sentry + Better Stack

Sentry para exceptions. Better Stack para logs estructurados (JSON) con alertas. Heartbeat de los MCP servers cada 60s.

### 8.5 Kill switches

Por agente y por marca, vía `brands.feature_flags`. Sin redeploy. Hay un toggle en Console + un endpoint admin `POST /admin/flags/:brand/:agent`.

---

## 9. Multi-tenancy — reglas no negociables

1. **`brand_id` en TODA fila** de toda tabla. Sin excepción.
2. **RLS (Row Level Security) en Supabase** activado en todas las tablas con datos por marca. La policy filtra por `brand_id = current_setting('app.brand_id')::uuid`.
3. **El backend setea `app.brand_id`** al inicio de cada request (`SET LOCAL app.brand_id = '...'`).
4. **MCPs reciben `brand_id` explícito** en cada call y validan que el agente caller tiene permiso.
5. **Storage paths**: `{brand_slug}/{customer_id}/...`. Nunca raíz compartida.
6. **Embeddings**: índice y query siempre filtran `WHERE brand_id = $1`.
7. **Tests de cruce**: por cada feature, un test que verifica que la marca A no ve datos de la marca B (prompt injection incluido).

---

## 10. Roadmap por versiones

| Versión | Entrega | Tiempo (días concentrados) | Destraba el usuario |
|---|---|---|---|
| **v0.1** | Monorepo scaffold + Agente 1 (Customer Service) con mocks, end-to-end local | 3-5 | Crear repo, dar acceso |
| **v0.2** | MCPs reales: `mcp-woocommerce` Fuxia + `mcp-knowledge-base` con ingesta | 4-6 | Creds Woo Fuxia |
| **v0.3** | Agente 1 vivo en WhatsApp de Fuxia + Langfuse + Sentry | 3-5 | Twilio, Anthropic key, Langfuse |
| **v0.4** | Hilo Console v1 (flags, logs, costs) + Supabase Auth | 5-7 | — |
| **v0.5** | Agentes 2 (Stylist) + 7 (Executive básico) | 5-7 | Google AI key |
| **v0.6** | Agente 6 (Sales Closer) sin cadencia | 4-6 | Resend, política descuentos |
| **v0.7** | Cadencia Sales Closer con Temporal + descuentos automáticos | 5-7 | Temporal Cloud |
| **v0.8** | Agente 3 (Content Gen) + HITL queue | 4-6 | DALL-E/Replicate |
| **v0.9** | Agente 4 (Sizing) cuestionario + Agente 5 fase A (body classifier) | 7-10 | Revisión legal privacidad |
| **v1.0** | Agente 5 completo + onboarding 2da marca | 10-14 | Legal cerrado |

Total realista: **~3 meses** de trabajo concentrado.

---

## 11. ADRs

### ADR-001 — Orquestador: Google ADK
**Status:** Accepted (2026-05-11)
**Contexto:** 7 agentes con jerarquía, mezcla Claude+Gemini, necesidad de eval/tracing built-in.
**Decisión:** Google ADK en Python.
**Alternativas:** LangGraph (TS), Claude Agent SDK.
**Consecuencias:** Backend en Python (no TS). Soporte MCP nativo. Path a Vertex Agent Engine.

### ADR-002 — DB: Supabase
**Status:** Accepted (2026-05-11)
**Contexto:** Necesitamos Postgres + pgvector + storage efímero (Try-On) + auth (Console).
**Decisión:** Supabase. Reemplaza a Neon + S3 + Clerk en una sola cuenta.
**Consecuencias:** Lock-in moderado a Supabase. Mitigación: usamos sólo PG estándar + Storage S3-compatible.

### ADR-003 — Hosting fase 1: Railway
**Status:** Accepted (2026-05-11)
**Contexto:** MVP rápido, sin GCP infra.
**Decisión:** Railway. Migración a GCP Cloud Run / Vertex Agent Engine en fase 3 (cuando necesitemos sessions managed).
**Trigger de migración:** > 100 marcas activas o > 50k sesiones/día.

### ADR-004 — Lenguajes: Python (agentes) + TS (MCPs y Console)
**Status:** Accepted (2026-05-11)
**Contexto:** ADK es Python; MCPs y Console se benefician de TS (tipos compartidos con `hilolabs-web` futuro).
**Decisión:** Polígloto controlado. Boundary clara: MCP server = TS, agente = Python, frontend = TS.

### ADR-005 — Workflows durables: Temporal Cloud
**Status:** Accepted (2026-05-11)
**Contexto:** Sales Closer requiere timers de días + retries + estado durable.
**Decisión:** Temporal Cloud. No BullMQ ni cron casero.

### ADR-006 — Skills versionadas en git, no en panel
**Status:** Accepted (2026-05-11)
**Contexto:** El prompt es el contrato con el modelo. Cambios sin trazabilidad rompen evals.
**Decisión:** Skills viven en `packages/skills/`, editar = PR + review. No hay UI para editarlas hasta v2.

---

## 12. ¿Cómo empezamos?

1. Crear repo `hilolabs-platform` en GitHub.
2. Scaffold v0.1 (Agente 1 + mocks). Ver `docs/LOCAL_SETUP.md` (a generar).
3. Iterar versión por versión según §10.
4. Cualquier desviación de este doc → ADR nuevo + PR.
