'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 shadow-lg shadow-primary/5">
        <span className="material-symbols-outlined text-4xl">travel_explore</span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
        Page introuvable
      </h1>
      <p className="text-on-surface-variant max-w-md mb-8 text-sm sm:text-base">
        L'adresse que vous avez saisie ne correspond à aucune page existante ou le lien a été déplacé.
      </p>
      <div className="flex flex-wrap gap-4 items-center justify-center">
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-primary hover:bg-primary-hover text-on-primary rounded-xl font-semibold text-sm transition-all shadow-md shadow-primary/20 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">dashboard</span>
          <span>Tableau de bord</span>
        </Link>
        <Link
          href="/"
          className="px-6 py-3 bg-surface hover:bg-surface-container border border-border-base text-on-surface rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          <span>Accueil</span>
        </Link>
      </div>
    </div>
  );
}
