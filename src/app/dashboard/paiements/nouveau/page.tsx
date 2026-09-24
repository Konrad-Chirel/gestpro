'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';

export default function EnregistrerPaiementPage() {
  const router = useRouter();
  const { factures, addPaiement, formatCurrency, convertPrice, toBasePrice, currencySymbol, currencyCode, t } = useStore();

  // Sort: invoices with remaining balance first
  const availableFactures = useMemo(() => {
    if (!factures || factures.length === 0) return [];
    return [...factures].sort((a, b) => (b.resteDu || 0) - (a.resteDu || 0));
  }, [factures]);

  const [selectedFactureId, setSelectedFactureId] = useState<string>('');
  const [montant, setMontant] = useState<string>('');
  const [datePaiement, setDatePaiement] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [methode, setMethode] = useState<string>('virement');
  const [reference, setReference] = useState<string>(() => `PAY-${Date.now().toString().slice(-6)}`);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Initialize selected invoice from URL or first unpaid invoice
  useEffect(() => {
    if (availableFactures.length === 0) return;

    let targetId = '';
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qId = params.get('factureId') || params.get('id');
      if (qId && availableFactures.some((f) => f.id === qId || f.numero === qId)) {
        targetId = availableFactures.find((f) => f.id === qId || f.numero === qId)!.id;
      }
    }

    if (!targetId) {
      const unpaid = availableFactures.find((f) => (f.resteDu || 0) > 0);
      targetId = unpaid ? unpaid.id : availableFactures[0].id;
    }

    setSelectedFactureId((prev) => prev || targetId);
  }, [availableFactures]);

  const currentFacture =
    availableFactures.find((f) => f.id === selectedFactureId || f.numero === selectedFactureId) ||
    availableFactures[0] ||
    null;

  // Set initial montant when currentFacture is resolved
  useEffect(() => {
    if (currentFacture && !montant) {
      const converted = convertPrice(currentFacture.resteDu || 0);
      setMontant(converted % 1 === 0 ? String(converted) : converted.toFixed(2));
    }
  }, [currentFacture, montant, convertPrice]);

  const numMontant = parseFloat(montant) || 0;
  const numMontantBase = toBasePrice(numMontant);
  const resteDuActuel = currentFacture?.resteDu ?? 0;
  const nouveauResteDu = Math.max(0, Number((resteDuActuel - numMontantBase).toFixed(2)));

  const handleFactureChange = (facId: string) => {
    setSelectedFactureId(facId);
    const fac = availableFactures.find((f) => f.id === facId || f.numero === facId);
    if (fac) {
      const converted = convertPrice(fac.resteDu || 0);
      setMontant(converted % 1 === 0 ? String(converted) : converted.toFixed(2));
    }
  };

  const handleQuickAmount = (pct: number) => {
    if (!currentFacture) return;
    const converted = convertPrice((currentFacture.resteDu || 0) * pct);
    setMontant(converted % 1 === 0 ? String(converted) : converted.toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFacture) return;
    const num = parseFloat(montant);
    if (isNaN(num) || num <= 0) return;

    setIsSubmitted(true);

    const methodeNormalized = (methode === 'cb' ? 'carte' : methode) as any;

    addPaiement({
      reference: reference.trim() || `PAY-${Date.now().toString().slice(-6)}`,
      factureId: currentFacture.id,
      factureNumero: currentFacture.numero || currentFacture.id,
      clientId: currentFacture.clientId,
      clientNom: currentFacture.clientNom,
      montant: numMontantBase,
      methode: methodeNormalized,
      date: datePaiement || new Date().toISOString().split('T')[0],
      statut: 'reussi',
      notes: notes.trim() || undefined,
    });

    setTimeout(() => {
      router.push('/dashboard/paiements');
    }, 800);
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto pb-20 px-4 sm:px-8 py-6 sm:py-8 flex flex-col gap-6 sm:gap-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-base pb-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/dashboard/paiements"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-surface hover:bg-surface-container-high border border-border-base text-on-surface hover:text-primary transition-colors shadow-sm shrink-0"
            title={t('Retour aux paiements')}
          >
            <span className="material-symbols-outlined text-[20px] sm:text-[22px]">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight m-0">
              {t('Enregistrer un paiement')}
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5 m-0">
              {t('Associez un encaissement à une facture client en attente')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-surface-container-high/60 px-3.5 py-1.5 rounded-xl border border-border-base w-fit">
          <span className="w-2 h-2 rounded-full bg-warning animate-pulse"></span>
          <span className="text-xs text-on-surface-variant font-medium">{t('Facture :')}</span>
          <span className="text-xs font-bold text-primary font-mono">{currentFacture?.numero || currentFacture?.id || '—'}</span>
        </div>
      </header>

      {/* Main Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Form Column (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          <div className="bg-surface rounded-xl p-5 sm:p-7 border border-border-base shadow-sm flex flex-col gap-6 relative">
            <div className="flex items-center gap-2 pb-4 border-b border-border-base">
              <span className="material-symbols-outlined text-primary text-[22px]">payments</span>
              <h2 className="text-base sm:text-lg font-semibold text-on-surface m-0">
                {t('Informations du règlement')}
              </h2>
            </div>

            {/* Facture Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                {t('Facture concernée')} <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedFactureId}
                  onChange={(e) => handleFactureChange(e.target.value)}
                  className="w-full h-12 bg-surface-container border border-border-base rounded-xl px-4 pr-10 text-sm font-medium text-on-surface focus:border-primary focus:outline-none appearance-none cursor-pointer transition-colors"
                  required
                >
                  {availableFactures.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.numero || f.id} — {f.clientNom} ({t('Reste :')} {formatCurrency(f.resteDu || 0)})
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Montant */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="amount">
                  {t('Montant à encaisser')} ({currencySymbol}) <span className="text-primary">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(1)}
                    className="text-[11px] px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors cursor-pointer"
                  >
                    {t('Totalité')} ({formatCurrency(currentFacture?.resteDu ?? 0)})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(0.5)}
                    className="text-[11px] px-2 py-0.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant font-medium transition-colors cursor-pointer"
                  >
                    50%
                  </button>
                </div>
              </div>

              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-[20px] pointer-events-none">
                  euro
                </span>
                <input
                  id="amount"
                  type="number"
                  step={currencyCode === 'XOF' ? '1' : '0.01'}
                  min="0.01"
                  max={currentFacture ? convertPrice((currentFacture.resteDu || 0) * 2) : undefined}
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  className="w-full h-12 bg-surface-container border border-border-base rounded-xl pl-12 pr-4 text-base font-bold text-on-surface focus:border-primary focus:outline-none transition-colors shadow-inner"
                  required
                />
              </div>
            </div>

            {/* Date & Mode de paiement */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Date */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="date">
                  {t('Date de paiement')} <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                    calendar_today
                  </span>
                  <input
                    id="date"
                    type="date"
                    value={datePaiement}
                    onChange={(e) => setDatePaiement(e.target.value)}
                    className="w-full h-12 bg-surface-container border border-border-base rounded-xl pl-11 pr-3 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors [color-scheme:dark]"
                    required
                  />
                </div>
              </div>

              {/* Méthode */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="method">
                  {t('Mode de règlement')} <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <select
                    id="method"
                    value={methode}
                    onChange={(e) => setMethode(e.target.value)}
                    className="w-full h-12 bg-surface-container border border-border-base rounded-xl px-4 pr-10 text-sm text-on-surface focus:border-primary focus:outline-none appearance-none cursor-pointer transition-colors font-medium"
                    required
                  >
                    <option value="virement">{t('Virement bancaire')}</option>
                    <option value="cb">{t('Carte bancaire')}</option>
                    <option value="cheque">{t('Chèque')}</option>
                    <option value="especes">{t('Espèces')}</option>
                    <option value="wave">{t('Wave')}</option>
                    <option value="orange_money">{t('Orange Money')}</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {/* Référence */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="reference">
                {t('Référence de transaction')} <span className="text-on-surface-variant/60 font-normal lowercase">{t('(optionnel)')}</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                  tag
                </span>
                <input
                  id="reference"
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder={t('Ex: VIR-99382-A ou ID Transaction...')}
                  className="w-full h-12 bg-surface-container border border-border-base rounded-xl pl-11 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors font-mono"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="notes">
                {t('Notes / Commentaire')} <span className="text-on-surface-variant/60 font-normal lowercase">{t('(optionnel)')}</span>
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('Ajouter une note interne concernant cet encaissement...')}
                className="w-full bg-surface-container border border-border-base rounded-xl p-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none resize-none transition-colors"
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-border-base flex flex-col sm:flex-row items-center justify-end gap-3">
              <Link
                href="/dashboard/paiements"
                className="w-full sm:w-auto h-11 px-6 flex items-center justify-center rounded-xl border border-border-base text-on-surface hover:bg-surface-container-high transition-colors text-sm font-medium"
              >
                {t('Annuler')}
              </Link>
              <button
                type="submit"
                disabled={isSubmitted}
                className="w-full sm:w-auto h-11 px-8 flex items-center justify-center gap-2 rounded-xl bg-primary text-on-primary hover:bg-primary-hover font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>{isSubmitted ? t('Paiement enregistré...') : t('Enregistrer le paiement')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Summary (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
          {/* Facture Summary Card */}
          <div className="bg-surface rounded-xl p-5 sm:p-6 border border-border-base shadow-md flex flex-col gap-5 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-border-base">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">description</span>
                <h3 className="text-base font-semibold text-on-surface m-0">{t('Aperçu Facture')}</h3>
              </div>
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                {currentFacture?.numero || currentFacture?.id || '—'}
              </span>
            </div>

            <div className="flex flex-col gap-3.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">{t('Client')}</span>
                <span className="font-semibold text-on-surface">{currentFacture?.clientNom || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">{t("Date d'émission")}</span>
                <span className="text-on-surface">{currentFacture?.dateEmission || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">{t('Montant Total TTC')}</span>
                <span className="font-semibold text-on-surface">
                  {formatCurrency(currentFacture?.totalTTC ?? 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">{t('Déjà réglé')}</span>
                <span className="font-semibold text-success">
                  {formatCurrency(currentFacture?.montantPaye ?? 0)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border-base">
                <span className="text-on-surface-variant font-medium">{t('Reste dû initial')}</span>
                <span className="font-bold text-error">
                  {formatCurrency(currentFacture?.resteDu ?? 0)}
                </span>
              </div>

              {/* Nouveau solde après paiement */}
              <div className="bg-surface-container/60 p-4 rounded-xl border border-border-base flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs text-on-surface-variant">
                  <span>{t('Paiement en cours')}</span>
                  <span className="font-bold text-primary">
                    - {formatCurrency(numMontantBase)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-border-base/60">
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                    {t('Reste dû final')}
                  </span>
                  <span className={`text-lg font-extrabold ${nouveauResteDu === 0 ? 'text-success' : 'text-primary'}`}>
                    {formatCurrency(nouveauResteDu)}
                  </span>
                </div>
                {nouveauResteDu === 0 && numMontant > 0 && (
                  <div className="mt-1 text-[11px] text-success flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    {t('Facture soldée en totalité')}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Security Info */}
            <div className="p-3.5 rounded-xl bg-surface-container/40 border border-border-base flex gap-2.5 items-start text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">verified_user</span>
              <p className="m-0 leading-relaxed">
                {t("Ce paiement sera instantanément comptabilisé dans les rapports financiers et l'historique du client.")}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
