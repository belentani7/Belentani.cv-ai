import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Readiness is intentionally separate from liveness.
 * A deployment must not receive traffic if its database is unavailable.
 * Never expose credentials, connection strings, or raw driver errors.
 */
export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { status: 'not_ready', checks: { database: 'not_configured' } },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    await Promise.race([
      db.$queryRaw`SELECT 1`,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('database readiness timeout')), 3000),
      ),
    ]);

    return NextResponse.json(
      { status: 'ready', checks: { database: 'ok' } },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json(
      { status: 'not_ready', checks: { database: 'unavailable' } },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
