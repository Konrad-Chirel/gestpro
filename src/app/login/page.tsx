'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTranslation } from '@/i18n/translations';

export default function LoginPage() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gestpro_lang');
      if (saved === 'en' || saved === 'fr') setLang(saved);
    }
  }, []);

  const t = (text: string) => getTranslation(text, lang);

  return (
    <main className="min-h-screen flex flex-col justify-center bg-background font-body-md text-on-surface transition-colors duration-200">
      <div className="flex flex-col w-full">
        <div className="flex flex-col lg:flex-row w-full max-w-[1280px] mx-auto rounded-[2rem] overflow-hidden bg-surface shadow-2xl border border-border-base">
          {/* LEFT COLUMN: Branding & Glow */}
          <div className="relative flex flex-col justify-center items-center p-12 lg:p-24 lg:w-1/2 overflow-hidden bg-surface-container-low">
            {/* Radial Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,88,12,0.15)_0%,transparent_60%)] pointer-events-none"></div>
            {/* Logo & Slogan */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <img alt="Logo GestPro" className="w-32 h-32 lg:w-48 lg:h-48 rounded-[2rem] shadow-xl mb-12" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCM6JLGmVhSMYt55BtetS883ocjr2mnODZfHbA9CzKQ0WAh10x_CwqLciLoi2hASgZnYYRnrTtKXxyDe2wNojF6XUqxFL8AIghoQZF1ucdxr8NO19nG86KFc1dGCqlYbN6Ccits7OMWQeIgWKamds0gyeeXjTC7Rj8MsGd0fLR4sAWYLLgY6j7jWNHo57T4o5bdcKDXnFHDhFilu23GUyVABL9UIYjHFa6RYLeLofnIRyg9xp3cMPt3" />
              <h1 className="font-display-lg text-display-lg text-on-surface max-w-lg">
                {t('Gérez vos commandes et factures en toute simplicité')}
              </h1>
              {/* Decorative structural element */}
              <div className="mt-16 flex gap-3">
                <div className="w-12 h-2 rounded-full bg-primary"></div>
                <div className="w-2 h-2 rounded-full bg-surface-container-high"></div>
                <div className="w-2 h-2 rounded-full bg-surface-container-high"></div>
              </div>
            </div>
          </div>
          {/* RIGHT COLUMN: Login Form */}
          <div className="flex flex-col justify-center items-center p-8 lg:p-20 lg:w-1/2 bg-surface z-20">
            <div className="w-full max-w-[400px]">
              {/* Header */}
              <div className="mb-10">
                <img alt="Logo GestPro Small" className="w-12 h-12 rounded-xl mb-6 shadow-md" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCM6JLGmVhSMYt55BtetS883ocjr2mnODZfHbA9CzKQ0WAh10x_CwqLciLoi2hASgZnYYRnrTtKXxyDe2wNojF6XUqxFL8AIghoQZF1ucdxr8NO19nG86KFc1dGCqlYbN6Ccits7OMWQeIgWKamds0gyeeXjTC7Rj8MsGd0fLR4sAWYLLgY6j7jWNHo57T4o5bdcKDXnFHDhFilu23GUyVABL9UIYjHFa6RYLeLofnIRyg9xp3cMPt3" />
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">{t('Connexion')}</h2>
                <p className="font-body-md text-body-md text-text-secondary">{t('Entrez vos identifiants pour accéder à votre espace')}</p>
              </div>
              {/* Form */}
              <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
                {/* Email Input */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="email">{t('Adresse email')}</label>
                  <div className="relative flex items-center bg-input-bg rounded-xl shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/50">
                    <span className="material-symbols-outlined absolute left-4 text-text-secondary text-[20px]">mail</span>
                    <input className="w-full h-12 bg-transparent pl-12 pr-4 font-body-md text-body-md text-on-surface placeholder:text-text-secondary/50 focus:outline-none" id="email" placeholder="nom@entreprise.com" type="email" />
                  </div>
                </div>
                {/* Password Input */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="font-label-md text-label-md text-on-surface" htmlFor="password">{t('Mot de passe')}</label>
                    <Link className="font-label-sm text-label-sm text-primary hover:text-primary-hover transition-colors" href="#">{t('Mot de passe oublié?')}</Link>
                  </div>
                  <div className="relative flex items-center bg-input-bg rounded-xl shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/50">
                    <span className="material-symbols-outlined absolute left-4 text-text-secondary text-[20px]">lock</span>
                    <input className="w-full h-12 bg-transparent pl-12 pr-12 font-body-md text-body-md text-on-surface placeholder:text-text-secondary/50 focus:outline-none" id="password" placeholder="••••••••" type="password" />
                    <button className="absolute right-4 text-text-secondary hover:text-on-surface transition-colors flex items-center justify-center" type="button">
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                  </div>
                </div>
                {/* Main CTA */}
                <button className="mt-4 h-12 w-full bg-primary hover:bg-primary-hover text-on-primary font-label-md text-label-md rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group" type="submit">
                  {t('Se connecter')}
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
                {/* Separator */}
                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 h-[1px] bg-surface-container-high"></div>
                  <span className="font-label-sm text-label-sm text-text-secondary uppercase">{t('ou')}</span>
                  <div className="flex-1 h-[1px] bg-surface-container-high"></div>
                </div>
                {/* Google Login */}
                <button className="h-12 w-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md rounded-xl transition-colors flex items-center justify-center gap-3 cursor-pointer" type="button">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  {t('Se connecter avec Google')}
                </button>
              </form>
              {/* Footer */}
              <p className="mt-8 text-center font-body-sm text-body-sm text-text-secondary">
                {t('Pas encore de compte?')} 
                <Link className="text-primary hover:text-primary-hover font-label-md transition-colors ml-1" href="#">{t('Créer un compte')}</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
