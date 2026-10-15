# Belentani.cv-ai

> Currículum con IA: generación y adaptación de CV que **no inventa experiencia**.

[![CI](https://github.com/belentani7/Belentani.cv-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/belentani7/Belentani.cv-ai/actions/workflows/ci.yml)
[![Build](https://github.com/belentani7/Belentani.cv-ai/actions/workflows/build.yml/badge.svg)](https://github.com/belentani7/Belentani.cv-ai/actions/workflows/build.yml)
[![Licencia: MIT](https://img.shields.io/badge/License-MIT-00E676.svg)](./LICENSE)
[![Seguridad](https://img.shields.io/badge/security--policy-brightgreen.svg)](./SECURITY.md)

🌐 En línea: <https://belentani-cv-ai.vercel.app>

## Qué es

Un estudio documental para construir currículums que se adaptan a cada oferta. El
principio de diseño es explícito: **la IA no inventa experiencia; reorganiza y destaca
lo que ya existe** según lo que pide el puesto. Sin invenciones, sin relleno.

Además del CV: cartas de presentación y presentaciones, en un único estudio.

### Características

- Generación y adaptación de CV por oferta
- Cartas de presentación y presentaciones
- Editor con ordenamiento por arrastrar y soltar (`@dnd-kit`)
- Privacy-first y offline-first: los datos del usuario no tienen por qué viajar
- Base de datos con **Prisma**

## Stack

- **Next.js 15 + React 19** — aplicación (App Router)
- **Prisma** — persistencia (`prisma/`)
- **Tailwind + shadcn/ui** — interfaz (`components.json`)
- **Caddy** — servidor (`Caddyfile`)
- **Vitest / Playwright** — tests
- **ESLint** — linting

## Puesta en marcha

```bash
pnpm install
cp .env.example .env
pnpm db:generate
pnpm dev

pnpm build && pnpm start
pnpm lint
```

Scripts de base de datos:

```bash
pnpm db:generate   # prisma generate
pnpm db:migrate    # prisma migrate dev
pnpm db:push       # prisma db push
pnpm db:reset      # prisma migrate reset
```

## Configuración

Copia `.env.example` a `.env` y rellena solo lo que tu entorno necesite.
**Nunca se versiona un secreto.** Ver [`SECURITY.md`](./SECURITY.md).

## Documentación

- [`PROYECTO-ANALISIS-COMPLETO.md`](./PROYECTO-ANALISIS-COMPLETO.md) — análisis del proyecto
- [`worklog.md`](./worklog.md) — bitácora de trabajo
- `docs/` — documentación por módulo

## Licencia

[MIT](./LICENSE) · [`CONTRIBUTING.md`](./CONTRIBUTING.md) · [`SECURITY.md`](./SECURITY.md)

<sub>Estudio de documentos con IA · by <a href="https://github.com/belentani7">@belentani7</a></sub>
