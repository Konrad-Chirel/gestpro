'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useStore } from '@/context/StoreContext';

export default function Dashboard() {
  const { clients, commandes, factures, formatCurrency, t } = useStore();

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
    const totalFac = factures.length || 1;
    const payeesCount = factures.filter((f) => f.statut === 'payee').length;
    const attenteCount = factures.filter((f) => f.statut === 'attente').length;
    const retardCount = factures.filter((f) => f.statut === 'retard').length;

    const pctPaye = Math.round((payeesCount / totalFac) * 100);
    const pctAttente = Math.round((attenteCount / totalFac) * 100);
    const pctRetard = Math.max(0, 100 - pctPaye - pctAttente);

    // Circonférence cercle SVG (r=40) = 251.2
    const circ = 251.2;
    const retardDash = Number(((pctRetard / 100) * circ).toFixed(1));
    const attenteDash = Number(((pctAttente / 100) * circ).toFixed(1));
    const payeDash = Number(((pctPaye / 100) * circ).toFixed(1));

    const retardOffset = 0;
    const attenteOffset = -retardDash;
    const payeOffset = -(retardDash + attenteDash);

    // 3 dernières commandes et 3 dernières factures
    const recentOrders = [...commandes].slice(0, 3);
    const recentInvoices = [...factures].slice(0, 3);

    return {
      caTotal,
      commandesCount,
      facturesImpayeesCount,
      totalResteDu,
      clientsActifsCount,
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
    <div className="flex flex-col w-full gap-8 p-6 md:p-8 lg:p-10">
      {/* Header Section */}
      <div className="flex flex-col gap-2 relative">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary flex items-center flex-wrap gap-2">
          {t('dashboard.welcome')} <span className="inline-block hover:animate-bounce origin-bottom -mt-2">👋</span>
        </h1>
        <p className="text-body-lg font-body-lg text-text-secondary mt-2">{t('dashboard.subtitle')}</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="bg-surface rounded-xl p-6 shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col gap-1">
              <span className="text-label-md font-label-md text-text-secondary uppercase tracking-wider">{t('dashboard.revenue')}</span>
              <span className="text-headline-lg font-headline-lg text-text-primary">
                {formatCurrency(stats.caTotal, { showDecimals: false })}
              </span>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <span className="material-symbols-outlined text-[28px]">trending_up</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-success/15 text-success text-label-sm font-label-sm px-2 py-1 rounded flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 12.5%
            </span>
            <span className="text-label-sm font-label-sm text-text-secondary">{t('dashboard.vs_last_month')}</span>
          </div>
        </div>
        
        {/* KPI 2 */}
        <div className="bg-surface rounded-xl p-6 shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/5 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col gap-1">
              <span className="text-label-md font-label-md text-text-secondary uppercase tracking-wider">{t('dashboard.orders')}</span>
              <span className="text-headline-lg font-headline-lg text-text-primary">{stats.commandesCount}</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary group-hover:bg-tertiary group-hover:text-on-tertiary transition-colors">
              <span className="material-symbols-outlined text-[28px]">shopping_cart</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-success/15 text-success text-label-sm font-label-sm px-2 py-1 rounded flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">add</span> {stats.commandesCount}
            </span>
            <span className="text-label-sm font-label-sm text-text-secondary">{t('dashboard.in_total')}</span>
          </div>
        </div>
        
        {/* KPI 3 */}
        <div className="bg-surface rounded-xl p-6 shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-warning/5 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col gap-1">
              <span className="text-label-md font-label-md text-text-secondary uppercase tracking-wider">{t('dashboard.unpaid')}</span>
              <span className="text-headline-lg font-headline-lg text-text-primary">{stats.facturesImpayeesCount}</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center text-warning group-hover:bg-warning group-hover:text-on-background transition-colors">
              <span className="material-symbols-outlined text-[28px]">description</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-warning text-label-md font-label-md">
              {formatCurrency(stats.totalResteDu, { showDecimals: false })}
            </span>
            <span className="text-label-sm font-label-sm text-text-secondary">{t('dashboard.pending')}</span>
          </div>
        </div>
        
        {/* KPI 4 */}
        <div className="bg-surface rounded-xl p-6 shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/5 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col gap-1">
              <span className="text-label-md font-label-md text-text-secondary uppercase tracking-wider">{t('dashboard.active_clients')}</span>
              <span className="text-headline-lg font-headline-lg text-text-primary">{stats.clientsActifsCount}</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
              <span className="material-symbols-outlined text-[28px]">group</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-success/15 text-success text-label-sm font-label-sm px-2 py-1 rounded flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span> {stats.clientsActifsCount}
            </span>
            <span className="text-label-sm font-label-sm text-text-secondary">{t('dashboard.registered')}</span>
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-8 bg-surface rounded-xl p-4 sm:p-6 shadow-lg flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base sm:text-headline-md font-bold sm:font-headline-md text-text-primary">{t('dashboard.revenue_6_months')}</h2>
            <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors shrink-0">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">more_vert</span>
            </button>
          </div>
          <div className="flex-1 w-full relative min-h-[256px] h-64 shrink-0 flex items-end justify-between gap-2 md:gap-4 pt-8 mt-4 overflow-x-auto pb-2 hide-scrollbar">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pb-8 pointer-events-none min-w-[300px]">
              <div className="w-full h-px bg-surface-container-high"></div>
              <div className="w-full h-px bg-surface-container-high"></div>
              <div className="w-full h-px bg-surface-container-high"></div>
              <div className="w-full h-px bg-surface-container-high"></div>
            </div>
            {/* Bars */}
            <div className="relative w-full h-full flex items-end justify-around z-10 pb-8 group/chart min-w-[300px]">
              {/* Mar */}
              <div className="w-8 md:w-12 h-[45%] bg-surface-container-high hover:bg-primary transition-colors duration-300 rounded-t-lg relative group/bar cursor-pointer">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface-container-highest text-text-primary text-label-sm font-label-sm px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">12k</div>
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-label-sm font-label-sm text-text-secondary">{t('month.mar')}</span>
              </div>
              {/* Avr */}
              <div className="w-8 md:w-12 h-[60%] bg-surface-container-high hover:bg-primary transition-colors duration-300 rounded-t-lg relative group/bar cursor-pointer">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface-container-highest text-text-primary text-label-sm font-label-sm px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">15k</div>
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-label-sm font-label-sm text-text-secondary">{t('month.apr')}</span>
              </div>
              {/* Mai */}
              <div className="w-8 md:w-12 h-[55%] bg-surface-container-high hover:bg-primary transition-colors duration-300 rounded-t-lg relative group/bar cursor-pointer">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface-container-highest text-text-primary text-label-sm font-label-sm px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">14.2k</div>
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-label-sm font-label-sm text-text-secondary">{t('month.may')}</span>
              </div>
              {/* Juin */}
              <div className="w-8 md:w-12 h-[75%] bg-surface-container-high hover:bg-primary transition-colors duration-300 rounded-t-lg relative group/bar cursor-pointer">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface-container-highest text-text-primary text-label-sm font-label-sm px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">18.9k</div>
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-label-sm font-label-sm text-text-secondary">{t('month.jun')}</span>
              </div>
              {/* Juil */}
              <div className="w-8 md:w-12 h-[85%] bg-surface-container-high hover:bg-primary transition-colors duration-300 rounded-t-lg relative group/bar cursor-pointer">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface-container-highest text-text-primary text-label-sm font-label-sm px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">22.5k</div>
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-label-sm font-label-sm text-text-secondary">{t('month.jul')}</span>
              </div>
              {/* Août */}
              <div className="w-8 md:w-12 h-[95%] bg-primary shadow-[0_0_15px_rgba(255,182,144,0.3)] hover:bg-primary-hover transition-colors duration-300 rounded-t-lg relative group/bar cursor-pointer">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface-container-highest text-text-primary text-label-sm font-label-sm px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">
                  {formatCurrency(stats.caTotal, { compact: true })}
                </div>
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-label-sm font-label-sm text-primary font-bold">{t('month.aug')}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Donut Chart */}
        <div className="lg:col-span-4 bg-surface rounded-xl p-4 sm:p-6 shadow-lg flex flex-col gap-4 sm:gap-6">
          <h2 className="text-base sm:text-headline-md font-bold sm:font-headline-md text-text-primary">{t('dashboard.payment_breakdown')}</h2>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" className="text-surface-container-high" strokeWidth="12"></circle>
              {/* En retard */}
              <circle className="transition-all duration-1000" cx="50" cy="50" fill="transparent" r="40" stroke="#EF4444" strokeDasharray={`${stats.retardDash} 251.2`} strokeDashoffset={`${stats.retardOffset}`} strokeWidth="12"></circle>
              {/* En attente */}
              <circle className="transition-all duration-1000" cx="50" cy="50" fill="transparent" r="40" stroke="#F59E0B" strokeDasharray={`${stats.attenteDash} 251.2`} strokeDashoffset={`${stats.attenteOffset}`} strokeWidth="12"></circle>
              {/* Payé */}
              <circle className="transition-all duration-1000" cx="50" cy="50" fill="transparent" r="40" stroke="#22C55E" strokeDasharray={`${stats.payeDash} 251.2`} strokeDashoffset={`${stats.payeOffset}`} strokeWidth="12"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-display-lg font-display-lg text-text-primary">{stats.pctPaye}%</span>
              <span className="text-label-sm font-label-sm text-text-secondary">{t('dashboard.paid')}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-4">
            <div className="flex items-center justify-between text-body-sm font-body-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <span className="text-text-secondary">{t('status.paid')}</span>
              </div>
              <span className="text-text-primary font-bold">{stats.pctPaye}%</span>
            </div>
            <div className="flex items-center justify-between text-body-sm font-body-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                <span className="text-text-secondary">{t('status.pending')}</span>
              </div>
              <span className="text-text-primary font-bold">{stats.pctAttente}%</span>
            </div>
            <div className="flex items-center justify-between text-body-sm font-body-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-error"></div>
                <span className="text-text-secondary">{t('status.overdue')}</span>
              </div>
              <span className="text-text-primary font-bold">{stats.pctRetard}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-surface rounded-xl p-4 sm:p-6 shadow-lg flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base sm:text-headline-md font-bold sm:font-headline-md text-text-primary">{t('dashboard.recent_orders')}</h2>
            <Link className="text-primary hover:text-primary-hover text-xs sm:text-label-md font-medium sm:font-label-md flex items-center gap-1 transition-colors shrink-0" href="/dashboard/commandes">
              {t('dashboard.view_all')} <span className="material-symbols-outlined text-[16px] sm:text-[18px]">arrow_forward</span>
            </Link>
          </div>
          <div className="flex flex-col gap-2 overflow-x-auto pb-2 hide-scrollbar">
            <div className="min-w-[400px] flex flex-col gap-2">
              {stats.recentOrders.map((cmd) => (
                <Link
                  key={cmd.id}
                  href={`/dashboard/commandes/${cmd.id}`}
                  className="flex items-center justify-between p-3.5 sm:p-4 bg-surface-container-lowest rounded-lg hover:bg-surface-container-high transition-colors group cursor-pointer gap-3"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-text-secondary group-hover:bg-primary/20 group-hover:text-primary transition-colors shrink-0">
                      <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-label-md font-label-md text-text-primary truncate">{cmd.numero}</span>
                      <span className="text-label-sm font-label-sm text-text-secondary truncate">{cmd.clientNom}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                    <span className="text-sm sm:text-base font-semibold text-text-primary whitespace-nowrap text-right min-w-[100px] sm:min-w-[130px]">
                      {formatCurrency(cmd.totalTTC || 0)}
                    </span>
                    {cmd.statut === 'livree' && (
                      <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-label-sm font-semibold px-3 py-1 rounded-full w-24 text-center shrink-0">{t('status.delivered')}</span>
                    )}
                    {cmd.statut === 'confirmee' && (
                      <span className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-label-sm font-semibold px-3 py-1 rounded-full w-24 text-center shrink-0">{t('status.confirmed')}</span>
                    )}
                    {cmd.statut === 'preparation' && (
                      <span className="bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/25 text-label-sm font-semibold px-3 py-1 rounded-full w-24 text-center shrink-0">{t('status.preparing')}</span>
                    )}
                    {cmd.statut === 'attente' && (
                      <span className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 text-label-sm font-semibold px-3 py-1 rounded-full w-24 text-center shrink-0">{t('status.pending')}</span>
                    )}
                    {cmd.statut === 'annulee' && (
                      <span className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-label-sm font-semibold px-3 py-1 rounded-full w-24 text-center shrink-0">{t('status.cancelled')}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        
        {/* Recent Invoices */}
        <div className="bg-surface rounded-xl p-4 sm:p-6 shadow-lg flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base sm:text-headline-md font-bold sm:font-headline-md text-text-primary">{t('dashboard.recent_invoices')}</h2>
            <Link className="text-primary hover:text-primary-hover text-xs sm:text-label-md font-medium sm:font-label-md flex items-center gap-1 transition-colors shrink-0" href="/dashboard/factures">
              {t('dashboard.view_all')} <span className="material-symbols-outlined text-[16px] sm:text-[18px]">arrow_forward</span>
            </Link>
          </div>
          <div className="flex flex-col gap-2 overflow-x-auto pb-2 hide-scrollbar">
            <div className="min-w-[400px] flex flex-col gap-2">
              {stats.recentInvoices.map((fac) => (
                <Link
                  key={fac.id}
                  href={`/dashboard/factures/${fac.id}`}
                  className="flex items-center justify-between p-3.5 sm:p-4 bg-surface-container-lowest rounded-lg hover:bg-surface-container-high transition-colors group cursor-pointer gap-3"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-text-secondary group-hover:bg-primary/20 group-hover:text-primary transition-colors shrink-0">
                      <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-label-md font-label-md text-text-primary truncate">{fac.numero}</span>
                      <span className="text-label-sm font-label-sm text-text-secondary truncate">{fac.clientNom || fac.dateEmission}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                    <span className="text-sm sm:text-base font-semibold text-text-primary whitespace-nowrap text-right min-w-[100px] sm:min-w-[130px]">
                      {formatCurrency(fac.totalTTC || 0)}
                    </span>
                    {fac.statut === 'payee' && (
                      <span className="bg-success/15 text-success text-label-sm font-label-sm px-3 py-1 rounded-full w-24 text-center shrink-0">{t('status.paid')}</span>
                    )}
                    {fac.statut === 'attente' && (
                      <span className="bg-warning/15 text-warning text-label-sm font-label-sm px-3 py-1 rounded-full w-24 text-center shrink-0">{t('status.pending')}</span>
                    )}
                    {fac.statut === 'retard' && (
                      <span className="bg-error/15 text-error text-label-sm font-label-sm px-3 py-1 rounded-full w-24 text-center shrink-0">{t('status.overdue')}</span>
                    )}
                    {fac.statut === 'annulee' && (
                      <span className="bg-surface-container-highest text-text-secondary text-label-sm font-label-sm px-3 py-1 rounded-full w-24 text-center shrink-0">{t('status.cancelled')}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
