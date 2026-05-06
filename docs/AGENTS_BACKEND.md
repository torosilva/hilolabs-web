# Hilo AI Stack — Especificación para Desarrollo

**Audiencia:** equipo de desarrollo backend / IA.
**Objetivo:** dejar claro qué son los 7 agentes que vendemos en la página `/ai`, qué tiene que hacer cada uno, qué stack usar, qué entrega cada uno y cómo se integran al resto de la plataforma (Loyalty + Commerce).

> El sitio (`src/components/ai/AIClient.tsx`) es el "menú" público. Este documento es **el qué hay detrás**.

---

## Principios

1. **AI native, no bolt-on.** Los agentes no son chatbots aparte. Viven dentro de los flujos de Loyalty, Commerce y back-office.
2. **Multi-canal.** WhatsApp, web, app y dashboard interno comparten el mismo cerebro (mismas bases de conocimiento, misma memoria del cliente).
3. **Cada marca es un tenant.** Todo agente debe operar con `brand_id` y nunca cruzar datos entre marcas.
4. **Latencia objetivo:** < 800 ms promedio. **Uptime:** 99.99%.
5. **Observabilidad obligatoria.** Cada llamada a un modelo debe loguearse: input, output, modelo, latencia, costo, `brand_id`, `customer_id`.

---

## Infraestructura común (construir primero)

Antes de cualquier agente, necesitamos:

### 1. Knowledge Base por marca
- **Qué:** vector store (pgvector o Vertex AI Vector Search) con los documentos de la marca: catálogo, políticas, FAQs, tono de voz, guías de talla.
- **Ingest:** worker que sincroniza desde Shopify (productos), Notion/Drive (políticas), CSVs (talla).
- **Re-index:** automático cada 24h + webhook on-change.

### 2. Customer Memory
- Tabla `customer_profiles`: historial de compra, talla, devoluciones, conversaciones previas, tier de loyalty.
- Cada agente lee/escribe aquí. Es la "memoria" compartida.

### 3. Brand Voice Config
- JSON por marca con: tono, palabras prohibidas, emojis permitidos, idioma default, firma.
- Inyectado en el system prompt de todo agente que genere texto cara a cliente.

### 4. Orquestador
- LangChain (o LangGraph) como capa de routing.
- Recibe input → decide qué agente(s) invocar → maneja tool-calls → devuelve respuesta.

### 5. Canales
- **WhatsApp Business API** (provider: Twilio o Meta directo).
- **Webhook web/app** (REST + WebSocket para streaming).
- **Email** (SendGrid o Resend).

---

## Los 7 Agentes

### Agent 1 — Customer Service
**Promesa:** resuelve el 90% de inquiries entrantes en WhatsApp y email, sonando como la marca.

| Campo | Valor |
|---|---|
| Stack | Claude Sonnet 4.6 + Knowledge Base de la marca |
| Canales | WhatsApp, email, chat web |
| Inputs | mensaje del cliente, `customer_id`, `brand_id`, historial |
| Outputs | respuesta en lenguaje natural + opcional: tool-call (crear ticket, consultar pedido, iniciar devolución) |
| Escalación | si confidence < umbral o detecta queja → handoff a humano con resumen |

**Tools que necesita exponer:**
- `get_order_status(order_id)`
- `start_return(order_id, reason)`
- `lookup_policy(topic)` → RAG sobre KB
- `create_human_ticket(summary, priority)`

**Métricas:** % deflection, CSAT post-conversación, tiempo medio de respuesta.

---

### Agent 2 — AI Stylist
**Promesa:** recomienda outfits completos basado en compras pasadas. Sube AOV y tamaño de carrito.

| Campo | Valor |
|---|---|
| Stack | Gemini 1.5 Pro + Vertex AI Vector Search (embeddings de producto) |
| Canales | App, web (widget en PDP/cart), WhatsApp |
| Inputs | `customer_id`, contexto opcional (ocasión, presupuesto, item base) |
| Outputs | 3-5 outfits con razón ("para tu evento del viernes"), links a producto |

**Implementación:**
- Embeddings de cada producto (imagen + descripción) → vector store.
- Embedding del perfil del cliente (compras + interacciones).
- Recomendación = similarity search + reranking con LLM aplicando reglas (stock, talla, presupuesto).

**Métricas:** CTR de recomendaciones, AOV pre/post, tasa de "add all to cart".

---

### Agent 3 — Content Generation
**Promesa:** genera miles de descripciones de producto, variaciones de ad y captions de social.

| Campo | Valor |
|---|---|
| Stack | Stable Diffusion (imágenes) + Claude (texto) |
| Canales | Dashboard interno de la marca (no cara a cliente) |
| Inputs | producto base (imagen, ficha técnica), formato (PDP, IG caption, Meta ad) |
| Outputs | drafts editables; versiones A/B/C por formato |

**Notas:**
- Texto siempre pasa por `brand_voice_config`.
- Imágenes generadas se marcan con metadata `ai_generated=true` y van a una cola de aprobación.
- Nunca publicar automáticamente. **Human-in-the-loop obligatorio.**

---

### Agent 4 — Sizing & Fit
**Promesa:** predice talla correcta vía CV + histórico. Reduce devoluciones ~40%.

