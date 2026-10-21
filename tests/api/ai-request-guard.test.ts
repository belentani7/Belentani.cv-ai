import { createHash } from 'node:crypto';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { guardAiRequest } from '@/lib/ai-request-guard';

jest.mock('@vercel/kv', () => ({ kv: {} }));
jest.mock('@upstash/ratelimit', () => {
  const mockLimit = jest.fn();
  const Ratelimit = Object.assign(
    jest.fn().mockImplementation(() => ({ limit: mockLimit })),
    { slidingWindow: jest.fn().mockReturnValue({}) },
  );
  return { Ratelimit, __mockLimit: mockLimit };
});

const schema = z.object({ prompt: z.string().min(1).max(100) }).strict();

function request(body: string, headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost/api/cover-letter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body,
  });
}

describe('shared public AI request guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.replaceProperty(process, 'env', {
      ...process.env,
      KV_REST_API_URL: 'https://kv.example.test',
      KV_REST_API_TOKEN: 'test-token',
    });
    jest.requireMock('@upstash/ratelimit').__mockLimit.mockResolvedValue({
      success: true, limit: 5, remaining: 4, reset: Date.now() + 60_000,
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('fails closed when the shared Redis credentials are absent', async () => {
    delete process.env.KV_REST_API_TOKEN;
    const result = await guardAiRequest(request('{"prompt":"hola"}'), schema);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(503);
    expect(jest.requireMock('@upstash/ratelimit').__mockLimit).not.toHaveBeenCalled();
  });

  it('rejects unsupported content types', async () => {
    const result = await guardAiRequest(request('{"prompt":"hola"}', { 'content-type': 'text/plain' }), schema);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(415);
  });

  it('rejects requests larger than 64 KiB before calling Redis', async () => {
    const result = await guardAiRequest(request('{}', { 'content-length': '70000' }), schema);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(413);
    expect(jest.requireMock('@upstash/ratelimit').__mockLimit).not.toHaveBeenCalled();
  });

  it('also caps streamed requests without a trusted content-length', async () => {
    const result = await guardAiRequest(request(JSON.stringify({ prompt: 'x'.repeat(70_000) })), schema);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(413);
  });

  it('rejects malformed JSON and additional fields with generic 400 errors', async () => {
    for (const body of ['{"prompt":', '{"prompt":"hola","credit_card":"secret"}']) {
      const result = await guardAiRequest(request(body), schema);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.response.status).toBe(400);
        expect(JSON.stringify(await result.response.json())).not.toContain('secret');
      }
    }
  });

  it('shares one rate limiter key per client and returns Retry-After', async () => {
    const limit = jest.requireMock('@upstash/ratelimit').__mockLimit;
    limit.mockResolvedValueOnce({ success: false, limit: 5, remaining: 0, reset: Date.now() + 60_000 });
    const result = await guardAiRequest(request('{"prompt":"hola"}', { 'x-forwarded-for': '203.0.113.9' }), schema);
    const hash = createHash('sha256').update('203.0.113.9').digest('hex');
    expect(limit).toHaveBeenCalledWith(`public-ai:${hash}`);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(429);
      expect(Number(result.response.headers.get('Retry-After'))).toBeGreaterThan(0);
    }
  });

  it('returns unavailable rather than bypassing a failed quota service', async () => {
    jest.requireMock('@upstash/ratelimit').__mockLimit.mockRejectedValueOnce(new Error('redis-down'));
    const result = await guardAiRequest(request('{"prompt":"hola"}'), schema);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(503);
  });

  it('returns validated data without leaking input into logs', async () => {
    const result = await guardAiRequest(request('{"prompt":"hola"}'), schema);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual({ prompt: 'hola' });
  });
});
