'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-error/10 border border-error/20 flex items-center justify-center text-error mb-6">
        <span className="material-symbols-outlined text-4xl">error_outline</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
        Une erreur inattendue est survenue
      </h1>
      <p className="text-on-surface-variant max-w-md mb-8 text-sm sm:text-base">
        Nous n'avons pas pu charger cette page correctement. Vous pouvez réessayer ou revenir au tableau de bord.
      </p>
      <div className="flex flex-wrap gap-4 items-center justify-center">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-primary hover:bg-primary-hover text-on-primary rounded-xl font-semibold text-sm transition-all shadow-md shadow-primary/20 flex items-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          <span>Réessayer</span>
        </button>
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-surface hover:bg-surface-container border border-border-base text-on-surface rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">dashboard</span>
          <span>Tableau de bord</span>
        </Link>
      </div>
    </div>
  );
}
