'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore, Paiement } from '@/context/StoreContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PaiementsPage() {
  const { paiements, factures, companySettings, isHydrated, formatCurrency, t } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');

  // KPI Calculations
  const metrics = useMemo(() => {
    // 1. Encaissé : Somme des paiements réussis
    const totalEncaisse = paiements
      .filter((p) => p.statut === 'reussi')
      .reduce((sum, p) => sum + (p.montant || 0), 0);

    // 2. En attente : Somme et nombre des paiements en attente de validation / en cours
    const paiementsEnAttente = paiements.filter((p) => p.statut === 'attente');
    const totalEnAttente = paiementsEnAttente.reduce((sum, p) => sum + (p.montant || 0), 0);
    const nbPaiementsEnAttente = paiementsEnAttente.length;

    // 3. En retard : Montants des factures en retard
    const facturesEnRetard = factures.filter((f) => f.statut === 'retard');
    const totalEnRetard = facturesEnRetard.reduce((sum, f) => sum + (f.resteDu || 0), 0);

    return {
      totalEncaisse,
      totalEnAttente,
      nbPaiementsEnAttente,
      totalEnRetard,
    };
  }, [paiements, factures]);

  // Client initials helper
  const getInitials = (name: string) => {
    if (!name) return 'CL';
    const parts = name.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase() || 'CL';
  };

  // Payment method label
  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'virement':
        return t('Virement Bancaire');
      case 'carte':
      case 'cb':
        return t('Carte de Crédit');
      case 'cheque':
        return t('Chèque');
      case 'especes':
        return t('Espèces');
      case 'wave':
        return 'Wave';
      case 'orange_money':
        return 'Orange Money';
      default:
        return method ? t(method) : t('Virement Bancaire');
    }
  };

  // Helper to parse dates in format DD/MM/YYYY, YYYY-MM-DD, or ISO strings
  const parsePaymentDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const trimmed = dateStr.trim();
    const dmyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1;
      const year = parseInt(dmyMatch[3], 10);
      return new Date(year, month, day);
    }
    const ymdMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (ymdMatch) {
      const year = parseInt(ymdMatch[1], 10);
      const month = parseInt(ymdMatch[2], 10) - 1;
      const day = parseInt(ymdMatch[3], 10);
      return new Date(year, month, day);
    }
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  };

  // Filtered Payments
  const filteredPaiements = useMemo(() => {
    return (paiements || []).filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.reference.toLowerCase().includes(q) ||
        p.factureNumero.toLowerCase().includes(q) ||
        p.clientNom.toLowerCase().includes(q) ||
        getMethodLabel(p.methode).toLowerCase().includes(q);

      const matchesStatus = !statusFilter || p.statut === statusFilter;

      // Filter by period
      let matchesPeriod = true;
      if (periodFilter && periodFilter !== 'tous' && periodFilter !== 'toutes') {
        const pDate = parsePaymentDate(p.date);
        if (pDate) {
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const pDay = new Date(pDate.getFullYear(), pDate.getMonth(), pDate.getDate());

          if (periodFilter === 'aujourdhui') {
            matchesPeriod = pDay.getTime() === today.getTime();
          } else if (periodFilter === 'mois') {
            matchesPeriod = pDate.getFullYear() === now.getFullYear() && pDate.getMonth() === now.getMonth();
          } else if (periodFilter === '3mois') {
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            matchesPeriod = pDay >= threeMonthsAgo && pDay <= today;
          } else if (periodFilter === 'annee') {
            matchesPeriod = pDate.getFullYear() === now.getFullYear();
          }
        } else {
          matchesPeriod = false;
        }
      }

      return matchesSearch && matchesStatus && matchesPeriod;
    });
  }, [paiements, searchQuery, statusFilter, periodFilter]);

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const companyName = companySettings?.companyName || 'GestPro ERP';
    const isEn = companySettings?.language === 'en';
    const title = isEn ? 'PAYMENTS REPORT' : 'RAPPORT DES PAIEMENTS';
    const now = new Date();
    const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Header banner
    doc.setFillColor(28, 27, 27);
    doc.rect(0, 0, 210, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(companyName, 14, 11);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(190, 190, 190);
    doc.text(isEn ? 'Financial transactions & settlements' : 'Transactions financières et règlements', 14, 18);

    doc.setTextColor(255, 182, 144);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 196, 11, { align: 'right' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(190, 190, 190);
    doc.text(`${isEn ? 'Exported on' : 'Exporté le'} : ${dateFormatted}`, 196, 18, { align: 'right' });

    // Meta subheader
    const totalEncaisse = filteredPaiements.filter((p) => p.statut === 'reussi').reduce((s, p) => s + (p.montant || 0), 0);
    const totalFiltered = filteredPaiements.reduce((s, p) => s + (p.montant || 0), 0);

    const periodLabel =
      periodFilter === 'aujourdhui'
        ? t("Aujourd'hui")
        : periodFilter === 'mois'
        ? t('Ce mois-ci')
        : periodFilter === '3mois'
        ? t('3 derniers mois')
        : periodFilter === 'annee'
        ? t('Cette année')
        : t('Toutes les dates');

    doc.setTextColor(80, 80, 80);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${isEn ? 'Period' : 'Période'} : ${periodLabel}    |    ${isEn ? 'Transactions' : 'Transactions'} : ${filteredPaiements.length}    |    ${isEn ? 'Total Volume' : 'Volume Total'} : ${formatCurrency(totalFiltered)}`,
      14,
      32
    );

    const headers = [[t('Date'), t('Référence'), t('Facture'), t('Client'), t('Mode'), t('Montant'), t('Statut')]];
    const rows = filteredPaiements.map((p) => [
      p.date,
      p.reference,
      p.factureNumero ? p.factureNumero.replace(/^FAC-2026-(FAC-)?/i, 'FAC-2026-') : '-',
      p.clientNom,
      getMethodLabel(p.methode),
      formatCurrency(p.montant || 0),
      p.statut === 'reussi' ? t('Réussi') : p.statut === 'attente' ? t('En attente') : t('Échoué'),
    ]);

    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 37,
      theme: 'grid',
      styles: {
        fontSize: 8.5,
        cellPadding: 3,
        textColor: [40, 40, 40],
        lineColor: [220, 220, 220],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 28, fontStyle: 'bold' },
        2: { cellWidth: 26 },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 32 },
        5: { halign: 'right', cellWidth: 28, fontStyle: 'bold' },
        6: { halign: 'center', cellWidth: 22 },
      },
      margin: { left: 14, right: 14, bottom: 16 },
      didDrawPage: (data: any) => {
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height || pageSize.getHeight();
        const pageWidth = pageSize.width || pageSize.getWidth();

        doc.setFontSize(7.5);
        doc.setTextColor(140, 140, 140);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `${companyName} - ${isEn ? 'Automated ERP Report' : 'Rapport ERP Automatisé'}`,
          14,
          pageHeight - 8
        );
        doc.text(
          `Page ${data.pageNumber}`,
          pageWidth - 14,
          pageHeight - 8,
          { align: 'right' }
        );
      },
    });

    const fileName = `paiements_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="w-full pb-16 flex flex-col px-4 sm:px-8 py-6 sm:py-8 gap-6 sm:gap-8">
      {/* Page Header */}
      <div className="flex flex-row justify-between items-center gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight m-0">
            {t('payments.title')}
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-bold text-xs border border-border-base">
            {filteredPaiements.length}
          </span>
        </div>
        <Link
          href="/dashboard/paiements/nouveau"
          className="bg-primary hover:bg-primary-hover text-on-primary font-semibold text-xs sm:text-sm h-10 px-4 sm:px-5 rounded-full shadow-md transition-colors flex items-center justify-center gap-2 shrink-0 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span className="hidden sm:inline">{t('payments.new')}</span>
          <span className="sm:hidden">{t('common.new')}</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="bg-surface rounded-xl p-6 shadow-md border-b-4 border-success">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col">
              <span className="font-label-md text-text-secondary uppercase tracking-wider">{t('Encaissé (Mois)')}</span>
              <span className="font-headline-lg md:font-display-lg text-success mt-2">
                {formatCurrency(metrics.totalEncaisse)}
              </span>
            </div>
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-success">check_circle</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-success text-[16px]">trending_up</span>
            <span className="font-body-sm text-text-secondary">+12.5% {t('dashboard.vs_last_month')}</span>
          </div>
        </div>
        
        <div className="bg-surface rounded-xl p-6 shadow-md border-b-4 border-warning">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col">
              <span className="font-label-md text-text-secondary uppercase tracking-wider">{t('En attente')}</span>
              <span className="font-headline-lg md:font-display-lg text-warning mt-2">
                {formatCurrency(metrics.totalEnAttente)}
              </span>
            </div>
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-warning">pending</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-body-sm text-text-secondary">
              {metrics.nbPaiementsEnAttente} {metrics.nbPaiementsEnAttente > 1 ? t('paiements en cours') : t('paiement en cours')}
            </span>
          </div>
        </div>
        
        <div className="bg-surface rounded-xl p-6 shadow-md border-b-4 border-error">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col">
              <span className="font-label-md text-text-secondary uppercase tracking-wider">{t('En retard')}</span>
              <span className="font-headline-lg md:font-display-lg text-error mt-2">
                {formatCurrency(metrics.totalEnRetard)}
              </span>
            </div>
            <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-error">error</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-[16px]">trending_up</span>
            <span className="font-body-sm text-text-secondary">+4.2% {t('dashboard.vs_last_month')}</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface-container-high rounded-xl p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm relative z-10 mb-2">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 flex-1 w-full lg:w-auto overflow-x-auto pb-2 md:pb-0">
          <div className="flex items-center bg-input-bg rounded-lg px-4 h-10 w-full max-w-sm shadow-inner transition-colors focus-within:bg-surface shrink-0">
            <span className="material-symbols-outlined text-text-secondary mr-3 text-[18px]">search</span>
            <input 
              className="bg-transparent border-none outline-none text-body-sm text-on-surface w-full font-body-sm placeholder:text-text-secondary" 
              placeholder={t('Rechercher un paiement...')} 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center bg-input-bg rounded-lg px-4 h-10 shadow-inner relative">
            <select 
              className="bg-transparent border-none outline-none text-body-sm text-on-surface appearance-none pr-8 cursor-pointer w-40 font-body-sm" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option className="bg-surface-container text-on-surface" value="">{t('Tous les statuts')}</option>
              <option className="bg-surface-container text-on-surface" value="attente">{t('En attente')}</option>
              <option className="bg-surface-container text-on-surface" value="reussi">{t('Réussi')}</option>
              <option className="bg-surface-container text-on-surface" value="echoue">{t('Échoué')}</option>
            </select>
            <span className="material-symbols-outlined text-text-secondary absolute right-3 pointer-events-none text-[18px]">expand_more</span>
          </div>
          <div className="flex items-center bg-input-bg rounded-lg px-4 h-10 shadow-inner relative">
            <select 
              className="bg-transparent border-none outline-none text-body-sm text-on-surface appearance-none pr-8 cursor-pointer w-40 font-body-sm" 
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
            >
              <option className="bg-surface-container text-on-surface" value="">{t('Toutes les dates')}</option>
              <option className="bg-surface-container text-on-surface" value="aujourdhui">{t("Aujourd'hui")}</option>
              <option className="bg-surface-container text-on-surface" value="mois">{t('Ce mois-ci')}</option>
              <option className="bg-surface-container text-on-surface" value="3mois">{t('3 derniers mois')}</option>
              <option className="bg-surface-container text-on-surface" value="annee">{t('Cette année')}</option>
            </select>
            <span className="material-symbols-outlined text-text-secondary absolute right-3 pointer-events-none text-[18px]">calendar_today</span>
          </div>
        </div>
        <button 
          type="button"
          onClick={handleExportPDF}
          className="w-10 h-10 rounded-lg bg-surface-container hover:bg-surface-variant flex items-center justify-center text-text-secondary hover:text-primary transition-colors shadow-sm shrink-0 cursor-pointer"
          title={t('Exporter les paiements en PDF')}
        >
          <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
        </button>
      </div>

      {/* Data Table */}
      <div className="relative z-10">
        <div className="flex flex-col gap-3 overflow-x-auto w-full pb-16">
          <div className="min-w-[1000px] flex flex-col gap-3">
            {/* Headers */}
            <div className="grid grid-cols-[110px_100px_minmax(150px,1fr)_120px_160px_120px_100px] gap-4 px-6 py-3 bg-surface-container-highest rounded-xl text-label-sm text-text-secondary uppercase tracking-widest items-center">
              <div className="">{t('Date')}</div>
              <div className="">{t('Facture')}</div>
              <div className="">{t('Client')}</div>
              <div className="text-right whitespace-nowrap">{t('Montant')}</div>
              <div className="">{t('Mode')}</div>
              <div className="">{t('Référence')}</div>
              <div className="text-center">{t('Statut')}</div>
            </div>
            
            {/* Rows */}
            {filteredPaiements.length > 0 ? (
              filteredPaiements.map((p) => {
                const isEchoue = p.statut === 'echoue';
                const facCleanNumber = p.factureNumero.replace(/^FAC-/i, '');
                return (
                  <div 
                    key={p.id}
                    className={`grid grid-cols-[110px_100px_minmax(150px,1fr)_120px_160px_120px_100px] gap-4 px-6 py-5 rounded-xl shadow-md transition-all items-center group cursor-pointer ${
                      isEchoue ? 'bg-error/5 hover:bg-error/10' : 'bg-surface hover:bg-surface-container-lowest'
                    }`}
                  >
                    <div className="font-body-sm text-text-primary">{p.date}</div>
                    <div className="font-label-md text-tertiary hover:underline">
                      <Link href={`/dashboard/factures/${p.factureId || p.factureNumero}`}>{facCleanNumber}</Link>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-label-sm text-[10px] ${
                        isEchoue ? 'bg-error-container text-text-primary' : 'bg-surface-container-high text-text-primary'
                      }`}>
                        {getInitials(p.clientNom)}
                      </div>
                      <span className="font-body-sm text-text-primary truncate">{p.clientNom}</span>
                    </div>
                    <div className="font-label-md text-text-primary text-right whitespace-nowrap">
                      {formatCurrency(p.montant)}
                    </div>
                    <div className="font-body-sm text-text-primary">{getMethodLabel(p.methode)}</div>
                    <div className="font-mono text-xs text-text-secondary">{p.reference}</div>
                    <div className="flex justify-center">
                      {p.statut === 'reussi' && (
                        <span className="px-3 py-1 rounded-full whitespace-nowrap bg-success/15 text-success font-label-sm">{t('Réussi')}</span>
                      )}
                      {p.statut === 'attente' && (
                        <span className="px-3 py-1 rounded-full whitespace-nowrap bg-warning/15 text-warning font-label-sm">{t('En cours')}</span>
                      )}
                      {p.statut === 'echoue' && (
                        <span className="px-3 py-1 rounded-full whitespace-nowrap bg-error/15 text-error font-label-sm">{t('Échoué')}</span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-surface rounded-xl text-text-secondary text-sm">
                {t('Aucun paiement ne correspond à votre recherche.')}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}

