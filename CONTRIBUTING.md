# Guía de contribución — Belentani CV Studio

Gracias por contribuir a **Belentani CV Studio** (`belentani7/Belentani.cv-ai`). Este repositorio mantiene un estándar estricto de calidad editorial, privacidad de datos personales y verificación automatizada.

## Principios innegociables

1. **Privacidad por defecto**: los borradores de CV y cartas de presentación pertenecen al usuario y residen en su navegador (`localStorage`). Nunca registres contenido personal de CV en logs, telemetría, fixtures ni commits.
2. **Honestidad editorial**: ninguna función ni texto asistido debe inventar experiencia laboral, titulaciones, métricas ni prometer contratación o validación oficial ATS.
3. **Degradación elegante**: el editor de CV, el inspector local de adaptación por oferta y el constructor local de cartas deben seguir funcionando al 100 % aunque los proveedores externos de IA o base de datos no estén configurados.
4. **Cero secretos en el árbol**: ejecuta escaneo de secretos antes de publicar cualquier cambio.

## Requisitos del entorno

- **Node.js**: `>= 22.23.4` (recomendado `24.22.1` en CI)
- **Gestor de paquetes**: `pnpm@9.15.0` vía Corepack (`corepack enable`)
- **Python**: `>= 3.11` para diagnósticos estructurales (`python3 scripts/doctor.py`)

## Flujo de trabajo

1. Lee `BIBLIA.md`, `AGENTS.md` y `plataforma/FICHA.md` antes de proponer cambios de alcance.
2. Instala dependencias respetando el lockfile:
   ```bash
   corepack enable
   pnpm install --frozen-lockfile
   ```
3. Ejecuta las puertas de verificación antes y después de tus cambios:
   ```bash
   python3 scripts/doctor.py
   node scripts/forge-audit.mjs
   pnpm run typecheck
   pnpm run lint
   pnpm test
   pnpm run build
   ```
4. Sigue el formato de commits convencionales:
   - `feat(cv): añade inspector local de adaptación por oferta`
   - `fix(a11y): garantiza contraste WCAG 2.2 AA y nombres accesibles`
   - `perf(bundle): aplica carga diferida por sección`
   - `test(e2e): verifica camino feliz del estudio`

## Lista de verificación previa al Pull Request

- [ ] `pnpm run typecheck` sin errores (`strict: true`).
- [ ] `pnpm run lint` con `0 errors, 0 warnings`.
- [ ] Suite Jest + tests Node (`pnpm test` y `pnpm run test:gates`) en verde.
- [ ] Contraste de texto `>= 4.5:1`, objetivos táctiles `>= 44px` y respeto a `prefers-reduced-motion`.
- [ ] Sin marcadores `TODO`, placeholders ni dependencias huérfanas.
