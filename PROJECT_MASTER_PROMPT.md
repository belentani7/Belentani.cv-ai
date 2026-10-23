# PROJECT MASTER PROMPT — BELENTANI CV STUDIO

> Canon operativo del repositorio existente. No crear repositorios derivados ni confundir este producto con Manos Abiertas.

## 1. Identidad y fuente de verdad
**Producto:** Belentani CV Studio. **Repositorio:** `belentani7/Belentani.cv-ai`.
**Promesa:** «Tu trayectoria, bien contada». Aplicación para crear, editar, adaptar y exportar currículums y cartas de presentación de manera accesible y profesional.
**Fuente de verdad técnica:** código y pruebas del repositorio actual; `README.md`, `package.json`, los componentes y contratos existentes. Este documento establece objetivos, pero jamás sustituye la verificación del código.
**Stack confirmado en package.json:** Next.js 16, React 19, TypeScript, Prisma, Zod, React Hook Form, Jest, Tailwind CSS, pnpm. Utilizar la arquitectura real que ya existe; no rediseñar con frameworks alternativos sin evidencia.

## 2. Visión de producto de máxima capacidad
Experiencia integral de empleabilidad centrada en la autonomía de la persona:
- Página de inicio propia, clara, accesible y optimizada para móviles.
- Constructor guiado de CV: perfil, experiencia, formación, idiomas, competencias, logros y proyectos; ordenación, edición, vista previa y guardado recuperable.
- Plantillas con tipografía editorial limpia, secciones configurables, impresión A4 y exportación PDF verificable, legible y compatible con sistemas ATS.
- Cartas de presentación conectadas al CV; versiones por oferta, sin alterar el documento maestro.
- Ayuda IA opcional para resumir experiencia, adaptar lenguaje a ofertas y detectar información ausente, nunca inventar empleos, certificados, experiencias ni habilidades.
- Internacionalización real ES/EN/PT, accesibilidad WCAG 2.2 AA como objetivo y estados de error/ausencia/carga correctamente resueltos.
- Privacidad por defecto: modo local completo sin IA; control explícito de retención y borrado, sin recopilar datos innecesarios.
- Sólo incorporar cuentas, persistencia remota, pagos, analítica y ofertas laborales cuando haya casos de uso claros, consentimiento, infraestructura y pruebas.

## 3. Arquitectura futura, de evolución incremental
- **UI:** rutas / y /cv, componentes reutilizables, separación entre editor, modelo documental y vista imprimible.
- **Dominio:** modelo versionado y validado mediante Zod para CV, cartas, plantillas, exportación y parámetros de IA.
- **Persistencia:** guardado local resiliente; sincronización opcional autenticada con Prisma y reglas de autorización por propietario, solamente cuando se implemente y pruebe.
- **Servicios:** endpoints con validación estricta, tamaño máximo de entrada, presupuestos de tokens, autenticación cuando corresponda, rate limit efectivo y fallos seguros.
- **Infra:** variables de entorno server-only; prohibición de registrar PII o secretos; CI con typecheck/lint/test/build y comprobaciones de dependencias.
- **Observabilidad:** métricas técnicas sin contenido de CV, errores sin datos personales y alertas sólo para fallos accionables.
No tratar esta estructura propuesta como funcionalidades ya implementadas.

## 4. Fases de implementación ejecutable

### Fase A — Estabilizar y establecer línea base
1. Inspeccionar rutas, API, formularios, esquema Prisma, pruebas y CI; detectar contratos existentes.
2. Reproducir `pnpm install --frozen-lockfile`, `pnpm run typecheck`, `pnpm run lint`, `pnpm exec jest --coverage --runInBand`, `pnpm run build` en ambiente apto.
3. Corregir fallos reales y crear regresiones antes de agregar funcionalidades. No anunciar éxito sin ejecutar el comando.

### Fase B — Entregar recorrido CV completo
1. Verificar crear/editar/guardar/recuperar/duplicar/exportar e impresión A4.
2. Previsualización consistente con el documento final, gestión de saltos de página, sección vacía y textos largos.
3. Pruebas E2E en escritorio/móvil y prueba de accesibilidad de teclado, foco, etiquetas y contraste.

### Fase C — Asistencia profesional segura
1. Validar todos los cuerpos de solicitud con Zod estricto; límites de payload, coste y tiempo.
2. Rate limiting de servidor que falle cerrado donde corresponda; revisar semántica 429 y errores.
3. Minimización PII, prompts robustos, ausencia de logs personales, política de consentimiento y degradación elegante si falla IA.
4. Garantizar que la IA no fabrica hechos y que toda sugerencia se revisa antes de aplicar.

### Fase D — Escala y lanzamiento
1. Adaptación de CV a ofertas y cartas por oportunidad; historial de versiones consentido.
2. Idiomas completos, plantillas de calidad, SEO y experiencia inicial.
3. Preview desplegada; smoke tests /, /cv, editor, exportación y cartas; verificar variables de entorno y dominio.
4. Publicar sólo después de cumplimiento documentado de gates, sin dar por operativos cobros ni funciones inexistentes.

## 5. Gates de calidad obligatorios
- Sin errores de compilación, tipos, lint ni pruebas; E2E de recorridos críticos.
- Sin exposición de PII, tokens, claves o CV reales en código, logs o telemetría.
- Validación y autorización en servidor; protección contra abuso y degradación útil sin IA.
- Experiencia visual propia, UX móvil y accesibilidad verificadas.
- Documentación refleja únicamente funcionalidades probadas.
- Mantener compatibilidad con lo que ya funciona; evitar reescrituras completas y cambios irreversibles no justificados.

## 6. Prompt operativo reutilizable para agentes
«Trabaja en el repositorio existente `belentani7/Belentani.cv-ai`. Lee primero este PROJECT_MASTER_PROMPT.md, README, package.json, rutas reales, APIs y tests. Selecciona la primera fase no terminada. Define un cambio mínimo pero funcional con pruebas. Implementa el código, ejecuta las verificaciones disponibles, corrige fallos, documenta los resultados y abre un PR para revisión si la modificación puede afectar producción. No crees otro repositorio, no declares completadas funciones sin evidencia, no inventes datos del usuario, no expongas PII y no publiques ni modifiques servicios externos sin comprobar permisos y efectos. Avanza a la siguiente mejora sólo al cerrar la anterior.»

## 7. Estado de esta intervención
- Evidencia consultada: README.md y package.json en la rama main.
- Primer entregable: este plan maestro concreto.
- Estado de fases A–D: **pendientes de implementación y verificación**; la existencia del plan no implica funcionalidad nueva ni ejecución de tests.
