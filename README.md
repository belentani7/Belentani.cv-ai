# Belentani CV Studio

> Tu trayectoria, bien contada.

Herramienta web para crear currículums, preparar cartas de presentación y adaptar candidaturas. Este repositorio conserva una experiencia histórica de Manos Abiertas en una ruta no indexada para evitar pérdida de trabajo mientras se completa su separación.

## Qué funciona en el código

- Portada y marca propias en /; estudio de CV en /cv.
- Formulario para experiencia, educación, habilidades, idiomas y datos de contacto.
- Selección de plantillas, vista previa y opciones de exportación/impresión en el editor existente.
- Autosave local de borradores en el navegador del usuario.
- Constructor de cartas de presentación integrado.
- Endpoints opcionales de IA con validación y rate limit; requieren configuración de servidor y proveedor accesible.
- API de estado en /api, sin exposición de credenciales.

## Lo que no debe anunciarse como finalizado

No hay en el repositorio evidencia de pasarela de pagos operativa ni de un estudio de presentaciones terminado. No se debe cobrar una tarifa, anunciar plantillas como oficiales ni garantizar contratación hasta validar esas funciones y su situación legal. Una compilación correcta no sustituye pruebas de flujo real.

## Desarrollo

Requisitos: Node.js 22, pnpm 9.15.0, configuración Prisma y variables pertinentes para IA.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm exec prisma generate
pnpm run typecheck
pnpm run lint
pnpm exec jest --coverage --runInBand
pnpm run build
pnpm dev
```

La edición básica debe seguir disponible cuando falla el servicio de IA. Para generación IA configura KV_REST_API_URL y KV_REST_API_TOKEN en el proveedor de despliegue. No incluyas tokens ni CV personales en logs o repositorios.

## Lanzamiento

1. Verificar typecheck, lint, pruebas y compilación.
2. Desplegar preview de la rama de release.
3. Comprobar /, /cv, editor, exportación, carta, móviles y accesibilidad.
4. Promover exclusivamente el commit aprobado a producción; verificar dominios, metadata y observabilidad.

© Belentani. El material histórico de Manos Abiertas conserva su propio propósito y no debe confundirse con la marca CV Studio.

<!-- repo-forge:readme:inicio -->
## Qué es

**Belentani CV Studio** — estudio de CV con IA.

Un artefacto editorial que respeta al lector: dato con fuente, voz con autoría, límite declarado.

## Estado medido

| Dato | Valor |
|---|---|
| Lenguajes | TypeScript, YAML, Markdown, HTML, Shell, JavaScript |
| Archivos / líneas | 255 / 86235 |
| Páginas HTML | 9 |
| Tests detectados | 16 |
| Cumplimiento de reglas | 37/37 (100.0%) |

Todo lo anterior se midió en disco el 2026-11-10; no es una estimación.

## Uso

```bash
npm install
npm run dev
```

## Estructura

```
assets/
brand/
data/
docs/
download/
examples/
lib/
magic/
mini-services/
plataforma/
```

## Diseño de plataforma

- Editor
- Adaptación por oferta
- ATS
- Exportar

La ficha completa —máximo potencial, marca, fases de monetización y recursos— vive en
[`plataforma/FICHA.md`](plataforma/FICHA.md). Los tokens de marca están en
[`brand/tokens.css`](brand/tokens.css).

## Reglas del proyecto

Este repositorio sigue el catálogo oficial del ecosistema (`GH-*`, `WEB-*`, `ACC-*`,
`SEO-*`, `COH-*`, `DEV-*`). El gate se ejecuta con:

```bash
python scripts/doctor.py
```

## Licencia

MIT. Ver [`LICENSE`](LICENSE).
<!-- repo-forge:readme:fin -->
## Producto comercial

Se vende un **CV adaptado a una oferta concreta**, entregado en 48 horas por 89 € con IVA:
PDF y texto plano, carta breve, lista de comprobación de filtros y una ronda de correcciones.
Es un servicio editorial; no incluye suscripción, ni bolsa de empleo, ni puntuaciones ATS
inventadas.

- [`producto/OFERTA.md`](producto/OFERTA.md) — qué se vende, a quién, precio y objeciones
- [`producto/landing.html`](producto/landing.html) — página de venta autocontenida
- [`producto/precios.json`](producto/precios.json) — planes, límites e IVA
- [`producto/COBRO.md`](producto/COBRO.md) — cobro, entrega y reembolso
- [`producto/ONEPAGER.md`](producto/ONEPAGER.md) — ficha de una página
- [`producto/DEMO.md`](producto/DEMO.md) — guion de demo de 3 minutos
- [`producto/METRICAS.md`](producto/METRICAS.md) — indicadores y objetivos a 30 días

Verificación: `python tools/area_check.py producto --repo Belentani.cv-ai` desde la raíz del
workspace.

<!-- repo-forge:readme:fin -->
<!-- repo-forge:readme:fin -->
<!-- repo-forge:readme:fin -->
