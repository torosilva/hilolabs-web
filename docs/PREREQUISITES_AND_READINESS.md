# Prerequisitos y Brand Readiness — el "cold start"

**Audiencia:** desarrollador(a) backend + producto.
**Pre-requisito:** `SELF_SERVE_PROVISIONING.md`.

> El doc de provisioning asumía que la marca ya tenía WooCommerce y un número de WhatsApp Business. **Muchas marcas latinas no los tienen.** Este doc resuelve qué hacer en cada caso, sin perder la promesa SaaS.

---

## 1. La realidad del mercado

Cuando una founder de marca de moda latina llega a HiloLabs, su estado real suele ser uno de estos:

| Tipo de marca | % estimado | Lo que tiene | Lo que le falta |
|---|---|---|---|
| 🟢 **Ready** | 10% | WooCommerce, WA Business, Meta BM, dominio | Nada estructural |
| 🟡 **Partial** | 30% | Solo storefront (Shopify/Wix/WC) **o** solo WA Business | Lo otro |
| 🟠 **Instagram-only** | 50% | Solo Instagram + DMs + WA personal | Storefront, WA Business, Meta BM |
| 🔴 **Greenfield** | 10% | Idea, sin nada digital | Todo |

El doc anterior solo servía al 10% 🟢. Este doc cubre el 100%.

---

## 2. Las 9 cosas que una marca necesita para que HiloLabs funcione

| # | Prerequisito | Crítico | Quién lo provee |
|---|---|---|---|
| 1 | Storefront (catálogo + checkout) | 🔴 sí | WooCommerce de ellas o **Hilo Storefront managed** |
| 2 | Dominio propio | 🟡 importante | Compra en Namecheap/Cloudflare o subdominio Hilo |
| 3 | Hosting WordPress | 🟡 si optan WC | Self-managed, o **Hilo Hosting managed** |
| 4 | Número WhatsApp Business API | 🔴 sí | Migrar el suyo o provisionar uno nuevo via Twilio |
| 5 | Meta Business Manager | 🔴 sí (para WA) | Crear con OAuth de Meta o usar el de Hilo (BSP) |
| 6 | Pasarela de pago | 🔴 sí | Stripe, MercadoPago, OpenPay, Conekta — connect onboarding |
| 7 | Catálogo de productos (fotos + datos) | 🔴 sí | Subir CSV o importar de IG Shop |
| 8 | Términos y Política de Privacidad | 🟡 importante | Generador automático con plantilla legal |
| 9 | Cuenta bancaria de la marca | 🔴 sí | Conectada en la pasarela de pago (no la tocamos directo) |

🔴 = bloqueante. 🟡 = puede arrancar sin esto pero hay que resolverlo pronto.

---

## 3. La idea central: **Readiness Check ANTES del pago**

No le cobramos a una marca antes de saber qué le falta. El flujo es:

```
1. hilolabs.ai → "Empezar"
2. Wizard de Readiness Check (5 min, sin tarjeta)
3. Resultado: "Estás en Track A / B / C"
4. Cada track muestra precio + tiempo + qué incluye
5. Stripe Checkout con el plan correcto para el track
6. Provisioning automático adaptado al track
```

Así nadie paga sin saber qué va a pasar y nosotros no quedamos atrapados con expectativas imposibles.

---

## 4. Los 3 Onboarding Tracks

### 🟢 Track A — "Connect" (el del doc anterior)

**Para:** marcas que ya tienen WooCommerce + número WA Business.

- Tiempo a "live": **30 minutos**.
- Precio: el plan base (Starter/Growth/Scale).
- Self-serve: 100%.
- Flujo: el del `SELF_SERVE_PROVISIONING.md`.

### 🟡 Track B — "Launch" (la mayoría)

**Para:** marcas con storefront pero sin WA Business, **o** con WA pero sin storefront, **o** queriendo migrar de otra plataforma (Shopify, Wix, Tiendanube).

- Tiempo a "live": **48-72 horas** (la mayoría es espera de Meta/proveedores, no humano nuestro).
- Precio: plan + **add-on de setup** (ej. +$199 one-time si necesita WA, +$299 one-time si necesita storefront).
- Self-serve: 95% (puede haber 1 email de follow-up).

#### Sub-flujos automatizados que activamos en Track B

##### B.1 — "No tengo storefront, créame uno"

Tenemos un **Hilo Storefront Template** (WordPress + WooCommerce + tema propio + plugins esenciales pre-configurados):

