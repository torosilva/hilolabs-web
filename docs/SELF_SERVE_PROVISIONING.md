# Self-Serve Provisioning — Cómo HiloLabs es SaaS de verdad

**Audiencia:** desarrollador(a) backend.
**Pre-requisito:** `ONBOARDING.md` + `AGENTS_BACKEND.md` (al menos sección 4 leída).

> "¿Cómo se disponibilizan los agentes por compra, sin intervención humana?" — esta es la pregunta SaaS clave. Este doc la responde paso a paso.

---

## 1. La promesa SaaS

Una founder de marca:

1. Entra a `hilolabs.ai`, hace clic en "Empezar".
2. Pone tarjeta y paga el plan que eligió.
3. Sigue un **wizard guiado de 5–10 minutos**.
4. **Al terminar, sus agentes ya están atendiendo en SU número de WhatsApp y SU tienda WooCommerce.**

Sin que nadie de HiloLabs tenga que tocar nada. Esa es la meta.

Esto se logra automatizando **5 cosas que tradicionalmente requieren humano**:

| Paso | Tradicional (con humano) | Self-serve (lo que vamos a construir) |
|---|---|---|
| Crear cuenta + cobrar | Llamada de ventas + invoice manual | Stripe Checkout |
| Crear tenant en nuestra DB | Sysadmin corre script | Webhook Stripe → provisioning automático |
| Conectar WooCommerce | "Mándame tus credenciales" por email | Plugin "Hilo Connector" para WordPress |
| Conectar WhatsApp Business | Submitir docs a Meta + esperar 2 semanas | Twilio Embedded Signup (15 min) |
| Cargar catálogo + configurar voz | Onboarding call de 1 hora | Ingesta automática + AI extrae brand voice del sitio |

---

## 2. Arquitectura de provisioning

```
┌──────────────────────────────────────────────────────────────┐
│  hilolabs.ai (este repo, marketing + signup)                 │
│                                                              │
│   "Empezar" → Stripe Checkout → Email de bienvenida          │
└──────────────┬───────────────────────────────────────────────┘
               │ webhook checkout.session.completed
               ▼
┌──────────────────────────────────────────────────────────────┐
│  Provisioning Service (backend)                              │
│                                                              │
│   1. Crea brand en DB                                        │
│   2. Crea subdominio admin: {slug}.app.hilolabs.ai           │
│   3. Genera credenciales del Brand Admin                     │
│   4. Crea sub-cuenta en Twilio (subaccount API)              │
│   5. Crea KB vacía en pgvector                               │
│   6. Encola job: "esperar a que la founder complete wizard"  │
│   7. Manda email con link mágico al wizard                   │
└──────────────┬───────────────────────────────────────────────┘
               │ founder hace login con magic link
               ▼
┌──────────────────────────────────────────────────────────────┐
│  Onboarding Wizard ({slug}.app.hilolabs.ai/setup)            │
│                                                              │
│   Step 1: Conectar WooCommerce (instalar plugin)             │
│   Step 2: Conectar WhatsApp (Twilio Embedded Signup)         │
│   Step 3: Confirmar Brand Voice (auto-detectado)             │
│   Step 4: Configurar políticas (devoluciones, descuentos)    │
│   Step 5: Activar agentes (toggles)                          │
│   Step 6: Test end-to-end (envía un WA real)                 │
│   Step 7: ¡Listo!                                            │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Paso a paso técnico

### 3.1 Signup + Pago (5 min de la founder)

**Stack:** Stripe Checkout + Stripe Customer Portal.

Flujo:

1. Founder en `hilolabs.ai/pricing` → selecciona plan ("Starter $199/mo").
2. Botón "Empezar" → llama a `POST /api/checkout/create-session` (este repo, Next.js).
3. Backend crea **Stripe Checkout Session** con:
   - `mode: "subscription"`
   - `line_items: [{price: STARTER_PRICE_ID, quantity: 1}]`
   - `subscription_data.trial_period_days: 14`
   - `metadata: {plan: "starter"}`
   - `success_url: hilolabs.ai/welcome?session_id={CHECKOUT_SESSION_ID}`
4. Redirect a Stripe → founder paga.
5. Stripe dispara webhook `checkout.session.completed` → llega al **Provisioning Service**.

**Por qué Stripe Checkout y no formulario propio:** Stripe maneja PCI compliance, 3DS, monedas locales, recuperación de pagos fallidos, métodos locales (OXXO en MX, etc.). Cero código de tarjetas para nosotros.

### 3.2 Provisioning automático (30 segundos sin que la founder vea nada)

**Worker que escucha webhook `checkout.session.completed`:**

```python
def handle_checkout_completed(session):
    # 1. Idempotencia: si ya existe un brand para esta session, skip
    if Brand.exists(stripe_session_id=session.id):
        return

    email = session.customer_email
    name = session.customer_details.name
    plan = session.metadata.plan

    # 2. Crear brand
    slug = slugify(name)  # 'fuxia'
    if Brand.exists(slug=slug):
        slug = f"{slug}-{shortid()}"

    brand = Brand.create(
        slug=slug,
        name=name,
        plan=plan,
        stripe_customer_id=session.customer,
        stripe_subscription_id=session.subscription,
        config=DEFAULT_BRAND_CONFIG,        # ver 3.6
        feature_flags=plan_to_flags(plan),  # ver tabla más abajo
        provisioning_status="pending_wizard"
    )

    # 3. Crear admin user
    admin = User.create(
        brand_id=brand.id,
        email=email,
        role="brand_admin",
        is_owner=True
    )

    # 4. Crear sub-cuenta en Twilio (para aislar números/costos por marca)
    subaccount = twilio.api.accounts.create(friendly_name=brand.slug)
    brand.twilio_subaccount_sid = subaccount.sid
    brand.twilio_subaccount_token = subaccount.auth_token  # encriptado en KMS
    brand.save()

    # 5. Inicializar Knowledge Base vacía (las tablas ya existen, solo marcamos)
    KnowledgeBase.initialize(brand.id)

    # 6. Mandar email con magic link al wizard
    magic_token = MagicLink.issue(user_id=admin.id, expires_in_hours=72)
    send_email(
        to=email,
        template="welcome_setup",
        data={
            "name": name,
            "wizard_url": f"https://{slug}.app.hilolabs.ai/setup?token={magic_token}",
            "support_email": "soporte@hilolabs.ai"
        }
    )

    # 7. Telemetry
    log_event("brand.provisioned", brand_id=brand.id, plan=plan)
