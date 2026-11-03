# BIBLIA.md — Belentani.cv-ai

> Doctrina del producto. Repositorio del ecosistema belentani7.

## Visión
Estudio web para crear currículums, cartas de presentación y adaptar candidaturas: "Tu trayectoria, bien contada."

## Misión
Ofrecer una herramienta de documentos impulsada por IA (CV, cartas, plantillas, exportación/impresión) con autosave local, GDPR compliant y AES-256, que funcione incluso cuando el servicio de IA falla.

## Stack tecnológico
- Next.js 16 (App Router), React 19, TypeScript (`strict: true`), Tailwind CSS 4
- Prisma ORM + PostgreSQL, @vercel/kv, @upstash/ratelimit
- framer-motion, react-hook-form, zod, lucide-react, recharts, sonner
- Jest (pruebas), Docker (Dockerfile, docker-compose.yml), Caddy (Caddyfile), Vercel (vercel.json)

## Tokens CANON (Belentani)
- Negro vacío: #05030a
- Rojo neón: #ff073a (focus-visible)
- Dorado Zion: #d4af37
- Cyan señal: #4de8e0

## Reglas de desarrollo
- Protocolo spec-first: PRD → SRS → Design Doc → ADR → Plan → Tests GWT.
- Gobernanza: AGENTS.md, .gitleaks.toml, CODEOWNERS, SECURITY.md, CODE_OF_CONDUCT.md, CHANGELOG.md, CONTRIBUTING.md.
- No commitear secretos. Ejecutar gitleaks antes de cada push.
- Convenciones de commit: `type(scope): summary`.
- CODEOWNERS: `@belentani7` revisión requerida.

## Microsoft rules (TypeScript)
- `tsconfig.json` `"strict": true` (obligatorio).
- Named exports/imports; evitar `any`.
- Async/await para I/O; try/catch para errores.

## Impeccable (diseño frontend) — ecosistema.html
- Registro: brand (landing de producto CV).
- Anti-patrones prohibidos: gradient text, side-stripe borders, eyebrow en cada sección, marcadores 01-09, hero heading > 6rem.
- focus-visible visible, touch targets >= 44px, lang y viewport presentes.
- Estados vacío, error y carga diseñados.
- Contraste body >= 4.5:1, línea 65-75ch, letter-spacing >= -0.04em.
- z-index semántico, nunca 999/9999.
- prefers-reduced-motion respetado.

## Convenciones de commit
`type(scope): summary` — feat, fix, docs, chore, refactor, test, perf, style.

## Seguridad
- Secret scanning con gitleaks (reglas personalizadas del ecosistema Belentani).
- Endpoints IA opcionales con validación y rate limit; sin exposición de credenciales.
- KV_REST_API_URL/TOKEN solo en despliegue; nunca commitear tokens ni CV personales en logs.
- Signed commits requeridos.
