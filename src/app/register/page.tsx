'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { getTranslation } from '@/i18n/translations';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const { theme, toggleTheme, showToast } = useStore();
  const supabase = createClient();

  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  
  const [nom, setNom] = useState('');
  const [entreprise, setEntreprise] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gestpro_lang');
      if (saved === 'en' || saved === 'fr') setLang(saved);
    }
  }, []);

  const t = (text: string) => getTranslation(text, lang);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      showToast(lang === 'en' ? 'Please accept the terms of service.' : 'Veuillez accepter les conditions d’utilisation.', 'error');
      return;
    }
    if (!email || !password || !nom) {
      showToast(lang === 'en' ? 'Please fill in all required fields' : 'Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const trimmedNom = nom.trim();
      const trimmedCompany = entreprise.trim() || 'GestPro S.A.S';
      const trimmedEmail = email.trim();

      if (typeof window !== 'undefined') {
        localStorage.setItem('gestpro_user_name', trimmedNom);
        localStorage.setItem('gestpro_company_name', trimmedCompany);
        localStorage.setItem('gestpro_user_email', trimmedEmail);
      }

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: password,
        options: {
          data: {
            full_name: trimmedNom,
            company_name: trimmedCompany,
          },
        },
      });

      if (error) {
        showToast(error.message, 'error');
        setIsSubmitting(false);
        return;
      }

      // If session was not immediately granted (e.g. email confirmation setting), attempt auto-login
      if (!data.session) {
        try {
          await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password: password,
          });
        } catch {
          // ignore
        }
      }

      showToast(
        lang === 'en' 
          ? 'Account created! Welcome to GestPro.' 
          : 'Compte créé avec succès ! Bienvenue sur GestPro.', 
        'success'
      );
      router.push('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Une erreur est survenue lors de l’inscription', 'error');
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    showToast(
      lang === 'en'
        ? 'Google Sign-In is not enabled in your Supabase dashboard yet. Please register with Email & Password.'
        : "La connexion Google n'est pas encore activée dans votre console Supabase. Veuillez vous inscrire avec Email et Mot de passe.",
      'info'
    );
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-background font-body-md text-on-surface transition-colors duration-200 p-4 sm:p-6 lg:p-8">
      {/* Top Bar with Back Arrow and Theme Switcher */}
      <div className="flex items-center justify-between w-full max-w-[1280px] mx-auto mb-4 sm:mb-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-xs sm:text-sm font-semibold py-2 px-3.5 rounded-full bg-surface border border-border-base shadow-sm group cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
            arrow_back
          </span>
          <span>{lang === 'en' ? 'Back to login' : 'Retour à la connexion'}</span>
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
          {/* LEFT COLUMN: Branding & Benefits */}
          <div className="relative flex flex-col justify-center items-center p-6 sm:p-10 lg:p-20 lg:w-1/2 overflow-hidden bg-surface-container-low border-b lg:border-b-0 lg:border-r border-border-base">
            {/* Radial Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,88,12,0.15)_0%,transparent_60%)] pointer-events-none"></div>
            
            {/* Logo & Pitch */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <img 
                alt="Logo GestPro" 
                className="w-16 h-16 sm:w-24 sm:h-24 lg:w-36 lg:h-36 rounded-2xl sm:rounded-[2rem] shadow-xl mb-3 sm:mb-6 object-contain" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCM6JLGmVhSMYt55BtetS883ocjr2mnODZfHbA9CzKQ0WAh10x_CwqLciLoi2hASgZnYYRnrTtKXxyDe2wNojF6XUqxFL8AIghoQZF1ucdxr8NO19nG86KFc1dGCqlYbN6Ccits7OMWQeIgWKamds0gyeeXjTC7Rj8MsGd0fLR4sAWYLLgY6j7jWNHo57T4o5bdcKDXnFHDhFilu23GUyVABL9UIYjHFa6RYLeLofnIRyg9xp3cMPt3" 
              />

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold mb-3">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                <span>{lang === 'en' ? '14-day free trial' : 'Essai gratuit 14 jours'}</span>
              </div>

              <h1 className="text-base sm:text-2xl lg:text-3xl font-bold text-on-surface max-w-md leading-snug px-2">
                {lang === 'en' 
                  ? 'Join thousands of businesses managing with GestPro'
                  : 'Rejoignez des milliers d’entreprises qui gèrent leur activité avec GestPro'}
              </h1>

              {/* Benefits list (desktop / tablet) */}
              <div className="hidden sm:flex flex-col gap-2.5 mt-6 text-left max-w-sm">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-on-surface">
                  <span className="material-symbols-outlined text-success text-[18px]">check_circle</span>
                  <span>{lang === 'en' ? 'Unlimited invoices and quotes' : 'Facturation et devis illimités'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-on-surface">
                  <span className="material-symbols-outlined text-success text-[18px]">check_circle</span>
                  <span>{lang === 'en' ? 'Real-time payment tracking' : 'Suivi des encaissements en temps réel'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-on-surface">
                  <span className="material-symbols-outlined text-success text-[18px]">check_circle</span>
                  <span>{lang === 'en' ? 'Clients CRM and multi-currency' : 'Gestion clients & multi-devises'}</span>
                </div>
              </div>

              {/* Decorative indicator dots */}
              <div className="mt-4 sm:mt-8 flex gap-2">
                <div className="w-8 sm:w-12 h-1.5 sm:h-2 rounded-full bg-primary"></div>
                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-surface-container-high"></div>
                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-surface-container-high"></div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Register Form */}
          <div className="flex flex-col justify-center items-center p-6 sm:p-10 lg:p-16 lg:w-1/2 bg-surface z-20">
            <div className="w-full max-w-[420px]">
              {/* Header */}
              <div className="mb-6 sm:mb-8 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl lg:text-headline-lg font-bold text-on-surface mb-2">
                  {lang === 'en' ? 'Create an account' : 'Créer un compte'}
                </h2>
                <p className="text-xs sm:text-body-md text-text-secondary">
                  {lang === 'en' 
                    ? 'Start managing your orders and finances today'
                    : 'Commencez dès aujourd’hui à gérer vos finances simplement'}
                </p>
              </div>

              {/* Form */}
              <form className="flex flex-col gap-4" onSubmit={handleRegister}>
                {/* Nom complet */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs sm:text-label-md font-semibold text-on-surface" htmlFor="nom">
                    {lang === 'en' ? 'Full name' : 'Nom complet'}
                  </label>
                  <div className="relative flex items-center bg-input-bg rounded-xl shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/50 border border-border-base">
                    <span className="material-symbols-outlined absolute left-4 text-text-secondary text-[18px] sm:text-[20px]">
                      person
                    </span>
                    <input 
                      className="w-full h-11 sm:h-12 bg-transparent pl-11 sm:pl-12 pr-4 text-xs sm:text-body-md text-on-surface placeholder:text-text-secondary/50 focus:outline-none" 
                      id="nom" 
                      placeholder="Ex: Konrad Chirel" 
                      type="text" 
                      required
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                    />
                  </div>
                </div>

                {/* Nom entreprise */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs sm:text-label-md font-semibold text-on-surface" htmlFor="entreprise">
                    {lang === 'en' ? 'Company name' : 'Nom de l’entreprise'}
                  </label>
                  <div className="relative flex items-center bg-input-bg rounded-xl shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/50 border border-border-base">
                    <span className="material-symbols-outlined absolute left-4 text-text-secondary text-[18px] sm:text-[20px]">
                      business
                    </span>
                    <input 
                      className="w-full h-11 sm:h-12 bg-transparent pl-11 sm:pl-12 pr-4 text-xs sm:text-body-md text-on-surface placeholder:text-text-secondary/50 focus:outline-none" 
                      id="entreprise" 
                      placeholder="Ex: Chirel Solutions SARL" 
                      type="text" 
                      value={entreprise}
                      onChange={(e) => setEntreprise(e.target.value)}
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs sm:text-label-md font-semibold text-on-surface" htmlFor="reg-email">
                    {t('Adresse email')}
                  </label>
                  <div className="relative flex items-center bg-input-bg rounded-xl shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/50 border border-border-base">
                    <span className="material-symbols-outlined absolute left-4 text-text-secondary text-[18px] sm:text-[20px]">
                      mail
                    </span>
                    <input 
                      className="w-full h-11 sm:h-12 bg-transparent pl-11 sm:pl-12 pr-4 text-xs sm:text-body-md text-on-surface placeholder:text-text-secondary/50 focus:outline-none" 
                      id="reg-email" 
                      placeholder="contact@mon-entreprise.com" 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs sm:text-label-md font-semibold text-on-surface" htmlFor="reg-password">
                    {t('Mot de passe')}
                  </label>
                  <div className="relative flex items-center bg-input-bg rounded-xl shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/50 border border-border-base">
                    <span className="material-symbols-outlined absolute left-4 text-text-secondary text-[18px] sm:text-[20px]">
                      lock
                    </span>
                    <input 
                      className="w-full h-11 sm:h-12 bg-transparent pl-11 sm:pl-12 pr-11 sm:pr-12 text-xs sm:text-body-md text-on-surface placeholder:text-text-secondary/50 focus:outline-none" 
                      id="reg-password" 
                      placeholder="••••••••" 
                      type={showPassword ? 'text' : 'password'} 
                      required
                      minLength={6}
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

                {/* Terms agreement checkbox */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer shrink-0"
                  />
                  <label htmlFor="terms" className="text-[11px] sm:text-xs text-text-secondary leading-snug cursor-pointer select-none">
                    {lang === 'en' ? (
                      <>I accept the <span className="text-primary hover:underline">Terms of Service</span> and <span className="text-primary hover:underline">Privacy Policy</span>.</>
                    ) : (
                      <>J’accepte les <span className="text-primary hover:underline">Conditions Générales</span> et la <span className="text-primary hover:underline">Politique de Confidentialité</span>.</>
                    )}
                  </label>
                </div>

                {/* Main CTA */}
                <button 
                  disabled={isSubmitting}
                  className="mt-2 h-11 sm:h-12 w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-on-primary font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-95" 
                  type="submit"
                >
                  <span>{isSubmitting ? (lang === 'en' ? 'Creating account...' : 'Création en cours...') : (lang === 'en' ? 'Create my account' : 'Créer mon compte')}</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>

                {/* Separator */}
                <div className="flex items-center gap-4 my-1.5 sm:my-2">
                  <div className="flex-1 h-[1px] bg-border-base"></div>
                  <span className="text-[11px] sm:text-label-sm text-text-secondary uppercase">{t('ou')}</span>
                  <div className="flex-1 h-[1px] bg-border-base"></div>
                </div>

                {/* Google Sign up */}
                <button 
                  onClick={handleGoogleSignup}
                  className="h-11 sm:h-12 w-full bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-3 cursor-pointer border border-border-base active:scale-95" 
                  type="button"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  <span>{lang === 'en' ? 'Sign up with Google' : 'S’inscrire avec Google'}</span>
                </button>
              </form>

              {/* Footer */}
              <p className="mt-6 sm:mt-8 text-center text-xs sm:text-body-sm text-text-secondary">
                {lang === 'en' ? 'Already have an account?' : 'Vous avez déjà un compte ?'}{' '}
                <Link className="text-primary hover:text-primary-hover font-semibold transition-colors ml-1" href="/login">
                  {lang === 'en' ? 'Sign in' : 'Se connecter'}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
