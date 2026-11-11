# Ficha de venta — CV adaptado · Belentani CV Studio

## El problema

Alguien tiene una oferta abierta en una pestaña y su CV en otra. Sabe que debería adaptarlo y
no sabe qué tocar: si recorta, pierde experiencia; si no recorta, el anuncio habla de
«gestión de incidencias» y su CV de «atención al cliente». Envía el mismo PDF a todas partes y
no entiende por qué no contestan.

## La promesa

**En 48 horas tienes tu CV reescrito para esa oferta concreta, en PDF y en texto plano, con
carta breve y la lista de lo que revisa un filtro. 89 € con IVA, una vez. Si llega tarde, no se
cobra.**

Sin suscripción, sin «planes», sin puntuaciones inventadas.

## La prueba

| Afirmación | Dónde se comprueba |
|---|---|
| Existe un editor de CV funcional con vista previa y exportación | `src/app/cv/page.tsx`; README, «Qué funciona en el código» |
| El borrador se guarda en el navegador del cliente | `src/app/cv/preparar/page.tsx`, `lib/cv-storage.ts` |
| Hay pruebas automatizadas del flujo y de la privacidad del borrador | `tests/lib/cv-storage.test.ts`, `tests/lib/cv-draft-privacy.test.ts`, 13 archivos de prueba |
| No hay pasarela operativa y se documenta en vez de fingirla | README, «Lo que no debe anunciarse como finalizado» |
| No se inventa experiencia | `plataforma/FICHA.md`, «lo que este repositorio no va a hacer» |

Prueba que no existe: ningún cliente, ninguna tasa de éxito, ningún testimonio. Los CV de
ejemplo que se muestren en la demo son ficticios y se dicen como tales.

## El precio

| Plan | Qué es | Precio |
|---|---|---|
| CV adaptado | 1 oferta, PDF + texto, carta, 1 corrección | 89 € IVA incluido (base 73,55 €) |
| Tres ofertas | 3 adaptaciones en 5 días laborables | 219 € IVA incluido (base 180,99 €) |

**Garantía:** 48 horas o devolución íntegra.

## El CTA

Correo con asunto **«CV»**: enlace o PDF de la oferta, CV actual e idioma. Respuesta el mismo día
laborable con el encaje y la forma de pago. Si el encaje no tiene sentido, se dice y no se cobra.

## Quién está detrás

El autor de Belentani CV Studio, que escribe el editor y hace las adaptaciones. No hay agencia,
ni red de reclutadores, ni empresas asociadas. Cuando el CV no va a ayudar, se dice.

## Tres frases para repetir

1. Se adapta lo que existe; no se inventa trayectoria.
2. 48 horas o no se cobra.
3. El precio se ve antes de dar el correo.
