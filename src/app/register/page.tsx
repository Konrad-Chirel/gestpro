'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { getTranslation } from '@/i18n/translations';
import { createClient } from '@/lib/supabase/client';
import { AuthShowcase, AuthBrand } from '@/components/AuthShowcase';

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

    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      showToast(
        lang === 'en'
          ? 'Password must be at least 8 characters and include a letter and a number.'
          : 'Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre.',
        'error'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const trimmedNom = nom.trim();
      const trimmedCompany = entreprise.trim() || 'GestPro S.A.S';
      const trimmedEmail = email.trim();

      if (typeof window !== 'undefined') {
        localStorage.removeItem('gestpro_clients_v1');
        localStorage.removeItem('gestpro_commandes_v1');
        localStorage.removeItem('gestpro_factures_v1');
        localStorage.removeItem('gestpro_paiements_v1');
        localStorage.removeItem('gestpro_produits_v1');
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

      if (data.user) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: trimmedEmail,
            full_name: trimmedNom,
            company_name: trimmedCompany,
          });
        } catch {
          // ignore
        }
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
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback?flow=signup`,
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
              : "Le fournisseur Google n'est pas encore activé dans votre console Supabase (Authentication > Providers > Google). Veuillez vous inscrire avec Email et Mot de passe.",
            'error'
          );
        } else {
          showToast(error.message, 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l’inscription Google', 'error');
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
      <AuthShowcase lang={lang} variant="register" />

      <section className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 sm:px-8 lg:px-12 h-16 sm:h-20">
          <div className="lg:hidden">
            <AuthBrand lang={lang} />
          </div>
          <Link
            href="/login"
            className="hidden lg:inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>{lang === 'en' ? 'Back to sign in' : 'Retour à la connexion'}</span>
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
          <div className="w-full max-w-[400px]">
            <header className="mb-8">
              <h2 className="text-[26px] font-semibold tracking-tight text-text-primary leading-tight">
                {lang === 'en' ? 'Create your account' : 'Créer votre compte'}
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                {lang === 'en'
                  ? 'Your company details appear on every invoice you issue.'
                  : 'Les informations de votre entreprise figureront sur vos factures.'}
              </p>
            </header>

            <button
              onClick={handleGoogleSignup}
              type="button"
              className="h-11 w-full rounded-lg bg-surface border border-border-base hover:bg-surface-container hover:border-outline text-on-surface font-medium text-sm transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>{lang === 'en' ? 'Sign up with Google' : 'S’inscrire avec Google'}</span>
            </button>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-border-base" />
              <span className="text-xs text-text-secondary">
                {lang === 'en' ? 'or with your email' : 'ou avec votre e-mail'}
              </span>
              <div className="flex-1 h-px bg-border-base" />
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleRegister}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-4">
                <div className="flex flex-col gap-2">
                  <label className={labelCls} htmlFor="nom">
                    {lang === 'en' ? 'Full name' : 'Nom complet'}
                  </label>
                  <div className={inputWrap}>
                    <span className={inputIcon}>person</span>
                    <input
                      className={inputCls}
                      id="nom"
                      placeholder="Amadou Diallo"
                      type="text"
                      autoComplete="name"
                      required
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className={labelCls} htmlFor="entreprise">
                    {lang === 'en' ? 'Company' : 'Entreprise'}
                  </label>
                  <div className={inputWrap}>
                    <span className={inputIcon}>business</span>
                    <input
                      className={inputCls}
                      id="entreprise"
                      placeholder="Chirel Solutions"
                      type="text"
                      autoComplete="organization"
                      value={entreprise}
                      onChange={(e) => setEntreprise(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelCls} htmlFor="reg-email">
                  {lang === 'en' ? 'Work email' : 'Adresse e-mail professionnelle'}
                </label>
                <div className={inputWrap}>
                  <span className={inputIcon}>mail</span>
                  <input
                    className={inputCls}
                    id="reg-email"
                    placeholder="contact@mon-entreprise.com"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelCls} htmlFor="reg-password">
                  {t('Mot de passe')}
                </label>
                <div className={inputWrap}>
                  <span className={inputIcon}>lock</span>
                  <input
                    className={`${inputCls} pr-11`}
                    id="reg-password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    aria-describedby="reg-password-hint"
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
                <p id="reg-password-hint" className="text-xs text-text-secondary">
                  {lang === 'en' ? 'At least 6 characters.' : '6 caractères minimum.'}
                </p>
              </div>

              <label htmlFor="terms" className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-primary cursor-pointer shrink-0"
                />
                <span className="text-[13px] text-text-secondary leading-snug">
                  {lang === 'en' ? (
                    <>I accept the <span className="text-on-surface font-medium hover:text-primary">Terms of Service</span> and the <span className="text-on-surface font-medium hover:text-primary">Privacy Policy</span>.</>
                  ) : (
                    <>J’accepte les <span className="text-on-surface font-medium hover:text-primary">conditions générales</span> et la <span className="text-on-surface font-medium hover:text-primary">politique de confidentialité</span>.</>
                  )}
                </span>
              </label>

              <button
                disabled={isSubmitting}
                className="h-11 w-full rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-on-primary font-semibold text-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
                type="submit"
              >
                {isSubmitting
                  ? lang === 'en' ? 'Creating your account…' : 'Création du compte…'
                  : lang === 'en' ? 'Create my account' : 'Créer mon compte'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-text-secondary">
              {lang === 'en' ? 'Already have an account?' : 'Déjà un compte ?'}
              <Link className="text-primary hover:text-primary-hover font-semibold transition-colors ml-1.5" href="/login">
                {lang === 'en' ? 'Sign in' : 'Se connecter'}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
