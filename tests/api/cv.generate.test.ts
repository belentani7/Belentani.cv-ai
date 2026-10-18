import { POST } from '@/app/api/cv/generate/route';
import { NextRequest } from 'next/server';

// Mock ZAI
jest.mock('z-ai-web-dev-sdk', () => {
  const mockCreate = jest.fn();
  return { __esModule: true, default: { create: mockCreate }, __mockCreate: mockCreate };
});

// Mock @upstash/ratelimit
jest.mock('@upstash/ratelimit', () => {
  const mockLimit = jest.fn();
  const Ratelimit = Object.assign(
    jest.fn().mockImplementation(() => ({ limit: mockLimit })),
    { slidingWindow: jest.fn().mockReturnValue({}) },
  );
  return { Ratelimit, __mockLimit: mockLimit };
});

// Mock @vercel/kv
jest.mock('@vercel/kv', () => ({
  kv: {},
}));

describe('POST /api/cv/generate', () => {
  const createRequest = (body: object, headers: Record<string, string> = {}) => {
    return new NextRequest('http://localhost/api/cv/generate', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
        ...headers,
      },
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { __mockCreate } = jest.requireMock('z-ai-web-dev-sdk');
    const { __mockLimit } = jest.requireMock('@upstash/ratelimit');
    __mockLimit.mockResolvedValue({ success: true, limit: 5, remaining: 4, reset: Date.now() + 60000 });
    __mockCreate.mockResolvedValue({
      chat: { completions: { create: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Generated CV content' } }],
      }) } },
    });
  });

  it('rejects payload with extra fields (injection attempt)', async () => {
    const req = createRequest({
      field: 'summary',
      fullName: 'Test',
      profession: 'Dev',
      credit_card: '4111-1111-1111-1111',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toBe('Invalid request payload');
  });

  it('rejects missing required field', async () => {
    const req = createRequest({
      profession: 'Dev',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('accepts valid summary request', async () => {
    const req = createRequest({
      field: 'summary',
      fullName: 'Juan Pérez',
      profession: 'Desarrollador',
      experiences: [{ position: 'Dev', company: 'Acme', description: 'Coding', startDate: '2020-01', endDate: '2023-01' }],
      skills: ['TypeScript', 'React'],
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.text).toBe('Generated CV content');
  });

  it('accepts valid experience request', async () => {
    const req = createRequest({
      field: 'experience',
      experiences: [{ position: 'Senior Dev', company: 'TechCorp', description: 'Led team', startDate: '2021-01', endDate: '2023-01' }],
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  it('returns generic error on AI failure', async () => {
    const { __mockCreate } = jest.requireMock('z-ai-web-dev-sdk');
    __mockCreate.mockResolvedValueOnce({
      chat: {
        completions: {
          create: jest.fn().mockRejectedValue(new Error('API key invalid')),
        },
      },
    });

    const req = createRequest({ field: 'summary', fullName: 'Test' });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toBe('Failed to generate content. Please try again.');
    expect(json.error).not.toContain('API key');
    expect(json.error).not.toContain('ZAI');
  });

  it('rate limits after 5 requests', async () => {
    const { __mockLimit } = jest.requireMock('@upstash/ratelimit');
    __mockLimit.mockResolvedValueOnce({ success: false, limit: 5, remaining: 0, reset: Date.now() + 60000 });

    const req = createRequest({ field: 'summary', fullName: 'Test' }, { 'x-forwarded-for': '1.2.3.4' });
    const res = await POST(req);
    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toBe('Rate limit exceeded. Try again later.');
    expect(res.headers.get('X-RateLimit-Limit')).toBe('5');
  });

  it('validates language enum', async () => {
    const req = createRequest({
      field: 'summary',
      language: 'invalid-lang',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('validates experience array length', async () => {
    const experiences = Array(11).fill({ position: 'Dev', company: 'Co', description: 'D', startDate: '2020-01', endDate: '2021-01' });
    const req = createRequest({ field: 'summary', experiences });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