1. Founder confirma que quiere "Hilo Storefront managed".
2. Provisioning Service llama a la **API de nuestro proveedor de hosting** (Cloudways, Kinsta, o nuestro propio cluster WP) → crea instancia.
3. Instala WP + WC + plugin Hilo Connector + tema + plugins esenciales (Yoast, WP Rocket, Wordfence) — todo via WP-CLI scripted.
4. Crea base de datos, usuario admin, SSL.
5. Asigna subdominio temporal `{slug}.hilo.shop` (CNAME a nuestro hosting).
6. Founder puede después conectar su dominio propio (instrucciones DNS auto-generadas).
7. Importa catálogo (ver B.3).

**Costo interno:** ~$8/mes hosting + setup automatizado. **Lo cobramos como add-on** $299 one-time + $30/mes de hosting incluido en plan Growth/Scale.

##### B.2 — "Quiero migrar de Shopify/Wix/Tiendanube"

1. Founder pega URL de su tienda actual + credenciales (OAuth donde se pueda).
2. **Migration Worker** (job background):
   - Si Shopify: usa Shopify Admin API → exporta productos, clientes, órdenes históricas.
   - Si Wix/Tiendanube: scraper estructurado o sus APIs.
3. Crea Hilo Storefront (B.1) o conecta con WC existente.
4. Importa todo, mapea categorías, baja imágenes a CDN.
5. Notifica por email cuando termina (~2-6 horas según tamaño).

**Soporte:** plataformas comunes (Shopify, Wix, Tiendanube, Mercado Shops, Jumpseller). Otras → manual o "no migramos, empieza en limpio".

##### B.3 — "Mi catálogo está en Instagram / fotos sueltas / Excel"

Tres opciones que el wizard ofrece:

1. **Importar de Instagram Shop** (si tiene Catálogo configurado en Meta): OAuth de Meta → Catalog API → importa productos con fotos y precios.
2. **Subir CSV** (template descargable con columnas: nombre, precio, talla, stock, foto_url, descripción).
3. **AI Catalog Builder**: founder sube 20-50 fotos y un Google Sheet sin estructura → Gemini Vision + Claude las parsean, agrupan por producto, generan títulos y descripciones, sugieren categorías. Founder revisa y aprueba en lote.

##### B.4 — "No tengo WhatsApp Business API"

Dos sub-opciones:

###### B.4.a — Tengo número (móvil personal o de la marca) y quiero usarlo
1. Twilio Embedded Signup hace el flujo con Meta (15 min de la founder).
2. Meta verifica el negocio (auto si la marca está bien, manual si no — 24-48h).
3. Migra el número de WhatsApp regular a WA Business API.
4. **El número deja de funcionar en la app móvil** (advertencia clara antes de proceder).

###### B.4.b — No tengo número o no quiero usar el mío
1. Twilio API → buscamos números disponibles en el país de la founder.
2. Founder elige uno (lista con costos: ej. número MX = $5/mes Twilio).
3. Provisioning lo activa para WA Business automáticamente.
4. Founder lo publica como su número oficial.

##### B.5 — "No tengo Meta Business Manager"

Es requisito de Meta para WhatsApp Business API. El wizard:

1. Detecta si la founder tiene BM (vía OAuth de Meta).
2. Si no, explica qué es y la lleva al flujo de creación (formulario de Meta de 5 min).
3. Verificación de negocio (el comprobante de domicilio fiscal lo sube ella) — 1-3 días, **bloqueante de Meta, no nuestro**.
4. Mientras se aprueba, los demás agentes (1, 2, 3, 4, 5, 7) pueden funcionar via web/app — **WhatsApp queda en "pendiente"** y se enciende solo cuando Meta apruebe.

##### B.6 — "No tengo pasarela de pago"

WooCommerce + Stripe Connect (o MercadoPago Connect, OpenPay):
1. Wizard pregunta país de operación.
2. Botón "Conectar pasarela" → OAuth flow con la pasarela elegida.
3. Pasarela lleva a su propio onboarding (KYC, RFC, cuenta bancaria) — 1-2 días, **bloqueante del proveedor, no nuestro**.
4. Mientras tanto, configuramos pago contra-entrega y transferencia manual como fallback.

### 🔴 Track C — "Build" (greenfield + Done-For-You)

**Para:** marcas que solo tienen Instagram o ni eso. Necesitan que les armemos todo.

- Tiempo a "live": **5-7 días**.
- Precio: plan + **setup fee** ($899-$1,499 one-time según complejidad).
- Self-serve: 70% (sí hay un humano nuestro acompañando, pero estructurado).
- **No es 100% sin humano por diseño** — y está bien, porque cobramos por eso.