| Campo | Valor |
|---|---|
| Stack | Modelo propio de Computer Vision (PyTorch) + histórico de devoluciones |
| Canales | PDP (web/app), WhatsApp ("¿qué talla me queda?") |
| Inputs | foto/medidas opcionales del cliente, `customer_id` (histórico), SKU |
| Outputs | talla recomendada + confianza + nota ("este corre chico") |

**Componentes:**
- Modelo CV: estima medidas a partir de foto frontal.
- Modelo de fit: dado (medidas + SKU + tabla de tallas de la marca + devoluciones de tallas similares) → predice talla.
- Fallback: cuestionario de 3 preguntas si no hay foto.

**Privacidad:** fotos NO se almacenan más de 24h. Solo medidas derivadas (números) se guardan.

---

### Agent 5 — Influencer Outreach
**Promesa:** identifica, vetting y outreach a micro-influencers, automático.

| Campo | Valor |
|---|---|
| Stack | Instagram Graph API + LangChain (Claude 3.5 Sonnet) |
| Canales | Dashboard interno + envío real por DM (con aprobación) |
| Inputs | brief de campaña, presupuesto, target geográfico/demográfico |
| Outputs | shortlist de influencers (engagement real, audiencia, fit de marca) + draft de DM personalizado |

**Pipeline:**
1. Discovery: buscar por hashtags, geo, similar accounts.
2. Vetting: chequear engagement orgánico vs. seguidores comprados (heurísticas + LLM).
3. Scoring: fit con la marca (estética + tono).
4. Outreach: draft DM personalizado → operador aprueba → envío.

**Compliance:** respetar TOS de Instagram. Sin scraping agresivo.

---

### Agent 6 — Dynamic Pricing
**Promesa:** ajusta precios en tiempo real según inventario, velocidad y competencia.

| Campo | Valor |
|---|---|
| Stack | Reinforcement Learning propio |
| Canales | Backend de Commerce (cambia precio en Shopify/POS) |
| Inputs | inventario actual, velocidad de venta, precios de competencia, márgenes mínimos |
| Outputs | precio sugerido + delta vs actual + razón |

**Reglas duras:**
- Nunca por debajo del costo + margen mínimo configurado por la marca.
- Cambios > X% requieren aprobación humana.
- Cap de cambios por día por SKU para no marear al cliente.

**MVP:** empezar con reglas heurísticas (no RL) hasta tener data suficiente. RL es fase 2.

---

### Agent 7 — Executive Dashboard
**Promesa:** "tu cofundador AI". Responde preguntas sobre métricas en lenguaje natural.

| Campo | Valor |
|---|---|
| Stack | SQL Agent + Gemini 1.5 Pro |
| Canales | Dashboard web interno, WhatsApp del founder |
| Inputs | pregunta en español/inglés ("¿cómo vamos vs el mes pasado?") |
| Outputs | respuesta narrativa + gráfico/tabla + link a vista detallada |

**Implementación:**
- Schema-aware SQL agent: tiene el esquema de la data warehouse en contexto.
- Capa de seguridad: solo SELECT, solo tablas del `brand_id` del usuario.
- Caching de queries comunes.
- Si la pregunta no se puede resolver con SQL → fallback a respuesta cualitativa basada en KB.

---

## Roadmap sugerido

**Fase 1 (MVP — primeros 60 días):**
- Infraestructura común (KB, Customer Memory, Brand Voice, canal WhatsApp).
- Agent 1 (Customer Service) end-to-end con una marca piloto (Fuxia).
- Agent 7 (Executive Dashboard) con queries básicas.

**Fase 2 (60–120 días):**
- Agent 2 (Stylist) en web + app.
- Agent 4 (Sizing) versión cuestionario; CV en backlog.
- Agent 3 (Content Generation) en dashboard interno.

**Fase 3 (120+ días):**
- Agent 5 (Influencer Outreach).
- Agent 6 (Dynamic Pricing) — empieza con reglas, luego RL.
- Agent 4 con Computer Vision real.

---

## Definition of Done por agente

Un agente está "listo" cuando:

- [ ] Endpoint(s) documentados en OpenAPI.
- [ ] Métricas en dashboard (latencia, costo/llamada, error rate, métrica de negocio).
- [ ] Logs estructurados con `brand_id`, `customer_id`, `agent_id`, `model`, `tokens_in/out`.
- [ ] Tests: unit + al menos 5 escenarios end-to-end.
- [ ] Runbook: qué hacer si el agente falla, cómo desactivarlo por marca.
- [ ] Feature flag por marca (poder apagarlo sin redeploy).
- [ ] Revisado con el equipo de producto contra el copy del sitio (`/ai` y `messages/*.json`).

---

## Stack técnico consolidado (referencia rápida)

| Capa | Tecnología |
|---|---|
| Modelos texto | Claude Sonnet 4.6, Gemini 1.5 Pro |
| Vector DB | Vertex AI Vector Search / pgvector |
| Computer Vision | Modelos PyTorch propios |
| Orquestación | LangChain / LangGraph |
| Canal mensajería | WhatsApp Business API |
| Observabilidad | Langfuse o Helicone (decidir) |
| Feature flags | LaunchDarkly o Unleash |
| SLA público | 99.99% uptime, < 800 ms latencia media |

---

## Contacto / dudas

Cualquier duda de producto: founder.
Cualquier duda de copy o cómo se vende cada agente: ver `messages/en.json` y `messages/es.json` namespace `AI`.
