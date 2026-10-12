import { z } from 'zod';
import { MAX_CHAT_MESSAGE_CHARS, MAX_CHAT_MESSAGES } from './chat-history';

const MAX_BODY_BYTES = 64 * 1024;
const language = z.string().max(35).optional();
const shortText = z.string().max(200).optional();
const skills = z.array(z.string().max(200)).max(100).optional();

export const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().trim().min(1).max(MAX_CHAT_MESSAGE_CHARS),
  }).strict()).min(1).max(MAX_CHAT_MESSAGES),
  language,
  context: z.string().max(4000).optional(),
}).strict();

export const cvRequestSchema = z.object({
  field: z.enum(['summary', 'experience']),
  fullName: shortText,
  profession: shortText,
  experiences: z.array(z.object({
    position: shortText, company: shortText,
    description: z.string().max(5000).optional(),
    startDate: z.string().max(50).optional(), endDate: z.string().max(50).optional(),
  })).max(50).optional(),
  education: z.array(z.object({
    title: shortText, institution: shortText, year: z.string().max(50).optional(),
    description: z.string().max(5000).optional(),
  })).max(50).optional(),
  skills,
  language,
}).strict();

export const coverLetterRequestSchema = z.object({
  fullName: shortText, profession: shortText, companyName: shortText, jobTitle: shortText,
  experience: z.string().max(10000).optional(),
  skills, language,
  tone: z.enum(['formal', 'friendly', 'direct']).optional(),
}).strict();

export const studyToolsRequestSchema = z.object({
  tool: z.enum(['questions', 'summary']),
  content: z.string().trim().min(50).max(50000),
  title: z.string().max(500).optional(), language,
}).strict();

export class AIRequestError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

/** Bound the streamed body even when Content-Length is absent or incorrect. */
export async function readAIRequest<T>(req: Request, schema: z.ZodType<T>): Promise<T> {
  const reader = req.body?.getReader();
  if (!reader) throw new AIRequestError('Solicitud JSON no válida.', 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new AIRequestError('La solicitud es demasiado grande.', 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  let payload: unknown;
  try {
    payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new AIRequestError('Solicitud JSON no válida.', 400);
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) throw new AIRequestError('Revisa los campos de la solicitud.', 400);
  return parsed.data;
}

export function requireAIText(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AIRequestError('El servicio de IA no devolvió una respuesta. Inténtalo de nuevo.', 502);
  }
  return value.trim();
}

/** Provider exceptions may contain credentials, request content or internal URLs. */
export function aiErrorResponse(error: unknown): Response {
  const expected = error instanceof AIRequestError;
  return Response.json({
    ok: false,
    error: expected ? error.message : 'No se pudo completar la solicitud. Inténtalo de nuevo.',
    text: '',
  }, { status: expected ? error.status : 500 });
}
