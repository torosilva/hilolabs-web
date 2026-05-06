# Hilo AI Stack — Especificación Detallada para Desarrollo

**Audiencia:** desarrollador(a) backend / IA, perfil junior o intermedio.
**Pre-requisito:** haber leído `docs/ONBOARDING.md`.
**Objetivo:** que puedas construir, sola/o, los 7 agentes de IA que vendemos en `/ai`. Incluye **conceptos**, **arquitectura**, **código de ejemplo**, **pasos en orden** y **criterios de aceptación**.

> Cuando veas 🟢 es algo que ya puedes hacer hoy. 🟡 requiere infra previa. 🔴 fase futura.

---

## Índice

1. [Visión general del producto](#1-visión-general-del-producto)
2. [Arquitectura de alto nivel](#2-arquitectura-de-alto-nivel)
3. [Principios no negociables](#3-principios-no-negociables)
4. [Infraestructura común (CONSTRUIR PRIMERO)](#4-infraestructura-común)
5. [Los 7 Agentes — uno por uno](#5-los-7-agentes)
6. [Roadmap por fases](#6-roadmap-por-fases)
7. [Definition of Done](#7-definition-of-done)
8. [Glosario](#8-glosario)

---

## 1. Visión general del producto

Vendemos **7 agentes de IA** integrados a una plataforma de moda. No son chatbots aislados: comparten memoria del cliente y conocimiento de la marca.

| # | Agente | Qué hace en una frase | Quién lo usa |
|---|---|---|---|
| 1 | Customer Service | Responde dudas en WhatsApp/email | Cliente final |
| 2 | AI Stylist | Recomienda outfits | Cliente final |
| 3 | Content Generation | Genera textos e imágenes de producto | Equipo de la marca |
| 4 | Sizing & Fit | Sugiere talla correcta | Cliente final |
| 5 | Influencer Outreach | Busca y contacta influencers | Equipo de la marca |
| 6 | Dynamic Pricing | Ajusta precios | Sistema (con guardrails) |
| 7 | Executive Dashboard | Responde preguntas sobre métricas | Founder de la marca |

El copy comercial vive en `messages/en.json` y `messages/es.json` bajo el namespace `AI`. **Nunca** te alejes de esa promesa sin avisar.

---

## 2. Arquitectura de alto nivel

```
┌─────────────────────────────────────────────────────────────┐
│                   CANALES (entrada/salida)                  │
│  WhatsApp  │  Web (widget)  │  App móvil  │  Email  │  Dashboard │
└──────────┬──────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                      ORQUESTADOR                            │
│  (LangChain/LangGraph) — decide qué agente y qué tools usar │
└──────────┬──────────────────────────────────────────────────┘
           │
   ┌───────┴────────┬───────────┬──────────┬───────┐
   ▼                ▼           ▼          ▼       ▼
┌──────┐  ┌──────┐  ┌──────┐  …  ┌──────┐
│Agt 1 │  │Agt 2 │  │Agt 3 │     │Agt 7 │
└──┬───┘  └──┬───┘  └──┬───┘     └──┬───┘
   │         │         │             │
   ▼         ▼         ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                    INFRA COMÚN                              │
│  Knowledge Base │ Customer Memory │ Brand Voice │ Tools     │
│       (pgvector)        (Postgres)     (JSON)              │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                   FUENTES DE DATOS                          │
│  Shopify  │  POS  │  WhatsApp logs  │  Notion  │  CSVs      │
└─────────────────────────────────────────────────────────────┘
```

**Flujo típico (Agente 1 — Customer Service):**

1. Cliente escribe a WhatsApp: *"¿cuándo me llega mi pedido #4521?"*
2. Twilio dispara webhook → llega al **Orquestador**.
3. Orquestador identifica `brand_id` (por número de WhatsApp) y `customer_id` (por teléfono).
4. Detecta intención → enruta al **Agente 1**.
5. Agente 1 lee **Customer Memory** (¿es VIP?), llama tool `get_order_status(4521)`.
6. Compone respuesta con **Brand Voice** de Fuxia.
7. Devuelve mensaje a Twilio → llega al WhatsApp del cliente.
8. Todo se loguea.

---

## 3. Principios no negociables

1. **Multi-tenant por `brand_id`.** Toda tabla, toda query, toda llamada a modelo lleva `brand_id`. Nunca cruzar datos entre marcas.
2. **Observabilidad desde el día 1.** Cada llamada a un LLM se loguea: `brand_id`, `customer_id`, `agent_id`, `model`, `prompt_tokens`, `completion_tokens`, `latency_ms`, `cost_usd`, `outcome`.
3. **Feature flags por marca.** Cada agente debe poder apagarse para una marca específica sin redeploy.
4. **Human-in-the-loop por defecto.** Mientras estemos en MVP, todo lo que se publica/envía cara a cliente requiere aprobación humana, salvo Customer Service y Stylist.
5. **Latencia objetivo: < 800 ms promedio. Uptime: 99.99%.**
6. **Sin secrets en repo.** Usa `.env`. En producción usa el secret manager del cloud.
7. **Idempotencia.** Webhooks pueden llegar duplicados. Toda escritura debe poder repetirse sin efectos.

---

## 4. Infraestructura común

**🚨 Esto se construye antes de cualquier agente. Sin esto, los agentes no funcionan.**

### 4.1 Base de datos — esquema mínimo

PostgreSQL con extensiones `pgvector` (búsqueda por similitud) y `pg_trgm` (búsqueda por texto).

```sql
-- Marcas (tenants)
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,         -- 'fuxia'
  name TEXT NOT NULL,                -- 'Fuxia'
  config JSONB NOT NULL DEFAULT '{}', -- brand voice, locale, etc.
  feature_flags JSONB NOT NULL DEFAULT '{}', -- {"agent_1": true, ...}
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Clientes finales de cada marca
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id),
  external_id TEXT,                  -- id en Shopify
  phone TEXT,
  email TEXT,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (brand_id, phone),
  UNIQUE (brand_id, email)
);

-- "Memoria" del cliente: lo que cada agente necesita saber
CREATE TABLE customer_profiles (
  customer_id UUID PRIMARY KEY REFERENCES customers(id),
  loyalty_tier TEXT,                 -- 'silver' | 'gold' | 'platinum'
  size_preferences JSONB,            -- {"top": "M", "bottom": "28"}
  purchase_history JSONB,            -- resumen comprimido
  preferences JSONB,                 -- estilos que le gustan
  last_updated TIMESTAMPTZ DEFAULT now()
);

-- Documentos de la marca (políticas, FAQs, fichas de producto)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id),
  source TEXT NOT NULL,              -- 'shopify' | 'notion' | 'manual'
  type TEXT NOT NULL,                -- 'product' | 'policy' | 'faq'
  title TEXT,
  content TEXT NOT NULL,
  metadata JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Embeddings para búsqueda semántica (RAG)
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL,            -- denormalizado para filtrar rápido
  chunk TEXT NOT NULL,               -- pedazo del documento
  embedding VECTOR(1536) NOT NULL    -- ajusta a la dimensión del modelo
);
CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON embeddings (brand_id);

-- Conversaciones (todas las interacciones agente↔cliente)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL,
  customer_id UUID,
  channel TEXT NOT NULL,             -- 'whatsapp' | 'web' | 'email'
  started_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  role TEXT NOT NULL,                -- 'user' | 'assistant' | 'tool'
  content TEXT NOT NULL,
  agent_id TEXT,                     -- 'customer_service', 'stylist', ...
  metadata JSONB,                    -- tool calls, tokens, latency
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Logs de cada llamada a LLM (para costos y debugging)
CREATE TABLE llm_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL,
  agent_id TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_tokens INT,
  completion_tokens INT,
  latency_ms INT,
  cost_usd NUMERIC(10,6),
  status TEXT,                       -- 'ok' | 'error'
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.2 Knowledge Base (RAG)

**Qué es:** la "memoria a largo plazo" de cada marca. Documentos (productos, FAQs, políticas) convertidos en vectores para que el LLM pueda buscar lo relevante en cada pregunta.

**Pipeline de ingesta:**

```
Shopify/Notion/CSV  →  parser  →  chunks (~500 tokens)  →  embedding  →  pgvector
```

**Cuándo se reindexa:**
- Webhook `product.update` de Shopify → reindexa ese producto.
- Cron diario a las 3am → revisa cambios y reindexa.

**Ejemplo de búsqueda (Python):**

```python
from openai import OpenAI  # o el SDK que uses para embeddings
import psycopg

def search_kb(brand_id: str, query: str, k: int = 5):
    # 1. Embed del query
    emb = openai.embeddings.create(
        model="text-embedding-3-small",
        input=query
    ).data[0].embedding

    # 2. Busca top-K en pgvector, filtrando por marca
    with psycopg.connect(DSN) as conn:
        rows = conn.execute("""
            SELECT chunk, document_id
            FROM embeddings
            WHERE brand_id = %s
            ORDER BY embedding <=> %s::vector
            LIMIT %s
        """, (brand_id, emb, k)).fetchall()
    return rows
```

### 4.3 Brand Voice Config

JSON por marca, vive en `brands.config`. Ejemplo:

```json
{
  "voice": {
    "tone": "cálido, cercano, femenino, sin cursilerías",
    "language_default": "es-MX",
    "forbidden_words": ["barato", "rebaja"],
    "preferred_words": ["promo", "edición especial"],
    "emojis": "moderado, solo 💗 y ✨",
    "signature": "— el equipo Fuxia"
  },
  "policies": {
    "returns_days": 15,
    "shipping_free_over": 1500
  }
}
```

Este JSON se **inyecta en el system prompt** de todo agente que hable cara a cliente.

### 4.4 Orquestador

**Función:** recibir una entrada (mensaje, evento) y decidir qué agente activar.

Versión simple (sin LangChain) en pseudo-código:

```python
def handle_incoming_message(brand_id, customer_id, channel, text):
    intent = classify_intent(text)  # otra llamada a LLM, barata
    if intent in ("order_status", "return", "policy_question", "general_qa"):
        return run_agent("customer_service", brand_id, customer_id, text)
    elif intent in ("style_advice", "outfit_request"):
        return run_agent("stylist", brand_id, customer_id, text)
    elif intent == "size_question":
        return run_agent("sizing", brand_id, customer_id, text)
    else:
        return run_agent("customer_service", brand_id, customer_id, text)  # fallback
```

Cuando crezca, migra a **LangGraph** para tener estados y handoffs entre agentes.

### 4.5 Canales de entrada

#### WhatsApp (Twilio)
- Crear cuenta Twilio → activar WhatsApp Sandbox.
- Configurar webhook: `POST https://tu-backend/webhooks/whatsapp`.
- En el webhook: validar firma de Twilio, crear/buscar `customer`, llamar al orquestador.

#### Web widget
- Endpoint `POST /api/chat` que el front (este repo) llama.
- Devuelve respuesta o stream (SSE).

#### Email
- Resend o SendGrid con webhook de inbound parsing.

### 4.6 Observabilidad

- Logs estructurados (JSON) → enviar a [Better Stack](https://betterstack.com/) o [Axiom](https://axiom.co/).
- Métricas de LLM → tabla `llm_calls` + dashboard ([Langfuse](https://langfuse.com/) self-hosted o cloud).
- Errores → Sentry.

---

## 5. Los 7 Agentes

Para cada agente: **qué hace**, **stack**, **inputs/outputs**, **system prompt sugerido**, **tools**, **pasos para construirlo**, **criterios de aceptación**.

---

### 🟢 Agente 1 — Customer Service

#### Promesa pública
> "Resuelve el 90% de inquiries entrantes en WhatsApp y email, sonando exactamente como tu marca."

#### Stack
- Modelo: **Claude Sonnet 4.5+** (Anthropic API).
- RAG sobre Knowledge Base de la marca.
- Canales: WhatsApp, email, web chat.

#### Inputs
- `brand_id`, `customer_id`, `channel`, `message_text`, `conversation_history` (últimos 10 mensajes).

#### Outputs
- `reply_text` (string para enviar al cliente).
- Opcional: `tool_calls` ejecutadas.
- Opcional: `escalate_to_human` (bool) + `summary` si confianza baja.

#### System prompt (template)

```
Eres el asistente oficial de {{brand.name}}.

VOZ DE MARCA:
{{brand.config.voice}}

POLÍTICAS:
- Devoluciones: hasta {{brand.config.policies.returns_days}} días.
- Envío gratis sobre ${{brand.config.policies.shipping_free_over}}.

CLIENTE ACTUAL:
- Nombre: {{customer.name}}
- Tier loyalty: {{customer_profile.loyalty_tier}}
- Compras previas: {{customer_profile.purchase_history.summary}}

REGLAS:
1. Responde en máximo 3 oraciones salvo que pidan detalle.
2. Si no sabes algo con seguridad, di que vas a consultar y usa tool `create_human_ticket`.
3. NUNCA inventes números de pedido, fechas o políticas.
4. Si detectas frustración o queja seria, escala con `escalate_to_human`.
5. Usa los tools disponibles antes de responder.

CONTEXTO RELEVANTE (de la knowledge base):
{{rag_results}}
```

#### Tools que necesita

```python
tools = [
    {
        "name": "get_order_status",
        "description": "Consulta el estado de un pedido por su número.",
        "input_schema": {
            "type": "object",
            "properties": {"order_id": {"type": "string"}},
            "required": ["order_id"]
        }
    },
    {
        "name": "start_return",
        "description": "Inicia un proceso de devolución.",
        "input_schema": {
            "type": "object",
            "properties": {
                "order_id": {"type": "string"},
                "reason": {"type": "string"}
            },
            "required": ["order_id", "reason"]
        }
    },
    {
        "name": "lookup_policy",
        "description": "Busca información en las políticas de la marca.",
        "input_schema": {
            "type": "object",
            "properties": {"topic": {"type": "string"}},
            "required": ["topic"]
        }
    },
    {
        "name": "create_human_ticket",
        "description": "Escala a un humano. Usar cuando no se puede resolver.",
        "input_schema": {
            "type": "object",
            "properties": {
                "summary": {"type": "string"},
                "priority": {"type": "string", "enum": ["low", "med", "high"]}
            },
            "required": ["summary"]
        }
    }
]
```

#### Pasos para construirlo

1. Implementar las 4 funciones (mock al inicio: `get_order_status` devuelve hardcoded).
2. Endpoint `POST /agents/customer-service` que recibe `{brand_id, customer_id, message, history}`.
3. Construir system prompt con template + RAG (top-5 chunks).
4. Llamar a Claude con `tools=tools`.
5. Loop: si Claude pide tool → ejecutar → re-llamar con resultado. Hasta que devuelva texto final.
6. Guardar todo en `messages` y `llm_calls`.
7. Conectar con webhook de Twilio → end-to-end.

#### Criterios de aceptación

- [ ] Responde en < 3s p95.
- [ ] En 20 preguntas reales de Fuxia, acierta al menos 18.
- [ ] Detecta cuándo escalar (probar con "estoy MUY molesta").
- [ ] No inventa nunca un número de pedido (probar con `get_order_status` que devuelva "no existe").
- [ ] Logueado en `llm_calls` y `messages`.

---

### 🟡 Agente 2 — AI Stylist

#### Promesa pública
> "Recomienda outfits completos basados en compras pasadas, subiendo el AOV."

#### Stack
- Modelo: **Gemini 1.5 Pro** (mejor para multimodal/visión).
- Vector search sobre embeddings de productos (imagen + descripción).
- Reranking con LLM.

#### Cómo funciona (alto nivel)

1. **Cada producto** tiene un embedding multimodal (Gemini puede embeddear imagen+texto juntos).
2. **Cada cliente** tiene un "vector de gusto" (promedio de embeddings de sus compras).
3. **Recomendación:**
   - Vector search: top-50 productos más cercanos al gusto del cliente.
   - Filtros duros: en stock, dentro de presupuesto, talla disponible.
   - LLM rerank: arma 3-5 outfits coherentes con justificación.

#### Inputs/Outputs

```json
// Input
{
  "brand_id": "...",
  "customer_id": "...",
  "context": "outfit para boda de día",
  "base_item_sku": "FX-VST-091",  // opcional
  "budget_max": 3000               // opcional
}

// Output
{
  "outfits": [
    {
      "items": [{"sku": "...", "name": "...", "image": "...", "price": 1200}],
      "total": 2800,
      "rationale": "Combinamos el vestido base con accesorios en tono neutro porque has comprado mucho beige últimamente."
    }
  ]
}
```

#### Pasos para construirlo
1. Job batch: para cada producto de Fuxia, generar embedding (Gemini multimodal). Guardar en tabla `product_embeddings`.
2. Job batch: para cada cliente, recomputar "vector de gusto" cada noche.
3. Endpoint `POST /agents/stylist` que hace vector search + filtros + rerank.
4. Widget React en el front (este repo) que llama el endpoint y muestra outfits.

#### Criterios de aceptación
- [ ] Recomendaciones devueltas en < 2s.
- [ ] CTR de recomendaciones > 8% en piloto.
- [ ] Respeta stock y talla del cliente.
- [ ] Justificación en lenguaje natural y on-brand.

---

### 🟡 Agente 3 — Content Generation

#### Promesa pública
> "Genera miles de descripciones de producto, ads y captions de social."

#### Stack
- Texto: **Claude** (creatividad + brand voice).
- Imágenes: **Stable Diffusion** (vía Replicate o local) o **DALL-E**.
- **Solo dashboard interno**, nunca cara a cliente directo.

#### Inputs/Outputs

```json
// Input
{
  "brand_id": "...",
  "product_sku": "FX-BLZ-002",
  "format": "ig_caption",  // 'pdp_description' | 'meta_ad' | 'ig_caption' | 'email_subject'
  "variations": 3
}

// Output
{
  "drafts": [
    {"id": "v1", "text": "...", "hashtags": ["#..."]},
    {"id": "v2", "text": "...", "hashtags": ["#..."]},
    {"id": "v3", "text": "...", "hashtags": ["#..."]}
  ],
  "review_required": true
}
```

#### Pasos para construirlo
1. Catálogo de prompt templates por `format`.
2. Endpoint `POST /agents/content` que devuelve N variaciones.
3. UI de aprobación: el equipo de la marca aprueba/edita antes de publicar.
4. Cuando se aprueba, push a Shopify (PDP) o exporta CSV (ads).

#### Criterios de aceptación
- [ ] Cada draft pasa el filtro de `forbidden_words` de la marca.
- [ ] El equipo de Fuxia aprueba ≥ 60% sin editar.
- [ ] Imágenes generadas tienen metadata `ai_generated=true`.

---

### 🔴 Agente 4 — Sizing & Fit

#### Promesa pública
> "Predice talla correcta vía CV + histórico. Reduce devoluciones ~40%."

#### Stack
- Modelo CV: PyTorch propio (estima medidas desde foto).
- Modelo de fit: clasificador (gradient boosting) sobre histórico de devoluciones.
- Fallback: cuestionario de 3 preguntas.

#### Fases recomendadas
1. **Fase A (semanas 1-4):** solo cuestionario + tabla de tallas. Sin CV.
2. **Fase B (mes 2-3):** modelo de fit basado en histórico de devoluciones.
3. **Fase C (mes 4+):** Computer Vision real.

#### Privacidad
- **Fotos NO se almacenan más de 24h.**
- Solo se persisten medidas derivadas (números).
- Consentimiento explícito antes de subir foto.

#### Criterios de aceptación
- [ ] Reduce tasa de devolución por talla ≥ 30% vs baseline.
- [ ] No almacena fotos > 24h (auditable).

---

### 🔴 Agente 5 — Influencer Outreach

#### Promesa pública
> "Identifica, vetting y outreach a micro-influencers automáticamente."

#### Stack
- Instagram Graph API.
- LangChain + Claude.

#### Pipeline
1. **Discovery:** búsqueda por hashtag, geo, "cuentas similares".
2. **Vetting:** detectar engagement falso (heurísticas: ratio likes/seguidores, comentarios genéricos).
3. **Scoring:** fit con la marca (estética + tono) usando LLM con ejemplos.
4. **Outreach:** Claude redacta DM personalizado → operador aprueba → envío.

#### Compliance
- Respetar TOS de Instagram (no scraping agresivo, usar API oficial).
- Rate limiting estricto.

---

### 🔴 Agente 6 — Dynamic Pricing

#### Promesa pública
> "Ajusta precios en tiempo real según inventario, velocidad de venta y competencia."

#### Stack
- **MVP:** reglas heurísticas.
- **Fase 2:** Reinforcement Learning.

#### Reglas duras (siempre)
- Nunca por debajo de `costo + margen_minimo` (config por marca).
- Cambios > 10% requieren aprobación humana.
- Máximo 1 cambio de precio por SKU por día (no marear al cliente).
- Si baja > 5% → notificar a clientes en wishlist.

#### MVP — algoritmo simple
```
Si inventario > 80% del comprado y han pasado > 30 días:
   sugerir descuento de 10%
Si inventario < 20% y velocidad alta:
   sugerir subir precio 5%
```

---

### 🟡 Agente 7 — Executive Dashboard

#### Promesa pública
> "Tu cofundador AI. Responde preguntas sobre métricas en lenguaje natural."

#### Stack
- SQL Agent (text-to-SQL).
- Modelo: Gemini 1.5 Pro.
- Frontend: Dashboard web + WhatsApp del founder.

#### Cómo funciona

1. Founder pregunta: *"¿cómo vamos vs el mes pasado?"*.
2. LLM convierte a SQL contra el data warehouse, **filtrado por `brand_id` del usuario**.
3. Ejecuta query (solo SELECT, en réplica de lectura).
4. LLM convierte resultado en respuesta narrativa + recomienda gráfico.

#### Seguridad
- Solo `SELECT`. **Nunca** `INSERT/UPDATE/DELETE/DROP`.
- Whitelist de tablas accesibles.
- Filtro `brand_id` inyectado por código, no por LLM.
- Cap de filas y timeout de query.

#### Caching
- Queries comunes se cachean 1 hora.
- "¿ventas hoy?" → cache 5 min.

#### Criterios de aceptación
- [ ] Responde en < 5s p95.
- [ ] Nunca devuelve datos de otra marca (probar con prompt injection).
- [ ] Sugiere visualización adecuada (tabla, línea, barra).

---

## 6. Roadmap por fases

### Fase 0 — Preparación (semana 1-2)
- Repo backend creado, CI básico, deploy automático a staging.
- Postgres + pgvector levantado.
- Variables de entorno y secret manager configurados.
- Logging y Sentry funcionando.

### Fase 1 — MVP (semana 3-10)
- ✅ Knowledge Base + ingesta desde Shopify de Fuxia.
- ✅ Customer Memory (tabla + endpoints CRUD).
- ✅ Brand Voice Config para Fuxia.
- ✅ **Agente 1** end-to-end (WhatsApp + web).
- ✅ **Agente 7** versión básica (preguntas predefinidas).

### Fase 2 — Crecimiento (mes 3-4)
- ✅ **Agente 2** (Stylist) en widget web.
- ✅ **Agente 4** versión cuestionario.
- ✅ **Agente 3** (Content) en dashboard interno.
- ✅ Onboarding de segunda marca piloto.

### Fase 3 — Escala (mes 5+)
- ✅ **Agente 5** (Influencer Outreach).
- ✅ **Agente 6** (Dynamic Pricing) con reglas.
- ✅ **Agente 4** con Computer Vision.
- ✅ **Agente 6** con Reinforcement Learning.

---

## 7. Definition of Done

Un agente está "listo para producción" cuando:

- [ ] Endpoints documentados (OpenAPI/Swagger).
- [ ] Tests: unitarios + 5 escenarios end-to-end mínimo.
- [ ] Logueado en `llm_calls` con todos los campos.
- [ ] Dashboard de métricas: latencia p50/p95, costo/día, error rate, métrica de negocio.
- [ ] Runbook escrito: qué hacer si falla, cómo apagarlo por marca.
- [ ] Feature flag por marca (toggle sin redeploy).
- [ ] Revisión con producto contra el copy del sitio.
- [ ] Probado con datos reales de Fuxia.
- [ ] Privacidad/seguridad revisada (datos personales, prompt injection).

---

## 8. Glosario

| Término | Significado |
|---|---|
| **Tenant** | Cada cliente nuestro (cada marca). |
| **Multi-tenant** | Una sola app sirve a muchos tenants, datos aislados. |
| **`brand_id`** | UUID que identifica al tenant. Va en TODA query. |
| **LLM** | Large Language Model (Claude, Gemini, GPT). |
| **System prompt** | Instrucciones permanentes que recibe el LLM antes del input del usuario. |
| **Embedding** | Vector numérico que representa un texto/imagen. |
| **Vector DB** | Base de datos optimizada para búsqueda por similitud entre embeddings. |
| **RAG** | Retrieval-Augmented Generation. Buscar contexto y meterlo al prompt. |
| **Tool / Function calling** | Cuando el LLM "llama" funciones definidas por ti. |
| **Agent** | LLM + tools + memoria + objetivo. |
| **Orquestador** | Capa que decide qué agente/tool usar. |
| **Tenant config** | JSON con configuración por marca (voice, policies, flags). |
| **Idempotencia** | Que repetir una operación no cause efectos duplicados. |
| **Webhook** | URL tuya que un servicio externo llama cuando pasa un evento. |
| **HITL** | Human In The Loop. Humano aprueba antes de actuar. |
| **AOV** | Average Order Value. Ticket promedio. |
| **CTR** | Click-Through Rate. % de clicks sobre impresiones. |
| **PDP** | Product Detail Page. Página de producto. |
| **POS** | Point of Sale. Punto de venta físico. |
| **SLA** | Service Level Agreement. Compromiso de uptime/latencia. |
| **Feature flag** | Switch para activar/desactivar features sin redeploy. |
| **p95 / p99** | Percentil 95/99 de latencia (la mayoría de requests son más rápidos). |

---

## ¿Y ahora?

1. Lee `docs/ONBOARDING.md` si no lo has hecho.
2. Termina la **Fase 0**.
3. Construye **Infraestructura común (sección 4)**.
4. Empieza por **Agente 1** y muéstralo funcionando con Fuxia en WhatsApp.
5. Itera.

**Cualquier duda → pregunta. Es más barato que hacerlo dos veces.**
