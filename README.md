# Belentani CV Studio

> Tu trayectoria, bien contada.

Herramienta web para crear currículums, adaptar candidaturas por oferta de empleo con diagnóstico honesto de legibilidad ATS, preparar cartas de presentación y exportar documentos listos para imprimir o conservar en formato portable. Este repositorio conserva una experiencia histórica de Manos Abiertas en `/manos-abiertas` (ruta no indexada) para evitar pérdida de trabajo mientras se completa su separación.

## Qué funciona en el código

- Portada editorial con atmósfera GPU WebGL (y degradación elegante a Canvas 2D / CSS) en `/`; estudio completo en `/cv`; lista de revisión previa al envío en `/cv/preparar`.
- Formulario estructurado para datos de contacto, resumen, experiencia, formación, habilidades e idiomas.
- **7 plantillas reales diferenciadas** con vista previa en tiempo real e impresión/exportación A4 optimizada.
- **Adaptación local por oferta y diagnóstico ATS** (`100 %` en navegador, sin subir documentos ni inventar experiencia).
- Autosave local validado con Zod en `localStorage` e importación/exportación de archivo `.json` portable.
- Constructor de cartas de presentación con modo local sin conexión (5 idiomas) e IA opcional bajo consentimiento explícito.
- Endpoints opcionales de IA con validación estricta, protección contra prompt injection y rate limit con `@upstash/ratelimit` + `@vercel/kv`.
- API de estado operativo en `/api` y readiness en `/api/ready`, sin exposición de credenciales.

## Lo que no debe anunciarse como finalizado

No hay en el repositorio pasarela de pagos activa ni estudio de presentaciones terminado. No se debe cobrar una tarifa, anunciar plantillas como oficiales ni garantizar contratación o puntuaciones ATS certificadas.

## Desarrollo

Requisitos: Node.js `>= 22.23.4` (o `24.22.1` en CI), `pnpm@9.15.0` y Python `>= 3.11`.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run build
pnpm dev
```

La edición completa, las plantillas, el inspector de ofertas y la carta local siguen disponibles aunque el servicio de IA no esté configurado. Para activar los endpoints opcionales de IA configura `KV_REST_API_URL` y `KV_REST_API_TOKEN` en el proveedor de despliegue. Nunca incluyas tokens ni CV personales en logs o repositorios.

## Herramientas internas (`scripts/`)

Todas las utilidades internas incluyen soporte para `--help`:

```bash
# Doctor estructural y de gobernanza (solo lectura)
python3 scripts/doctor.py

# Auditoría integral del repositorio (estructura, catálogo, identidad, dependencias, contraste CANON)
node scripts/forge-audit.mjs --help
pnpm run audit:repo

# Auditoría de rendimiento, cabeceras HTTP y accesibilidad semántica sobre rutas reales
node scripts/a11y-perf-audit.mjs --help
pnpm run audit:web

# Generador resiliente de cliente Prisma (online/offline)
node scripts/db-generate.mjs --help

# Puerta de seguridad de versiones fijadas en lockfile
node scripts/security-release-audit.mjs --help

# Validación del banco de datos canónico
node scripts/validate-catalog.mjs --help
```

## Lanzamiento

1. Verificar `pnpm run quality:check`, `pnpm run audit:repo` y `pnpm run test:e2e`.
2. Desplegar preview de la rama de trabajo.
3. Comprobar `/`, `/cv`, `/cv/preparar`, plantillas, adaptación por oferta, exportación, carta, móviles y accesibilidad.
4. Promover el commit verificado a `main`; comprobar dominios, metadata y observabilidad.

## Producto y gobernanza

Véase `plataforma/FICHA.md`, `plataforma/OFERTA.md`, `plataforma/precios.json`, `plataforma/ONEPAGER.md`, `BIBLIA.md` y `CONTRIBUTING.md`.

© Belentani. El material histórico de Manos Abiertas conserva su propio propósito y no debe confundirse con la marca CV Studio.
