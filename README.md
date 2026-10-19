# Belentani.cv-ai — estado real del proyecto

Esta rama contiene una aplicación **Manos Abiertas** con editor de CV, generador de cartas, recursos educativos y asistente de IA. Su página de inicio actual es `src/app/page.tsx`, que renderiza `ManosAbiertasApp`. **No es todavía una plataforma comercial independiente de CV.**

## Funciones implementadas

- Editor de currículum, plantillas y vista de impresión/PDF mediante el navegador.
- Redacción asistida de resumen de CV y carta de presentación bajo solicitud explícita.
- Asistente educativo y herramientas de resumen/cuestionarios.
- Edición local sin IA cuando el proveedor no está disponible.

No hay integración de cobro ni checkout verificada. **No anunciar «€0,99» ni presentar pagos como funcionales.** El proyecto no debe publicarse como un producto comercial separado hasta resolver su identidad y el flujo de pago.

## Privacidad y límites

El editor guarda información del CV y de la carta en el **almacenamiento local del navegador**. Esto permite recuperar el formulario en ese dispositivo, pero no equivale a cifrado de extremo a extremo ni a un sistema de copia de seguridad.

Los botones de generación con IA exigen autorización visible antes de enviar los datos incluidos en la solicitud al servidor y, desde allí, al proveedor de IA. **No es un flujo exclusivamente offline.** El editor de CV no transmite correo, teléfono ni dirección en su solicitud de generación, aunque sí puede transmitir nombre, profesión, experiencia, estudios y habilidades. No introducir información personal innecesaria en otros campos.

La API usa esquemas Zod estrictos, límite de 64 KiB por solicitud y límites compartidos de 5 peticiones por minuto para las rutas de chat, cartas y estudio. La ruta CV conserva su límite propio de 5 peticiones por minuto. Si Redis/KV falla o no está configurado, las llamadas de IA devuelven 503 sin invocar al modelo. Los errores de proveedor no se devuelven ni se registran con datos privados.

## Instalación y verificación

```sh
pnpm install --frozen-lockfile
pnpm db:generate
pnpm test -- --runInBand
pnpm lint
pnpm build
```

Copiar `.env.example` a un archivo local no versionado y configurar credenciales protegidas. Las rutas de IA necesitan `KV_REST_API_URL` y `KV_REST_API_TOKEN`; las variables `UPSTASH_REDIS_REST_*` por sí solas **no cumplen** el contrato actual de `@vercel/kv`.

El repositorio contiene documentos de trabajo, un ZIP histórico de Manos Abiertas y varios módulos mezclados. No publicar backups, `.env`, archivos privados o derivados ajenos como assets públicos. Separar el producto comercial del producto educativo únicamente tras identificar sus fuentes canónicas y probar el build.
