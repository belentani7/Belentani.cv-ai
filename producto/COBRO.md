# Cobro — Belentani CV Studio

## Qué se cobra y cuándo

Un pago único por adaptación, **antes** de empezar. El plazo de 48 horas empieza con el pago
confirmado, no con el correo.

| Momento | Qué ocurre | Importe |
|---|---|---|
| Encaje | Se lee la oferta y el CV; se dice si sirve o no | 0 € |
| Pago | Transferencia o enlace de pago | 89 € o 219 € (IVA incluido) |
| Entrega | PDF, texto plano, carta, checklist | — |
| Corrección | Una ronda | 0 € |
| Retraso | Si incumple las 48 h | −100 % |

## Pasarela elegida

**Stripe** con enlace de pago por importe fijo, más **transferencia/Bizum** como alternativa
para quien no quiera pagar con tarjeta.

Estado real: **el repositorio no tiene pasarela operativa**. Su propio README lo dice: «No hay
en el repositorio evidencia de pasarela de pagos operativa». Por tanto, el alta es trabajo
pendiente y se documenta aquí:

1. Cuenta Stripe (o equivalente) con CIF y cuenta de abono. Verificación: 2–5 días.
2. Dos enlaces de pago: 89 € y 219 €, con el IVA ya incluido en el importe (no se suma en el
   checkout).
3. Factura simplificada o completa desde el sistema de facturación del titular; Stripe solo
   cobra.
4. Mientras el alta termina: transferencia con justificante y factura en 24 h. Es como se
   cobrará el primer encargo.

No se pide nunca el número de tarjeta por correo ni por mensaje.

## Qué datos hacen falta

- Nombre y correo de contacto.
- El CV actual (PDF o texto) y la oferta (enlace o PDF).
- Idioma de entrega: español, catalán, portugués o inglés.
- Para la factura, si se pide: nombre fiscal, NIF y dirección. Si no se pide, basta el recibo.

No se piden datos de salud, familia, religión ni situación administrativa: no cambian el CV y no
se necesitan.

## Qué se entrega tras pagar

1. **CV en PDF**, maquetado con la plantilla elegida.
2. **CV en texto plano**, para formularios que no aceptan archivos.
3. **Carta breve** adaptada a la misma oferta.
4. **Lista de comprobación** de lo que revisa un filtro automático (sin puntuación inventada).
5. **Una ronda de correcciones** por correo, en 24 horas.
6. **Borrado de archivos** a los 30 días, con aviso por correo cuando ocurra.

## Política de reembolso

- **7 días** desde la entrega si el CV contiene un error imputable al servicio (dato mal
  transcrito, oferta equivocada, formato ilegible).
- **Devolución íntegra automática** si la entrega llega fuera de las 48 horas acordadas.
- No hay devolución por «no me ha llamado ninguna empresa»: eso no es un defecto del servicio y
  decirlo sería vender humo.
- Vía: misma pasarela o transferencia, en 7 días laborables.

## Lo que no se cobra

- La revisión de encaje, incluso cuando la respuesta es «no te va a servir».
- La corrección de erratas del CV entregado.
- Cualquier servicio de bolsa de empleo: no existe.

## Antes de publicar

El correo de la landing (`cv@belentani.example`) es un marcador; se sustituye por una dirección
real antes de publicar. Y no se anuncia ninguna suscripción: el paywall la prevé como fase 3,
pero no hay producto recurrente construido.
