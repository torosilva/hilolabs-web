# HiloLabs.ai — Web

Sitio web institucional y de producto de **HiloLabs**, la plataforma de loyalty, ecommerce y AI para marcas de moda lideradas por mujeres latinas.

> Página viva del producto: Hilo Loyalty, Commerce, AI Stack, Case Studies (Fuxia), Pricing y Book a Demo.

---

## Stack

- **Framework:** Next.js 16.2 (App Router)
- **React:** 19.2
- **Estilos:** Tailwind CSS 4
- **i18n:** next-intl (Español / Inglés)
- **Animaciones:** framer-motion
- **Forms:** react-hook-form
- **TypeScript:** 5.x

> ⚠️ Esta versión de Next.js trae **breaking changes**. Antes de tocar APIs internas, revisa `node_modules/next/dist/docs/`. Lee `AGENTS.md`.

---

## Scripts

```bash
npm run dev      # servidor de desarrollo (http://localhost:3000)
npm run build    # build de producción
npm run start    # servir build
npm run lint     # eslint
```

---

## Estructura

```
src/
├── app/
│   └── [locale]/              # rutas internacionalizadas (es, en)
│       ├── page.tsx           # Home
│       ├── layout.tsx
│       ├── loyalty/           # Hilo Loyalty
│       ├── commerce/          # Hilo Commerce
│       ├── ai/                # AI Stack (7 agentes)
│       ├── case-studies/      # Fuxia y otros casos
│       ├── about/
│       ├── pricing/
│       └── book-demo/
├── components/
│   ├── home/  loyalty/  commerce/  ai/  case-studies/
│   ├── about/  pricing/
│   └── shared/                # Navbar, Footer, etc.
├── i18n/
│   ├── routing.ts             # locales soportados
│   └── request.ts             # carga de mensajes
└── proxy.ts                   # middleware i18n

messages/
├── en.json                    # copy en inglés
└── es.json                    # copy en español

public/                        # logos, hero mockup, fuxia editorial
```

---

## Internacionalización

Toda la copy vive en `messages/en.json` y `messages/es.json`. Para añadir/cambiar texto:

1. Edita la clave en **ambos** archivos.
2. Úsala con `useTranslations("Namespace")` en el componente.

Las rutas se generan bajo `/[locale]` (ej. `/es/ai`, `/en/ai`).

---

## Tokens de marca

Definidos como CSS vars en `src/app/[locale]/globals.css`:

- `--color-fuchsia` — color de acento principal
- `--color-cream` — texto sobre fondos oscuros
- `--color-gray` — texto secundario
- `--color-base` — fondo

Usar siempre estos tokens; **no hardcodear** colores en componentes.

---

## Convenciones

- Componentes interactivos → `"use client"`. Resto, server components por defecto.
- Animaciones con `framer-motion` (patrón `fadeInUp` en `AIClient.tsx`).
- Links internos → `Link` de `@/i18n/routing` (NO `next/link` directo, para preservar locale).
- Imágenes en `public/`, referenciadas con ruta absoluta `/archivo.png`.

---

## Deploy

Pensado para **Vercel**. Push a `main` → preview/prod automático.

---

## Documentación interna

- `AGENTS.md` — instrucciones para agentes de IA que trabajan en este repo.
- **`docs/ONBOARDING.md`** — guía cero-a-productivo para nuevo desarrollador(a). **Leer primero.**
- **`docs/AGENTS_BACKEND.md`** — especificación detallada de los 7 agentes de IA del producto (arquitectura, schema SQL, prompts, tools, roadmap, glosario).
