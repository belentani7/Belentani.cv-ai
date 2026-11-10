# Oferta — Belentani CV Studio

## Qué se vende

**Un currículum adaptado a una oferta concreta, entregado en 48 horas, por 89 € con IVA
incluido.**

Es un servicio, no una suscripción: se paga una vez por cada oferta a la que la persona quiera
presentarse. Se entrega el CV reescrito en PDF y en texto plano, una carta breve y una lista de
comprobación de lo que revisa un filtro automático. Una ronda de correcciones incluida.

Lo que se compra es **el trabajo de adaptación**, hecho con el editor de este repositorio
(`src/app/cv/page.tsx` y `src/app/cv/preparar/page.tsx`, autoguardado local del borrador) y con
una persona leyendo la oferta. No se vende una suscripción a una herramienta ni un «generador
infinito».

## A quién

1. **Quien busca empleo y se juega una candidatura concreta**: tiene una oferta delante, tiene
   su CV y no sabe qué recortar, qué reordenar y qué palabra usar.
2. **Perfiles migrantes o en cambio de sector** cuyo CV está bien en su país y no encaja con lo
   que se lee aquí: hay que traducir el formato, no solo el idioma.
3. **Quien lleva 30 candidaturas y cero respuestas** y necesita saber si el problema es el CV o
   el puesto. En ese caso se dice en la primera respuesta, aunque signifique no vender.

Nunca se acepta: inventar experiencia, títulos, fechas o empresas. El repositorio lo declara
fuera de alcance (`plataforma/FICHA.md`: «inventar experiencia») y es la primera condición del
servicio.

## Precio

| Plan | Qué incluye | Precio (IVA 21 % incluido) | Base |
|---|---|---|---|
| CV adaptado | 1 oferta · PDF + texto plano · carta breve · 1 ronda de correcciones | **89 €** | 73,55 € |
| Tres ofertas | 3 adaptaciones distintas, entregadas en 5 días laborables | **219 €** | 180,99 € |

Sin alta, sin cuota y sin renovación. El precio se ve antes de pedir ningún dato: no hay
formulario que pida el correo para revelar la tarifa (`plataforma/PAYWALL.md`, regla dura).

## Garantía

**48 horas o no se cobra.** Si la entrega llega después del plazo acordado, el importe se
devuelve íntegro y el CV entregado se queda con el cliente.

Además: si al leer la oferta y el CV se concluye que la adaptación no va a mejorar nada —porque
el problema es el encaje del puesto o el sector—, se dice antes de cobrar y no se acepta el
encargo.

## Objeciones

### «¿Esto me garantiza una entrevista?»

No, y quien lo garantice está mintiendo. Un CV adaptado mejora la probabilidad de pasar un
filtro; no decide la contratación. Lo que sí se puede comprobar es el trabajo: el CV sale con la
oferta delante, con las palabras del anuncio donde corresponden y sin datos inventados.

### «Lo puedo hacer yo con ChatGPT»

Sí, y probablemente el resultado sea parecido en el primer párrafo. La diferencia está en el
criterio: qué se quita, qué se reordena, qué se deja fuera porque no aporta, y qué no se pone
aunque quede bien. El editor del repositorio está pensado para que ese trabajo sea rápido; lo
que se paga son las dos horas de criterio, no el texto.

### «¿Qué pasa con mis datos?»

El borrador vive en el navegador del cliente (`lib/cv-storage.ts`, autoguardado local). Para el
servicio, el cliente envía su CV y la oferta por correo; se trabaja sobre copia local, se
entrega el resultado y **se borran los archivos a los 30 días**. No se publica nada, no se usa
como ejemplo y no se comparte con terceros. Si el cliente prefiere no enviar su CV por correo,
no se puede prestar el servicio y se dice.

## Lo que no se vende

- **Suscripción mensual.** El paywall la prevé como fase 3, pero no hay producto recurrente
  construido y no se va a inventar para la landing.
- **Puntuación ATS garantizada.** No existe un estándar único de ATS; prometer una nota sería
  vender una cifra inventada. Se entrega una lista de comprobación, no una puntuación.
- **Bolsa de empleo, contactos con empresas o entrevistas.** No existen.
- **Un SaaS terminado.** El repositorio declara que no hay pasarela operativa ni estudio de
  presentaciones terminado; esta oferta es un servicio humano con el editor como herramienta.
