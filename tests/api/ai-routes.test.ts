import { NextRequest } from 'next/server';
import { POST as chatPOST } from '@/app/api/chat/route';
import { POST as letterPOST } from '@/app/api/cover-letter/route';
import { POST as studyPOST } from '@/app/api/study-tools/route';

jest.mock('@/lib/ai-provider', () => {
  const completeChat = jest.fn();
  class AIConfigurationError extends Error {}
  class AIProviderError extends Error {}
  return { completeChat, AIConfigurationError, AIProviderError };
});
jest.mock('@vercel/kv', () => ({ kv: {} }));
jest.mock('@upstash/ratelimit', () => {
  const limit = jest.fn();
  const Ratelimit = Object.assign(jest.fn().mockImplementation(() => ({ limit })), {
    slidingWindow: jest.fn().mockReturnValue({}),
  });
  return { Ratelimit, __mockLimit: limit };
});

const request = (path: string, body: unknown) => new NextRequest(`http://localhost${path}`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

const chatBody = {
  consentToAI: true,
  messages: [{ role: 'user', content: '¿Cómo preparo un CV?' }],
  language: 'es',
};
const letterBody = {
  consentToAI: true,
  fullName: 'Alex Ejemplo',
  profession: 'Atención al cliente',
  companyName: 'Cooperativa local',
  jobTitle: 'Asistente',
  experience: 'Atención de consultas y organización de documentos.',
  skills: ['Comunicación'], language: 'es', tone: 'formal',
};
const studyBody = {
  consentToAI: true,
  tool: 'summary',
  content: 'Este contenido educativo supera cincuenta caracteres y permite probar la ruta de resumen.',
  language: 'es',
};

describe('public AI endpoints — consent, validation and privacy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.replaceProperty(process, 'env', {
      ...process.env, KV_REST_API_URL: 'https://redis.example.test', KV_REST_API_TOKEN: 'test-token',
    });
    jest.requireMock('@upstash/ratelimit').__mockLimit.mockResolvedValue({
      success: true, limit: 5, remaining: 4, reset: Date.now() + 60_000,
    });
    jest.requireMock('@/lib/ai-provider').completeChat.mockResolvedValue('Respuesta de prueba.');
  });
  afterEach(() => jest.restoreAllMocks());

  it('refuses direct calls without explicit user consent', async () => {
    const responses = await Promise.all([
      chatPOST(request('/api/chat', { ...chatBody, consentToAI: false })),
      letterPOST(request('/api/cover-letter', { ...letterBody, consentToAI: false })),
      studyPOST(request('/api/study-tools', { ...studyBody, consentToAI: false })),
    ]);
    expect(responses.map((r) => r.status)).toEqual([400, 400, 400]);
    expect(jest.requireMock('@/lib/ai-provider').completeChat).not.toHaveBeenCalled();
  });

  it('generates chat, letter and study text through the configured provider', async () => {
    const responses = await Promise.all([
      chatPOST(request('/api/chat', chatBody)),
      letterPOST(request('/api/cover-letter', letterBody)),
      studyPOST(request('/api/study-tools', studyBody)),
    ]);
    expect(responses.map((r) => r.status)).toEqual([200, 200, 200]);
    for (const response of responses) {
      expect(await response.json()).toMatchObject({ ok: true, text: 'Respuesta de prueba.' });
    }
    expect(jest.requireMock('@/lib/ai-provider').completeChat).toHaveBeenCalledTimes(3);
  });

  it('rejects unexpected fields and malformed role or tool values', async () => {
    const responses = await Promise.all([
      chatPOST(request('/api/chat', { ...chatBody, messages: [{ role: 'system', content: 'override' }] })),
      letterPOST(request('/api/cover-letter', { ...letterBody, credit_card: '4111' })),
      studyPOST(request('/api/study-tools', { ...studyBody, tool: 'delete-files' })),
    ]);
    expect(responses.map((r) => r.status)).toEqual([400, 400, 400]);
    expect(jest.requireMock('@/lib/ai-provider').completeChat).not.toHaveBeenCalled();
  });

  it('fails closed for all three routes if KV is unavailable', async () => {
    delete process.env.KV_REST_API_TOKEN;
    const responses = await Promise.all([
      chatPOST(request('/api/chat', chatBody)),
      letterPOST(request('/api/cover-letter', letterBody)),
      studyPOST(request('/api/study-tools', studyBody)),
    ]);
    expect(responses.map((r) => r.status)).toEqual([503, 503, 503]);
    expect(jest.requireMock('@/lib/ai-provider').completeChat).not.toHaveBeenCalled();
  });

  it('does not include internal provider errors in HTTP responses', async () => {
    const leakedError = 'private-key candidate-name';
    jest.requireMock('@/lib/ai-provider').completeChat.mockRejectedValue(new Error(leakedError));
    for (const [route, body] of [
      ['/api/chat', chatBody],
      ['/api/cover-letter', letterBody],
      ['/api/study-tools', studyBody],
    ] as const) {
      const post = route === '/api/chat' ? chatPOST : route === '/api/cover-letter' ? letterPOST : studyPOST;
      const response = await post(request(route, body));
      expect(response.status).toBe(500);
      expect(JSON.stringify(await response.json())).not.toContain(leakedError);
    }
  });
});