```

**Garantías:** idempotente, atómico (transacción), recuperable (si Twilio falla, se reintenta).

### 3.3 Onboarding Wizard — Step 1: Conectar WooCommerce

Aquí está la parte más delicada. La founder tiene su WooCommerce y necesitamos credenciales para leer productos, recibir webhooks y crear órdenes/cupones.

**Tres opciones, en orden de fricción:**

#### Opción A — Plugin "Hilo Connector" (RECOMENDADO)

Construimos un plugin de WordPress que:
1. La founder instala desde el repo de WordPress.org (1 clic) o sube el `.zip`.
2. En la config del plugin, pega un **pairing code** (6 dígitos) que generamos en el wizard.
3. El plugin llama a `POST https://api.hilolabs.ai/wp-pair` con el código + URL del sitio.
4. Nuestro backend valida el código → genera REST API keys vía la API de WooCommerce automáticamente (`POST /wp-json/wc/v3/system_status/tools/regenerate_api_keys` con auth temporal) → guarda en `brand_woocommerce_credentials`.
5. El plugin también registra los **webhooks necesarios** (`product.updated`, `order.created`, etc.) apuntando a nuestro backend.

**Ventajas:**
- Cero conocimiento técnico de la founder.
- Webhooks configurados solos.
- Validamos versión de WP/WC y avisamos si falta algo.
- Podemos hacer push de actualizaciones (ej. nuevos endpoints) sin pedirle nada.

**Esfuerzo:** ~2 semanas de desarrollo PHP del plugin.

#### Opción B — Setup manual guiado (FALLBACK)

Si la founder no quiere instalar plugin:
1. Wizard muestra paso a paso con screenshots: "Ve a WooCommerce → Ajustes → Avanzado → REST API → Agregar clave".
2. Le pedimos pegar consumer key + consumer secret.
3. Backend valida llamando a `GET /wp-json/wc/v3/system_status`.
4. Backend crea webhooks vía `POST /wp-json/wc/v3/webhooks` desde el server.

**Desventaja:** ~10% de las founders se atasca aquí. Tener buen video tutorial.

#### Opción C — OAuth de WooCommerce (FUTURO)

WooCommerce soporta OAuth-like authorization endpoint (`/wc-auth/v1/authorize`). Mejor UX pero requiere que la marca tenga el sitio bien configurado con HTTPS y permalinks. **Para v2.**

