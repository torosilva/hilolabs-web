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
| 5 | Virtual Try-On & Body-Aware Stylist | Probador virtual con foto real + cross-sell según tipo de cuerpo | Cliente final |
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

### 🔴 Agente 5 — Virtual Try-On & Body-Aware Stylist

#### Promesa pública
> "La clienta sube una foto y ve cómo le queda cada prenda en su cuerpo real. El agente analiza silueta y tipo de cuerpo para sugerir las piezas que mejor le favorecen y hacer cross-sell con productos complementarios de la marca."

#### Por qué importa (el "killer feature" de HiloLabs)

Las marcas latinas venden a cuerpos **reales y diversos**. Las modelos de catálogo no representan a la mayoría de las clientas, y el principal motivo de devolución es *"no me queda como pensé"*. Este agente:

1. **Reduce devoluciones**: la clienta ve la prenda en SU cuerpo antes de comprar.
2. **Sube AOV**: cross-sell de outfits completos basados en su silueta.
3. **Genera contenido**: cada try-on es opcionalmente compartible (UGC con consentimiento).
4. **Es multi-marca**: misma infra sirve a Fuxia, a la siguiente marca, a la siguiente.

#### Diferencia con Agente 2 y Agente 4

| Agente | Pregunta que responde | Input principal |
|---|---|---|
| **2 — Stylist** | "¿Qué outfits combinan según mis compras pasadas?" | Histórico de compras |
| **4 — Sizing & Fit** | "¿Qué talla me queda?" | Medidas / cuestionario / foto |
| **5 — Try-On & Body Stylist** | "¿Cómo me veo con esto puesto y qué más me favorece?" | **Foto del cuerpo + catálogo visual** |

Los tres comparten infraestructura (Customer Memory, embeddings de producto), pero responden necesidades distintas. Pueden usarse combinados (ej.: 5 sugiere prenda → 4 confirma talla → 2 arma el outfit completo).

#### Stack

| Componente | Tecnología | Por qué |
|---|---|---|
| Body segmentation & pose | **MediaPipe** o **SAM 2** + **OpenPose** | Detectar silueta, postura, puntos clave del cuerpo |
| Body type classifier | Modelo propio (PyTorch) entrenado sobre proporciones | Clasificar en tipos: reloj de arena, triángulo, rectángulo, óvalo, triángulo invertido |
| Virtual Try-On | **IDM-VTON** o **OOTDiffusion** (open source) vía Replicate | Generar imagen de la clienta usando la prenda |
| Razonamiento de styling | **Gemini 1.5 Pro Vision** (multimodal) | "Mira" la imagen de la clienta + catálogo y razona qué le favorece |
| Cross-sell ranking | Vector search (pgvector) sobre embeddings de producto | Productos complementarios (zapatos, accesorios, capa exterior) |

> **Decisión clave a validar con producto:** ¿hosting propio de IDM-VTON (más caro pero control total) o vía Replicate (más rápido para MVP)? **Recomendación: Replicate para MVP, migrar a self-hosted en escala.**

#### Cómo funciona — flujo completo

```
1. La clienta abre PDP de un vestido
   ↓
2. Tap en "Pruébatelo virtualmente"
   ↓
3. Permiso explícito + sube foto (cuerpo completo, fondo neutro)
   ↓
4. Pipeline de visión:
   - Segmentación corporal (separar persona del fondo)
   - Pose estimation (puntos clave: hombros, cintura, cadera, etc.)
   - Cálculo de proporciones (ratio hombros:cintura:cadera)
   - Clasificación de tipo de cuerpo
   ↓
5. Virtual Try-On (IDM-VTON):
   - Input: foto persona + foto producto (flat lay o modelo)
   - Output: imagen de la clienta usando la prenda
   ↓
6. Body-aware reasoning (Gemini Vision):
   - Input: foto clienta + tipo de cuerpo + prenda probada + catálogo de la marca
   - Output: "Esta blusa te favorece porque marca cintura. Para tu silueta también recomiendo
             estos pantalones de tiro alto y este blazer estructurado."
   ↓
7. Cross-sell:
   - Vector search top-20 productos complementarios al outfit base
   - Filtros: stock, talla disponible (cruzar con Agente 4), presupuesto opcional
   - Re-rank con Gemini explicando "por qué te queda bien"
   ↓
8. UI muestra:
   - Imagen del try-on (compartible con consentimiento)
   - 3-5 productos sugeridos con razón
   - Botón "Probarme también esto" (re-corre el try-on con cada uno)
   - Botón "Agregar outfit completo al carrito"
```

