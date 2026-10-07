# SDD / Design Doc -- Belentani.cv-ai
Fecha: 2026-09-25 | Estado: Draft

## Arquitectura general

Stack: Node.js, Next.js, React, Tailwind, TypeScript, Deploy: vercel.json. Estructura de primer nivel detectada:

```
  .env.example
  .github
  .gitignore
  .zscripts
  Caddyfile
  LICENSE
  PROYECTO-ANALISIS-COMPLETO.md
  README.md
  SECURITY.md
  bun.lock
  components.json
  docs
  download
  ecosistema.html
  ecosystem.json
  eslint.config.mjs
  examples
  magic
  manos-abiertas-proyecto-completo.zip
  mini-services
```

CI: build.yml, ci.yml, deploy-pages.yml.

## Decisiones clave

Ver `docs/adr/`. Regla: una fuente de verdad por concern, contratos de frontera
claros y direccion de dependencias sin ciclos.

## Flujos criticos

1. Desarrollo local -> build -> test -> CI.
2. Cambio -> PR -> revision -> merge -> deploy (si aplica).

## Estrategia de verificacion

- Build y tests en CI en cada PR.
- Revision de seguridad (cero secretos, validacion).
- Comprobacion de deploy segun la matriz de plataforma.

## Limites y riesgos

- Deuda tecnica no documentada: registrar como ADR antes de refactor mayor.
- Dependencias externas: fijar versiones y lockfile.