#### Schema

```sql
CREATE TABLE brand_woocommerce_credentials (
  brand_id UUID PRIMARY KEY REFERENCES brands(id),
  store_url TEXT NOT NULL,                     -- 'https://fuxia.com'
  consumer_key_encrypted BYTEA NOT NULL,       -- encriptado con KMS
  consumer_secret_encrypted BYTEA NOT NULL,
  webhook_secret TEXT NOT NULL,
  wc_version TEXT,
  wp_version TEXT,
  health_status TEXT DEFAULT 'unknown',        -- 'healthy'|'degraded'|'down'
  last_health_check TIMESTAMPTZ,
  connected_at TIMESTAMPTZ DEFAULT now()
);
```

#### Verificación post-conexión

Antes de marcar el step como "completo", el backend corre health check:

```python
def verify_woocommerce_connection(brand_id):
    creds = get_credentials(brand_id)
    checks = {
        "auth": ping_endpoint(creds, "/system_status"),
        "products_visible": fetch_products(creds, limit=1).count > 0,
        "webhook_can_register": register_test_webhook(creds),
        "https": creds.store_url.startswith("https://"),
        "wc_version_min": parse_version(creds.wc_version) >= "7.0"
    }
    return checks
```

Si algo falla, mostrar mensaje claro y no dejar avanzar.

### 3.4 Onboarding Wizard — Step 2: Conectar WhatsApp Business

Esto es lo más doloroso de un SaaS de WhatsApp y donde la mayoría sangra. Tenemos 2 caminos:

#### Camino A — Twilio Embedded Signup (RECOMENDADO)

Twilio ofrece un widget embebido que hace TODO el flujo de Meta dentro de un iframe en nuestro wizard.

Pasos para la founder (15 min):
1. Click en "Conectar WhatsApp" en el wizard.
2. Se abre el widget de Twilio.
3. Inicia sesión con Facebook Business Manager (lo crea si no tiene).
4. Selecciona o crea WhatsApp Business Account.
5. Selecciona o agrega un número (o usa un Twilio number).
6. Verifica el número (SMS o llamada).
7. Acepta T&C de Meta.
8. Vuelve al wizard → ya está conectado.

Pasos para nosotros:
1. **Convertirnos en Twilio Tech Provider** (proceso con Twilio, ~2 semanas, 1 vez).
2. Implementar callback que recibe el `subaccount_sid` + `phone_number_sid` cuando termina.
3. Crear plantillas de mensajes pre-aprobadas en Meta (ver abajo).

#### Camino B — Bring Your Own Number (FALLBACK)

Si la founder ya tiene WhatsApp Business API con otro proveedor (ej. 360dialog, MessageBird), darle opción de migrar el número (1–3 días) o conectar via APIs.

#### Plantillas de mensajes pre-aprobadas

Meta exige que **el primer mensaje saliente** (fuera de ventana de 24h) sea una *Message Template* aprobada. Pre-creamos estas y las aprobamos con Meta una vez:

```
Template: hilo_followup_value
Idioma: es-MX
Texto: "Hola {{1}}, vi que te interesó {{2}}. ¿Te ayudo con la talla o envío? 💗 — {{3}}"
Categoría: MARKETING
Botones: ["Ver producto", "Hablar ahora"]
```

El Sales Closer (Agente 6) usa estas templates para los toques de cadencia que caen fuera de la ventana de 24h.

#### Schema

```sql
CREATE TABLE brand_whatsapp_config (
  brand_id UUID PRIMARY KEY REFERENCES brands(id),
  twilio_subaccount_sid TEXT NOT NULL,
  whatsapp_phone_number TEXT NOT NULL,        -- E.164: '+5215512345678'
  whatsapp_phone_sid TEXT NOT NULL,
  meta_business_id TEXT,
  waba_id TEXT,                                -- WhatsApp Business Account ID
  display_name TEXT,
  status TEXT DEFAULT 'pending',               -- 'pending'|'active'|'suspended'
  quality_rating TEXT,                         -- 'green'|'yellow'|'red' (de Meta)
  connected_at TIMESTAMPTZ
);
```

### 3.5 Onboarding Wizard — Step 3: Brand Voice auto-detectada

No le pedimos a la founder que escriba un brand voice manual. **Lo extraemos de su sitio web automáticamente:**

