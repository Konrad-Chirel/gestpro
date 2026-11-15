import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function sanitizeRedirectPath(target: string | null, fallback = '/dashboard'): string {
  if (!target) return fallback;
  const trimmed = target.trim();
  if (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('//') &&
    !trimmed.startsWith('/\\') &&
    !trimmed.includes('@') &&
    !trimmed.includes('\\') &&
    !trimmed.includes(':') &&
    !/[\r\n]/.test(trimmed)
  ) {
    return trimmed;
  }
  return fallback;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const flow = searchParams.get('flow');
  const safeNext = sanitizeRedirectPath(searchParams.get('next'), '/dashboard');

  // Never trust unvalidated X-Forwarded-Host headers to prevent Host Header Poisoning
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const user = data.user;

      if (flow === 'login') {
        const createdAt = new Date(user.created_at).getTime();
        const isNewUser = Date.now() - createdAt < 60_000;
        if (isNewUser) {
          await supabase.auth.signOut();
          return NextResponse.redirect(`${baseUrl}/login?error=no_account`);
        }
      }

      return NextResponse.redirect(`${baseUrl}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${baseUrl}/login?error=auth-code-error`);
}
