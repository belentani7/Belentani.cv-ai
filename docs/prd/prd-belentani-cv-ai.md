# PRD -- Belentani.cv-ai
Fecha: 2026-09-25 | Estado: Draft (auditoria automatica, requiere revision humana) | Autor: auditoria belentani7 (NOIACORE)

## 1. Problema

Proyecto de **Belentani** — Belentani Academy / NOIACORE.

## 2. Usuarios objetivo

- **Primario**: usuario final que necesita resolver el caso de uso de Belentani.cv-ai.
- **Secundario**: equipo/persona que mantiene y despliega el proyecto.
- **Terciario**: agentes CLI que operan sobre el repositorio.

## 3. Features (MoSCoW)

| ID | Feature | MoSCoW |
|---|---|---|
| F1 | npm run build | Must |
| F2 | npm run db:generate | Must |
| F3 | npm run db:migrate | Must |
| F4 | npm run db:push | Must |
| F5 | npm run db:reset | Must |
| F6 | npm run dev | Must |
| F7 | npm run lint | Must |
| F8 | npm run start | Must |
| F90 | Checklist de produccion (build, tests, deploy, seguridad) | Should |
| F91 | Documentacion viva (esta cadena) | Must |

## 4. Criterios de aceptacion (GWT)

### F1 -- npm run build
- Given el usuario en el contexto de Belentani.cv-ai / When usa npm run build / Then obtiene el resultado esperado sin error.
- Given entrada invalida / When la envia / Then recibe un error generico y el detalle queda en logs.

### F2 -- npm run db:generate
- Given el usuario en el contexto de Belentani.cv-ai / When usa npm run db:generate / Then obtiene el resultado esperado sin error.
- Given entrada invalida / When la envia / Then recibe un error generico y el detalle queda en logs.

### F3 -- npm run db:migrate
- Given el usuario en el contexto de Belentani.cv-ai / When usa npm run db:migrate / Then obtiene el resultado esperado sin error.
- Given entrada invalida / When la envia / Then recibe un error generico y el detalle queda en logs.

### F4 -- npm run db:push
- Given el usuario en el contexto de Belentani.cv-ai / When usa npm run db:push / Then obtiene el resultado esperado sin error.
- Given entrada invalida / When la envia / Then recibe un error generico y el detalle queda en logs.


## 5. Metricas de exito

- Build reproducible en un comando.
- CI verde en cada PR.
- Cero secretos en el repositorio.
- Documentacion actualizada en el mismo PR que el codigo.

## 6. Out of scope

- Funcionalidad no descrita en el README vigente.
- Cambios que rompan compatibilidad sin ADR que lo justifique.
