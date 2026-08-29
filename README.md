# Manos Abiertas

Aplicacion Next.js de apoyo educativo multilingue: aprendizaje de IA, creacion de CV y orientacion sobre derechos y recursos para personas inmigrantes en Espana.

El nombre `Belentani.cv-ai` pertenece al repositorio historico. La identidad visible y los metadatos incluidos en la aplicacion identifican el producto como **Manos Abiertas**.

## Desarrollo

Requisitos: Node.js y npm.

```powershell
Copy-Item .env.example .env.local
npm ci
npm run dev
```

Validacion local:

```powershell
npm run lint
npm run typecheck
npm run build
```

`package-lock.json` es el lockfile canonico. Los scripts de construccion y arranque usan Node.js y funcionan en Windows, Linux y macOS.

## Datos locales y secretos

La configuracion real vive en `.env.local`. Las bases SQLite bajo `db/` son datos de ejecucion y no forman parte del codigo fuente. Consulta [SECURITY.md](SECURITY.md) antes de publicar cambios.
