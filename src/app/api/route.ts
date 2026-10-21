import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      service: 'Belentani CV Studio',
      status: 'operational',
      capabilities: ['cv-editor', 'cover-letter-builder'],
      aiGenerationConfigured: Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN),
    },
    { headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } },
  );
}
