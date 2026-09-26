import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const flow = searchParams.get('flow'); // 'login' or 'signup'
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const user = data.user;

      // Determine the redirect base URL
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      const baseUrl = isLocalEnv
        ? origin
        : forwardedHost
          ? `https://${forwardedHost}`
          : origin;

      // Check if this is a LOGIN flow and the user was JUST created (new account)
      // A user is considered "just created" if their account was created within the last 60 seconds
      if (flow === 'login') {
        const createdAt = new Date(user.created_at).getTime();
        const now = Date.now();
        const isNewUser = (now - createdAt) < 60_000; // 60 seconds

        if (isNewUser) {
          // This user didn't have an account — they tried to LOGIN but got auto-created
          // Sign them out and redirect to login with an error
          await supabase.auth.signOut();
          return NextResponse.redirect(
            `${baseUrl}/login?error=no_account`
          );
        }
      }

      // For signup flow or existing user login — proceed normally
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