#### Cómo se "automatiza" Track C aunque haya humano

El humano de Hilo no es un sysadmin haciendo cosas técnicas (eso ya está automatizado). Es un **Brand Success Manager** que:

1. **Llamada de kickoff de 30 min** (agendada por Calendly) para definir nombre marca, dominio, voz, productos prioritarios.
2. **Acompaña a la founder en 3 puntos** del wizard que requieren decisiones humanas:
   - Verificación de Meta Business (sube documentos en vivo).
   - Activación de pasarela (KYC).
   - Aprobación inicial de catálogo generado por AI.
3. **Worklist asistida**: el sistema le da al manager una checklist clara, no resuelve nada técnico.

> El "trabajo manual" de un BSM se mide en minutos por marca, no horas. Cuando una marca paga $1,499 de setup, eso paga 8-10 horas de BSM con margen.

---

## 5. El Wizard de Readiness Check (cómo decide el track)

Pre-checkout. Sin tarjeta. 5 minutos.

```
1. Email + nombre de la marca
2. País de operación
3. ¿Dónde vendes hoy?
   [ ] Instagram DMs solamente
   [ ] WhatsApp con número personal
   [ ] Tengo tienda online en: [Shopify | WooCommerce | Wix | Otra]
   [ ] Físico (POS) + algo digital
4. ¿Tienes WhatsApp Business (no la app de WA normal)?
   [ ] Sí, ya con API     [ ] Sí, pero solo la app   [ ] No
5. ¿Tienes Meta Business Manager?
   [ ] Sí   [ ] No   [ ] No sé qué es
6. ¿Tienes pasarela de pago activa?
   [ ] Sí: [Stripe | MercadoPago | OpenPay | Otra]   [ ] No
7. ¿Cuántos productos vendes?
   [ ] < 20   [ ] 20-100   [ ] 100-500   [ ] > 500
8. ¿Tienes fotos de cada producto?
   [ ] Sí, profesionales   [ ] Sí, de celular   [ ] Algunas   [ ] No
```

#### Lógica de clasificación

```python
def classify_readiness(answers):
    has_storefront = answers.q3.includes_storefront()
    has_wa_api = answers.q4 == "yes_api"
    has_bm = answers.q5 == "yes"
    has_payment = answers.q6.startswith("yes")
    has_catalog = answers.q7 != "<20" and answers.q8 in ["pro", "phone"]

    if has_storefront and has_wa_api and has_bm and has_payment:
        return Track.A  # Connect
    elif has_catalog and (has_storefront or has_wa_api or has_bm):
        return Track.B  # Launch
    else:
        return Track.C  # Build
```

#### Página de resultado

```
Tu camino: TRACK B — "Launch"

Lo que vamos a hacer por ti (sin que muevas un dedo):
✓ Crear tu tienda en WooCommerce con dominio fuxia.hilo.shop
✓ Provisionar tu número WhatsApp Business: +52 55 XXXX
✓ Importar tus 47 productos de Instagram Shop
✗ Necesitarás 5 min para verificar tu Meta Business (te guiamos)
✗ Necesitarás conectar tu pasarela de pago (1-2 días de aprobación)

Tiempo total: 48-72 horas
Costo: $299 setup + $299/mes (plan Growth)

[ Empezar — pagar setup + 14 días de prueba del plan ]
```

---

## 6. Estados intermedios mientras se completan prerrequisitos

Una marca puede estar **provisionada y pagando pero no 100% live** porque depende de aprobaciones de terceros (Meta, pasarelas). El sistema modela esto:

```sql
ALTER TABLE brands ADD COLUMN provisioning_state JSONB;
-- Ejemplo:
-- {
--   "track": "B",
--   "checks": {
--     "storefront": "live",
--     "whatsapp": "pending_meta_review",  -- esperando 24-48h de Meta
--     "payment_gateway": "pending_kyc",   -- esperando que la founder suba RFC
--     "catalog": "live",
--     "brand_voice": "live",
--     "domain": "pending_dns"             -- esperando que cambie DNS
--   }
-- }
```

El **Brand Admin Portal** muestra esto como un dashboard de "Tu lanzamiento":

```
🟢 Tienda lista — fuxia.hilo.shop
🟡 WhatsApp en revisión por Meta (típicamente 24-48h)
🔴 Falta conectar tu pasarela de pago [Conectar →]
🟢 Catálogo importado (47 productos)
🟢 Voz de marca lista
```

Cada item es interactivo: si está rojo, hay un CTA claro. Si está amarillo, explicamos qué se está esperando y mostramos ETA.

