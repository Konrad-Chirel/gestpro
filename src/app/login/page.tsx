'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { getTranslation } from '@/i18n/translations';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
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
          if (fullName) localStorage.setItem('gestpro_user_name', fullName);
          if (companyName) localStorage.setItem('gestpro_company_name', companyName);
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
    showToast(
      lang === 'en'
        ? 'Google Sign-In is not enabled in your Supabase dashboard yet. Please log in with Email & Password.'
        : "La connexion Google n'est pas encore activée dans votre console Supabase. Veuillez vous connecter avec Email et Mot de passe.",
      'info'
    );
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-background font-body-md text-on-surface transition-colors duration-200 p-4 sm:p-6 lg:p-8">
      {/* Top Bar with Back Arrow and Theme Switcher */}
      <div className="flex items-center justify-between w-full max-w-[1280px] mx-auto mb-4 sm:mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-xs sm:text-sm font-semibold py-2 px-3.5 rounded-full bg-surface border border-border-base shadow-sm group cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
            arrow_back
          </span>
          <span>{lang === 'en' ? 'Back to home' : "Retour à l'accueil"}</span>
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary bg-surface border border-border-base transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </div>

      <div className="flex flex-col w-full max-w-[1280px] mx-auto">
        <div className="flex flex-col lg:flex-row w-full rounded-2xl sm:rounded-[2rem] overflow-hidden bg-surface shadow-2xl border border-border-base">
          {/* LEFT COLUMN: Branding & Glow */}
          <div className="relative flex flex-col justify-center items-center p-6 sm:p-10 lg:p-20 lg:w-1/2 overflow-hidden bg-surface-container-low border-b lg:border-b-0 lg:border-r border-border-base">
            {/* Radial Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,88,12,0.15)_0%,transparent_60%)] pointer-events-none"></div>
            
            {/* Logo & Slogan */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <img 
                alt="Logo GestPro" 
                className="w-16 h-16 sm:w-24 sm:h-24 lg:w-36 lg:h-36 rounded-2xl sm:rounded-[2rem] shadow-xl mb-3 sm:mb-6 object-contain" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCM6JLGmVhSMYt55BtetS883ocjr2mnODZfHbA9CzKQ0WAh10x_CwqLciLoi2hASgZnYYRnrTtKXxyDe2wNojF6XUqxFL8AIghoQZF1ucdxr8NO19nG86KFc1dGCqlYbN6Ccits7OMWQeIgWKamds0gyeeXjTC7Rj8MsGd0fLR4sAWYLLgY6j7jWNHo57T4o5bdcKDXnFHDhFilu23GUyVABL9UIYjHFa6RYLeLofnIRyg9xp3cMPt3" 
              />
              <h1 className="text-base sm:text-2xl lg:text-3xl font-bold text-on-surface max-w-md leading-snug px-2">
                {t('Gérez vos commandes et factures en toute simplicité')}
              </h1>
              
              {/* Decorative indicator dots */}
              <div className="mt-3 sm:mt-6 flex gap-2">
                <div className="w-8 sm:w-12 h-1.5 sm:h-2 rounded-full bg-primary"></div>
                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-surface-container-high"></div>
                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-surface-container-high"></div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Login Form */}
          <div className="flex flex-col justify-center items-center p-6 sm:p-10 lg:p-20 lg:w-1/2 bg-surface z-20">
            <div className="w-full max-w-[400px]">
              {/* Header */}
              <div className="mb-6 sm:mb-8 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl lg:text-headline-lg font-bold text-on-surface mb-2">
                  {t('Connexion')}
                </h2>
                <p className="text-xs sm:text-body-md text-text-secondary">
                  {t('Entrez vos identifiants pour accéder à votre espace')}
                </p>
              </div>

              {/* Form */}
              <form className="flex flex-col gap-4 sm:gap-5" onSubmit={handleLogin}>
                {/* Email Input */}
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  <label className="text-xs sm:text-label-md font-semibold text-on-surface" htmlFor="email">
                    {t('Adresse email')}
                  </label>
                  <div className="relative flex items-center bg-input-bg rounded-xl shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/50 border border-border-base">
                    <span className="material-symbols-outlined absolute left-4 text-text-secondary text-[18px] sm:text-[20px]">
                      mail
                    </span>
                    <input 
                      className="w-full h-11 sm:h-12 bg-transparent pl-11 sm:pl-12 pr-4 text-xs sm:text-body-md text-on-surface placeholder:text-text-secondary/50 focus:outline-none" 
                      id="email" 
                      placeholder="nom@entreprise.com" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs sm:text-label-md font-semibold text-on-surface" htmlFor="password">
                      {t('Mot de passe')}
                    </label>
                    <Link className="text-[11px] sm:text-label-sm text-primary hover:text-primary-hover transition-colors" href="#">
                      {t('Mot de passe oublié?')}
                    </Link>
                  </div>
                  <div className="relative flex items-center bg-input-bg rounded-xl shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/50 border border-border-base">
                    <span className="material-symbols-outlined absolute left-4 text-text-secondary text-[18px] sm:text-[20px]">
                      lock
                    </span>
                    <input 
                      className="w-full h-11 sm:h-12 bg-transparent pl-11 sm:pl-12 pr-11 sm:pr-12 text-xs sm:text-body-md text-on-surface placeholder:text-text-secondary/50 focus:outline-none" 
                      id="password" 
                      placeholder="••••••••" 
                      type={showPassword ? 'text' : 'password'} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                      className="absolute right-4 text-text-secondary hover:text-on-surface transition-colors flex items-center justify-center cursor-pointer" 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined text-[18px] sm:text-[20px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Main CTA */}
                <button 
                  disabled={isLoading}
                  className="mt-2 sm:mt-4 h-11 sm:h-12 w-full bg-primary hover:bg-primary-hover disabled:opacity-60 text-on-primary font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-95" 
                  type="submit"
                >
                  <span>{isLoading ? (lang === 'en' ? 'Signing in...' : 'Connexion en cours...') : t('Se connecter')}</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>

                {/* Separator */}
                <div className="flex items-center gap-4 my-2 sm:my-3">
                  <div className="flex-1 h-[1px] bg-border-base"></div>
                  <span className="text-[11px] sm:text-label-sm text-text-secondary uppercase">{t('ou')}</span>
                  <div className="flex-1 h-[1px] bg-border-base"></div>
                </div>

                {/* Google Login */}
                <button 
                  onClick={handleGoogleLogin}
                  className="h-11 sm:h-12 w-full bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-3 cursor-pointer border border-border-base active:scale-95" 
                  type="button"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  <span>{t('Se connecter avec Google')}</span>
                </button>
              </form>

              {/* Footer */}
              <p className="mt-6 sm:mt-8 text-center text-xs sm:text-body-sm text-text-secondary">
                {t('Pas encore de compte?')} 
                <Link className="text-primary hover:text-primary-hover font-semibold transition-colors ml-1 cursor-pointer" href="/register">
                  {t('Créer un compte')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
