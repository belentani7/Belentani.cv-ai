import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { z } from 'zod';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@vercel/kv';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
});

const cvSchema = z.object({
  field: z.enum(['summary', 'experience']),
  fullName: z.string().min(2).max(100).optional(),
  profession: z.string().max(100).optional(),
  experiences: z.array(z.object({
    position: z.string().max(150),
    company: z.string().max(150),
    description: z.string().max(3000),
    startDate: z.string().regex(/^\d{4}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}$/),
  })).max(10).optional(),
  education: z.array(z.object({
    title: z.string().max(200),
    institution: z.string().max(200),
    year: z.string().regex(/^\d{4}$/),
    description: z.string().max(1000).optional(),
  })).max(5).optional(),
  skills: z.array(z.string().max(50)).max(30).optional(),
  language: z.enum(['es', 'en', 'ca', 'pt-BR', 'fr', 'ar', 'zh', 'hi']).optional(),
}).strict();

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || req.headers.get('x-real-ip') 
      || 'unknown';
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);
    
    if (!success) {
      return NextResponse.json(
        { ok: false, error: 'Rate limit exceeded. Try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          }
        }
      );
    }

    const body = await req.json();
    const parsedData = cvSchema.parse(body);
    
    const lang = parsedData.language || 'es';

    const langInstruction: Record<string, string> = {
      es: 'Responde en español de España.',
      en: 'Respond in English.',
      ca: 'Respon en català.',
      'pt-BR': 'Responda em português brasileiro.',
      fr: 'Réponds en français.',
      ar: 'أجب بالعربية.',
      zh: '用中文回答.',
      hi: 'हिंदी में उत्तर दें.',
    };

    const langPrompt = langInstruction[lang] || langInstruction.es;

    const zai = await ZAI.create();

    let systemPrompt = '';
    let userPrompt = '';

    if (parsedData.field === 'summary') {
      systemPrompt = `Eres un experto en recursos humanos y orientación laboral. Escribes resúmenes profesionales de CV persuasivos, honestos y optimizados para ATS. ${langPrompt} Máximo 3-4 frases (60-90 palabras). No uses la primera persona "yo", usa tercera persona o infinitivo. Sin emojis.`;
      userPrompt = `Genera un resumen profesional de CV para esta persona:

Nombre: ${parsedData.fullName || 'No especificado'}
Profesión: ${parsedData.profession || 'No especificada'}
Experiencia: ${parsedData.experiences?.map(e => `${e.position} en ${e.company}`).join(', ') || 'Sin experiencia especificada'}
Educación: ${parsedData.education?.map(e => `${e.title} - ${e.institution}`).join(', ') || 'No especificada'}
Habilidades: ${parsedData.skills?.join(', ') || 'No especificadas'}

Devuelve SOLO el texto del resumen, sin título ni explicación. Debe ser profesional, destacar fortalezas y ser adecuado para España.`;
    } else {
      systemPrompt = `Eres un experto en RRHH. Mejoras descripciones de experiencia laboral usando verbos de acción, logros cuantificables y formato profesional. ${langPrompt} Máximo 4-5 puntos con viñeta. Empieza cada punto con un verbo de acción. Sin emojis.`;
      userPrompt = `Mejora esta descripción de experiencia laboral:

Puesto: ${parsedData.experiences?.[0]?.position || ''}
Empresa: ${parsedData.experiences?.[0]?.company || ''}
Descripción actual: ${parsedData.experiences?.[0]?.description || '(vacía)'}

Reescribe en formato de viñetas (•) con logros concretos y verbos de acción. Devuelve SOLO el texto mejorado, sin título ni explicación.`;
    }

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      thinking: { type: 'disabled' },
    });

    const text = completion.choices[0]?.message?.content?.trim() || '';

    return NextResponse.json({ text, ok: true });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      console.warn('CV generation: invalid payload', { errors: error.flatten() });
      return NextResponse.json(
        { ok: false, error: 'Invalid request payload' },
        { status: 400 }
      );
    }
    
    console.error('CV generation error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to generate content. Please try again.' },
      { status: 500 }
    );
  }
}