#### Inputs / Outputs

```json
// POST /agents/try-on
{
  "brand_id": "uuid",
  "customer_id": "uuid",
  "base_product_sku": "FX-VST-091",
  "photo_id": "uuid_de_foto_subida",  // referencia a foto efímera
  "consent_share": false
}

// Response
{
  "try_on_image_url": "https://cdn.../tryons/abc123.jpg",
  "body_analysis": {
    "body_type": "hourglass",
    "proportions": {"shoulder_waist": 1.35, "waist_hip": 0.72},
    "confidence": 0.87
  },
  "fit_assessment": {
    "summary": "Esta prenda marca tu cintura y favorece tu silueta de reloj de arena.",
    "score": 9
  },
  "cross_sell": [
    {
      "sku": "FX-PNT-022",
      "name": "Pantalón tiro alto crema",
      "reason": "Equilibra el largo del vestido y alarga la pierna.",
      "image_url": "...",
      "price": 1290,
      "size_recommended": "M"
    }
  ],
  "complete_outfit_cta": {
    "skus": ["FX-VST-091", "FX-PNT-022", "FX-ACC-101"],
    "total": 3580,
    "discount_if_bundle": 358
  }
}
```

#### Privacidad — NO NEGOCIABLE 🔒

Las fotos del cuerpo de la clienta son data **extremadamente sensible**. Reglas:

1. **Consentimiento explícito** antes de subir foto (checkbox + texto claro, no pre-marcado).
2. **Almacenamiento efímero**: foto original se borra a las **24 horas** máximo.
3. **Lo que sí se persiste** (por meses, anonimizado):
   - Tipo de cuerpo clasificado (categoría, no foto).
   - Proporciones numéricas.
   - Try-on generado SOLO si la clienta dio consentimiento explícito de guardar.
4. **Nunca compartir** entre marcas. Multi-tenant estricto.
5. **Nunca usar para entrenar modelos** sin consentimiento adicional opt-in.
6. **Cumplimiento**: GDPR, LFPDPPP (México), CCPA. Right to deletion implementado.
7. **Watermark invisible** en try-ons generados para detectar usos indebidos.
8. **Nunca generar try-ons de menores**. Detector de edad + bloqueo si < 18.

> Antes de lanzar, **revisión legal obligatoria**.

#### Schema adicional

```sql
-- Fotos efímeras (TTL 24h, job de limpieza)
CREATE TABLE photo_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  storage_url TEXT NOT NULL,           -- S3/GCS, signed URL
  consent_given_at TIMESTAMPTZ NOT NULL,
  consent_share BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  deleted_at TIMESTAMPTZ
);

-- Análisis de cuerpo (anonimizado, persistente)
CREATE TABLE body_profiles (
  customer_id UUID PRIMARY KEY REFERENCES customers(id),
  body_type TEXT,                       -- 'hourglass' | 'pear' | etc
  proportions JSONB,
  measurements_estimated JSONB,
  confidence NUMERIC(3,2),
  last_updated TIMESTAMPTZ DEFAULT now()
);

-- Try-ons generados
CREATE TABLE try_ons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  product_sku TEXT NOT NULL,
  result_url TEXT,                      -- null si la clienta no dio consentimiento de guardar
  fit_score INT,
  led_to_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### Pasos para construirlo

**Fase A — Body classifier (semanas 1-2)**
1. Recolectar dataset etiquetado (open source: DeepFashion, propio con consentimiento).
2. Entrenar (o fine-tune) modelo de clasificación de tipo de cuerpo.
3. Endpoint `POST /vision/body-analyze` que recibe foto y devuelve tipo + proporciones.

**Fase B — Try-On vía Replicate (semanas 3-4)**
4. Integrar IDM-VTON vía API de Replicate.
5. Endpoint `POST /vision/try-on` que recibe (foto persona, foto producto) → devuelve imagen.
6. Cache de resultados por `(customer_id, sku)` para no re-generar.

**Fase C — Cross-sell con razonamiento (semanas 5-6)**
7. Embeddings multimodales del catálogo (re-uso de Agente 2).
8. Prompt a Gemini Vision con: foto try-on + tipo cuerpo + top-20 candidatos del catálogo.
9. Devolver 3-5 con razón en lenguaje natural.

**Fase D — UI + integración (semanas 7-8)**
10. Componente React en este repo: subir foto, mostrar try-on, carrusel de cross-sell.
11. Integrar con Agente 4 (talla) y Agente 1 (preguntas durante el try-on).
12. Tracking de conversión: try-on → add to cart → purchase.

**Fase E — Hardening (continuo)**
13. Job de limpieza de fotos > 24h.
14. Auditoría de seguridad y privacidad.
15. Watermarking, detección de menores.

#### System prompt (cross-sell con Gemini Vision)

```
Eres estilista personal experta en {{brand.name}}.

