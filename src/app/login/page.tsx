'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { getTranslation } from '@/i18n/translations';
import { createClient } from '@/lib/supabase/client';
import { AuthShowcase, AuthBrand } from '@/components/AuthShowcase';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggleTheme, showToast } = useStore();
  const supabase = createClient();

  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gestpro_lang');
      if (saved === 'en' || saved === 'fr') setLang(saved);
    }
  }, []);

  // Show error toast if redirected from callback with an error
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'no_account') {
      showToast(
        lang === 'en'
          ? 'No account found with this Google email. Please sign up first.'
          : "Aucun compte trouvé avec cet email Google. Veuillez d'abord créer un compte.",
        'error'
      );
      // Clean up the URL
      router.replace('/login');
    } else if (error === 'auth-code-error') {
      showToast(
        lang === 'en'
          ? 'Authentication error. Please try again.'
          : "Erreur d'authentification. Veuillez réessayer.",
        'error'
      );
      router.replace('/login');
    }
  }, [searchParams]);

  const t = (text: string) => getTranslation(text, lang);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast(lang === 'en' ? 'Please fill in all fields' : 'Veuillez remplir tous les champs', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        showToast(error.message, 'error');
        setIsLoading(false);
        return;
      }

      if (data.user) {
        const fullName = data.user.user_metadata?.full_name || '';
        const companyName = data.user.user_metadata?.company_name || '';
        if (typeof window !== 'undefined') {
          localStorage.removeItem('gestpro_clients_v1');
          localStorage.removeItem('gestpro_commandes_v1');
          localStorage.removeItem('gestpro_factures_v1');
          localStorage.removeItem('gestpro_paiements_v1');
          localStorage.removeItem('gestpro_produits_v1');
          if (fullName) localStorage.setItem('gestpro_user_name', fullName);
          else localStorage.removeItem('gestpro_user_name');
          if (companyName) localStorage.setItem('gestpro_company_name', companyName);
          else localStorage.removeItem('gestpro_company_name');
          if (data.user.email) localStorage.setItem('gestpro_user_email', data.user.email);
        }
      }

      showToast(lang === 'en' ? 'Welcome back!' : 'Connexion réussie !', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la connexion', 'error');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback?flow=login`,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });
      if (error) {
        if (error.message.includes('not enabled') || error.message.includes('Unsupported provider') || error.message.includes('disabled')) {
          showToast(
            lang === 'en'
              ? 'Google Sign-In is not enabled in your Supabase dashboard (Authentication > Providers > Google).'
              : "Le fournisseur Google n'est pas encore activé dans votre console Supabase (Authentication > Providers > Google). Veuillez vous connecter avec Email et Mot de passe.",
            'error'
          );
        } else {
          showToast(error.message, 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la connexion Google', 'error');
    }
  };

  const inputWrap =
    'relative flex items-center bg-input-bg rounded-lg border border-border-base transition-colors hover:border-outline focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15';
  const inputIcon = 'material-symbols-outlined absolute left-3.5 text-text-secondary text-[18px] pointer-events-none';
  const inputCls =
    'w-full h-11 bg-transparent pl-10 pr-4 text-sm text-on-surface placeholder:text-text-secondary/60 focus:outline-none';
  const labelCls = 'text-sm font-medium text-on-surface';

  return (
    <main className="min-h-screen flex bg-background text-on-surface transition-colors duration-200">
      <AuthShowcase lang={lang} variant="login" />

      <section className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 sm:px-8 lg:px-12 h-16 sm:h-20">
          <div className="lg:hidden">
            <AuthBrand lang={lang} />
          </div>
          <Link
            href="/"
            className="hidden lg:inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>{lang === 'en' ? 'Back to home' : "Retour à l'accueil"}</span>
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 pb-12">
          <div className="w-full max-w-[380px]">
            <header className="mb-8">
              <h2 className="text-[26px] font-semibold tracking-tight text-text-primary leading-tight">
                {t('Connexion')}
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                {lang === 'en' ? 'Sign in to your GestPro workspace.' : 'Accédez à votre espace GestPro.'}
              </p>
            </header>

            <button
              onClick={handleGoogleLogin}
              type="button"
              className="h-11 w-full rounded-lg bg-surface border border-border-base hover:bg-surface-container hover:border-outline text-on-surface font-medium text-sm transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>{t('Se connecter avec Google')}</span>
            </button>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-border-base" />
              <span className="text-xs text-text-secondary">
                {lang === 'en' ? 'or with your email' : 'ou avec votre e-mail'}
              </span>
              <div className="flex-1 h-px bg-border-base" />
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleLogin}>
              <div className="flex flex-col gap-2">
                <label className={labelCls} htmlFor="email">
                  {t('Adresse email')}
                </label>
                <div className={inputWrap}>
                  <span className={inputIcon}>mail</span>
                  <input
                    className={inputCls}
                    id="email"
                    placeholder="nom@entreprise.com"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className={labelCls} htmlFor="password">
                    {t('Mot de passe')}
                  </label>
                  <Link className="text-[13px] font-medium text-primary hover:text-primary-hover transition-colors" href="#">
                    {lang === 'en' ? 'Forgot password?' : 'Mot de passe oublié ?'}
                  </Link>
                </div>
                <div className={inputWrap}>
                  <span className={inputIcon}>lock</span>
                  <input
                    className={`${inputCls} pr-11`}
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="absolute right-2 w-8 h-8 rounded-md text-text-secondary hover:text-on-surface transition-colors flex items-center justify-center cursor-pointer"
                    type="button"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                disabled={isLoading}
                className="mt-1 h-11 w-full rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-on-primary font-semibold text-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
                type="submit"
              >
                {isLoading ? (lang === 'en' ? 'Signing in…' : 'Connexion en cours…') : t('Se connecter')}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-text-secondary">
              {lang === 'en' ? 'New to GestPro?' : 'Pas encore de compte ?'}
              <Link className="text-primary hover:text-primary-hover font-semibold transition-colors ml-1.5" href="/register">
                {t('Créer un compte')}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
