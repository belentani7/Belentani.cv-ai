# Ficha de producto — Belentani.cv-ai

## Identidad
- **Nombre:** Belentani.cv-ai
- **Tipo:** repositorio del ecosistema belentani7
- **Modelo de producto:** herramienta / servicio web
- **Origen:** clonado de GitHub (belentani7/Belentani.cv-ai)

## Qué resuelve
Belentani CV Studio: creación de currículums con plantillas diferenciadas, adaptación honesta por oferta de empleo y diagnóstico de legibilidad ATS, constructor de cartas de presentación y revisión previa al envío con privacidad local por defecto.

## Máximo potencial alcanzable
| Dimensión | Estado actual | Techo |
|-----------|---------------|-------|
| Producto | Estudio operativo (`/`, `/cv`, `/cv/preparar`) | Producto comercial completo con 8 piezas de plataforma |
| Monetización | Documentada en `plataforma/` (sin pasarela activa) | 4 fases de pago con regla dura |
| Despliegue | Vercel + Docker + GitHub Pages | Producción con dominio, CI/CD íntegro y soporte |

## Brechas para completar el producto comercial
1. OFERTA.md — oferta comercial concreta
2. precios.json — precios definidos
3. COBRO.md — flujo de pago y facturación
4. ONEPAGER.md — landing de venta
5. DEMO.md — guion de demo
6. METRICAS.md — KPIs de adopción
7. Enlace en README — apuntar a ficha y documentación de plataforma
8. Auditoría — gate de comprobaciones en verde (`scripts/doctor.py` y `scripts/forge-audit.mjs`)

## Auditoría interna
- git status: revisado
- Gobernanza: `BIBLIA.md`, `AGENTS.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` y `SECURITY.md` sincronizados
