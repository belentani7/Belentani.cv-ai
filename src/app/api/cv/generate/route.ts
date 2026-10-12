import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { cvRequestSchema, readAIRequest, requireAIText, aiErrorResponse } from '../../../../lib/ai-request';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await readAIRequest(req, cvRequestSchema);
    const lang = body.language || 'es';

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

    if (body.field === 'summary') {
      systemPrompt = `Eres un experto en recursos humanos y orientación laboral. Escribes resúmenes profesionales de CV persuasivos, honestos y optimizados para ATS. ${langPrompt} Máximo 3-4 frases (60-90 palabras). No uses la primera persona "yo", usa tercera persona o infinitivo. Sin emojis.`;
      userPrompt = `Genera un resumen profesional de CV para esta persona:

Nombre: ${body.fullName || 'No especificado'}
Profesión: ${body.profession || 'No especificada'}
Experiencia: ${body.experiences?.map(e => `${e.position} en ${e.company}`).join(', ') || 'Sin experiencia especificada'}
Educación: ${body.education?.map(e => `${e.title} - ${e.institution}`).join(', ') || 'No especificada'}
Habilidades: ${body.skills?.join(', ') || 'No especificadas'}

Devuelve SOLO el texto del resumen, sin título ni explicación. Debe ser profesional, destacar fortalezas y ser adecuado para España.`;
    } else {
      systemPrompt = `Eres un experto en RRHH. Mejoras descripciones de experiencia laboral usando verbos de acción, logros cuantificables y formato profesional. ${langPrompt} Máximo 4-5 puntos con viñeta. Empieza cada punto con un verbo de acción. Sin emojis.`;
      userPrompt = `Mejora esta descripción de experiencia laboral:

Puesto: ${body.experiences?.[0]?.position || ''}
Empresa: ${body.experiences?.[0]?.company || ''}
Descripción actual: ${body.experiences?.[0]?.description || '(vacía)'}

Reescribe en formato de viñetas (•) con logros concretos y verbos de acción. Devuelve SOLO el texto mejorado, sin título ni explicación.`;
    }

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      thinking: { type: 'disabled' },
    });

    const text = requireAIText(completion.choices?.[0]?.message?.content);

    return NextResponse.json({ text, ok: true });
  } catch (error: unknown) {
    return aiErrorResponse(error);
  }
}
