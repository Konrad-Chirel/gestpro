'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore, Facture } from '@/context/StoreContext';

export default function FacturesPage() {
  const router = useRouter();
  const { factures, formatCurrency, t } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('mois');

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const periodDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(event.target as Node)) {
        setIsPeriodDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered invoices
  const filteredFactures = useMemo(() => {
    return (factures || []).filter((f) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        f.numero.toLowerCase().includes(q) ||
        (f.commandeNumero && f.commandeNumero.toLowerCase().includes(q)) ||
        f.clientNom.toLowerCase().includes(q);

      const matchesStatus = !statusFilter || f.statut === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [factures, searchQuery, statusFilter]);

  const getInitials = (nom: string) => {
    if (!nom) return 'FA';
    const words = nom.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    if (words.length === 1 && words[0].length >= 2) {
      return words[0].slice(0, 2).toUpperCase();
    }
    return nom.slice(0, 2).toUpperCase() || 'FA';
  };

  const renderBadge = (statut: Facture['statut']) => {
    switch (statut) {
      case 'attente':
        return (
          <span className="px-3 py-1 rounded-full bg-warning/15 text-warning font-label-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-warning"></span>
            {t('status.pending')}
          </span>
        );
      case 'payee':
        return (
          <span className="px-3 py-1 rounded-full bg-success/15 text-success font-label-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
            {t('status.paid')}
          </span>
        );
      case 'retard':
        return (
          <span className="px-3 py-1 rounded-full bg-error/15 text-error font-label-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
            {t('status.overdue')}
          </span>
        );
      case 'annulee':
        return (
          <span className="px-3 py-1 rounded-full bg-surface-container-highest text-text-secondary font-label-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-text-secondary"></span>
            {t('status.cancelled')}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full pb-16 flex flex-col px-4 sm:px-8 py-6 sm:py-8 gap-6 sm:gap-8">
      {/* Page Header */}
      <div className="flex flex-row justify-between items-center gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight m-0">
            {t('invoices.title')}
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-bold text-xs border border-border-base">
            {filteredFactures.length}
          </span>
        </div>
        <Link
          href="/dashboard/factures/nouveau"
          className="bg-primary hover:bg-primary-hover text-on-primary font-semibold text-xs sm:text-sm h-10 px-4 sm:px-5 rounded-full shadow-md transition-colors flex items-center justify-center gap-2 shrink-0 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span className="hidden sm:inline">{t('dashboard.create_invoice')}</span>
          <span className="sm:hidden">{t('common.new')}</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full relative z-30">
        <div className="flex flex-wrap items-center gap-3 w-full">
          {/* Search */}
          <div className="flex items-center bg-surface-container rounded-full px-4 py-2 border border-border-base w-full md:w-64 focus-within:border-primary transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant mr-2 text-[18px]">search</span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-body-sm font-body-sm w-full text-on-surface outline-none" 
              placeholder={t('Rechercher une facture...')} 
              type="text" 
            />
          </div>

          {/* Status, Period & Filter on the same line */}
          <div className="flex flex-row items-center gap-2 sm:gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <div className="relative z-50 flex-1 md:flex-none min-w-0" ref={statusDropdownRef}>
              <button 
                type="button" 
                onClick={() => {
                  setIsStatusDropdownOpen(!isStatusDropdownOpen);
                  setIsPeriodDropdownOpen(false);
                }}
                className="flex items-center justify-between gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-surface border border-border-base rounded-full hover:bg-surface-container-high transition-colors w-full min-w-0 cursor-pointer"
              >
                <span className="font-label-md text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
                  {statusFilter === 'attente'
                    ? `${t('Statut')}: ${t('En attente')}`
                    : statusFilter === 'payee'
                    ? `${t('Statut')}: ${t('Payée')}`
                    : statusFilter === 'retard'
                    ? `${t('Statut')}: ${t('En retard')}`
                    : statusFilter === 'annulee'
                    ? `${t('Statut')}: ${t('Annulée')}`
                    : `${t('Statut')}: ${t('Tous')}`}
                </span>
                <span className={`material-symbols-outlined text-[16px] sm:text-[18px] text-text-secondary shrink-0 transition-transform duration-150 ${isStatusDropdownOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 w-48 bg-surface border border-border-base rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden ring-1 ring-border-base">
                  {[
                    { value: '', label: t('Tous') },
                    { value: 'attente', label: t('En attente') },
                    { value: 'payee', label: t('Payée') },
                    { value: 'retard', label: t('En retard') },
                    { value: 'annulee', label: t('Annulée') },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setStatusFilter(item.value);
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-between ${
                        statusFilter === item.value
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-text-primary hover:bg-surface-container-high hover:text-text-primary'
                      }`}
                    >
                      <span>{item.label}</span>
                      {statusFilter === item.value && (
                        <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Period Filter */}
            <div className="relative z-50 flex-1 md:flex-none min-w-0" ref={periodDropdownRef}>
              <button 
                type="button" 
                onClick={() => {
                  setIsPeriodDropdownOpen(!isPeriodDropdownOpen);
                  setIsStatusDropdownOpen(false);
                }}
                className="flex items-center justify-between gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-surface border border-border-base rounded-full hover:bg-surface-container-high transition-colors w-full min-w-0 cursor-pointer"
              >
                <span className="font-label-md text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
                  {periodFilter === 'tous'
                    ? `${t('Période') || 'Période'}: ${t('Toutes les périodes')}`
                    : periodFilter === 'annee'
                    ? `${t('Période') || 'Période'}: ${t('Cette année')}`
                    : `${t('Période') || 'Période'}: ${t('Ce mois')}`}
                </span>
                <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-text-secondary shrink-0">calendar_today</span>
              </button>

              {isPeriodDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 w-48 bg-surface border border-border-base rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden ring-1 ring-border-base">
                  {[
                    { value: 'mois', label: t('Ce mois') },
                    { value: 'annee', label: t('Cette année') },
                    { value: 'tous', label: t('Toutes les périodes') },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setPeriodFilter(item.value);
                        setIsPeriodDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-between ${
                        periodFilter === item.value
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-text-primary hover:bg-surface-container-high hover:text-text-primary'
                      }`}
                    >
                      <span>{item.label}</span>
                      {periodFilter === item.value && (
                        <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Icon */}
            <button 
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
                setPeriodFilter('mois');
              }}
              className="w-10 h-10 rounded-full bg-surface border border-border-base flex items-center justify-center hover:bg-surface-container-high transition-colors shrink-0 cursor-pointer"
              title={t('Réinitialiser filtres')}
            >
              <span className="material-symbols-outlined text-text-primary text-[18px]">filter_list</span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="relative z-0">
        <div className="flex flex-col gap-3 overflow-x-auto w-full pb-16">
          <div className="min-w-[1000px] flex flex-col gap-3">
            {/* Headers */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-container-highest rounded-xl text-label-sm text-text-secondary uppercase tracking-widest items-center">
              <div className="col-span-2">{t('N° Facture')}</div>
              <div className="col-span-1">{t('Cmd')}</div>
              <div className="col-span-3">{t('Client')}</div>
              <div className="col-span-2">{t('Émission / Échéance')}</div>
              <div className="col-span-1 whitespace-nowrap">{t('Total TTC')}</div>
              <div className="col-span-2 text-center">{t('Statut')}</div>
              <div className="col-span-1 text-right">{t('Actions')}</div>
            </div>

            {/* Rows */}
            {filteredFactures.length === 0 ? (
              <div className="py-12 text-center text-text-secondary text-body-sm bg-surface rounded-xl border border-border-base">
                {t('Aucune facture trouvée.')}
              </div>
            ) : (
              filteredFactures.map((fac) => (
                <div
                  key={fac.id}
                  onClick={() => router.push(`/dashboard/factures/${fac.id}`)}
                  className="grid grid-cols-12 gap-4 px-6 py-5 bg-surface hover:bg-surface-container-lowest rounded-xl shadow-md transition-all items-center group cursor-pointer"
                >
                  <div className={`col-span-2 font-label-md transition-colors ${fac.numero === 'FAC-2026-0038' ? 'text-primary' : 'text-text-primary group-hover:text-primary'}`}>
                    {fac.numero}
                  </div>
                  <div 
                    className="col-span-1 font-body-sm text-tertiary hover:underline whitespace-nowrap"
                    onClick={(e) => {
                      if (fac.commandeId || fac.commandeNumero) {
                        e.stopPropagation();
                        router.push(`/dashboard/commandes/${fac.commandeId || fac.commandeNumero}`);
                      }
                    }}
                  >
                    {fac.commandeNumero || '—'}
                  </div>
                  <div className="col-span-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center font-label-sm text-text-primary border border-border-base text-[10px]">
                      {getInitials(fac.clientNom)}
                    </div>
                    <span className="font-body-sm text-text-primary truncate">{fac.clientNom}</span>
                  </div>
                  <div className="col-span-2 flex flex-col">
                    <span className="font-body-sm text-text-primary">{fac.dateEmission}</span>
                    <span className={`font-body-sm text-xs ${fac.statut === 'retard' ? 'text-error font-semibold' : 'text-text-secondary'}`}>
                      {fac.dateEcheance}
                    </span>
                  </div>
                  <div className="col-span-1 font-label-md text-text-primary whitespace-nowrap">
                    {formatCurrency(fac.totalTTC)}
                  </div>
                  <div className="col-span-2 flex justify-center">
                    {renderBadge(fac.statut)}
                  </div>
                  <div className="col-span-1 flex items-center justify-end gap-2 transition-colors">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/factures/${fac.id}`);
                      }}
                      className="text-text-secondary hover:text-primary transition-colors cursor-pointer" 
                      title={t('Voir')}
                    >
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/factures/${fac.id}?print=true`);
                      }}
                      className="text-text-secondary hover:text-primary transition-colors cursor-pointer" 
                      title={t('Télécharger')}
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
