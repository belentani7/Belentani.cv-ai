import { NextResponse } from 'next/server';
import { AIConfigurationError, AIProviderError } from './ai-provider';

/** Error classification without publishing API credentials, prompts or provider messages. */
export function aiFailureResponse(error: unknown): NextResponse {
  if (error instanceof AIConfigurationError) {
    return NextResponse.json({ ok: false, error: 'La IA no está configurada. Puedes continuar sin ella.', text: '' }, { status: 503 });
  }
  if (error instanceof AIProviderError) {
    return NextResponse.json({ ok: false, error: 'La IA no pudo responder. Inténtalo más tarde.', text: '' }, { status: 502 });
  }
  return NextResponse.json({ ok: false, error: 'No se pudo generar contenido. Inténtalo de nuevo.', text: '' }, { status: 500 });
}
