'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore, OrderItem } from '@/context/StoreContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TableOrder {
  id: string;
  numero: string;
  clientId: string;
  clientNom: string;
  clientEmail?: string;
  dateCreation: string;
  dateLivraison: string;
  articlesCount: number;
  articles: OrderItem[];
  totalHT: number;
  tva: number;
  totalTTCNumeric: number;
  totalTTC: string;
  statut: 'livree' | 'attente' | 'preparation' | 'confirmee' | 'annulee';
  statutLabel: string;
  actions: ('visibility' | 'description' | 'edit')[];
  isFirst?: boolean;
}

const MONTHS_MAP: Record<string, number> = {
  jan: 0, janv: 0, janvier: 0, january: 0,
  fev: 1, fév: 1, fevr: 1, févr: 1, février: 1, fevrier: 1, february: 1,
  mar: 2, mars: 2, march: 2,
  avr: 3, avril: 3, apr: 3, april: 3,
  mai: 4, may: 4,
  juin: 5, june: 5,
  juil: 6, juillet: 6, jul: 6, july: 6,
  aou: 7, août: 7, aout: 7, aug: 7, august: 7,
  sep: 8, sept: 8, septembre: 8, september: 8,
  oct: 9, octobre: 9, october: 9,
  nov: 10, novembre: 10, november: 10,
  dec: 11, déc: 11, décembre: 11, decembre: 11, december: 11,
};

const parseOrderDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();

  // 1. DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    return new Date(year, month, day);
  }

  // 2. YYYY-MM-DD
  const ymdMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    return new Date(year, month, day);
  }

  // 3. DD Month YYYY (e.g. "24 Oct 2023", "25 Octobre 2023")
  const textMatch = trimmed.match(/^(\d{1,2})\s+([a-zA-ZÀ-ÿ.]+)\s+(\d{4})/);
  if (textMatch) {
    const day = parseInt(textMatch[1], 10);
    const monthStr = textMatch[2].toLowerCase().replace('.', '');
    const year = parseInt(textMatch[3], 10);
    const monthKey = Object.keys(MONTHS_MAP).find((k) => monthStr.startsWith(k));
    if (monthKey !== undefined) {
      return new Date(year, MONTHS_MAP[monthKey], day);
    }
  }

  // 4. Standard Date parsing fallback
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
};

