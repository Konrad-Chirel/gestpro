'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useStore, Facture } from '@/context/StoreContext';

export default function FactureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const factureId = String(params?.id || '');

  const {
    getFacture,
    markFactureAsPaid,
    showToast,
    factures,
    paiements,
    addPaiement,
    companySettings,
    formatCurrency,
    convertPrice,
    toBasePrice,
    currencySymbol,
    currencyCode,
    t,
  } = useStore();

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'virement' | 'carte' | 'cheque' | 'especes'>('virement');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Auto-print if ?print=true
  useEffect(() => {
    if (searchParams?.get('print') === 'true') {
      setIsPreviewOpen(true);
      const timer = setTimeout(() => {
        window.print();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Find dynamic invoice or fallback to default
  const foundFacture = getFacture?.(factureId) || factures?.find((f) => f.id === factureId || f.numero === factureId);
  
  const defaultFacture: Facture = {
    id: 'fac-2026-0038',
    numero: 'FAC-2026-0038',
    clientId: 'cli-001',
    statut: 'attente',
    articles: [
      { id: '1', description: 'Pack Riz Parfumé 25kg (x10)', quantity: 10, unitPrice: 2041.67 },
    ],
    totalHT: 20416.67,
    tva: 4083.33,
    totalTTC: 24500.00,
    resteDu: 24500.00,
    montantPaye: 0,
    dateEmission: '15/09/2026',
    dateEcheance: '15/10/2026',
    clientNom: 'Société Africaine de Commerce (SAC)',
    clientAdresse: 'Zone Industrielle de Yopougon, Abidjan, Côte d’Ivoire',
    clientEmail: 'comptabilite@sac-ci.com',
    clientSiret: 'CI-ABJ-2018-B-12458',
  };

  const facture = foundFacture || defaultFacture;

  const handleMarkAsPaid = () => {
    if (facture.id) {
      markFactureAsPaid(facture.id);
    }
    showToast('Facture marquée comme payée', 'success');
  };

  const handleOpenPaymentModal = () => {
    const convertedReste = convertPrice(facture.resteDu);
    setPaymentAmount(facture.resteDu > 0 ? (convertedReste % 1 === 0 ? String(convertedReste) : convertedReste.toFixed(2)) : '');
    setPaymentRef(`PAY-${Date.now().toString().slice(-6)}`);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentNotes('');
    setIsPaymentModalOpen(true);
  };
  const openPaymentModal = handleOpenPaymentModal;

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast(`Veuillez saisir un montant supérieur à 0 ${currencySymbol}.`, 'error');
      return;
    }
    const maxAmt = convertPrice(facture.resteDu);
    if (amt > maxAmt + 0.5) {
      showToast(`Le montant ne peut excéder le reste dû (${formatCurrency(facture.resteDu)}).`, 'error');
      return;
    }

    addPaiement({
      reference: paymentRef.trim() || `PAY-${Date.now().toString().slice(-6)}`,
      factureId: facture.id,
      factureNumero: facture.numero,
      clientId: facture.clientId || '',
      clientNom: facture.clientNom,
      montant: toBasePrice(amt),
      methode: paymentMethod,
      date: new Date(paymentDate).toLocaleDateString('fr-FR'),
      statut: 'reussi',
      notes: paymentNotes.trim() || `Règlement facture ${facture.numero}`,
    });

    setIsPaymentModalOpen(false);
    setPaymentNotes('');
  };

  const handleSendEmail = () => {
    showToast(`Facture ${facture.numero} transmise par email à ${facture.clientEmail || 'client@amadou.com'}`, 'success');
  };

  const handleDownloadPDF = () => {
    setIsPreviewOpen(true);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const percent = facture.totalTTC > 0 
    ? Math.min(100, Math.round((facture.montantPaye / facture.totalTTC) * 100))
    : 100;

  const invoicePayments = paiements?.filter(
    (p) => p.factureId === facture.id || p.factureNumero === facture.numero || p.factureId === facture.numero
  ) || [];

  return (
    <>
      <div className="flex flex-col w-full px-container-margin py-8 gap-8 print:hidden no-print">
        
        {/* Header */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-surface p-6 rounded-xl shadow-md">
          <div className="flex flex-row flex-nowrap items-center gap-2 md:gap-4 w-full xl:w-auto">
            <Link
              href="/dashboard/factures"
              className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high border border-border-base flex items-center justify-center text-text-primary transition-colors shrink-0 mr-1"
              title={t('Retour aux factures')}
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <h1 className="text-[18px] sm:font-headline-md md:font-headline-lg font-bold text-text-primary m-0 whitespace-nowrap">
              {facture.numero}
            </h1>
            {facture.statut === 'attente' && (
              <span className="bg-warning/15 text-warning font-label-sm px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap shrink-0">
                {t('En attente')}
              </span>
            )}
            {facture.statut === 'payee' && (
              <span className="bg-success/15 text-success font-label-sm px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap shrink-0">
                {t('Payée')}
              </span>
            )}
            {facture.statut === 'retard' && (
              <span className="bg-error/15 text-error font-label-sm px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap shrink-0">
                {t('En retard')}
              </span>
            )}
            {facture.statut === 'annulee' && (
              <span className="bg-surface-container-highest text-text-secondary font-label-sm px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap shrink-0">
                {t('Annulée')}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <button 
              type="button"
              onClick={handleDownloadPDF}
              className="flex-1 xl:flex-none h-10 px-4 sm:px-5 flex items-center justify-center gap-2 font-label-md text-text-primary border border-border-base rounded-full hover:bg-surface-container-high transition-colors whitespace-nowrap cursor-pointer"
            >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span className="hidden sm:inline">{t('Télécharger PDF')}</span>
            <span className="sm:hidden">PDF</span>
          </button>
          <button 
            type="button"
            onClick={handleSendEmail}
            className="flex-1 xl:flex-none h-10 px-4 sm:px-5 flex items-center justify-center gap-2 font-label-md text-text-primary border border-border-base rounded-full hover:bg-surface-container-high transition-colors whitespace-nowrap cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">mail</span>
            <span className="hidden sm:inline">{t('Envoyer par email')}</span>
            <span className="sm:hidden">Email</span>
          </button>
          <button 
            type="button"
            onClick={handleMarkAsPaid}
            disabled={facture.statut === 'payee'}
            className={`w-full xl:w-auto h-10 px-4 sm:px-6 grid grid-cols-[18px_1fr_18px] items-center gap-2 font-label-md rounded-full shadow-md transition-colors whitespace-nowrap cursor-pointer ${
              facture.statut === 'payee'
                ? 'bg-success/20 text-success cursor-default'
                : 'text-on-primary bg-primary hover:bg-primary-hover'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            <span className="text-center">{facture.statut === 'payee' ? t('Facture Payée') : t('Marquer payée')}</span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* Document Preview Thumbnail */}
        <div className="xl:col-span-2 flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between mb-4">
            <h2 className="font-label-lg text-text-secondary m-0">{t('Aperçu du document')}</h2>
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="text-xs text-primary hover:text-primary-hover font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-surface-container px-3.5 py-1.5 rounded-full border border-border-base hover:bg-surface-container-high"
            >
              <span className="material-symbols-outlined text-[16px]">fullscreen</span>
              <span>{t('Plein écran')}</span>
            </button>
          </div>

          <div 
            onClick={() => setIsPreviewOpen(true)}
            className="group relative w-full max-w-[500px] bg-white text-[#131313] rounded-xl shadow-lg border border-border-base cursor-pointer overflow-hidden p-4 sm:p-6 flex flex-col text-xs transition-all duration-200 hover:shadow-2xl hover:border-primary/40 select-none"
            title={t('Cliquer pour afficher en plein écran')}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#eee] mb-3">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary-container rounded flex items-center justify-center text-on-primary-container shrink-0">
                  <span className="material-symbols-outlined text-[18px] sm:text-[20px]">description</span>
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm sm:text-base text-primary-container tracking-tight leading-none">GestPro</div>
                  <div className="text-[#666] text-[9px] sm:text-[10px] mt-0.5 truncate">{t('Solutions de gestion')}</div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-sm sm:text-base text-[#131313] uppercase tracking-wider leading-none">{t('Facture')}</div>
                <div className="text-[#666] text-[10px] sm:text-[11px] font-medium mt-0.5 whitespace-nowrap">{companySettings.language === 'en' ? 'Invoice #' : 'N°'} {facture.numero}</div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 text-[10px] sm:text-[11px]">
              <div>
                <div className="text-[#888] font-bold uppercase text-[8px] sm:text-[9px] mb-0.5">{t('Émetteur')}</div>
                <div className="font-semibold text-[#131313] leading-tight">{companySettings?.companyName || 'GestPro S.A.S'}</div>
                <div className="text-[#666] text-[9px] sm:text-[10px] leading-tight mt-0.5">
                  {companySettings?.address || '15 Ave. des Champs-Élysées'}<br/>
                  {companySettings?.zip || '75008'} {companySettings?.city || 'Paris'}<br/>
                  TVA : {companySettings?.tva || 'FR 12 345678901'}
                </div>
              </div>
              <div className="bg-[#f7f7f7] p-2 sm:p-2.5 rounded border border-[#eee] min-w-0">
                <div className="text-[#888] font-bold uppercase text-[8px] sm:text-[9px] mb-0.5">{t('Facturé à')}</div>
                <div className="font-semibold text-[#131313] leading-tight truncate">{facture.clientNom}</div>
                <div className="text-[#666] text-[9px] sm:text-[10px] leading-tight mt-0.5">
                  Zone Industrielle Sud, Lot 42<br/>
                  BP 1234 Dakar, Sénégal<br/>
                  NINEA : 001234567 2B2
                </div>
              </div>
            </div>

            {/* Dates Bar */}
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-[#eee] text-[10px] sm:text-[11px]">
              <div className="flex gap-4 sm:gap-6">
                <div>
                  <span className="text-[#888] block text-[8px] sm:text-[9px] uppercase font-semibold">{t("Date d'émission")}</span>
                  <span className="font-medium text-[#131313] whitespace-nowrap">{facture.dateEmission}</span>
                </div>
                <div>
                  <span className="text-[#888] block text-[8px] sm:text-[9px] uppercase font-semibold">{t('Échéance')}</span>
                  <span className="font-medium text-[#131313] whitespace-nowrap">{facture.dateEcheance}</span>
                </div>
              </div>
              <div className="flex items-center">
                {facture.statut === 'payee' && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success/15 text-success whitespace-nowrap">{t('Payée')}</span>
                )}
                {facture.statut === 'retard' && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-error/15 text-error whitespace-nowrap">{t('En retard')}</span>
                )}
                {facture.statut === 'attente' && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-warning/15 text-warning whitespace-nowrap">{t('En attente')}</span>
                )}
                {facture.statut === 'annulee' && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 whitespace-nowrap">{t('Annulée')}</span>
                )}
              </div>
            </div>

            {/* Articles Table */}
            <div className="mb-3 overflow-hidden">
              <table className="w-full text-left text-[10px] sm:text-[11px] table-fixed">
                <thead>
                  <tr className="border-b border-[#131313] text-[9px] sm:text-[10px] font-semibold text-[#131313]">
                    <th className="py-1">{t('Description')}</th>
                    <th className="py-1 text-center w-8 sm:w-12">{t('Qté')}</th>
                    <th className="py-1 text-right w-20 hidden sm:table-cell">{t('Prix Unit.')}</th>
                    <th className="py-1 text-right w-20 sm:w-24">{t('Total HT')}</th>
                  </tr>
                </thead>
                <tbody className="text-[#555]">
                  {(facture.articles && facture.articles.length > 0 ? facture.articles : [
                    { id: '1', description: 'Farine de Blé', quantity: 10, unitPrice: 35.00 },
                    { id: '2', description: "Huile d'Arachide", quantity: 15, unitPrice: 42.00 },
                  ]).map((art: any, idx: number) => (
                    <tr key={art.id || idx} className="border-b border-[#f0f0f0]">
                      <td className="py-1.5 font-medium text-[#131313] truncate pr-2">{art.description}</td>
                      <td className="py-1.5 text-center text-[#666]">{art.quantity}</td>
                      <td className="py-1.5 text-right hidden sm:table-cell text-[#666]">
                        {formatCurrency(Number(art.unitPrice))}
                      </td>
                      <td className="py-1.5 text-right font-medium text-[#131313] whitespace-nowrap">
                        {formatCurrency(Number(art.quantity) * Number(art.unitPrice))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-3">
              <div className="w-full sm:w-3/5 md:w-1/2 text-[10px] sm:text-[11px]">
                <div className="flex justify-between py-0.5 text-[#666]">
                  <span>{t('Total Hors Taxes (HT)')}</span>
                  <span className="text-[#131313] font-medium whitespace-nowrap">
                    {formatCurrency(facture.totalHT || (facture.totalTTC / 1.2))}
                  </span>
                </div>
                <div className="flex justify-between py-0.5 text-[#666]">
                  <span>{t('TVA (20%)')}</span>
                  <span className="text-[#131313] font-medium whitespace-nowrap">
                    {formatCurrency(facture.tva || (facture.totalTTC - (facture.totalTTC / 1.2)))}
                  </span>
                </div>
                <div className="flex justify-between items-baseline py-1.5 border-t border-[#131313] mt-1 font-semibold">
                  <span className="text-[#131313] whitespace-nowrap">{t('Net à Payer (TTC)')}</span>
                  <span className="text-[#131313] text-xs sm:text-sm font-bold whitespace-nowrap">
                    {formatCurrency(facture.totalTTC)}
                  </span>
                </div>

                {/* Montant réglé & Solde restant dû if resteDu > 0 */}
                {facture.resteDu > 0 && (
                  <div className="space-y-1 mt-1.5">
                    {facture.montantPaye > 0 && (
                      <div className="flex justify-between items-center py-1 px-2 bg-[#f0fdf4] text-[#16a34a] rounded text-[9px] sm:text-[10px] font-semibold">
                        <span>{t('Montant réglé')}</span>
                        <span className="font-bold whitespace-nowrap">{formatCurrency(facture.montantPaye)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-1 px-2 bg-[#fef9c3] text-[#854d0e] rounded text-[9px] sm:text-[10px] font-bold">
                      <span>{t('Solde restant dû')}</span>
                      <span className="font-extrabold whitespace-nowrap">{formatCurrency(facture.resteDu)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Remarques */}
            <div className="p-2 sm:p-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-[9px] sm:text-[10px] text-[#4b5563] mb-3">
              <span className="font-bold text-[#111827]">{t('Remarques : ')}</span>
              {t('Paiement à 30 jours fin de mois.')}
            </div>

            {/* Footer */}
            <div className="mt-auto pt-2 border-t border-[#eee] text-center text-[8px] text-[#999]">
              {companySettings?.companyName || 'GestPro S.A.S'} - {companySettings?.address || '15 Ave. des Champs-Élysées'} {companySettings?.zip || '75008'} {companySettings?.city || 'Paris'} - {t('Document officiel')}
            </div>
          </div>
        </div>

        {/* Right Column: Summaries & Actions */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          {/* Summary Card */}
          <div className="bg-surface p-6 rounded-xl shadow-md border border-border-base relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-warning/10 rounded-full blur-2xl"></div>
            <h3 className="font-headline-md text-text-primary mb-6">{t('État des Paiements')}</h3>
            <div className="flex justify-between items-end mb-4">
              <span className="text-text-secondary font-body-sm">{t('Total Facture')}</span>
              <span className="font-label-md text-text-primary">
                {formatCurrency(facture.totalTTC)}
              </span>
            </div>
            <div className="flex justify-between items-end mb-4">
              <span className="text-text-secondary font-body-sm">{t('Montant Payé')}</span>
              <span className="font-label-md text-success">
                {formatCurrency(facture.montantPaye)}
              </span>
            </div>
            <div className="w-full bg-surface-container-high h-2 rounded-full mb-6 overflow-hidden">
              <div 
                className="bg-warning h-full rounded-full transition-all duration-300" 
                style={{ width: `${percent}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-border-base">
              <span className="text-text-secondary font-body-sm">{t('Reste à payer')}</span>
              <span className="font-headline-lg text-warning whitespace-nowrap">
                {formatCurrency(facture.resteDu)}
              </span>
            </div>
          </div>
          
          {/* Payment History */}
          <div className="bg-surface p-6 rounded-xl shadow-md border border-border-base">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-text-primary">{t('Historique')}</h3>
              <button 
                type="button" 
                onClick={handleOpenPaymentModal}
                disabled={facture.statut === 'payee'}
                className={`font-label-md flex items-center gap-1 transition-colors cursor-pointer ${
                  facture.statut === 'payee'
                    ? 'text-text-secondary opacity-40 cursor-not-allowed'
                    : 'text-primary hover:text-primary-hover'
                }`}
                title={facture.statut === 'payee' ? t('Facture déjà intégralement réglée') : t('Enregistrer un nouveau règlement')}
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                {t('Nouveau')}
              </button>
            </div>
            <div className="space-y-4">
              {invoicePayments.length > 0 ? (
                invoicePayments.map((pay) => (
                  <div key={pay.id} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-success text-[16px]">payments</span>
                    </div>
                    <div>
                      <div className="font-label-md text-text-primary">{t('Paiement reçu')}</div>
                      <div className="font-body-sm text-text-secondary">
                        {pay.methode === 'virement' ? t('Virement bancaire') : pay.methode === 'carte' ? t('Carte bancaire') : pay.methode === 'cheque' ? t('Chèque') : t('Espèces')} - {formatCurrency(pay.montant)}
                      </div>
                      <div className="text-[12px] text-text-secondary mt-1">{pay.date}</div>
                    </div>
                  </div>
                ))
              ) : facture.montantPaye > 0 ? (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-success text-[16px]">payments</span>
                  </div>
                  <div>
                    <div className="font-label-md text-text-primary">{t('Paiement reçu')}</div>
                    <div className="font-body-sm text-text-secondary">
                      {t('Virement bancaire')} - {formatCurrency(facture.montantPaye)}
                    </div>
                    <div className="text-[12px] text-text-secondary mt-1">{facture.dateEmission}</div>
                  </div>
                </div>
              ) : null}
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[16px]">mail</span>
                </div>
                <div>
                  <div className="font-label-md text-text-primary">{t('Facture envoyée')}</div>
                  <div className="font-body-sm text-text-secondary">
                    {t('Par email à')} {facture.clientEmail || 'client@amadou.com'}
                  </div>
                  <div className="text-[12px] text-text-secondary mt-1">{facture.dateEmission}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      </div>

      {/* A4 Modal & Print View */}
      <div 
        className={
          isPreviewOpen
            ? 'fixed inset-0 bg-background/90 backdrop-blur-md z-[100] overflow-y-auto print:static print:inset-auto print:bg-white print:p-0 print:overflow-visible print:z-auto print:backdrop-blur-none print:w-full print:h-auto'
            : 'hidden print:block print:static print:inset-auto print:bg-white print:p-0 print:overflow-visible print:z-auto print:backdrop-blur-none print:w-full print:h-auto'
        }
      >
        <div className="min-h-full flex flex-col items-center justify-start py-4 sm:py-8 px-2 sm:px-8 print:p-0 print:m-0 print:min-h-0 print:block print:w-full animate-in fade-in zoom-in-95 duration-200">
          
          {/* Modal Actions Header */}
          <div className="w-full max-w-4xl flex justify-between items-center mb-4 sm:mb-6 z-10 sticky top-0 bg-background/90 backdrop-blur-md py-3 sm:py-4 px-2 sm:px-0 rounded-b-xl print:hidden no-print">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button 
                type="button"
                onClick={() => window.print()}
                className="h-9 sm:h-10 px-3.5 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 font-label-md text-text-primary bg-surface border border-border-base rounded-full shadow-md hover:bg-surface-container-high transition-colors cursor-pointer text-xs sm:text-sm"
              >
                <span className="material-symbols-outlined text-[16px] sm:text-[18px]">download</span>
                <span className="hidden sm:inline">{t('Télécharger PDF')}</span>
                <span className="sm:hidden">PDF</span>
              </button>
              <button 
                type="button"
                onClick={() => window.print()}
                className="h-9 sm:h-10 px-3.5 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 font-label-md text-text-primary bg-surface border border-border-base rounded-full shadow-md hover:bg-surface-container-high transition-colors cursor-pointer text-xs sm:text-sm"
              >
                <span className="material-symbols-outlined text-[16px] sm:text-[18px]">print</span>
                <span className="hidden sm:inline">{t('Imprimer')}</span>
                <span className="sm:hidden">{t('Imprimer')}</span>
              </button>
            </div>
            <button 
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="w-9 h-9 sm:w-12 sm:h-12 bg-surface text-text-primary rounded-full shadow-lg border border-border-base flex items-center justify-center hover:bg-surface-container-high hover:text-error transition-colors shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">close</span>
            </button>
          </div>

          {/* The Actual A4 Paper */}
          <div 
            id="printable-invoice"
            className="bg-[#FFFFFF] text-[#131313] w-full max-w-4xl p-4 sm:p-10 md:p-12 lg:p-[20mm] print:p-0 print:m-0 print:w-full print:max-w-none print:shadow-none print:rounded-none print:border-none shadow-2xl flex flex-col font-body-sm aspect-auto md:aspect-[1/1.414] print:aspect-auto rounded-md overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-start gap-3 mb-6 sm:mb-8 md:mb-12 print:mb-5">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-container rounded flex items-center justify-center text-on-primary-container shrink-0">
                  <span className="material-symbols-outlined text-[20px] sm:text-[24px]">description</span>
                </div>
                <div className="min-w-0">
                  <div className="text-base sm:text-xl md:text-2xl font-bold text-primary-container tracking-tight leading-tight">GestPro</div>
                  <div className="text-[#4a4949] text-[10px] sm:text-xs md:text-sm truncate">{t('Solutions de gestion')}</div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xl sm:text-3xl md:text-4xl font-extrabold print:text-3xl text-[#131313] uppercase tracking-tight leading-none mb-1">{t('Facture')}</div>
                <div className="text-xs sm:text-sm font-semibold text-[#4a4949] whitespace-nowrap">{companySettings.language === 'en' ? 'Invoice #' : 'N°'} {facture.numero}</div>
              </div>
            </div>
            
            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4 sm:gap-8 print:gap-6 mb-6 sm:mb-12 print:mb-5">
              {/* Emetteur */}
              <div>
                <div className="text-[10px] sm:text-xs uppercase font-bold text-[#888] mb-1 sm:mb-2 print:mb-1">{t('Émetteur')}</div>
                <div className="font-bold sm:font-semibold text-sm sm:text-base text-[#131313]">{companySettings?.companyName || 'GestPro S.A.S'}</div>
                <div className="text-[#4a4949] mt-0.5 sm:mt-1 print:mt-0.5 leading-relaxed text-xs sm:text-sm">
                  {companySettings?.address || '15 Avenue des Champs-Élysées'}<br/>
                  {companySettings?.zip || '75008'} {companySettings?.city || 'Paris'}<br/>
                  TVA : {companySettings?.tva || 'FR 12 345678901'}
                </div>
              </div>
              {/* Client */}
              <div className="bg-[#f5f5f5] p-3 sm:p-4 print:p-3 rounded">
                <div className="text-[10px] sm:text-xs uppercase font-bold text-[#888] mb-1 sm:mb-2 print:mb-1">{t('Facturé à')}</div>
                <div className="text-base sm:text-lg md:text-xl font-bold text-[#131313] mb-0.5 sm:mb-1 print:mb-0.5 leading-tight">{facture.clientNom}</div>
                <div className="text-[#4a4949] text-xs sm:text-sm leading-relaxed">
                  Zone Industrielle Sud, Lot 42<br/>
                  BP 1234 Dakar, Sénégal<br/>
                  NINEA : 001234567 2B2
                </div>
              </div>
            </div>
            
            {/* Dates */}
            <div className="flex flex-wrap sm:flex-nowrap gap-6 sm:gap-12 mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-[#ddd] print:mb-4 print:pb-2">
              <div>
                <div className="text-[10px] sm:text-xs uppercase font-bold text-[#888]">{t('Date de facturation')}</div>
                <div className="text-xs sm:text-sm font-semibold text-[#131313] mt-0.5 sm:mt-1">{facture.dateEmission}</div>
              </div>
              <div>
                <div className="text-[10px] sm:text-xs uppercase font-bold text-[#888]">{t('Échéance')}</div>
                <div className="text-xs sm:text-sm font-semibold text-[#131313] mt-0.5 sm:mt-1">{facture.dateEcheance}</div>
              </div>
            </div>
            
            {/* Articles Table */}
            <div className="mb-8 sm:mb-12 print:mb-5 flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-full print:min-w-0 text-xs sm:text-sm">
                <thead>
                  <tr className="border-b-2 border-[#131313]">
                    <th className="py-2.5 sm:py-3 print:py-1.5 font-bold text-[#131313]">{t('Description')}</th>
                    <th className="py-2.5 sm:py-3 print:py-1.5 font-bold text-[#131313] text-center w-10 sm:w-20 whitespace-nowrap">{t('Qté')}</th>
                    <th className="py-2.5 sm:py-3 print:py-1.5 font-bold text-[#131313] text-right w-16 sm:w-28 whitespace-nowrap">{t('Prix Unit.')}</th>
                    <th className="py-2.5 sm:py-3 print:py-1.5 font-bold text-[#131313] text-right w-20 sm:w-32 whitespace-nowrap">{t('Total HT')}</th>
                  </tr>
                </thead>
                <tbody className="text-[#4a4949]">
                  {facture.articles && facture.articles.length > 0 ? (
                    facture.articles.map((art: any, idx: number) => (
                      <tr key={art.id || idx} className="border-b border-[#eee]">
                        <td className="py-2.5 sm:py-4 print:py-2 pr-2">
                          <div className="font-semibold text-[#131313] leading-snug">{art.description}</div>
                          {art.details && <div className="text-[10px] sm:text-[12px] text-[#777] mt-0.5 leading-snug">{art.details}</div>}
                        </td>
                        <td className="py-2.5 sm:py-4 print:py-2 text-center whitespace-nowrap">{art.quantity}</td>
                        <td className="py-2.5 sm:py-4 print:py-2 text-right whitespace-nowrap">
                          {formatCurrency(Number(art.unitPrice))}
                        </td>
                        <td className="py-2.5 sm:py-4 print:py-2 text-right font-bold text-[#131313] whitespace-nowrap">
                          {formatCurrency(Number(art.quantity) * Number(art.unitPrice))}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr className="border-b border-[#eee]">
                        <td className="py-2.5 sm:py-4 print:py-2 pr-2">
                          <div className="font-semibold text-[#131313] leading-snug">Farine de Blé</div>
                          <div className="text-[10px] sm:text-[12px] text-[#777] mt-0.5 leading-snug">Sac de 50kg, Qualité Extra</div>
                        </td>
                        <td className="py-2.5 sm:py-4 print:py-2 text-center whitespace-nowrap">10</td>
                        <td className="py-2.5 sm:py-4 print:py-2 text-right whitespace-nowrap">{formatCurrency(35)}</td>
                        <td className="py-2.5 sm:py-4 print:py-2 text-right font-bold text-[#131313] whitespace-nowrap">{formatCurrency(350)}</td>
                      </tr>
                      <tr className="border-b border-[#eee]">
                        <td className="py-2.5 sm:py-4 print:py-2 pr-2">
                          <div className="font-semibold text-[#131313] leading-snug">Huile d'Arachide</div>
                          <div className="text-[10px] sm:text-[12px] text-[#777] mt-0.5 leading-snug">Bidon de 20L</div>
                        </td>
                        <td className="py-2.5 sm:py-4 print:py-2 text-center whitespace-nowrap">15</td>
                        <td className="py-2.5 sm:py-4 print:py-2 text-right whitespace-nowrap">{formatCurrency(42)}</td>
                        <td className="py-2.5 sm:py-4 print:py-2 text-right font-bold text-[#131313] whitespace-nowrap">{formatCurrency(630)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Totals */}
            <div className="flex justify-end mb-6 sm:mb-12 print:mb-4">
              <div className="w-full sm:w-3/5 md:w-1/2 print:w-[55%] text-xs sm:text-sm">
                <div className="flex justify-between py-1.5 sm:py-2 print:py-1 text-[#4a4949]">
                  <span>{t('Total Hors Taxes (HT)')}</span>
                  <span className="font-semibold text-[#131313] whitespace-nowrap">
                    {formatCurrency(facture.totalHT || (facture.totalTTC / 1.2))}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 sm:py-2 print:py-1 text-[#4a4949]">
                  <span>{t('TVA (20%)')}</span>
                  <span className="font-semibold text-[#131313] whitespace-nowrap">
                    {formatCurrency(facture.tva || (facture.totalTTC - (facture.totalTTC / 1.2)))}
                  </span>
                </div>
                <div className="flex justify-between items-baseline py-2 sm:py-4 print:py-2 border-t-2 border-[#131313] mt-2 gap-4">
                  <span className="font-bold text-[#131313] whitespace-nowrap text-base sm:text-xl print:text-lg">
                    {t('Net à Payer (TTC)')}
                  </span>
                  <span className="text-xl sm:text-3xl print:text-2xl font-extrabold text-[#131313] whitespace-nowrap tracking-tight">
                    {formatCurrency(facture.totalTTC)}
                  </span>
                </div>

                {/* Montant réglé & Solde restant dû if resteDu > 0 */}
                {facture.resteDu > 0 && (
                  <div className="space-y-1.5 print:space-y-1 mt-2.5 print:mt-1.5">
                    {facture.montantPaye > 0 && (
                      <div className="flex justify-between items-center py-1.5 sm:py-2 print:py-1.5 px-3 bg-[#f0fdf4] text-[#16a34a] rounded-md font-semibold text-xs sm:text-sm print:text-xs">
                        <span>{t('Montant réglé')}</span>
                        <span className="font-bold whitespace-nowrap">
                          {formatCurrency(facture.montantPaye)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-1.5 sm:py-2 print:py-1.5 px-3 bg-[#fef9c3] text-[#854d0e] rounded-md font-bold text-xs sm:text-sm print:text-xs">
                      <span>{t('Solde restant dû')}</span>
                      <span className="font-extrabold text-sm sm:text-base print:text-sm whitespace-nowrap">
                        {formatCurrency(facture.resteDu)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Remarques box */}
            <div className="mb-4 sm:mb-6 print:mb-3 p-2.5 sm:p-3 print:p-2 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-xs print:text-[11px] text-[#4b5563]">
              <span className="font-bold text-[#111827]">{t('Remarques : ')}</span>
              {t('Paiement à 30 jours fin de mois.')}
            </div>
            
            {/* Footer */}
            <div className="mt-auto pt-6 sm:pt-8 print:pt-4 border-t border-[#ddd] text-center text-[9px] sm:text-[10px] text-[#888] print:text-[9px] leading-relaxed">
              {companySettings?.companyName || 'GestPro S.A.S'} {t('au capital de')} 10 000 € - SIRET : {companySettings?.siret || '123 456 789 00012'} - NAF : 6201Z<br/>
              {t("En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée.")}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Registration Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[120] flex items-center justify-center p-4 animate-in fade-in duration-150 no-print">
          <div className="bg-surface border border-border-base rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-on-surface">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-text-primary m-0">
                  {t('Enregistrer un règlement')}
                </h3>
                <p className="text-text-secondary text-xs mt-1">
                  {t('Facture')} {facture.numero} • {facture.clientNom}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Badges recap */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-surface-container rounded-xl mb-5 text-xs border border-border-base">
              <div>
                <span className="text-text-secondary block text-[11px]">{t('Déjà réglé :')}</span>
                <span className="font-semibold text-success text-sm">
                  {formatCurrency(facture.montantPaye)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-text-secondary block text-[11px]">{t('Reste à payer :')}</span>
                <span className="font-bold text-warning text-sm">
                  {formatCurrency(facture.resteDu)}
                </span>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">
                  {t('Montant du règlement')} ({currencySymbol})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={currencyCode === 'XOF' ? '1' : '0.01'}
                    min="0.01"
                    max={convertPrice(facture.resteDu)}
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full bg-input-bg border border-border-base rounded-xl px-4 py-2.5 text-text-primary font-medium focus:border-primary focus:outline-none text-sm"
                    placeholder="0.00"
                    autoFocus
                  />
                  <span className="absolute right-4 top-2.5 text-text-secondary text-sm">{currencySymbol}</span>
                </div>
                {facture.resteDu > 0 && (
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const amt = convertPrice(facture.resteDu);
                        setPaymentAmount(amt % 1 === 0 ? String(amt) : amt.toFixed(2));
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-primary border border-primary/30 transition-colors cursor-pointer"
                    >
                      {t('Tout régler')} ({formatCurrency(facture.resteDu)})
                    </button>
                    {facture.resteDu > 20 && (
                      <button
                        type="button"
                        onClick={() => {
                          const amt = convertPrice(facture.resteDu / 2);
                          setPaymentAmount(amt % 1 === 0 ? String(amt) : amt.toFixed(2));
                        }}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-text-secondary transition-colors cursor-pointer"
                      >
                        50% ({formatCurrency(facture.resteDu / 2)})
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">
                  {t('Mode de paiement')}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-input-bg border border-border-base rounded-xl px-4 py-2.5 text-text-primary text-sm focus:border-primary focus:outline-none cursor-pointer"
                >
                  <option value="virement">{t('Virement bancaire')}</option>
                  <option value="carte">{t('Carte bancaire')}</option>
                  <option value="cheque">{t('Chèque')}</option>
                  <option value="especes">{t('Espèces')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">
                  {t('Date du règlement')}
                </label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-input-bg border border-border-base rounded-xl px-4 py-2.5 text-text-primary text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">
                  {t('Notes / Référence (optionnel)')}
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Ex: Virement reçu Réf. 48291"
                  className="w-full bg-input-bg border border-border-base rounded-xl px-4 py-2.5 text-text-primary text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border-base">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary rounded-full hover:bg-surface-container transition-colors cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-on-primary bg-primary hover:bg-primary-hover rounded-full shadow-md transition-colors cursor-pointer"
                >
                  {t('Valider le règlement')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
