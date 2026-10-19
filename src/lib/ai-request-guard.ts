import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';
import { z } from 'zod';

const MAX_BODY_BYTES = 64 * 1024;
const limiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: false,
});

type Accepted<S extends z.ZodTypeAny> = { ok: true; data: z.infer<S> };
type Rejected = { ok: false; response: NextResponse };
type GuardResult<S extends z.ZodTypeAny> = Accepted<S> | Rejected;

function reject(status: number, error: string, headers?: Record<string, string>): Rejected {
  return {
    ok: false,
    response: NextResponse.json({ ok: false, error, text: '' }, { status, headers }),
  };
}

/**
 * Apply the same resource and privacy boundary to each public, paid AI endpoint.
 * Never log user-supplied input, raw AI errors, tokens, or provider responses.
 */
export async function guardAiRequest<S extends z.ZodTypeAny>(
  req: NextRequest,
  schema: S,
): Promise<GuardResult<S>> {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return reject(503, 'La generación con IA no está disponible en este momento.');
  }

  const contentType = req.headers.get('content-type') ?? '';
  if (!/^application\/json\s*(?:;|$)/i.test(contentType)) {
    return reject(415, 'Se requiere una solicitud JSON.');
  }

  const claimedLength = req.headers.get('content-length');
  if (claimedLength !== null && Number(claimedLength) > MAX_BODY_BYTES) {
    return reject(413, 'La solicitud supera el tamaño permitido.');
  }

  // All three routes share a quota to prevent switching endpoints to bypass it.
  const forwardedIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const clientId = (forwardedIp || req.headers.get('x-real-ip') || 'unknown').slice(0, 128);

  try {
    const result = await limiter.limit(`public-ai:${clientId}`);
    if (!result.success) {
      const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
      return reject(429, 'Límite de solicitudes alcanzado. Inténtalo más tarde.', {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
      });
    }
  } catch {
    // Fails closed; never call the model if the shared quota service is down.
    return reject(503, 'La generación con IA no está disponible en este momento.');
  }

  const reader = req.body?.getReader();
  if (!reader) return reject(400, 'Solicitud JSON inválida.');

  const chunks: Uint8Array[] = [];
  let bytesRead = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytesRead += value.byteLength;
      if (bytesRead > MAX_BODY_BYTES) {
        return reject(413, 'La solicitud supera el tamaño permitido.');
      }
      chunks.push(value);
    }
  } catch {
    return reject(400, 'Solicitud JSON inválida.');
  } finally {
    reader.releaseLock();
  }

  try {
    const payload = new Uint8Array(bytesRead);
    let offset = 0;
    for (const chunk of chunks) {
      payload.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(payload);
    const parsed = schema.safeParse(JSON.parse(decoded));
    if (!parsed.success) return reject(400, 'Solicitud JSON inválida.');
    return { ok: true, data: parsed.data };
  } catch {
    return reject(400, 'Solicitud JSON inválida.');
  }
}
