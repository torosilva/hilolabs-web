# Onboarding — Desarrollador(a) HiloLabs

Bienvenida/o. Este documento te lleva de **cero** a **productivo** trabajando en HiloLabs.

Si algo no se entiende, **es bug del documento**, no tuyo. Anota la duda y la mejoramos.

---

## 0. ¿Qué es HiloLabs en 2 minutos?

HiloLabs es una **plataforma SaaS** para marcas de moda lideradas por mujeres latinas. Vendemos 3 productos integrados:

1. **Hilo Loyalty** — programa de puntos, tiers VIP, referidos.
2. **Hilo Commerce** — storefront (basado en Shopify) + app móvil.
3. **Hilo AI Stack** — 7 agentes de IA que automatizan operación, ventas y soporte.

Cada cliente nuestro es una "marca" (un *tenant*). Una marca usa uno, dos o los tres productos.

**Marca piloto:** Fuxia. Todo lo construimos primero para Fuxia, lo probamos, y luego lo ofrecemos a más marcas.

---

## 1. Stack que vas a tocar

### Frontend (este repo: `hilolabs-web`)
- **Next.js 16** con App Router → marketing site, lo que ven los clientes potenciales.
- **React 19** + **TypeScript** + **Tailwind 4**.
- **next-intl** para español/inglés.
- **framer-motion** para animaciones.

### Backend (otro repo, a construir)
- **Python** o **TypeScript** (a definir contigo).
- **PostgreSQL** con extensión **pgvector** (vector search).
- **Redis** (cache y colas).
- **LangChain / LangGraph** para orquestar agentes.
- **Modelos:** Claude (Anthropic) y Gemini (Google).
- **WhatsApp Business API** vía Twilio.
- **Hosting:** Vercel (front) + Railway/Fly.io o GCP (back).

> No te asustes si no conoces todo. La idea es ir aprendiendo agente por agente.

---

## 2. Setup local (paso a paso)

### 2.1 Software que necesitas
- [Node.js 20+](https://nodejs.org/) (mejor con [nvm](https://github.com/nvm-sh/nvm))
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/) (recomendado) con extensiones: ESLint, Tailwind CSS IntelliSense, Prettier.
- Cuenta en **GitHub** (pídele al founder que te dé acceso al repo).

### 2.2 Clonar y correr
```bash
git clone https://github.com/torosilva/hilolabs-web.git
cd hilolabs-web
npm install
npm run dev
```

Abre `http://localhost:3000`. Si ves el sitio: ✅ todo bien.

### 2.3 Estructura del repo
Lee primero el `README.md` para entender carpetas. Lo importante:
- `src/app/[locale]/` — cada carpeta es una página.
- `src/components/` — componentes React, agrupados por sección.
- `messages/en.json` y `messages/es.json` — todo el copy.

### 2.4 Cómo hacer un cambio
1. Crea una rama: `git checkout -b feat/mi-cambio`.
2. Edita el código.
3. Verifica: `npm run lint` y `npm run build`.
4. Commit: `git commit -m "feat: descripción corta"`.
5. Push: `git push -u origin feat/mi-cambio`.
6. Abre PR en GitHub hacia `main`.

**Convenciones de commit (Conventional Commits):**
- `feat:` — nueva funcionalidad
- `fix:` — bug
- `docs:` — documentación
- `refactor:` — código que no cambia comportamiento
- `chore:` — config, dependencias

---

## 3. Conceptos clave de IA (en cristiano)

Antes de tocar agentes, asegúrate de entender esto. Si algo no, **investiga + pregunta**.

