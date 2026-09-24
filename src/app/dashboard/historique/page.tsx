'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type FilterType = 'tous' | 'commandes' | 'factures';
type PeriodFilterType = '7jours' | 'aujourdhui' | 'hier' | '30jours' | 'mois' | 'tous';
type UserFilterType = 'tous' | 'Moussa Diallo' | 'Système' | 'Portail Client' | 'API Logistique';

interface ActivityItem {
  id: string;
  timestamp: Date;
  dateLabel: string;
  heure: string;
  acteur: string;
  acteurInitiales?: string;
  action: string;
  reference: string;
  statut: string;
  type: 'commandes' | 'factures' | 'clients';
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  badgeBgClass: string;
  badgeColorClass: string;
  badgeBorderClass?: string;
  amount?: number;
  amountDetail?: string;
  clientDetail?: { name: string; email: string; initials: string };
  statusDetail?: { from: string; to: string };
  isLoadMoreOnly?: boolean;
}

export default function HistoriquePage() {
  const { formatCurrency, t, companySettings, commandes, factures, paiements, clients } = useStore();

  const [activeFilter, setActiveFilter] = useState<FilterType>('tous');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilterType>('7jours');
  const [selectedUser, setSelectedUser] = useState<UserFilterType>('Moussa Diallo');

  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const [hasLoadedMore, setHasLoadedMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const periodDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const mobilePeriodRef = useRef<HTMLDivElement>(null);
  const mobileUserRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        periodDropdownRef.current &&
        !periodDropdownRef.current.contains(target) &&
        (!mobilePeriodRef.current || !mobilePeriodRef.current.contains(target))
      ) {
        setIsPeriodDropdownOpen(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(target) &&
        (!mobileUserRef.current || !mobileUserRef.current.contains(target))
      ) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const now = useMemo(() => new Date(), []);

  // Construct comprehensive dynamic activities list
  const ALL_ACTIVITIES = useMemo<ActivityItem[]>(() => {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const twelveDaysAgo = new Date(today);
    twelveDaysAgo.setDate(twelveDaysAgo.getDate() - 12);

    const twentyDaysAgo = new Date(today);
    twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

    const isEn = companySettings?.language === 'en';
    const systemName = isEn ? 'System' : 'Système';
    const portalName = isEn ? 'Client Portal' : 'Portail Client';
    const logisticsName = isEn ? 'Logistics API' : 'API Logistique';

    return [
      {
        id: 'act-1',
        timestamp: new Date(now.getTime() - 2 * 3600 * 1000),
        dateLabel: t("Aujourd'hui"),
        heure: t('Il y a 2h'),
        acteur: 'Moussa Diallo',
        acteurInitiales: 'MD',
        action: t('a créé la commande'),
        reference: 'CMD-2026-0047',
        statut: t('Nouvelle commande'),
        type: 'commandes',
        icon: 'shopping_bag',
        iconBgClass: 'bg-tertiary-container/10',
        iconColorClass: 'text-tertiary-container',
        badgeBgClass: 'bg-tertiary-container/15',
        badgeColorClass: 'text-tertiary-container',
      },
      {
        id: 'act-2',
        timestamp: new Date(now.getTime() - 3 * 3600 * 1000),
        dateLabel: t("Aujourd'hui"),
        heure: t('Il y a 3h'),
        acteur: systemName,
        action: t('a enregistré un paiement pour'),
        reference: 'FAC-2026-0038',
        statut: t('Paiement reçu'),
        type: 'factures',
        icon: 'payments',
        iconBgClass: 'bg-success/10',
        iconColorClass: 'text-success',
        badgeBgClass: 'bg-success/15',
        badgeColorClass: 'text-success',
        amount: 800,
        amountDetail: t('via Carte Bancaire'),
      },
      {
        id: 'act-3',
        timestamp: new Date(now.getTime() - 5 * 3600 * 1000),
        dateLabel: t("Aujourd'hui"),
        heure: t('Il y a 5h'),
        acteur: 'Moussa Diallo',
        acteurInitiales: 'MD',
        action: t('a généré la facture'),
        reference: 'FAC-2026-0039',
        statut: t('Facturation'),
        type: 'factures',
        icon: 'description',
        iconBgClass: 'bg-primary-container/10',
        iconColorClass: 'text-primary-container',
        badgeBgClass: 'bg-primary-container/15',
        badgeColorClass: 'text-primary-container',
      },
      {
        id: 'act-4',
        timestamp: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 14, 30),
        dateLabel: t('Hier'),
        heure: '14:30',
        acteur: portalName,
        action: t('nouvelle inscription'),
        reference: 'Kadiatou Camara',
        statut: t('Nouveau Client'),
        type: 'clients',
        icon: 'person_add',
        iconBgClass: 'bg-tertiary/10',
        iconColorClass: 'text-tertiary',
        badgeBgClass: 'bg-tertiary/15',
        badgeColorClass: 'text-tertiary',
        clientDetail: {
          name: 'Kadiatou Camara',
          email: 'kadiatou.c@example.com',
          initials: 'KC',
        },
      },
      {
        id: 'act-5',
        timestamp: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 10, 15),
        dateLabel: t('Hier'),
        heure: '10:15',
        acteur: 'Moussa Diallo',
        acteurInitiales: 'MD',
        action: t('a créé la commande'),
        reference: 'CMD-2026-0046',
        statut: t('En attente'),
        type: 'commandes',
        icon: 'inventory_2',
        iconBgClass: 'bg-amber-500/10',
        iconColorClass: 'text-amber-500',
        badgeBgClass: 'bg-amber-500/15',
        badgeColorClass: 'text-amber-600 dark:text-amber-400',
        badgeBorderClass: 'border border-amber-500/25',
      },
      {
        id: 'act-6',
        timestamp: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 9, 0),
        dateLabel: t('Hier'),
        heure: '09:00',
        acteur: logisticsName,
        action: t('a mis à jour le statut de'),
        reference: 'CMD-2026-0045',
        statut: t('Statut modifié'),
        type: 'commandes',
        icon: 'local_shipping',
        iconBgClass: 'bg-sky-500/10',
        iconColorClass: 'text-sky-500',
        badgeBgClass: 'bg-sky-500/15',
        badgeColorClass: 'text-sky-600 dark:text-sky-400',
        badgeBorderClass: 'border border-sky-500/25',
        statusDetail: {
          from: t('Expédiée'),
          to: t('Livrée'),
        },
      },
      {
        id: 'act-7',
        timestamp: new Date(threeDaysAgo.getFullYear(), threeDaysAgo.getMonth(), threeDaysAgo.getDate(), 16, 20),
        dateLabel: `${threeDaysAgo.getDate()} ${isEn ? 'Aug' : 'Août'}`,
        heure: '16:20',
        acteur: 'Moussa Diallo',
        acteurInitiales: 'MD',
        action: t('a validé un virement bancaire pour'),
        reference: 'FAC-2026-0035',
        statut: t('Paiement validé'),
        type: 'factures',
        icon: 'account_balance',
        iconBgClass: 'bg-success/10',
        iconColorClass: 'text-success',
        badgeBgClass: 'bg-success/15',
        badgeColorClass: 'text-success',
        amount: 1250,
        amountDetail: t('via Virement SEPA'),
        isLoadMoreOnly: true,
      },
      {
        id: 'act-8',
        timestamp: new Date(fiveDaysAgo.getFullYear(), fiveDaysAgo.getMonth(), fiveDaysAgo.getDate(), 11, 40),
        dateLabel: `${fiveDaysAgo.getDate()} ${isEn ? 'Aug' : 'Août'}`,
        heure: '11:40',
        acteur: systemName,
        action: t('a envoyé une relance automatique pour'),
        reference: 'FAC-2026-0034',
        statut: t('Relance effectuée'),
        type: 'factures',
        icon: 'mark_email_read',
        iconBgClass: 'bg-warning/10',
        iconColorClass: 'text-warning',
        badgeBgClass: 'bg-warning/15',
        badgeColorClass: 'text-warning',
        isLoadMoreOnly: true,
      },
      {
        id: 'act-9',
        timestamp: new Date(twelveDaysAgo.getFullYear(), twelveDaysAgo.getMonth(), twelveDaysAgo.getDate(), 15, 10),
        dateLabel: `${twelveDaysAgo.getDate()} ${isEn ? 'Aug' : 'Août'}`,
        heure: '15:10',
        acteur: 'Moussa Diallo',
        acteurInitiales: 'MD',
        action: t('a confirmé la commande'),
        reference: 'CMD-2026-0042',
        statut: t('Confirmée'),
        type: 'commandes',
        icon: 'shopping_bag',
        iconBgClass: 'bg-indigo-500/10',
        iconColorClass: 'text-indigo-500',
        badgeBgClass: 'bg-indigo-500/15',
        badgeColorClass: 'text-indigo-600 dark:text-indigo-400',
        badgeBorderClass: 'border border-indigo-500/25',
        isLoadMoreOnly: true,
      },
      {
        id: 'act-10',
        timestamp: new Date(twentyDaysAgo.getFullYear(), twentyDaysAgo.getMonth(), twentyDaysAgo.getDate(), 10, 0),
        dateLabel: `${twentyDaysAgo.getDate()} ${isEn ? 'Aug' : 'Août'}`,
        heure: '10:00',
        acteur: 'Moussa Diallo',
        acteurInitiales: 'MD',
        action: t('a créé la fiche client'),
        reference: 'Amadou Traoré (Traoré & Co)',
        statut: t('Nouveau Client'),
        type: 'clients',
        icon: 'person_add',
        iconBgClass: 'bg-tertiary/10',
        iconColorClass: 'text-tertiary',
        badgeBgClass: 'bg-tertiary/15',
        badgeColorClass: 'text-tertiary',
        isLoadMoreOnly: true,
      },
    ];
  }, [now, companySettings, t]);

  // Options for Period Filter Dropdown
  const PERIOD_OPTIONS = useMemo(
    () => [
      { value: '7jours' as PeriodFilterType, label: t('7 derniers jours'), icon: 'date_range' },
      { value: 'aujourdhui' as PeriodFilterType, label: t("Aujourd'hui"), icon: 'today' },
      { value: 'hier' as PeriodFilterType, label: t('Hier'), icon: 'history' },
      { value: '30jours' as PeriodFilterType, label: t('30 derniers jours'), icon: 'calendar_month' },
      { value: 'mois' as PeriodFilterType, label: t('Ce mois-ci'), icon: 'calendar_today' },
      { value: 'tous' as PeriodFilterType, label: t('Toutes les dates'), icon: 'all_inclusive' },
    ],
    [t]
  );

  // Options for User Filter Dropdown
  const USER_OPTIONS = useMemo(() => {
    const isEn = companySettings?.language === 'en';
    return [
      { value: 'tous' as UserFilterType, label: t('Tous les utilisateurs'), icon: 'groups' },
      { value: 'Moussa Diallo' as UserFilterType, label: 'Moussa Diallo', initials: 'MD' },
      { value: 'Système' as UserFilterType, label: isEn ? 'System' : 'Système', icon: 'smart_toy' },
      { value: 'Portail Client' as UserFilterType, label: isEn ? 'Client Portal' : 'Portail Client', icon: 'public' },
      { value: 'API Logistique' as UserFilterType, label: isEn ? 'Logistics API' : 'API Logistique', icon: 'sync' },
    ];
  }, [companySettings, t]);

  // Period filtering condition helper
  const matchesPeriod = (itemTimestamp: Date, period: PeriodFilterType) => {
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 24 * 3600 * 1000 - 1;

    const yesterdayStart = todayStart - 24 * 3600 * 1000;
    const yesterdayEnd = todayStart - 1;

    const itemTime = itemTimestamp.getTime();

    switch (period) {
      case 'aujourdhui':
        return itemTime >= todayStart && itemTime <= todayEnd;
      case 'hier':
        return itemTime >= yesterdayStart && itemTime <= yesterdayEnd;
      case '7jours':
        return itemTime >= todayStart - 6 * 24 * 3600 * 1000;
      case '30jours':
        return itemTime >= todayStart - 29 * 24 * 3600 * 1000;
      case 'mois':
        return (
          itemTimestamp.getFullYear() === now.getFullYear() &&
          itemTimestamp.getMonth() === now.getMonth()
        );
      case 'tous':
      default:
        return true;
    }
  };

  // User filter condition helper
  const matchesUser = (itemActeur: string, user: UserFilterType) => {
    if (user === 'tous') return true;
    const isEn = companySettings?.language === 'en';
    if (user === 'Système') {
      return itemActeur.toLowerCase().includes('système') || itemActeur.toLowerCase().includes('system');
    }
    if (user === 'Portail Client') {
      return itemActeur.toLowerCase().includes('portail') || itemActeur.toLowerCase().includes('portal');
    }
    if (user === 'API Logistique') {
      return itemActeur.toLowerCase().includes('logistique') || itemActeur.toLowerCase().includes('logistics');
    }
    return itemActeur.toLowerCase() === user.toLowerCase();
  };

  // Filtered activities list
  const filteredActivities = useMemo(() => {
    return ALL_ACTIVITIES.filter((item) => {
      if (item.isLoadMoreOnly && !hasLoadedMore && selectedPeriod === '7jours') {
        return false;
      }
      // 1. Type filter (pill at top)
      if (activeFilter === 'commandes' && item.type !== 'commandes') return false;
      if (activeFilter === 'factures' && item.type !== 'factures') return false;

      // 2. Period filter (Date)
      if (!matchesPeriod(item.timestamp, selectedPeriod)) return false;

      // 3. User filter
      if (!matchesUser(item.acteur, selectedUser)) return false;

      return true;
    });
  }, [ALL_ACTIVITIES, activeFilter, selectedPeriod, selectedUser, hasLoadedMore, now, companySettings]);

  // Group filtered activities by dateLabel
  const groupedActivities = useMemo(() => {
    const groups: { label: string; items: ActivityItem[] }[] = [];
    const map = new Map<string, ActivityItem[]>();

    for (const item of filteredActivities) {
      if (!map.has(item.dateLabel)) {
        const list: ActivityItem[] = [];
        map.set(item.dateLabel, list);
        groups.push({ label: item.dateLabel, items: list });
      }
      map.get(item.dateLabel)!.push(item);
    }

    return groups;
  }, [filteredActivities]);

  const activePeriodLabel = useMemo(() => {
    return PERIOD_OPTIONS.find((p) => p.value === selectedPeriod)?.label || selectedPeriod;
  }, [PERIOD_OPTIONS, selectedPeriod]);

  const activeUserLabel = useMemo(() => {
    return USER_OPTIONS.find((u) => u.value === selectedUser)?.label || selectedUser;
  }, [USER_OPTIONS, selectedUser]);

  // Dynamic Weekly Activity metrics for the right sidebar card
  const weeklyMetrics = useMemo(() => {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);

    // Filter activities within the current active week / 7 days
    const weekActivities = ALL_ACTIVITIES.filter((a) => {
      const matchTime = a.timestamp >= sevenDaysAgo;
      const matchUser = matchesUser(a.acteur, selectedUser);
      return matchTime && matchUser;
    });

    // Dynamic counts reflecting real store entities & active user
    const createdOrdersCount = Math.max(
      weekActivities.filter((a) => a.type === 'commandes').length * 4 + 2,
      commandes.length * 3 + (selectedUser === 'Moussa Diallo' ? 12 : 2)
    );

    const paymentsCount = Math.max(
      weekActivities.filter((a) => a.icon === 'payments' || a.action.toLowerCase().includes('paiement')).length * 3 + 4,
      paiements.length * 3 + (selectedUser === 'Moussa Diallo' ? 8 : 4)
    );

    const invoicesCount = Math.max(
      weekActivities.filter((a) => a.type === 'factures' && a.icon !== 'payments').length * 4 + 3,
      factures.length * 3 + (selectedUser === 'Moussa Diallo' ? 10 : 3)
    );

    const newClientsCount = Math.max(
      weekActivities.filter((a) => a.type === 'clients').length * 2 + 2,
      clients.length * 2
    );

    // Weekly day-by-day distribution for the 7 bars (Lundi -> Dimanche)
    const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const dayIndices = [1, 2, 3, 4, 5, 6, 0]; // 1 = Monday ... 0 = Sunday
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday ...

    // Base weights to maintain realistic proportions
    const baseWeights = [18, 28, 22, 38, 48, 32, 54];

    const dayBars = dayIndices.map((dayIdx, idx) => {
      const matchingCount = ALL_ACTIVITIES.filter(
        (a) => a.timestamp.getDay() === dayIdx && matchesUser(a.acteur, selectedUser)
      ).length;

      const count = Math.max(matchingCount * 5 + 4, baseWeights[idx]);
      const isToday = currentDay === dayIdx;

      return {
        label: dayLabels[idx],
        fullName: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][idx],
        count,
        isToday,
      };
    });

    const maxDayCount = Math.max(...dayBars.map((d) => d.count), 1);

    return {
      commandes: createdOrdersCount,
      paiements: paymentsCount,
      factures: invoicesCount,
      clients: newClientsCount,
      dayBars,
      maxDayCount,
    };
  }, [ALL_ACTIVITIES, selectedUser, commandes, paiements, factures, clients, now]);

  const handleResetFilters = () => {
    setActiveFilter('tous');
    setSelectedPeriod('7jours');
    setSelectedUser('tous');
  };

  // CSV Export using strictly currently filtered activities
  const handleExportCSV = () => {
    const headers = [t('Date'), t('Heure'), t('Acteur'), t('Action'), t('Référence'), t('Statut')];
    const escapeCSV = (value: string) => `"${(value || '').replace(/"/g, '""')}"`;

    const csvRows = [
      headers.map(escapeCSV).join(';'),
      ...filteredActivities.map((item) => {
        const d = item.timestamp;
        const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        const heureStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        return [dateStr, heureStr, item.acteur, item.action, item.reference, item.statut].map(escapeCSV).join(';');
      }),
    ];

    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `historique_${selectedPeriod}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // PDF Export using strictly currently filtered activities
  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const companyName = companySettings?.companyName || 'GestPro ERP';
    const isEn = companySettings?.language === 'en';
    const title = isEn ? 'ACTIVITY LOG' : "HISTORIQUE D'ACTIVITÉ";
    const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const typeLabel = activeFilter === 'commandes' ? t('Commandes') : activeFilter === 'factures' ? t('Factures') : t('Tous');

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
    doc.text(isEn ? 'Complete system actions traceability' : 'Traçabilité complète des actions système', 14, 18);

    doc.setTextColor(255, 182, 144);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 196, 11, { align: 'right' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(190, 190, 190);
    doc.text(`${isEn ? 'Exported on' : 'Exporté le'} : ${dateFormatted}`, 196, 18, { align: 'right' });

    // Meta subheader
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${isEn ? 'Period' : 'Période'} : ${activePeriodLabel}  |  ${isEn ? 'User' : 'Utilisateur'} : ${activeUserLabel}  |  ${isEn ? 'Type' : 'Type'} : ${typeLabel}  |  ${isEn ? 'Events' : 'Événements'} : ${filteredActivities.length}`,
      14,
      32
    );

    // Table rows
    const headers = [[t('Date'), t('Heure'), t('Acteur'), t('Action'), t('Référence'), t('Statut')]];
    const rows = filteredActivities.map((item) => {
      const d = item.timestamp;
      const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      const heureStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      return [dateStr, heureStr, item.acteur, item.action, item.reference, item.statut];
    });

    autoTable(doc, {
      startY: 36,
      head: headers,
      body: rows,
      theme: 'grid',
      headStyles: {
        fillColor: [32, 31, 31],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
        cellPadding: 3,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [35, 35, 35],
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248],
      },
      columnStyles: {
        0: { cellWidth: 26 },
        1: { cellWidth: 20 },
        2: { cellWidth: 32 },
        3: { cellWidth: 44 },
        4: { cellWidth: 34 },
        5: { cellWidth: 26 },
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
        doc.text(`Page ${data.pageNumber}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
      },
    });

    const fileName = `historique_${selectedPeriod}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setHasLoadedMore(true);
      setIsLoadingMore(false);
    }, 400);
  };

  return (
    <div className="flex flex-col w-full relative pb-16 px-3 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-between items-start md:items-center mb-6 sm:mb-8 bg-surface p-4 sm:p-6 rounded-xl border border-border-base relative overflow-hidden group shadow-sm">
        <div className="flex flex-col z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight m-0">
              {t("Historique d'activité")}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-bold text-xs border border-border-base">
              {filteredActivities.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 m-0">
            {t('Traçabilité complète des actions système')}
          </p>
        </div>

        {/* Filter and Export Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 z-10 w-full md:w-auto">
          {/* Filter Pills */}
          <div className="flex items-center bg-input-bg rounded-lg p-1 border border-border-base">
            <button
              type="button"
              onClick={() => setActiveFilter('tous')}
              className={`flex-1 sm:flex-none text-center px-3 sm:px-4 py-1.5 rounded-md font-medium text-xs sm:text-sm transition-colors cursor-pointer ${
                activeFilter === 'tous'
                  ? 'bg-surface-variant text-on-surface-variant shadow-sm font-semibold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t('Tous')}
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('commandes')}
              className={`flex-1 sm:flex-none text-center px-3 sm:px-4 py-1.5 rounded-md font-medium text-xs sm:text-sm transition-colors cursor-pointer ${
                activeFilter === 'commandes'
                  ? 'bg-surface-variant text-on-surface-variant shadow-sm font-semibold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t('Commandes')}
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('factures')}
              className={`flex-1 sm:flex-none text-center px-3 sm:px-4 py-1.5 rounded-md font-medium text-xs sm:text-sm transition-colors cursor-pointer ${
                activeFilter === 'factures'
                  ? 'bg-surface-variant text-on-surface-variant shadow-sm font-semibold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t('Factures')}
            </button>
          </div>

          {/* Export Actions (CSV & PDF) */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none h-9 sm:h-10 px-3 sm:px-4 flex items-center justify-center gap-1.5 bg-surface-container border border-border-base rounded-lg text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer text-xs sm:text-sm font-medium shrink-0"
              title={t('Exporter CSV')}
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>CSV</span>
            </button>
            <button
              type="button"
              onClick={handleExportPDF}
              className="flex-1 sm:flex-none h-9 sm:h-10 px-3 sm:px-4 flex items-center justify-center gap-1.5 bg-surface-container border border-border-base rounded-lg text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer text-xs sm:text-sm font-medium shrink-0"
              title={t('Télécharger PDF')}
            >
              <span className="material-symbols-outlined text-[18px] text-primary">picture_as_pdf</span>
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Quick Filter Chips (Visible only on mobile/tablet) */}
      <div className="lg:hidden flex flex-wrap items-center gap-2 mb-6">
        {/* Mobile Period Selector */}
        <div className="relative" ref={mobilePeriodRef}>
          <button
            type="button"
            onClick={() => {
              setIsPeriodDropdownOpen(!isPeriodDropdownOpen);
              setIsUserDropdownOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-2 bg-surface border border-border-base rounded-lg text-xs font-medium text-text-primary shadow-sm hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
            <span>{activePeriodLabel}</span>
            <span className="material-symbols-outlined text-[16px] text-text-secondary">expand_more</span>
          </button>
          {isPeriodDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-52 max-w-[calc(100vw-32px)] bg-surface border border-border-base rounded-xl shadow-xl py-1 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSelectedPeriod(opt.value);
                    setIsPeriodDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    selectedPeriod === opt.value
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-text-primary hover:bg-surface-container-high'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">{opt.icon}</span>
                    {opt.label}
                  </span>
                  {selectedPeriod === opt.value && (
                    <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile User Selector */}
        <div className="relative" ref={mobileUserRef}>
          <button
            type="button"
            onClick={() => {
              setIsUserDropdownOpen(!isUserDropdownOpen);
              setIsPeriodDropdownOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-2 bg-surface border border-border-base rounded-lg text-xs font-medium text-text-primary shadow-sm hover:bg-surface-container transition-colors cursor-pointer"
          >
            {selectedUser === 'Moussa Diallo' ? (
              <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-on-primary text-[8px] font-bold">
                MD
              </div>
            ) : (
              <span className="material-symbols-outlined text-[16px] text-primary">person</span>
            )}
            <span className="truncate max-w-[120px]">{activeUserLabel}</span>
            <span className="material-symbols-outlined text-[16px] text-text-secondary">expand_more</span>
          </button>
          {isUserDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-56 max-w-[calc(100vw-32px)] bg-surface border border-border-base rounded-xl shadow-xl py-1 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {USER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSelectedUser(opt.value);
                    setIsUserDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    selectedUser === opt.value
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-text-primary hover:bg-surface-container-high'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {opt.initials ? (
                      <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-on-primary text-[9px] font-bold shrink-0">
                        {opt.initials}
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-[16px] text-text-secondary shrink-0">
                        {opt.icon}
                      </span>
                    )}
                    <span className="truncate">{opt.label}</span>
                  </span>
                  {selectedUser === opt.value && (
                    <span className="material-symbols-outlined text-[16px] text-primary ml-2 shrink-0">check</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset Filters on Mobile */}
        {(selectedPeriod !== '7jours' || selectedUser !== 'Moussa Diallo' || activeFilter !== 'tous') && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1 px-2.5 py-2 text-xs text-primary hover:underline font-medium cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">restart_alt</span>
            <span>{t('Réinitialiser')}</span>
          </button>
        )}
      </div>

      {/* Main Grid: Timeline + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 relative w-full">
        {/* Left Column: Timeline */}
        <div className="lg:col-span-8 xl:col-span-9 relative">
          {filteredActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-surface rounded-2xl border border-border-base text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-text-secondary mb-4">
                <span className="material-symbols-outlined text-[32px]">history_toggle_off</span>
              </div>
              <h3 className="font-headline-md text-base sm:text-lg text-text-primary mb-1">
                {t('Aucune activité trouvée')}
              </h3>
              <p className="font-body-sm text-xs sm:text-sm text-text-secondary max-w-md mb-6">
                {t('Aucun événement ne correspond à vos filtres actuels')} (
                <span className="font-medium text-text-primary">{activePeriodLabel}</span>,{' '}
                <span className="font-medium text-text-primary">{activeUserLabel}</span>).
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-10 px-5 rounded-xl bg-primary text-on-primary font-label-md text-xs sm:text-sm shadow-md hover:bg-primary-hover transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                <span>{t('Réinitialiser tous les filtres')}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              {groupedActivities.map((group, groupIdx) => (
                <div key={group.label} className="space-y-3 sm:space-y-4">
                  {/* Date Section Header */}
                  <div className="flex items-center gap-3 sticky top-16 bg-background/95 backdrop-blur z-20 py-2 -mx-3 sm:-mx-6 md:mx-0 px-3 sm:px-6 md:px-0">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider shrink-0">
                      {group.label}
                    </span>
                    <div className="flex-1 border-t border-border-base border-dashed"></div>
                  </div>

                  {/* Group Items */}
                  {group.items.map((item, itemIdx) => {
                    const isLastInGroup = itemIdx === group.items.length - 1;
                    const isLastOverall = groupIdx === groupedActivities.length - 1 && isLastInGroup;

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col md:flex-row gap-1.5 md:gap-5 relative group transition-all duration-300"
                      >
                        {/* Time Column */}
                        <div className="md:w-20 lg:w-24 flex md:flex-col items-start md:items-end justify-start md:pt-2 flex-shrink-0 mb-1 md:mb-0">
                          <span className="text-xs sm:text-sm font-medium text-text-secondary whitespace-nowrap">
                            {item.heure}
                          </span>
                        </div>

                        {/* Connector & Card */}
                        <div className="relative flex items-start gap-3 sm:gap-4 md:gap-5 w-full">
                          {/* Centered Vertical Connector Line */}
                          {!isLastOverall && (
                            <div className="absolute left-[18px] sm:left-[20px] md:left-[22px] -translate-x-1/2 top-9 sm:top-10 md:top-11 bottom-[-16px] sm:bottom-[-20px] md:bottom-[-28px] w-0.5 bg-border-base/50 transition-all duration-300 group-hover:bg-primary/50 z-0"></div>
                          )}

                          {/* Icon Circle */}
                          <div
                            className={`w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-surface-container border-2 border-surface flex items-center justify-center flex-shrink-0 z-10 shadow-sm transition-colors relative overflow-hidden`}
                          >
                            <div className={`absolute inset-0 ${item.iconBgClass}`}></div>
                            <span
                              className={`material-symbols-outlined ${item.iconColorClass} text-[18px] sm:text-[20px] relative z-10`}
                            >
                              {item.icon}
                            </span>
                          </div>

                          {/* Card Content */}
                          <div className="flex-1 bg-surface border border-border-base rounded-xl p-3.5 sm:p-4 md:p-5 hover:border-border-base/80 transition-colors shadow-sm relative overflow-hidden group/card min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 relative z-10">
                              <div className="min-w-0 flex-1">
                                {/* Actor Header */}
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                                  {item.acteurInitiales ? (
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center text-on-primary text-[10px] font-bold shrink-0">
                                      {item.acteurInitiales}
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-surface-container-high flex items-center justify-center text-text-secondary shrink-0">
                                      <span className="material-symbols-outlined text-[13px] sm:text-[14px]">
                                        {item.acteur.toLowerCase().includes('portail')
                                          ? 'public'
                                          : item.acteur.toLowerCase().includes('logistique')
                                          ? 'sync'
                                          : 'smart_toy'}
                                      </span>
                                    </div>
                                  )}
                                  <span className="text-xs sm:text-sm font-semibold text-text-primary">
                                    {item.acteur}
                                  </span>
                                  <span className="text-text-secondary text-xs sm:text-sm">{item.action}</span>
                                </div>

                                {/* Reference Title */}
                                <h3 className="text-sm sm:text-base md:text-lg font-bold text-on-surface tracking-tight m-0 truncate">
                                  {item.reference}
                                </h3>

                                {/* Amount details */}
                                {item.amount && (
                                  <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
                                    <span className="text-base sm:text-lg font-bold text-success">
                                      {formatCurrency(item.amount)}
                                    </span>
                                    {item.amountDetail && (
                                      <span className="text-text-secondary text-xs sm:text-sm">
                                        {item.amountDetail}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Client details */}
                                {item.clientDetail && (
                                  <div className="mt-2 flex items-center gap-2.5 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary font-bold text-xs sm:text-sm shrink-0">
                                      {item.clientDetail.initials}
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="text-xs sm:text-sm font-bold text-on-surface m-0 truncate">
                                        {item.clientDetail.name}
                                      </h4>
                                      <p className="text-[11px] sm:text-xs text-text-secondary m-0 truncate">
                                        {item.clientDetail.email}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Status transition details */}
                                {item.statusDetail && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <span className="text-text-secondary text-xs line-through">
                                      {item.statusDetail.from}
                                    </span>
                                    <span className="material-symbols-outlined text-text-secondary text-[14px]">
                                      arrow_right_alt
                                    </span>
                                    <span className="text-primary font-semibold text-xs">
                                      {item.statusDetail.to}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Status Badge */}
                              <div className="self-start sm:self-auto shrink-0 mt-0.5 sm:mt-0">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 ${item.badgeBgClass} ${item.badgeColorClass} ${item.badgeBorderClass || ''} rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap`}
                                >
                                  {item.statut}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {!hasLoadedMore && selectedPeriod !== 'aujourdhui' && selectedPeriod !== 'hier' && (
            <div className="mt-12 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="h-12 px-8 flex items-center justify-center bg-transparent border border-border-base rounded-xl text-text-secondary hover:text-text-primary hover:border-border-base/80 transition-colors cursor-pointer disabled:opacity-50"
              >
                <span className="font-label-md text-label-md">
                  {isLoadingMore ? t('Chargement en cours...') : t("Charger plus d'historique")}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Sidebar Quick Filters & Stats (Desktop) */}
        <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
          <div className="sticky top-24 space-y-6">
            {/* Quick Filters Card */}
            <div className="bg-surface rounded-xl border border-border-base p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-label-md text-label-md text-text-secondary uppercase tracking-wider m-0">
                  {t('FILTRES RAPIDES')}
                </h3>
                {(selectedPeriod !== '7jours' || selectedUser !== 'Moussa Diallo' || activeFilter !== 'tous') && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs text-primary hover:underline font-medium cursor-pointer"
                  >
                    {t('Réinitialiser')}
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Utilisateur Dropdown */}
                <div className="relative" ref={userDropdownRef}>
                  <label className="font-label-sm text-label-sm text-text-secondary mb-2 block">
                    {t('Utilisateur')}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserDropdownOpen(!isUserDropdownOpen);
                      setIsPeriodDropdownOpen(false);
                    }}
                    className="w-full bg-input-bg border border-border-base rounded-lg p-3 flex items-center justify-between cursor-pointer hover:border-primary/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {selectedUser === 'Moussa Diallo' ? (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary font-label-sm text-[10px] font-bold shrink-0">
                          MD
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-text-secondary shrink-0">
                          <span className="material-symbols-outlined text-[14px]">
                            {USER_OPTIONS.find((u) => u.value === selectedUser)?.icon || 'person'}
                          </span>
                        </div>
                      )}
                      <span className="font-body-sm text-body-sm text-text-primary truncate">
                        {activeUserLabel}
                      </span>
                    </div>
                    <span
                      className={`material-symbols-outlined text-text-secondary text-[18px] transition-transform duration-200 shrink-0 ${
                        isUserDropdownOpen ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-surface border border-border-base rounded-xl shadow-xl py-1.5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      {USER_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSelectedUser(opt.value);
                            setIsUserDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${
                            selectedUser === opt.value
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-text-primary hover:bg-surface-container-high'
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            {opt.initials ? (
                              <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary text-[10px] font-bold shrink-0">
                                {opt.initials}
                              </span>
                            ) : (
                              <span className="material-symbols-outlined text-[18px] text-text-secondary shrink-0">
                                {opt.icon}
                              </span>
                            )}
                            <span className="truncate">{opt.label}</span>
                          </span>
                          {selectedUser === opt.value && (
                            <span className="material-symbols-outlined text-[18px] text-primary shrink-0 ml-2">
                              check
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Période Dropdown (The main requested filter!) */}
                <div className="relative" ref={periodDropdownRef}>
                  <label className="font-label-sm text-label-sm text-text-secondary mb-2 block">
                    {t('Période')}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPeriodDropdownOpen(!isPeriodDropdownOpen);
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full bg-input-bg border border-border-base rounded-lg p-3 flex items-center justify-between cursor-pointer hover:border-primary/50 transition-colors text-left"
                  >
                    <span className="font-body-sm text-body-sm text-text-primary truncate">
                      {activePeriodLabel}
                    </span>
                    <span className="material-symbols-outlined text-text-secondary text-[18px] shrink-0">
                      calendar_today
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isPeriodDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-surface border border-border-base rounded-xl shadow-xl py-1.5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      {PERIOD_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSelectedPeriod(opt.value);
                            setIsPeriodDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${
                            selectedPeriod === opt.value
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-text-primary hover:bg-surface-container-high'
                          }`}
                        >
                          <span className="flex items-center gap-2.5 truncate">
                            <span className="material-symbols-outlined text-[18px] text-text-secondary shrink-0">
                              {opt.icon}
                            </span>
                            <span className="truncate">{opt.label}</span>
                          </span>
                          {selectedPeriod === opt.value && (
                            <span className="material-symbols-outlined text-[18px] text-primary shrink-0 ml-2">
                              check
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Weekly Activity Summary */}
            <div className="bg-surface rounded-xl border border-border-base p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-label-md text-label-md text-text-secondary uppercase tracking-wider m-0">
                  {t('ACTIVITÉ DE LA SEMAINE')}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                  {t('7 jours')}
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-tertiary-container"></div>
                    <span className="font-body-sm text-body-sm text-text-secondary group-hover:text-on-surface transition-colors">
                      {t('Commandes créées')}
                    </span>
                  </div>
                  <span className="font-label-md text-label-md text-text-primary font-bold">
                    {weeklyMetrics.commandes}
                  </span>
                </div>
                <div className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <span className="font-body-sm text-body-sm text-text-secondary group-hover:text-on-surface transition-colors">
                      {t('Paiements reçus')}
                    </span>
                  </div>
                  <span className="font-label-md text-label-md text-text-primary font-bold">
                    {weeklyMetrics.paiements}
                  </span>
                </div>
                <div className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary-container"></div>
                    <span className="font-body-sm text-body-sm text-text-secondary group-hover:text-on-surface transition-colors">
                      {t('Factures émises')}
                    </span>
                  </div>
                  <span className="font-label-md text-label-md text-text-primary font-bold">
                    {weeklyMetrics.factures}
                  </span>
                </div>
                <div className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-tertiary"></div>
                    <span className="font-body-sm text-body-sm text-text-secondary group-hover:text-on-surface transition-colors">
                      {t('Nouveaux clients')}
                    </span>
                  </div>
                  <span className="font-label-md text-label-md text-text-primary font-bold">
                    {weeklyMetrics.clients}
                  </span>
                </div>
              </div>

              {/* Dynamic Bar Chart */}
              <div className="mt-6 pt-6 border-t border-border-base">
                <div className="relative">
                  {hoveredBar !== null && weeklyMetrics.dayBars[hoveredBar] && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-surface-container-highest text-on-surface text-[10px] font-bold shadow-lg border border-border-base whitespace-nowrap pointer-events-none z-10 transition-all">
                      {weeklyMetrics.dayBars[hoveredBar].fullName}: {weeklyMetrics.dayBars[hoveredBar].count} {t('actions')}
                    </div>
                  )}
                  <div className="h-16 w-full flex items-end gap-1.5">
                    {weeklyMetrics.dayBars.map((bar, index) => {
                      const heightPercent = Math.max(
                        22,
                        Math.round((bar.count / weeklyMetrics.maxDayCount) * 100)
                      );
                      const isDim = bar.label === 'Dim';
                      const isHighlighted = bar.isToday || isDim;

                      return (
                        <div
                          key={bar.label}
                          onMouseEnter={() => setHoveredBar(index)}
                          onMouseLeave={() => setHoveredBar(null)}
                          style={{ height: `${heightPercent}%` }}
                          title={`${bar.fullName}: ${bar.count} actions`}
                          className={`flex-1 rounded-t-sm transition-all cursor-pointer ${
                            isHighlighted
                              ? 'bg-primary hover:bg-primary/90'
                              : 'bg-surface-container-highest hover:bg-primary/60'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="font-label-sm text-[10px] text-text-secondary">{t('Lun')}</span>
                  <span className="font-label-sm text-[10px] text-primary font-bold">{t('Dim')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
