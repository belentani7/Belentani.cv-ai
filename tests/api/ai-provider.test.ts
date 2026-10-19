import { AIConfigurationError, AIProviderError, completeChat } from '@/lib/ai-provider';

const prompt = [
  { role: 'system' as const, content: 'Answer in simple Spanish.' },
  { role: 'user' as const, content: 'Hola' },
];

describe('OpenRouter provider — bounded, fail-safe transport', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENROUTER_API_KEY = 'unit-test-only-key';
    process.env.OPENROUTER_MODEL = 'test/provider-model';
    delete process.env.APP_URL;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_MODEL;
    jest.restoreAllMocks();
  });

  it('does not call remote provider without both credentials and model', async () => {
    const mockFetch = jest.fn();
    global.fetch = mockFetch as typeof fetch;
    delete process.env.OPENROUTER_API_KEY;
    await expect(completeChat(prompt, { maxTokens: 200 })).rejects.toBeInstanceOf(AIConfigurationError);
    process.env.OPENROUTER_API_KEY = 'test-only';
    delete process.env.OPENROUTER_MODEL;
    await expect(completeChat(prompt, { maxTokens: 200 })).rejects.toBeInstanceOf(AIConfigurationError);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('enforces maxTokens and temperature before touching the network', async () => {
    const mockFetch = jest.fn();
    global.fetch = mockFetch as typeof fetch;
    await expect(completeChat(prompt, { maxTokens: 0 })).rejects.toThrow('Unsupported maxTokens');
    await expect(completeChat(prompt, { maxTokens: 2049 })).rejects.toThrow('Unsupported maxTokens');
    await expect(completeChat(prompt, { maxTokens: 100, temperature: -1 })).rejects.toThrow('Unsupported temperature');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('uses an explicit model, a bounded response and a no-store request', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: '  Hola, puedes aprender aquí.  ' } }] }),
    });
    global.fetch = mockFetch as typeof fetch;
    await expect(completeChat(prompt, { maxTokens: 700, temperature: 0.4 }))
      .resolves.toBe('Hola, puedes aprender aquí.');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('https://openrouter.ai/api/v1/chat/completions');
    expect(options.cache).toBe('no-store');
    expect(options.headers.Authorization).toBe('Bearer unit-test-only-key');
    const payload = JSON.parse(options.body);
    expect(payload).toMatchObject({
      model: 'test/provider-model',
      max_tokens: 700,
      temperature: 0.4,
      stream: false,
    });
    expect(payload.messages).toEqual(prompt);
    expect(options.signal).toBeDefined();
  });

  it('rejects provider HTTP failures without including their private body', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false, status: 401,
      json: async () => ({ error: 'secret-api-key-exposed-here' }),
    }) as typeof fetch;
    await expect(completeChat(prompt, { maxTokens: 200 })).rejects.toBeInstanceOf(AIProviderError);
  });

  it('rejects malformed, empty and oversized provider output', async () => {
    for (const result of [
      { choices: [] },
      { choices: [{ message: { content: '' } }] },
      { choices: [{ message: { content: 'x'.repeat(20_001) } }] },
    ]) {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true, status: 200, json: async () => result,
      }) as typeof fetch;
      await expect(completeChat(prompt, { maxTokens: 200 })).rejects.toBeInstanceOf(AIProviderError);
    }
  });

  it('fails closed on network errors and never returns raw transport details', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('private network trace')) as typeof fetch;
    await expect(completeChat(prompt, { maxTokens: 200 })).rejects.toBeInstanceOf(AIProviderError);
  });
});