```python
def auto_detect_brand_voice(brand_id):
    store_url = get_store_url(brand_id)

    # 1. Crawl ligero del sitio (home, about, 5 PDPs, IG bio)
    pages = crawl(store_url, max_pages=10)

    # 2. Pasa a Claude para extraer
    voice_json = claude.messages.create(
        model="claude-sonnet-4.5",
        system=BRAND_VOICE_EXTRACTION_PROMPT,
        messages=[{"role": "user", "content": "\n\n".join(pages)}]
    )

    # 3. Guarda como propuesta para que la founder confirme/edite
    brand = Brand.get(brand_id)
    brand.config["voice"] = voice_json
    brand.save()

    return voice_json
```

`BRAND_VOICE_EXTRACTION_PROMPT` le pide a Claude devolver:

```json
{
  "tone": "...",
  "language_default": "es-MX",
  "forbidden_words": [],
  "preferred_words": [],
  "emojis": "...",
  "signature": "— el equipo {{brand_name}}",
  "example_replies": {
    "greeting": "...",
    "size_question": "...",
    "complaint": "..."
  }
}
```

Wizard muestra el JSON en un editor amigable: la founder puede editar inline antes de guardar.

### 3.6 Onboarding Wizard — Step 4: Políticas

Form simple con defaults razonables (la founder solo confirma):

- Días de devolución: `15`
- Envío gratis sobre: `$1500`
- Descuento máximo del Sales Closer: `15%`
- Trigger de descuento: tras `3` toques sin conversión
- Quiet hours: `22:00–08:00` hora local
- Idioma default de las respuestas: detectado de WP locale

### 3.7 Onboarding Wizard — Step 5: Activar agentes

Toggle por agente, **respetando el plan contratado**:

| | Starter | Growth | Scale |
|---|---|---|---|
| Agente 1 — Customer Service | ✅ | ✅ | ✅ |
| Agente 2 — Stylist | — | ✅ | ✅ |
| Agente 3 — Content Generation | — | ✅ | ✅ |
| Agente 4 — Sizing | — | ✅ | ✅ |
| Agente 5 — Try-On & Body Stylist | — | — | ✅ |
| Agente 6 — Sales Closer | ✅ | ✅ | ✅ |
| Agente 7 — Executive Dashboard | — | ✅ | ✅ |
| Mensajes WA / mes | 1k | 10k | ilimitado |
| Try-ons / mes | — | — | 2k |

Cada toggle escribe a `brands.feature_flags` y al activarse arranca jobs (ej. ingesta inicial del catálogo, primer crawl para brand voice).

### 3.8 Onboarding Wizard — Step 6: Test end-to-end

Antes de marcar "completado":

1. Backend manda un WhatsApp de prueba al **número de la founder** (no a clientes), simulando un cliente.
2. La founder responde "ok" → verificamos que el ciclo entero funciona.
3. Si funciona → `brand.provisioning_status = "live"` → arrancan los agentes para tráfico real.

### 3.9 Ingesta inicial del catálogo (background)

Apenas se conecta WooCommerce, se encola un job:

```python
def initial_catalog_sync(brand_id):
    creds = get_woocommerce_credentials(brand_id)
    products = fetch_all_products(creds)  # paginado
    for product in products:
        # 1. Guarda en `documents`
        # 2. Chunking + embeddings
        # 3. Upsert en `embeddings` (pgvector)
        index_product(brand_id, product)
    log("catalog_sync_complete", brand_id=brand_id, count=len(products))
```

Se notifica a la founder por email cuando termina ("Tu catálogo de 247 productos está listo. Tus agentes ya pueden recomendarlos.").

A partir de ahí, **incremental sync** vía webhooks `product.updated` / `product.created` / `product.deleted`.

---

## 4. Subscription lifecycle (mantener vivo el SaaS)

Webhooks de Stripe que el Provisioning Service maneja:

| Evento Stripe | Qué hacemos |
|---|---|
| `checkout.session.completed` | Crear brand (sección 3.2) |
| `customer.subscription.updated` | Actualizar `plan` y `feature_flags` (upgrade/downgrade) |
| `invoice.paid` | Resetear contadores de uso del mes |
| `invoice.payment_failed` | Email + push notif. Tras 3 intentos: `provisioning_status = "past_due"`, agentes degradan a solo-lectura |
| `customer.subscription.deleted` | `provisioning_status = "cancelled"`, agentes off, datos retenidos 30 días, luego anonimizar |

