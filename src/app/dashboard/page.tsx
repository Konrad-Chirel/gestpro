'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';

export default function Dashboard() {
  const { clients, commandes, factures, formatCurrency, t, user, userProfile } = useStore();

  const storedName = typeof window !== 'undefined' ? localStorage.getItem('gestpro_user_name') : null;
  const displayName =
    userProfile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    storedName ||
    'Konrad Chirel';
  const firstName = displayName ? displayName.trim().split(' ')[0] : '';
  const greeting = firstName ? `${t('dashboard.welcome')}, ${firstName}` : t('dashboard.welcome');

  const stats = useMemo(() => {
    // 1. Chiffre d'affaires : Total encaissé (montantPaye) sur toutes les factures
    const caTotal = factures.reduce((acc, f) => acc + (Number(f.montantPaye) || 0), 0);

    // 2. Commandes totales
    const commandesCount = commandes.length;

    // 3. Factures impayées (reste dû > 0 ou statut attente/retard)
    const facturesImpayees = factures.filter(
      (f) => f.statut === 'attente' || f.statut === 'retard' || (f.resteDu && f.resteDu > 0)
    );
    const facturesImpayeesCount = facturesImpayees.length;
    const totalResteDu = factures.reduce((acc, f) => acc + (Number(f.resteDu) || 0), 0);

    // 4. Clients actifs
    const clientsActifsCount = clients.filter((c) => c.statut === 'actif').length;

    // 5. Répartition des statuts de factures (Donut)
    const totalFac = factures.length;
    const payeesCount = factures.filter((f) => f.statut === 'payee').length;
    const attenteCount = factures.filter((f) => f.statut === 'attente').length;
    const retardCount = factures.filter((f) => f.statut === 'retard').length;

    const pctPaye = totalFac > 0 ? Math.round((payeesCount / totalFac) * 100) : 0;
    const pctAttente = totalFac > 0 ? Math.round((attenteCount / totalFac) * 100) : 0;
    const pctRetard = totalFac > 0 ? Math.max(0, 100 - pctPaye - pctAttente) : 0;

    // Circonférence cercle SVG (r=40) = 251.2
    const circ = 251.2;
    const retardDash = Number(((pctRetard / 100) * circ).toFixed(1));
    const attenteDash = Number(((pctAttente / 100) * circ).toFixed(1));
    const payeDash = Number(((pctPaye / 100) * circ).toFixed(1));

    const retardOffset = 0;
    const attenteOffset = -retardDash;
    const payeOffset = -(retardDash + attenteDash);

    // 4 dernières commandes et 4 dernières factures
    const recentOrders = [...commandes].slice(0, 4);
    const recentInvoices = [...factures].slice(0, 4);

    return {
      caTotal,
      commandesCount,
      facturesImpayeesCount,
      totalResteDu,
      clientsActifsCount,
      totalFac,
      pctPaye,
      pctAttente,
      pctRetard,
      retardDash,
      attenteDash,
      payeDash,
      retardOffset,
      attenteOffset,
      payeOffset,
      recentOrders,
      recentInvoices,
    };
  }, [clients, commandes, factures]);

  return (
    <div className="flex flex-col w-full gap-8 p-5 sm:p-7 md:p-8 lg:p-10 max-w-7xl mx-auto">
      {/* ── 1. HEADER SECTION (MATCH ONLINE) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-text-primary flex items-center gap-2.5">
            <span>{greeting}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 inline-block"></span>
          </h1>
          <p className="text-sm sm:text-base text-text-secondary">
            {t('dashboard.subtitle') || "Voici un aperçu de votre activité aujourd'hui."}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <Link
            href="/dashboard/commandes/nouveau"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border-base bg-surface hover:bg-surface-container text-text-primary text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Nouvelle commande</span>
          </Link>

          <Link
            href="/dashboard/factures/nouveau"
            className="inline-flex items-center gap-2 h-10 px-4 sm:px-5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs sm:text-sm font-bold transition-all shadow-sm shadow-primary/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>Émettre une facture</span>
          </Link>
        </div>
      </div>

      {/* ── 2. KPI CARDS (MATCH EXACT ONLINE DESIGN) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: Chiffre d'affaires */}
        <div className="bg-surface rounded-2xl p-5 sm:p-6 border border-border-base shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-xs sm:text-sm font-medium text-text-secondary">
              {t('dashboard.revenue')}
            </span>
            <span className="material-symbols-outlined text-emerald-500 text-[22px]">trending_up</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight tabular-nums">
              {formatCurrency(stats.caTotal, { showDecimals: false })}
            </span>
            <span className="text-xs text-emerald-500 font-medium pt-1">
              +12.5% {t('dashboard.vs_last_month')}
            </span>
          </div>
        </div>

        {/* KPI 2: Commandes */}
        <div className="bg-surface rounded-2xl p-5 sm:p-6 border border-border-base shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-xs sm:text-sm font-medium text-text-secondary">
              {t('dashboard.orders')}
            </span>
            <span className="material-symbols-outlined text-orange-400 text-[22px]">shopping_cart</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight tabular-nums">
              {stats.commandesCount}
            </span>
            <span className="text-xs text-text-secondary pt-1">
              Dossiers enregistrés dans l'ERP
            </span>
          </div>
        </div>

        {/* KPI 3: Factures impayées */}
        <div className="bg-surface rounded-2xl p-5 sm:p-6 border border-border-base shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-xs sm:text-sm font-medium text-text-secondary">
              {t('dashboard.unpaid')}
            </span>
            <span className="material-symbols-outlined text-amber-500 text-[22px]">schedule</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight tabular-nums">
              {stats.facturesImpayeesCount}
            </span>
            <span className="text-xs text-text-secondary pt-1 truncate">
              Solde restant dû : <strong className="font-bold text-text-primary">{formatCurrency(stats.totalResteDu, { showDecimals: false })}</strong>
            </span>
          </div>
        </div>

        {/* KPI 4: Clients actifs */}
        <div className="bg-surface rounded-2xl p-5 sm:p-6 border border-border-base shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-xs sm:text-sm font-medium text-text-secondary">
              {t('dashboard.active_clients')}
            </span>
            <span className="material-symbols-outlined text-sky-400 text-[22px]">group</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight tabular-nums">
              {stats.clientsActifsCount}
            </span>
            <span className="text-xs text-text-secondary pt-1">
              Comptes clients actifs
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. CHARTS SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-8 bg-surface rounded-2xl p-6 sm:p-7 border border-border-base shadow-sm flex flex-col justify-between gap-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight">
                {t('dashboard.revenue_6_months')}
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                Évolution semestrielle des encaissements certifiés
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-surface-container border border-border-base text-text-secondary">
              6 derniers mois
            </span>
          </div>

          <div className="relative min-h-[240px] h-60 w-full flex items-end justify-between pt-8 pb-4">
            {/* Horizontal Gridlines */}
            <div className="absolute inset-0 flex flex-col justify-between pb-8 pointer-events-none">
              <div className="w-full h-px bg-border-base/60" />
              <div className="w-full h-px bg-border-base/60" />
              <div className="w-full h-px bg-border-base/60" />
              <div className="w-full h-px bg-border-base/60" />
            </div>

            {/* Bars */}
            <div className="relative w-full h-full flex items-end justify-around z-10 pb-6">
              {[
                { label: t('month.mar'), height: '45%', value: '12k' },
                { label: t('month.apr'), height: '60%', value: '15k' },
                { label: t('month.may'), height: '55%', value: '14.2k' },
                { label: t('month.jun'), height: '75%', value: '18.9k' },
                { label: t('month.jul'), height: '85%', value: '22.5k' },
                {
                  label: t('month.aug'),
                  height: '95%',
                  value: formatCurrency(stats.caTotal, { compact: true }),
                  current: true,
                },
              ].map((bar, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-2 group relative cursor-pointer h-full justify-end flex-1"
                >
                  <div
                    style={{ height: bar.height }}
                    className={`w-8 sm:w-12 rounded-t-lg transition-colors duration-200 relative ${
                      bar.current
                        ? 'bg-primary shadow-sm'
                        : 'bg-surface-container-high hover:bg-primary/60'
                    }`}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface border border-border-base shadow-sm text-text-primary text-xs font-semibold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {bar.value}
                    </div>
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-semibold tabular-nums mt-1 ${
                      bar.current ? 'text-primary font-bold' : 'text-text-secondary'
                    }`}
                  >
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="lg:col-span-4 bg-surface rounded-2xl p-6 sm:p-7 border border-border-base shadow-sm flex flex-col justify-between gap-6">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight">
              {t('dashboard.payment_breakdown')}
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Répartition des statuts de facturation
            </p>
          </div>

          <div className="flex flex-col items-center justify-center relative my-auto py-2">
            <svg className="w-44 h-44 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                fill="transparent"
                r="40"
                stroke="currentColor"
                className="text-surface-container"
                strokeWidth="11"
              />
              <circle
                cx="50"
                cy="50"
                fill="transparent"
                r="40"
                stroke="#EF4444"
                strokeDasharray={`${stats.retardDash} 251.2`}
                strokeDashoffset={`${stats.retardOffset}`}
                strokeWidth="11"
              />
              <circle
                cx="50"
                cy="50"
                fill="transparent"
                r="40"
                stroke="#F59E0B"
                strokeDasharray={`${stats.attenteDash} 251.2`}
                strokeDashoffset={`${stats.attenteOffset}`}
                strokeWidth="11"
              />
              <circle
                cx="50"
                cy="50"
                fill="transparent"
                r="40"
                stroke="#10B981"
                strokeDasharray={`${stats.payeDash} 251.2`}
                strokeDashoffset={`${stats.payeOffset}`}
                strokeWidth="11"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl sm:text-4xl font-extrabold text-text-primary tabular-nums">
                {stats.pctPaye}%
              </span>
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider mt-0.5">
                {t('dashboard.paid')}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-border-base text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-text-secondary font-medium">{t('status.paid')}</span>
              </div>
              <span className="font-bold text-text-primary tabular-nums">{stats.pctPaye}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-text-secondary font-medium">{t('status.pending')}</span>
              </div>
              <span className="font-bold text-text-primary tabular-nums">{stats.pctAttente}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-text-secondary font-medium">{t('status.overdue')}</span>
              </div>
              <span className="font-bold text-text-primary tabular-nums">{stats.pctRetard}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. ACTIVITÉ RÉCENTE (SECTION FLUIDE, ALIGNÉE & MÉDAILLONS PRO) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commandes récentes */}
        <div className="bg-surface rounded-2xl p-6 sm:p-7 border border-border-base shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-border-base">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight">
                {t('dashboard.recent_orders')}
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                Dernières commandes enregistrées
              </p>
            </div>
            <Link
              href="/dashboard/commandes"
              className="text-xs sm:text-sm font-bold text-primary hover:text-primary-hover transition-colors flex items-center gap-1 shrink-0"
            >
              <span>{t('dashboard.view_all')}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="flex flex-col divide-y divide-border-base/50">
            {stats.recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-border-base bg-surface-container-low/40 my-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
                </div>
                <p className="text-sm font-semibold text-text-primary mb-1">
                  {t('dashboard.no_orders_yet') || 'Aucune commande pour le moment'}
                </p>
                <Link
                  href="/dashboard/commandes/nouveau"
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-hover transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>{t('dashboard.new_order') || 'Créer une commande'}</span>
                </Link>
              </div>
            ) : (
              stats.recentOrders.map((cmd) => (
                <Link
                  key={cmd.id}
                  href={`/dashboard/commandes/${cmd.id}`}
                  className="flex items-center justify-between py-3 px-2 sm:px-3 hover:bg-surface-container/60 rounded-xl transition-colors group cursor-pointer gap-3 sm:gap-4"
                >
                  {/* Médaillon circulaire + détails */}
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high border border-border-base/60 flex items-center justify-center text-text-secondary group-hover:bg-primary/15 group-hover:text-primary transition-colors shrink-0">
                      <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors shrink-0">
                          {cmd.numero}
                        </span>
                        {cmd.clientNom && (
                          <span className="text-xs sm:text-sm text-text-secondary truncate">
                            {cmd.clientNom}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-text-secondary mt-0.5">
                        {cmd.dateCreation}
                      </span>
                    </div>
                  </div>

                  {/* Montant + Statut */}
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <span className="text-sm sm:text-base font-bold text-text-primary whitespace-nowrap text-right tabular-nums min-w-[75px] sm:min-w-[95px]">
                      {formatCurrency(cmd.totalTTC || 0)}
                    </span>

                    <div className="w-24 sm:w-28 flex justify-end shrink-0">
                      {cmd.statut === 'livree' && (
                        <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full text-center whitespace-nowrap">
                          {t('status.delivered')}
                        </span>
                      )}
                      {cmd.statut === 'confirmee' && (
                        <span className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full text-center whitespace-nowrap">
                          {t('status.confirmed')}
                        </span>
                      )}
                      {cmd.statut === 'preparation' && (
                        <span className="bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/25 text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full text-center whitespace-nowrap">
                          {t('status.preparing')}
                        </span>
                      )}
                      {cmd.statut === 'attente' && (
                        <span className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full text-center whitespace-nowrap">
                          {t('status.pending')}
                        </span>
                      )}
                      {cmd.statut === 'annulee' && (
                        <span className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full text-center whitespace-nowrap">
                          {t('status.cancelled')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Factures récentes */}
        <div className="bg-surface rounded-2xl p-6 sm:p-7 border border-border-base shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-border-base">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight">
                {t('dashboard.recent_invoices')}
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                Dernières factures émises
              </p>
            </div>
            <Link
              href="/dashboard/factures"
              className="text-xs sm:text-sm font-bold text-primary hover:text-primary-hover transition-colors flex items-center gap-1 shrink-0"
            >
              <span>{t('dashboard.view_all')}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="flex flex-col divide-y divide-border-base/50">
            {stats.recentInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-border-base bg-surface-container-low/40 my-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                </div>
                <p className="text-sm font-semibold text-text-primary mb-1">
                  {t('dashboard.no_invoices_yet') || 'Aucune facture émise'}
                </p>
                <Link
                  href="/dashboard/factures/nouveau"
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-hover transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>{t('dashboard.create_invoice') || 'Créer une facture'}</span>
                </Link>
              </div>
            ) : (
              stats.recentInvoices.map((fac) => (
                <Link
                  key={fac.id}
                  href={`/dashboard/factures/${fac.id}`}
                  className="flex items-center justify-between py-3 px-2 sm:px-3 hover:bg-surface-container/60 rounded-xl transition-colors group cursor-pointer gap-3 sm:gap-4"
                >
                  {/* Médaillon circulaire + détails */}
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high border border-border-base/60 flex items-center justify-center text-text-secondary group-hover:bg-primary/15 group-hover:text-primary transition-colors shrink-0">
                      <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors shrink-0">
                          {fac.numero}
                        </span>
                        {fac.clientNom && (
                          <span className="text-xs sm:text-sm text-text-secondary truncate">
                            {fac.clientNom}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-text-secondary mt-0.5">
                        Échéance : {fac.dateEcheance || fac.dateEmission}
                      </span>
                    </div>
                  </div>

                  {/* Montant + Statut */}
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <span className="text-sm sm:text-base font-bold text-text-primary whitespace-nowrap text-right tabular-nums min-w-[75px] sm:min-w-[95px]">
                      {formatCurrency(fac.totalTTC || 0)}
                    </span>

                    <div className="w-24 sm:w-28 flex justify-end shrink-0">
                      {fac.statut === 'payee' && (
                        <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full text-center whitespace-nowrap">
                          {t('status.paid')}
                        </span>
                      )}
                      {fac.statut === 'attente' && (
                        <span className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full text-center whitespace-nowrap">
                          {t('status.pending')}
                        </span>
                      )}
                      {fac.statut === 'retard' && (
                        <span className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full text-center whitespace-nowrap">
                          {t('status.overdue')}
                        </span>
                      )}
                      {fac.statut === 'annulee' && (
                        <span className="bg-surface-container-highest text-text-secondary border border-border-base text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full text-center whitespace-nowrap">
                          {t('status.cancelled')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
