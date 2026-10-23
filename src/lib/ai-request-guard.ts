import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

type GuardResult = { body: unknown; error?: never } | { body?: never; error: NextResponse };

export function createAiRequestGuard(namespace: string, maxBytes: number) {
  const ratelimit = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: false,
    prefix: 'belentani:ai:' + namespace,
  });

  return async (req: NextRequest): Promise<GuardResult> => {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return {
        error: NextResponse.json(
          { ok: false, text: '', error: 'El servicio de IA no está disponible temporalmente.' },
          { status: 503, headers: { 'Cache-Control': 'no-store' } },
        ),
      };
    }

    // Never trust arbitrary forwarded headers when running outside Vercel.
    const visitor = process.env.VERCEL === '1'
      ? (req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'unknown')
      : 'unknown';
    // Fail closed if the backing rate-limit service is unavailable. Never send
    // user CV content to the AI provider when abuse protection cannot run.
    let limitResult: Awaited<ReturnType<typeof ratelimit.limit>>;
    try {
      limitResult = await ratelimit.limit(visitor);
    } catch {
      return {
        error: NextResponse.json(
          { ok: false, text: '', error: 'El servicio de IA no está disponible temporalmente.' },
          { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '60' } },
        ),
      };
    }
    const { success, reset, limit, remaining } = limitResult;
    if (!success) {
      return {
        error: NextResponse.json(
          { ok: false, text: '', error: 'Límite temporal alcanzado. Inténtalo más tarde.' },
          {
            status: 429,
            headers: {
              'Cache-Control': 'no-store',
              'Retry-After': String(Math.max(1, Math.ceil((reset - Date.now()) / 1000))),
              'X-RateLimit-Limit': String(limit),
              'X-RateLimit-Remaining': String(remaining),
            },
          },
        ),
      };
    }

    const contentType = req.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase();
    if (contentType !== 'application/json') {
      return { error: NextResponse.json(
        { ok: false, text: '', error: 'Se requiere contenido JSON.' },
        { status: 415, headers: { 'Cache-Control': 'no-store' } },
      ) };
    }

    const declaredLength = req.headers.get('content-length');
    if (declaredLength !== null && !/^\d+$/.test(declaredLength)) {
      return { error: NextResponse.json(
        { ok: false, text: '', error: 'Cabecera de tamaño no válida.' },
        { status: 400 },
      ) };
    }
    if (declaredLength !== null && Number(declaredLength) > maxBytes) {
      return { error: NextResponse.json(
        { ok: false, text: '', error: 'La solicitud supera el tamaño permitido.' },
        { status: 413 },
      ) };
    }
    const reader = req.body?.getReader();
    if (!reader) {
      return { error: NextResponse.json(
        { ok: false, text: '', error: 'Solicitud JSON no válida.' },
        { status: 400 },
      ) };
    }
    let size = 0;
    const chunks: Uint8Array[] = [];
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > maxBytes) {
          return { error: NextResponse.json(
            { ok: false, text: '', error: 'La solicitud supera el tamaño permitido.' },
            { status: 413 },
          ) };
        }
        chunks.push(value);
      }
      const buffer = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) {
        buffer.set(chunk, offset);
        offset += chunk.byteLength;
      }
      const body: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(buffer));
      return { body };
    } catch {
      // Avoid logging request bodies, which can contain private user information.
      return { error: NextResponse.json(
        { ok: false, text: '', error: 'Solicitud JSON no válida.' },
        { status: 400 },
      ) };
    } finally {
      reader.releaseLock();
    }
  };
}
