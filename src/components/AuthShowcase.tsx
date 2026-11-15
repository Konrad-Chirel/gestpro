import Link from 'next/link';

type Lang = 'fr' | 'en';

/** Brand mark shared with the landing page header ("GP" tile + wordmark). */
export function AuthBrand({ lang }: { lang: Lang }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3 group" aria-label="GestPro">
      <span className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
        GP
      </span>
      <span className="flex flex-col">
        <span className="font-bold text-base tracking-tight text-text-primary leading-none">GestPro</span>
        <span className="text-[11px] text-text-secondary font-medium mt-1">
          {lang === 'en' ? 'Sales ERP & invoicing' : 'ERP commercial & facturation'}
        </span>
      </span>
    </Link>
  );
}

/**
 * Left-hand panel of the auth screens. Instead of a logo on a glow, it shows
 * what the product actually does: one invoice and the life of its payment.
 */
export function AuthShowcase({ lang, variant }: { lang: Lang; variant: 'login' | 'register' }) {
  const en = lang === 'en';

  const timeline = [
    {
      date: '26/08',
      label: en ? 'Invoice sent to Sogea SARL' : 'Facture envoyée à Sogea SARL',
      amount: null as string | null,
      dot: 'bg-on-surface-variant/50',
    },
    {
      date: '12/09',
      label: en ? 'Deposit received by bank transfer' : 'Acompte reçu par virement',
      amount: '+ 2 000,00 €',
      dot: 'bg-success',
    },
    {
      date: '25/09',
      label: en ? 'Balance due' : 'Solde à encaisser',
      amount: '1 240,00 €',
      dot: 'bg-warning',
    },
  ];

  const headline =
    variant === 'login'
      ? en
        ? 'Every invoice, and where its payment stands.'
        : 'Chaque facture, et où en est son paiement.'
      : en
        ? 'Set up your workspace in two minutes.'
        : 'Votre espace de gestion prêt en deux minutes.';

  const support =
    variant === 'login'
      ? en
        ? 'Orders, invoices, payments and clients, kept in sync.'
        : 'Commandes, factures, encaissements et clients, toujours synchronisés.'
      : en
        ? 'Add your clients and products, then issue your first invoice.'
        : 'Ajoutez vos clients et vos produits, puis émettez votre première facture.';

  return (
    <aside className="hidden lg:flex lg:w-[46%] xl:w-1/2 flex-col justify-between bg-surface-container-low border-r border-border-base px-12 xl:px-16 py-10">
      <AuthBrand lang={lang} />

      <div className="flex flex-col gap-10 max-w-[440px]">
        {/* Product vignette */}
        <div className="rounded-2xl border border-border-base bg-surface shadow-xl shadow-black/5 overflow-hidden">
          <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary tabular-nums">FAC-2026-0039</p>
              <p className="text-[13px] text-text-secondary mt-0.5">
                Sogea SARL, {en ? 'due' : 'échéance'} 25/09/2026
              </p>
            </div>
            <span className="shrink-0 px-2.5 py-1 rounded-full bg-warning/15 text-warning border border-warning/25 text-xs font-semibold">
              {en ? 'Partially paid' : 'Partiellement payée'}
            </span>
          </div>

          <div className="px-6 pb-5">
            <p className="text-[28px] font-bold tracking-tight text-text-primary tabular-nums leading-none">
              3 240,00 €
            </p>
            <div className="mt-4 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
              <div className="h-full w-[62%] rounded-full bg-primary" />
            </div>
            <div className="mt-2 flex justify-between text-xs text-text-secondary tabular-nums">
              <span>{en ? 'Collected' : 'Encaissé'} 2 000,00 €</span>
              <span>62 %</span>
            </div>
          </div>

          <ol className="border-t border-border-base px-6 py-4 flex flex-col gap-3">
            {timeline.map((step) => (
              <li key={step.date} className="flex items-center gap-3 text-[13px]">
                <span className={`w-2 h-2 rounded-full shrink-0 ${step.dot}`} />
                <span className="w-11 shrink-0 text-text-secondary tabular-nums">{step.date}</span>
                <span className="flex-1 min-w-0 truncate text-on-surface">{step.label}</span>
                {step.amount && (
                  <span className="shrink-0 font-semibold text-text-primary tabular-nums">{step.amount}</span>
                )}
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h1 className="text-[30px] xl:text-[34px] font-semibold tracking-tight leading-[1.15] text-text-primary">
            {headline}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">{support}</p>
        </div>
      </div>

      <p className="text-xs text-text-secondary">© 2026 GestPro</p>
    </aside>
  );
}