| Concepto | Qué es (en una frase) | Dónde lo vas a usar |
|---|---|---|
| **LLM** | Modelo de lenguaje (Claude, GPT, Gemini). Recibe texto, devuelve texto. | Todos los agentes |
| **Prompt** | Lo que le mandas al LLM. | Todo |
| **System prompt** | Instrucciones permanentes ("eres un asistente de moda…"). | Todos los agentes |
| **Token** | Pedazo de palabra. Los modelos cobran por token. | Costos |
| **Embedding** | Vector numérico que representa un texto/imagen. | Búsqueda semántica |
| **Vector DB** | Base de datos que busca por similitud entre embeddings. | Knowledge Base |
| **RAG** (Retrieval-Augmented Generation) | Buscar info relevante en una DB y meterla al prompt. | Customer Service, Stylist |
| **Tool / Function calling** | Cuando el LLM "llama" una función tuya (ej. `get_order(123)`). | Customer Service |
| **Agent** | LLM + tools + memoria + objetivo. | Todo este doc |
| **Orquestador** | Código que decide qué agente/tool usar. | LangChain |
| **Tenant** | Cliente nuestro (cada marca). | Toda la base de datos |
| **Multi-tenant** | Una sola app sirve a muchos tenants, separando datos. | Arquitectura |

> Recurso recomendado: [Anthropic Cookbook](https://github.com/anthropics/anthropic-cookbook) (ejemplos de Claude).

---

## 4. Tu primer mes — plan sugerido

### Semana 1 — Familiarización
- [ ] Setup local del front, navegar todas las páginas.
- [ ] Leer `README.md`, `AGENTS.md`, `docs/AGENTS_BACKEND.md`, `docs/ONBOARDING.md` (este).
- [ ] Hacer un cambio chico al front (ej. corregir typo en `messages/es.json`) → PR → merge.
- [ ] Crear cuentas: Anthropic (Claude), Google AI Studio (Gemini), Twilio (WhatsApp sandbox), Supabase o Neon (Postgres con pgvector).
- [ ] Hacer "Hello World" llamando a Claude desde un script local.

### Semana 2 — Infra común
- [ ] Crear repo `hilolabs-backend` (vacío, con README y lint configurado).
- [ ] Setup Postgres con pgvector. Schema inicial: `brands`, `customers`, `customer_profiles`, `documents`, `embeddings`.
- [ ] Endpoint `POST /ingest` que recibe un documento, calcula embedding, lo guarda.
- [ ] Endpoint `POST /search` que recibe un query, devuelve top-K documentos.
- [ ] Logging estructurado (JSON) desde el día 1.

### Semana 3-4 — Agente 1 (Customer Service) MVP
- [ ] Conectar WhatsApp sandbox de Twilio.
- [ ] Recibir mensaje → buscar en Knowledge Base → responder con Claude.
- [ ] Loguear cada interacción.
- [ ] Probar con 20 preguntas reales de Fuxia.

Al final del mes 1: deberías poder mostrarle al founder un WhatsApp donde "le hablas a Fuxia" y el agente responde.

---

## 5. Reglas de oro

1. **Pregunta antes de asumir.** Mejor 5 minutos perdidos preguntando que 2 días reconstruyendo.
2. **No subas secrets al repo.** Usa `.env.local` y `.gitignore`. Nunca commitees API keys.
3. **Logs siempre.** Si no logueas, no debuggeas.
4. **Empieza simple.** Primera versión: un script feo que funcione. Refactor viene después.
5. **Cada feature detrás de feature flag.** Para poder apagarla sin redeploy.
6. **Multi-tenant desde el día uno.** Cada query lleva `brand_id`. Nunca lo "agregamos después".
7. **No publiques nada cara a cliente sin aprobación humana** mientras estemos en MVP.

---

## 6. Cuando te atasques

Orden sugerido:
1. Releer este doc + `AGENTS_BACKEND.md`.
2. Buscar en docs oficiales (Next, Anthropic, LangChain).
3. Probar en Claude/ChatGPT con contexto.
4. Preguntar al founder por Slack/WhatsApp con: **(a)** qué intentas hacer, **(b)** qué probaste, **(c)** qué error/comportamiento ves.

---

## 7. Próximo paso

Cuando termines este onboarding, ve a `docs/AGENTS_BACKEND.md` y empieza por la sección **"Infraestructura común"**. Es el cimiento de todo lo demás.