#### Auto-recovery jobs

Workers en background que cada hora chequean:
- ¿Meta ya aprobó WA? → flip a 🟢, notificar.
- ¿La pasarela ya completó KYC? → flip a 🟢.
- ¿El DNS ya propagó? → flip a 🟢, mover de subdominio temporal a dominio propio.

---

## 7. Qué agentes funcionan según el estado

No esperamos a estar 100% live para que la founder vea valor. Activamos agentes incrementalmente:

| Estado | Agentes activos |
|---|---|
| Solo storefront live | Stylist (web widget), Try-On, Content Generation |
| + Catálogo live | + Sizing |
| + WhatsApp live | + Customer Service, + Sales Closer (sin descuentos en WA hasta tener pasarela) |
| + Pasarela live | + Sales Closer completo (puede generar links de pago), + Executive Dashboard con datos reales |
| + Meta BM verificado | + Templates marketing del Sales Closer fuera de ventana 24h |

Esto se calcula en tiempo real desde `provisioning_state.checks`.

---

## 8. Pricing transparente con add-ons

Para que el self-serve funcione hay que mostrar el precio total por adelantado. Tabla pública en `/pricing`:

```
PLAN              Starter   Growth    Scale
Mensual           $199      $499      $1,299

Add-ons one-time (solo si los necesitas):
+ Hilo Storefront managed         $299
+ Migración desde otra plataforma $199
+ Provisioning de número WA       $99 (+ $5/mes Twilio)
+ AI Catalog Builder (50 fotos)   $149
+ Done-For-You setup (Track C)    $1,499 incl. todo arriba

Hosting WP managed (si Track B/C)  +$30/mes
```

Stripe Checkout muestra el desglose exacto. Si la founder calculó mal, el wizard ajusta antes de cobrar.

---

## 9. Lo que NO automatizamos (y por qué está bien)

| Cosa | Por qué humano | Quién |
|---|---|---|
| Decisión de "qué nombre poner a la marca" | Es subjetiva | Founder |
| Verificación de identidad de Meta | Lo exige Meta, no negociable | Founder + Meta |
| KYC de pasarela de pago | Regulación financiera | Founder + Pasarela |
| Foto de modelo para hero del sitio | Creatividad | Founder o Hilo Studio (add-on) |
| Validación legal de TyC personalizados | Es legal | Abogado externo del cliente |
| Recuperación de cuenta perdida | Seguridad | Soporte humano |

Esos son "humanos del cliente", no "humanos de Hilo". La promesa SaaS sigue intacta.

---

## 10. Implementación — orden sugerido

**Fase 1 (semanas 1-2): Track A funcionando** (ya cubierto en `SELF_SERVE_PROVISIONING.md`).

**Fase 2 (semanas 3-4): Readiness Check + Pricing dinámico**
- Wizard pre-checkout con las 8 preguntas.
- Lógica de clasificación A/B/C.
- Stripe Checkout con add-ons.
- Página de "Tu camino" con expectativas claras.

**Fase 3 (semanas 5-7): Track B — sub-flujos críticos**
- Provisioning de WooCommerce managed (Cloudways API o cluster propio).
- Provisioning de número WhatsApp via Twilio.
- AI Catalog Builder.
- Importador desde Instagram Shop (Catalog API de Meta).

**Fase 4 (semanas 8-9): Estados intermedios + auto-recovery**
- `provisioning_state.checks` y dashboard de "Tu lanzamiento".
- Workers de polling para Meta, pasarelas, DNS.
- Activación incremental de agentes según estado.

**Fase 5 (semanas 10-12): Migraciones + Track C**
- Importadores: Shopify, Wix, Tiendanube.
- Brand Success Manager portal (no es público — herramienta interna del BSM).
- Calendly + worklist para Track C.

---

## 11. Definition of Done — "el cold start está resuelto"

- [ ] Una marca de Track A llega a "live" en < 30 min, 100% self-serve.
- [ ] Una marca de Track B llega a "live" en < 72h, con humano nuestro tocando 0 cosas técnicas.
- [ ] Una marca de Track C llega a "live" en < 7 días, con humano nuestro siguiendo una worklist (no improvisando).
- [ ] Las dependencias de terceros (Meta, pasarelas, DNS) tienen polling automático y notificación clara.
- [ ] La founder en cualquier track sabe en todo momento **qué falta** y **qué hacer**.
- [ ] El sistema no cobra sin antes haber definido el track y mostrado expectativas.
- [ ] Métricas: % de signups por track, tiempo medio a "live" por track, % completion del wizard de readiness.