export default function CommandesPage() {
  const router = useRouter();
  const { commandes, companySettings, formatCurrency, t } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');

  // Unified orders from the real store
  const allOrders = useMemo<TableOrder[]>(() => {
    return (commandes || []).map((c, idx) => ({
      id: c.id,
      numero: c.numero,
      clientId: c.clientId,
      clientNom: c.clientNom,
      clientEmail: c.clientEmail,
      dateCreation: c.dateCreation,
      dateLivraison: c.dateLivraison || '',
      articlesCount: c.articles ? c.articles.length : 1,
      articles: c.articles || [],
      totalHT: c.totalHT || 0,
      tva: c.tva || 0,
      totalTTCNumeric: c.totalTTC || 0,
      totalTTC: formatCurrency(c.totalTTC || 0),
      statut: c.statut,
      statutLabel:
        c.statut === 'livree'
          ? t('status.delivered')
          : c.statut === 'attente'
          ? t('status.pending')
          : c.statut === 'preparation'
          ? t('status.preparing')
          : c.statut === 'confirmee'
          ? t('status.confirmed')
          : t('status.cancelled'),
      actions: ['visibility', 'description', 'edit'],
      isFirst: idx === 0,
    }));
  }, [commandes, formatCurrency, t]);

  // Real-time filtering with period filter support
  const filteredOrders = useMemo(() => {
    return allOrders.filter((cmd) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        cmd.numero.toLowerCase().includes(q) ||
        cmd.clientNom.toLowerCase().includes(q);

      const matchesStatus = !statusFilter || cmd.statut === statusFilter;

      // Filter by period
      let matchesPeriod = true;
      if (periodFilter && periodFilter !== 'toutes' && periodFilter !== 'tous') {
        const oDate = parseOrderDate(cmd.dateCreation);
        if (oDate) {
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const oDay = new Date(oDate.getFullYear(), oDate.getMonth(), oDate.getDate());

          if (periodFilter === 'aujourdhui') {
            matchesPeriod = oDay.getTime() === today.getTime();
          } else if (periodFilter === '30') {
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            matchesPeriod = oDay >= thirtyDaysAgo && oDay <= today;
          } else if (periodFilter === '90') {
            const ninetyDaysAgo = new Date(today);
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
            matchesPeriod = oDay >= ninetyDaysAgo && oDay <= today;
          } else if (periodFilter === 'annee') {
            matchesPeriod = oDate.getFullYear() === now.getFullYear();
          }
        } else {
          matchesPeriod = false;
        }
      }

      return matchesSearch && matchesStatus && matchesPeriod;
    });
  }, [allOrders, searchQuery, statusFilter, periodFilter]);

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const companyName = companySettings?.companyName || 'GestPro ERP';
    const isEn = companySettings?.language === 'en';
    const title = isEn ? 'ORDERS REPORT' : 'RAPPORT DES COMMANDES';
    const now = new Date();
    const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Header banner
    doc.setFillColor(28, 27, 27);
    doc.rect(0, 0, 297, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(companyName, 14, 11);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(190, 190, 190);
    doc.text(isEn ? 'Complete orders management & status report' : 'Gestion globale des commandes et états de livraison', 14, 18);

    doc.setTextColor(255, 182, 144);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 283, 11, { align: 'right' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(190, 190, 190);
    doc.text(`${isEn ? 'Exported on' : 'Exporté le'} : ${dateFormatted}`, 283, 18, { align: 'right' });

    // Meta subheader
    const totalVolumeTTC = filteredOrders.reduce((acc, o) => acc + (o.totalTTCNumeric || 0), 0);
    const periodLabel =
      periodFilter === 'aujourdhui'
        ? t("Aujourd'hui")
        : periodFilter === '30'
        ? t('30 derniers jours')
        : periodFilter === '90'
        ? t('3 derniers mois')
        : periodFilter === 'annee'
        ? t('Cette année')
        : t('Toutes les dates');

    doc.setTextColor(80, 80, 80);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${isEn ? 'Period' : 'Période'} : ${periodLabel}    |    ${isEn ? 'Orders count' : 'Total Commandes'} : ${filteredOrders.length}    |    ${isEn ? 'Total Volume (TTC)' : 'Volume Total (TTC)'} : ${formatCurrency(totalVolumeTTC)}`,
      14,
      32
    );

    const headers = [[t('N° Commande'), t('Client'), t('Date'), t('Articles & Quantités'), t('Total HT'), t('TVA'), t('Total TTC'), t('Statut')]];
    const rows = filteredOrders.map((cmd) => {
      const articlesSummary =
        (cmd.articles || [])
          .map((a) => `${a.productName || 'Article'} (x${a.quantity})`)
          .join(', ') || `${cmd.articlesCount} article(s)`;

      return [
        cmd.numero,
        cmd.clientNom,
        cmd.dateCreation,
        articlesSummary,
        formatCurrency(cmd.totalHT || 0),
        formatCurrency(cmd.tva || 0),
        cmd.totalTTC,
        cmd.statutLabel,
      ];
    });

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
        0: { cellWidth: 34, fontStyle: 'bold' },
        1: { cellWidth: 38 },
        2: { cellWidth: 26 },
        3: { cellWidth: 'auto' },
        4: { halign: 'right', cellWidth: 26 },
        5: { halign: 'right', cellWidth: 24 },
        6: { halign: 'right', cellWidth: 28, fontStyle: 'bold' },
        7: { halign: 'center', cellWidth: 26 },
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

    const fileName = `commandes_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  };

  const totalRevenuTTC = useMemo(() => {
    return (commandes || []).reduce((acc, c) => acc + (c.totalTTC || 0), 0);
  }, [commandes]);

  const totalAttenteCount = useMemo(() => {
    return (commandes || []).filter((c) => c.statut === 'attente').length;
  }, [commandes]);

  const renderBadge = (statut: TableOrder['statut']) => {
    switch (statut) {
      case 'livree':
        return <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-label-sm font-semibold whitespace-nowrap">{t('status.delivered')}</span>;
      case 'attente':
        return <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 font-label-sm font-semibold whitespace-nowrap">{t('status.pending')}</span>;
      case 'preparation':
        return <span className="px-3 py-1 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/25 font-label-sm font-semibold whitespace-nowrap">{t('status.preparing')}</span>;
      case 'confirmee':
        return <span className="px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-label-sm font-semibold whitespace-nowrap">{t('status.confirmed')}</span>;
      case 'annulee':
        return <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-label-sm font-semibold whitespace-nowrap">{t('status.cancelled')}</span>;
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
            {t('nav.orders')}
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-bold text-xs border border-border-base">
            {filteredOrders.length}
          </span>
        </div>
        <Link
          href="/dashboard/commandes/nouveau"
          className="bg-primary hover:bg-primary-hover text-on-primary font-semibold text-xs sm:text-sm h-10 px-4 sm:px-5 rounded-full shadow-md transition-colors flex items-center justify-center gap-2 shrink-0 whitespace-nowrap cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>{t('dashboard.new_order')}</span>
        </Link>
      </div>

      {/* Visual Richness: KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface rounded-2xl p-6 shadow-md relative overflow-hidden group border border-border-base">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
          <p className="font-label-sm text-text-secondary uppercase tracking-widest mb-2">{t('Total Mensuel')}</p>
          <div className="flex items-end gap-2 xl:gap-4 justify-between min-w-0">
            <p className="text-xl sm:text-2xl xl:text-3xl font-bold text-text-primary whitespace-nowrap">
              {commandes.length > 0 ? commandes.length : 124}
            </p>
            <div className="w-16 sm:w-20 xl:w-24 h-10 xl:h-12 text-primary shrink-0">
              <svg className="w-full h-full stroke-current fill-none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 100 40">
                <path d="M0,30 Q10,25 20,28 T40,15 T60,20 T80,5 T100,10"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-6 shadow-md relative overflow-hidden group border border-border-base">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-warning/10 rounded-full blur-2xl group-hover:bg-warning/20 transition-all"></div>
          <p className="font-label-sm text-text-secondary uppercase tracking-widest mb-2">{t('En Attente')}</p>
          <div className="flex items-end gap-2 xl:gap-4 justify-between min-w-0">
            <p className="text-xl sm:text-2xl xl:text-3xl font-bold text-text-primary whitespace-nowrap">
              {totalAttenteCount > 0 ? totalAttenteCount : 18}
            </p>
            <div className="w-16 sm:w-20 xl:w-24 h-10 xl:h-12 text-warning shrink-0">
              <svg className="w-full h-full stroke-current fill-none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 100 40">
                <path d="M0,20 Q15,22 25,18 T50,25 T75,10 T100,15"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-6 shadow-md relative overflow-hidden group border border-border-base">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-success/10 rounded-full blur-2xl group-hover:bg-success/20 transition-all"></div>
          <p className="font-label-sm text-text-secondary uppercase tracking-widest mb-2">{t('Revenu (TTC)')}</p>
          <div className="flex items-end gap-2 xl:gap-4 justify-between min-w-0">
            <p className="text-xl sm:text-2xl xl:text-3xl font-bold text-text-primary whitespace-nowrap">
              {formatCurrency(totalRevenuTTC > 0 ? totalRevenuTTC : 45290)}
            </p>
            <div className="w-16 sm:w-20 xl:w-24 h-10 xl:h-12 text-success shrink-0">
              <svg className="w-full h-full stroke-current fill-none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 100 40">
                <path d="M0,35 Q20,30 30,15 T60,20 T80,5 T100,0"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface-container-high rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 shadow-sm border border-border-base">
        <div className="flex-1 flex items-center bg-input-bg rounded-lg px-4 h-11 sm:h-12 shadow-inner transition-colors border border-border-base focus-within:border-primary">
          <span className="material-symbols-outlined text-text-secondary mr-2 text-[20px]">search</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-body-sm text-on-surface w-full font-body-sm placeholder:text-text-secondary"
            placeholder={t('Rechercher une commande, un client...')}
            type="text"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-text-secondary hover:text-text-primary p-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
          <div className="flex-1 sm:flex-none min-w-[155px] flex items-center bg-input-bg rounded-lg px-3 h-11 sm:h-12 shadow-inner relative border border-border-base">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-on-surface appearance-none pr-8 cursor-pointer w-full font-body-sm"
            >
              <option className="bg-surface-container text-on-surface" value="">{t('Tous les statuts')}</option>
              <option className="bg-surface-container text-on-surface" value="attente">{t('En attente')}</option>
              <option className="bg-surface-container text-on-surface" value="confirmee">{t('Confirmée')}</option>
              <option className="bg-surface-container text-on-surface" value="preparation">{t('En préparation')}</option>
              <option className="bg-surface-container text-on-surface" value="livree">{t('Livrée')}</option>
              <option className="bg-surface-container text-on-surface" value="annulee">{t('Annulée')}</option>
            </select>
            <span className="material-symbols-outlined text-text-secondary absolute right-2 pointer-events-none text-[20px]">expand_more</span>
          </div>

          <div className="flex-1 sm:flex-none min-w-[165px] flex items-center bg-input-bg rounded-lg px-3 h-11 sm:h-12 shadow-inner relative border border-border-base">
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-on-surface appearance-none pr-8 cursor-pointer w-full font-body-sm"
            >
              <option className="bg-surface-container text-on-surface" value="">{t('Toutes les dates')}</option>
              <option className="bg-surface-container text-on-surface" value="aujourdhui">{t("Aujourd'hui")}</option>
              <option className="bg-surface-container text-on-surface" value="30">{t('30 derniers jours')}</option>
              <option className="bg-surface-container text-on-surface" value="90">{t('3 derniers mois')}</option>
              <option className="bg-surface-container text-on-surface" value="annee">{t('Cette année')}</option>
            </select>
            <span className="material-symbols-outlined text-text-secondary absolute right-2 pointer-events-none text-[20px]">calendar_today</span>
          </div>

          <button
            type="button"
            onClick={handleExportPDF}
            title={t('Exporter les commandes en PDF')}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-surface-container hover:bg-surface-variant flex items-center justify-center text-text-secondary hover:text-primary transition-colors shadow-sm border border-border-base shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
          </button>
        </div>
      </div>

      {/* Data List (Table Alternative) */}
      <div className="flex flex-col gap-3">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[1000px] flex flex-col gap-3">
            {/* Headers */}
            <div className="grid grid-cols-[1.5fr_2fr_1.4fr_0.8fr_1.3fr_1.3fr_1fr] gap-4 px-6 py-3 bg-surface-container-highest rounded-xl text-label-sm text-text-secondary uppercase tracking-widest items-center">
              <div>{t('N° Commande')}</div>
              <div>{t('Client')}</div>
              <div>{t('Date')}</div>
              <div className="text-center">{t('Articles')}</div>
              <div className="text-right whitespace-nowrap">{t('Total TTC')}</div>
              <div className="text-center">{t('Statut')}</div>
              <div className="text-right">{t('Actions')}</div>
            </div>

            {/* Rows */}
            {filteredOrders.length === 0 ? (
              <div className="py-12 text-center bg-surface rounded-xl shadow-md border border-border-base">
                <span className="material-symbols-outlined text-4xl text-text-secondary mb-2">shopping_bag</span>
                <p className="text-text-secondary font-body-sm">{t('Aucune commande ne correspond aux critères.')}</p>
              </div>
            ) : (
              filteredOrders.map((cmd) => (
                <div
                  key={cmd.id}
                  onClick={() => router.push(`/dashboard/commandes/${cmd.id}`)}
                  className="grid grid-cols-[1.5fr_2fr_1.4fr_0.8fr_1.3fr_1.3fr_1fr] gap-4 px-6 py-5 bg-surface hover:bg-surface-container-lowest rounded-xl shadow-md transition-all items-center group cursor-pointer border border-transparent hover:border-border-base/50"
                >
                  <div
                    className={`font-label-md ${
                      cmd.isFirst ? 'text-primary' : 'text-text-primary group-hover:text-primary'
                    } transition-colors whitespace-nowrap`}
                  >
                    {cmd.numero}
                  </div>
                  <div className="font-body-sm text-text-primary truncate font-medium">
                    {cmd.clientNom}
                  </div>
                  <div className="font-body-sm text-text-secondary whitespace-nowrap">
                    {cmd.dateCreation}
                  </div>
                  <div className="font-body-sm text-text-secondary text-center">
                    {cmd.articlesCount}
                  </div>
                  <div className="font-label-md text-text-primary text-right whitespace-nowrap">
                    {cmd.totalTTC}
                  </div>
                  <div className="flex justify-center">
                    {renderBadge(cmd.statut)}
                  </div>
                  <div className="flex items-center justify-end gap-2 text-text-secondary">
                    {cmd.actions.includes('visibility') && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/commandes/${cmd.id}`);
                        }}
                        className="text-text-secondary hover:text-primary transition-colors cursor-pointer p-1"
                        title={t('Voir la commande')}
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                    )}
                    {cmd.actions.includes('description') && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/commandes/${cmd.id}`);
                        }}
                        className="text-text-secondary hover:text-primary transition-colors cursor-pointer p-1"
                        title={t('Détails')}
                      >
                        <span className="material-symbols-outlined text-[18px]">description</span>
                      </button>
                    )}
                    {cmd.actions.includes('edit') && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/commandes/${cmd.id}`);
                        }}
                        className="text-text-secondary hover:text-primary transition-colors cursor-pointer p-1"
                        title={t('Modifier')}
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-2 mt-4">
          <span className="font-body-sm text-text-secondary">
            {t('Affichage de')} 1 {t('à')} {filteredOrders.length} {t('sur')} {commandes.length || 124} {t('commandes')}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface flex items-center justify-center text-text-secondary shadow-sm transition-colors opacity-50 cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface flex items-center justify-center text-text-primary shadow-sm transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