#### Cambio de plan (upgrade/downgrade) self-serve

Founder entra a `{slug}.app.hilolabs.ai/billing` → portal de Stripe (Stripe Customer Portal, sin código nuestro) → cambia plan → webhook → ajustamos `feature_flags`. Cero intervención humana.

#### Metering de uso

Cada llamada a un agente consulta cuota:

```python
def can_invoke_agent(brand_id, agent_id):
    usage = get_monthly_usage(brand_id, agent_id)
    quota = get_plan_quota(brand_id, agent_id)
    return usage < quota
```

Si se pasa, devolver respuesta degradada ("Estás cerca del límite, considera Growth") y notificar.

---

## 5. Brand Admin Portal ({slug}.app.hilolabs.ai)

Subdominio por marca, generado automáticamente. Es un Next.js separado del marketing site (este repo). Funcionalidades mínimas:

- **Dashboard:** ventas, conversión por agente, costos, uso vs cuota.
- **Conversaciones:** ver transcripts de WhatsApp por cliente, revisar/editar tono.
- **Agentes:** toggles + configuración (políticas, descuentos, brand voice).
- **Knowledge Base:** ver/editar documentos manualmente, forzar reindex.
- **Billing:** link al Stripe Customer Portal.
- **Logs:** auditoría de cada acción de cada agente (por compliance).

Hosting: Vercel con **wildcard domain** `*.app.hilolabs.ai` apuntando al deployment. Cada request lee el subdomain → resuelve `brand_id` → carga config.

---

## 6. ¿Qué SÍ requiere humano (al menos en MVP)?

Hay que ser honestos. En la primera versión, estos casos siguen necesitando que un humano nuestro intervenga:

| Caso | Cuándo se automatiza |
|---|---|
| Marca quiere idioma que aún no soportamos (ej. portugués) | Cuando agreguemos i18n por marca |
| WooCommerce muy custom (themes que rompen REST) | Mejorando el plugin Hilo Connector |
| Disputas de pago, fraude | Stripe Radar lo cubre, pero casos extremos sí |
| Quality rating de WhatsApp se pone rojo (Meta restringe) | Agregando auto-pause + email educativo |
| Violación de políticas (contenido inapropiado generado) | Mejorando filtros pre-publicación |

Documentar estos casos en el runbook interno y tener un email `soporte@hilolabs.ai` que cae en un canal de Slack.

---

## 7. Orden de implementación

**Bloque 1 — Pago + Provisioning (semana 1-2):**
1. Stripe Checkout en este repo (front).
2. Provisioning Service: tabla `brands`, webhook `checkout.session.completed`, magic link.
3. Skeleton del subdomain `{slug}.app.hilolabs.ai`.

**Bloque 2 — WooCommerce Connector (semana 3-5):**
4. Plugin `hilo-connector` para WordPress (PHP).
5. Endpoint `/wp-pair` y verificación.
6. Job de ingesta inicial del catálogo.

**Bloque 3 — WhatsApp (semana 6-8):**
7. Aplicar a Twilio Tech Provider (en paralelo desde semana 1).
8. Integrar Twilio Embedded Signup en el wizard.
9. Pre-aprobar templates en Meta.

**Bloque 4 — Wizard completo (semana 9-10):**
10. Brand voice auto-detection.
11. UI del wizard con todos los steps.
12. Test end-to-end automático.

**Bloque 5 — Lifecycle + Admin Portal (semana 11-12):**
13. Webhooks Stripe restantes (subscription updates, payment failed).
14. Brand Admin Portal v1 (dashboard + agentes + billing link).

**A partir de aquí:** primera marca self-serve real.

---

## 8. Definition of Done — "es SaaS de verdad"

- [ ] Una founder ajena a HiloLabs puede pasar de `hilolabs.ai` a "agentes funcionando" en < 30 min sin que nadie nuestro intervenga.
- [ ] El churn de un cliente (cancelar) tampoco requiere humano.
- [ ] Upgrade/downgrade de plan tampoco.
- [ ] El sistema soporta provisioning concurrente de N marcas sin race conditions.
- [ ] El costo de provisioning < $5 por marca (Twilio + cómputo + emails).
- [ ] Métricas de funnel: % que paga → % que conecta WC → % que conecta WA → % que activa al menos un agente → % live.
- [ ] Documentación pública (`docs.hilolabs.ai`) que cubre las 10 dudas más comunes (auto-generada del knowledge base interno).