Estás viendo una foto de una clienta probándose una prenda virtualmente.

DATOS:
- Tipo de cuerpo: {{body_type}}
- Proporciones: {{proportions}}
- Prenda actual: {{current_product}}
- Tier loyalty: {{customer_profile.loyalty_tier}}
- Voz de marca: {{brand.config.voice}}

CATÁLOGO DISPONIBLE (top-20 candidatos relevantes):
{{candidate_products_with_images}}

TU TAREA:
1. Mira la imagen del try-on y evalúa cómo le queda en escala 1-10.
2. Selecciona 3-5 productos del catálogo que armen un OUTFIT completo y favorezcan su silueta.
3. Para cada uno, da UNA razón corta (máx 15 palabras), específica al tipo de cuerpo.
4. Habla en segunda persona ("te queda", "alarga tu pierna").
5. Nunca uses palabras prohibidas: {{brand.config.voice.forbidden_words}}.
6. Nunca menciones tallas (eso lo maneja otro agente).

Devuelve JSON estructurado.
```

#### Criterios de aceptación

- [ ] Try-on generado en < 8s p95 (puede ser asíncrono con loader).
- [ ] Conversión try-on → add-to-cart > 25% en piloto.
- [ ] Reducción de devoluciones por "no me quedó" > 25% vs baseline.
- [ ] AOV de sesiones con try-on > 1.4× vs sesiones sin try-on.
- [ ] 0 fotos almacenadas más de 24h (auditable con cron + alerta).
- [ ] Consentimiento explícito documentado por cada upload.
- [ ] Probado en ≥ 4 tipos de cuerpo distintos con ≥ 3 marcas distintas.
- [ ] Funciona en móvil (cámara nativa) y web.

#### Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| IDM-VTON da resultados raros (manos extra, distorsión) | Quality gate: scoring automático + fallback a "no disponible" si baja del umbral |
| Costo por try-on alto en Replicate | Caching agresivo + presupuesto por marca + posible self-hosting en escala |
| Sesgo del modelo en cuerpos no-occidentales | Validar con dataset diverso, métricas por tipo de cuerpo, opt-in para reportar problemas |
| Mal uso (clientas suben fotos de terceros) | Términos de uso claros + watermark + detector de edad |
| Latencia mata la experiencia | Procesamiento asíncrono + push notification cuando esté listo |

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
- ✅ **Agente 5** Fase A+B (body classifier + try-on básico vía Replicate). **Killer feature: prioridad alta.**
- ✅ Onboarding de segunda marca piloto.

### Fase 3 — Escala (mes 5+)
- ✅ **Agente 5** Fase C+D (cross-sell con razonamiento + UI completa) y hardening de privacidad.
- ✅ **Agente 6** (Dynamic Pricing) con reglas.
- ✅ **Agente 4** con Computer Vision (re-uso del pipeline del Agente 5).
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
