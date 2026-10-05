import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Keep-alive endpoint called daily by a Vercel Cron job (see vercel.json).
 * It sends a tiny read request to Supabase so the free-tier project is never
 * paused for inactivity (Supabase pauses projects after ~7 days without activity).
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ ok: false, error: 'Missing Supabase env vars' }, { status: 500 });
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/profiles?select=id&limit=1`, {
      method: 'GET',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      pingedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Ping failed', pingedAt: new Date().toISOString() },
      { status: 502 }
    );
  }
}
