# Seguridad del repositorio

## Medidas aplicadas

- `.env` y las bases SQLite locales no se rastrean.
- `.env.example` contiene solo valores de desarrollo no sensibles.
- `package-lock.json` fija la resolucion npm usada por CI y desarrollo.

## Accion requerida por el propietario

Este cambio retira `.env` y `db/custom.db` del estado actual de Git, pero no reescribe commits anteriores.

1. Revisa en privado si el `.env` historico contenia credenciales reales.
2. Revoca y rota cada credencial encontrada desde su proveedor.
3. Sustituye los valores solo en el gestor de secretos del despliegue o en `.env.local` sin rastrear.
4. Si el repositorio fue publico, limpia el historial con una herramienta como `git filter-repo` en una operacion separada y coordinada; despues invalida clones antiguos.

No publiques valores reales en incidencias, commits o logs.
