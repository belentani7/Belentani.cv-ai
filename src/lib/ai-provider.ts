import { z } from 'zod';

export type AIMessage = { role: 'system' | 'user' | 'assistant'; content: string };
export type AICompletionOptions = { maxTokens: number; temperature?: number };

export class AIConfigurationError extends Error {
  constructor() { super('AI provider is not configured.'); this.name = 'AIConfigurationError'; }
}
export class AIProviderError extends Error {
  constructor(readonly status?: number) { super('AI provider request failed.'); this.name = 'AIProviderError'; }
}

const responseSchema = z.object({
  choices: z.array(z.object({
    message: z.object({
      content: z.union([
        z.string(),
        z.array(z.object({ type: z.string().optional(), text: z.string().optional() })),
      ]),
    }),
  })).min(1),
});

const API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const OUTPUT_TOKEN_CAP = 2048;

export async function completeChat(messages: AIMessage[], options: AICompletionOptions): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  const model = process.env.OPENROUTER_MODEL?.trim();
  if (!apiKey || !model) throw new AIConfigurationError();

  if (!Number.isInteger(options.maxTokens) || options.maxTokens < 1 || options.maxTokens > OUTPUT_TOKEN_CAP) {
    throw new TypeError('Unsupported maxTokens');
  }
  const temperature = options.temperature ?? 0.3;
  if (!Number.isFinite(temperature) || temperature < 0 || temperature > 1) throw new TypeError('Unsupported temperature');

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'X-OpenRouter-Title': 'Manos Abiertas',
  };
  if (process.env.APP_URL) headers['HTTP-Referer'] = process.env.APP_URL;

  let response: Response;
  try {
    response = await fetch(API_ENDPOINT, {
      method: 'POST', headers, signal: AbortSignal.timeout(25_000), cache: 'no-store',
      body: JSON.stringify({
        model, messages,
        max_tokens: options.maxTokens,
        temperature, stream: false,
      }),
    });
  } catch {
    throw new AIProviderError();
  }

  if (!response.ok) throw new AIProviderError(response.status);
  let payload: unknown;
  try { payload = await response.json(); } catch { throw new AIProviderError(response.status); }

  const parsed = responseSchema.safeParse(payload);
  if (!parsed.success) throw new AIProviderError(response.status);
  const content = parsed.data.choices[0].message.content;
  const text = typeof content === 'string'
    ? content
    : content.map((part) => part.text ?? '').join('');
  if (!text.trim() || text.length > 20_000) throw new AIProviderError(response.status);
  return text.trim();
}
