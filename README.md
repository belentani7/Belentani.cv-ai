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
