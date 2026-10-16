# Belentani.cv-ai

AI-powered document studio — CVs, cover letters, presentations. €0.99 one-time.

## Estado de seguridad

- **Validación**: ✅ Zod strict schema con PII pre-check
- **Rate limiting**: ✅ @upstash/ratelimit (5 req/min por IP en producción)
- **Error handling**: ✅ Errors redactados — no se expone stack trace al cliente
- **Privacy**: Privacy-first y offline-first — los datos del usuario no viajan a servidores de IA sin consentimiento explícito

## Setup

```bash
pnpm install
cp .env.example .env
pnpm db:generate
pnpm dev
```

## Stack

- Next.js 15 + React 19
- Prisma para persistencia
- Zod para validación de inputs
- shadcn/ui + TailwindCSS

## License

MIT
