# hilolabs-web

Resumen ejecutivo del repositorio `hilolabs-web` — el sitio institucional y de producto de **HiloLabs**.

> Plataforma SaaS de loyalty, ecommerce y AI para marcas de moda lideradas por mujeres latinas. Marca piloto: **Fuxia**.

---

## 1. Qué es este repo

Sitio web público de HiloLabs.ai construido con **Next.js 16** (App Router) y React 19. Cubre:

- Home y narrativa de marca.
- Páginas de producto: **Hilo Loyalty**, **Hilo Commerce**, **Hilo AI Stack**.
- **Case Studies** (Fuxia como caso ancla).
- **About**, **Pricing**, **Book a Demo**.
- Internacionalización completa **español / inglés**.

No incluye backend. La operación (agentes de IA, base de datos, WhatsApp) vive en otro repo aún por construir (ver `docs/AGENTS_BACKEND.md`).

---

## 2. Stack

| Capa            | Tecnología                       |
|-----------------|----------------------------------|
| Framework       | Next.js **16.2.4** (App Router)  |
| UI              | React **19.2.4** + TypeScript 5  |
| Estilos         | Tailwind CSS **4**               |
| i18n            | `next-intl` 4.11                 |
| Animaciones     | `framer-motion` 12               |
| Forms           | `react-hook-form` 7              |
| Hosting         | Vercel (preview/prod desde `main`) |

> ⚠️ **Next.js 16 tiene breaking changes** respecto a versiones anteriores. Antes de tocar APIs internas, revisa `node_modules/next/dist/docs/` y lee `AGENTS.md`.

---

## 3. Estructura

```
hilolabs-web/
├── AGENTS.md                  # reglas para agentes IA en el repo
├── CLAUDE.md                  # alias a AGENTS.md
├── README.md
├── docs/
│   ├── ONBOARDING.md          # cero-a-productivo para nuevo dev
│   └── AGENTS_BACKEND.md      # spec de los 7 agentes de IA
├── messages/
│   ├── en.json                # copy en inglés
│   └── es.json                # copy en español
├── public/                    # logos, hero, editorial Fuxia
└── src/
    ├── app/
    │   └── [locale]/          # rutas i18n: /es/*, /en/*
    │       ├── page.tsx       # Home
    │       ├── layout.tsx
    │       ├── globals.css    # tokens de marca (CSS vars)
    │       ├── loyalty/
    │       ├── commerce/
    │       ├── ai/
    │       ├── case-studies/
    │       ├── about/
    │       ├── pricing/
    │       └── book-demo/
    ├── components/
    │   ├── home/  loyalty/  commerce/  ai/
    │   ├── case-studies/  about/  pricing/
    │   └── shared/            # Navbar, Footer
    ├── i18n/
    │   ├── routing.ts         # locales soportados
    │   └── request.ts         # carga de mensajes
    └── proxy.ts               # middleware i18n
```

---

## 4. Scripts

```bash
npm run dev      # http://localhost:3000
npm run build    # build de producción
npm run start    # servir build
npm run lint     # eslint
```

---

## 5. Convenciones clave

- **Server components por defecto.** Solo añade `"use client"` cuando necesites estado, eventos o hooks de cliente.
- **Links internos:** importar `Link` desde `@/i18n/routing` — NO desde `next/link` — para preservar el locale.
- **Copy:** todo texto vive en `messages/{en,es}.json`. Se consume con `useTranslations("Namespace")`. Si añades una key, **edítala en ambos archivos**.
- **Tokens de marca** (en `src/app/[locale]/globals.css`):
  - `--color-fuchsia` — acento principal
  - `--color-cream` — texto sobre fondo oscuro
  - `--color-gray` — texto secundario
  - `--color-base` — fondo
  Usa siempre los tokens; **no hardcodees** colores.
- **Animaciones:** patrón `fadeInUp` con framer-motion (referencia en `src/components/ai/AIClient.tsx`).
- **Imágenes:** en `public/`, referencia absoluta `/archivo.png`.

---

## 6. Producto: los 3 pilares

1. **Hilo Loyalty** — puntos, tiers VIP, referidos.
2. **Hilo Commerce** — storefront sobre Shopify + app móvil.
3. **Hilo AI Stack** — 7 agentes de IA. La página `/ai` los presenta uno por uno. Estado actual de los slots:
   - Agentes 1–4: operación y soporte.
   - Agente 5: **Virtual Try-On & Body-Aware Stylist**.
   - Agente 6: **AI Sales Closer** (reemplazó el slot original de Dynamic Pricing).
   - Agente 7: cierre del stack.

Detalle de arquitectura, schema SQL, prompts y tools de cada agente → `docs/AGENTS_BACKEND.md`.

---

## 7. Internacionalización

- Locales soportados: `es`, `en` (configurados en `src/i18n/routing.ts`).
- Todas las rutas viven bajo `/[locale]`. Ej.: `/es/ai`, `/en/case-studies`.
- Para añadir/cambiar copy:
  1. Edita la clave en **`messages/en.json` y `messages/es.json`**.
  2. Consúmela con `useTranslations("Namespace")` en el componente.

---

## 8. Deploy

- **Vercel.** Push a `main` → preview y producción automáticos.
- Repo: <https://github.com/torosilva/hilolabs-web>

---

## 9. Lectura obligatoria antes de tocar código

1. `AGENTS.md` — reglas para agentes IA (Next.js 16, breaking changes).
2. `docs/ONBOARDING.md` — guía cero-a-productivo.
3. `docs/AGENTS_BACKEND.md` — spec de los 7 agentes (si vas a tocar `/ai` o el backend).
4. `node_modules/next/dist/docs/` — docs locales de Next.js 16 para APIs que cambiaron.

---

## 10. Estado del repo

- Rama activa de trabajo: ramas `claude/*` que se mergean a `main`.
- `main` está sincronizado con `origin/main` y deploya a producción.
- Último hito: index page de `/case-studies` y rework del Agente 6 (AI Sales Closer).
