'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';

interface InvoiceRow {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function NouvelleFacturePage() {
  const router = useRouter();
  const { clients, commandes, addFacture, showToast, isHydrated, formatCurrency, currencySymbol, t } = useStore();

  const getTodayISO = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  const getDueDateISO = (days = 30) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  const [selectedCommandeId, setSelectedCommandeId] = useState('');
  const [numCommande, setNumCommande] = useState('');

  const [dateEmission, setDateEmission] = useState(getTodayISO());
  const [dateEcheance, setDateEcheance] = useState(getDueDateISO(30));
  const [notes, setNotes] = useState('Paiement à réception par virement bancaire ou carte.');

  const [sendEmail, setSendEmail] = useState(true);
  const [markPaid, setMarkPaid] = useState(false);

  const [rows, setRows] = useState<InvoiceRow[]>([
    { id: '1', description: 'Fourniture et prestations de services', quantity: 1, unitPrice: 450.0 },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected client object
  const selectedClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId);
  }, [clients, selectedClientId]);

  // Filtered clients for quick search
  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients;
    const q = clientSearch.toLowerCase().trim();
    return clients.filter(
      (c) =>
        c.nom.toLowerCase().includes(q) ||
        c.prenom.toLowerCase().includes(q) ||
        c.entreprise.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [clients, clientSearch]);

  // Orders available for selection
  const relevantCommandes = useMemo(() => {
    if (selectedClientId) {
      return commandes.filter((c) => c.clientId === selectedClientId);
    }
    return commandes;
  }, [commandes, selectedClientId]);

  // Handle client selection
  const handleSelectClient = (clientId: string) => {
    const c = clients.find((item) => item.id === clientId);
    if (c) {
      setSelectedClientId(c.id);
      setClientSearch(`${c.prenom} ${c.nom} (${c.entreprise})`);
      setIsClientDropdownOpen(false);
    }
  };

  // Handle order selection (auto-populate items!)
  const handleSelectCommande = (cmdId: string) => {
    setSelectedCommandeId(cmdId);
    if (!cmdId) {
      setNumCommande('');
      return;
    }

    const cmd = commandes.find((c) => c.id === cmdId || c.numero === cmdId);
    if (cmd) {
      setNumCommande(cmd.numero);

      // Auto-set client if not selected
      if (!selectedClientId && cmd.clientId) {
        handleSelectClient(cmd.clientId);
      }

      // Auto-populate invoice rows from order items
      if (cmd.articles && cmd.articles.length > 0) {
        setRows(
          cmd.articles.map((art: any, idx: number) => ({
            id: String(idx + 1),
            description: art.productName || art.designation || 'Article',
            quantity: art.quantity || art.quantite || 1,
            unitPrice: art.unitPrice || art.prixUnitaire || 0,
          }))
        );
        showToast(`${t('Articles pré-remplis')} (${cmd.numero})`, 'info');
      }
    }
  };

  const updateRow = (id: string, field: keyof InvoiceRow, val: any) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  const addInvoiceRow = () => {
    setRows((prev) => [
      ...prev,
      { id: String(Date.now()), description: '', quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeRow = (id: string) => {
    if (rows.length <= 1) {
      setRows([{ id: String(Date.now()), description: '', quantity: 1, unitPrice: 0 }]);
    } else {
      setRows((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Calculations
  const subtotalHT = rows.reduce((sum, r) => sum + r.quantity * (r.unitPrice || 0), 0);
  const taxRate = 0.20; // Standard 20% TVA
  const taxAmount = subtotalHT * taxRate;
  const totalTTC = subtotalHT + taxAmount;

  const formatDateFR = (isoDate: string) => {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoDate;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient && !clientSearch.trim()) {
      showToast(t('Veuillez sélectionner ou désigner un client.'), 'error');
      return;
    }

    if (rows.length === 0 || rows.every((r) => !r.description.trim())) {
      showToast(t("Veuillez renseigner au moins une ligne d’article."), 'error');
      return;
    }

    setIsSubmitting(true);

    const clientDisplayName = selectedClient
      ? `${selectedClient.prenom} ${selectedClient.nom} (${selectedClient.entreprise})`
      : clientSearch.trim();

    const clientEmail = selectedClient?.email || '';

    try {
      const createdFacture = addFacture({
        clientId: selectedClient?.id || '1',
        clientNom: clientDisplayName,
        clientEmail: clientEmail || undefined,
        commandeId: selectedCommandeId || undefined,
        commandeNumero: numCommande.trim() ? numCommande.trim().replace(/^CMD-?/i, '').replace(/^\d{4}-/, '') : undefined,
        dateEcheance: formatDateFR(dateEcheance),
        statut: markPaid ? 'payee' : 'attente',
        articles: rows
          .filter((r) => r.description.trim())
          .map((r, idx) => ({
            id: String(idx + 1),
            description: r.description.trim(),
            quantity: r.quantity,
            unitPrice: r.unitPrice,
          })),
        totalHT: subtotalHT,
        tva: taxAmount,
        totalTTC: totalTTC,
        montantPaye: markPaid ? totalTTC : 0,
        resteDu: markPaid ? 0 : totalTTC,
        notes: notes.trim() || undefined,
      });

      if (sendEmail && clientEmail) {
        showToast(`${t('Facture transmise avec succès par email à')} ${clientEmail}`, 'info');
      }

      router.push(`/dashboard/factures/${createdFacture.id}`);
    } catch (err) {
      console.error('Erreur création facture:', err);
      showToast(t('Erreur lors de la création de la facture.'), 'error');
      setIsSubmitting(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full pb-16 flex flex-col px-4 sm:px-8 py-6 sm:py-8 gap-6 sm:gap-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/factures"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-border-base transition-colors shrink-0"
            title={t('Retour aux factures')}
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight m-0">
              {t('Créer une nouvelle facture')}
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1 m-0">
              {t("Émission directe ou à partir d'un bon de commande")}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        {/* Main Content (Left 8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Sélection Client */}
          <div className="bg-surface rounded-2xl p-5 sm:p-6 shadow-sm border border-border-base flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">person</span>
                <h2 className="text-base sm:text-lg font-bold text-on-surface m-0">{t('Client destinataire')}</h2>
              </div>
              <Link
                href="/dashboard/clients/nouveau"
                className="text-xs text-primary hover:text-primary-hover font-semibold flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>{t('Nouveau client')}</span>
              </Link>
            </div>

            <div className="relative w-full">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  value={clientSearch}
                  onFocus={() => setIsClientDropdownOpen(true)}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setIsClientDropdownOpen(true);
                  }}
                  placeholder={t('Rechercher un client (nom, entreprise, email)...')}
                  className="w-full bg-input-bg rounded-xl py-3 pl-10 pr-10 text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none border border-border-base focus:border-primary transition-all shadow-inner"
                />
                {clientSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setClientSearch('');
                      setSelectedClientId('');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </div>

              {/* Client Auto-complete Dropdown */}
              {isClientDropdownOpen && (
                <div className="absolute left-0 right-0 top-12 mt-2 bg-surface-container-high border border-border-base rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-border-base/40">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectClient(c.id)}
                        className="p-3 hover:bg-surface transition-colors cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <div className="text-sm font-semibold text-on-surface">
                            {c.prenom} {c.nom}
                          </div>
                          <div className="text-xs text-on-surface-variant">
                            {c.entreprise} • {c.email}
                          </div>
                        </div>
                        <span className="text-xs text-primary font-medium">{t('Sélectionner')}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-on-surface-variant">
                      {t('Aucun client correspondant. Le nom saisi sera utilisé tel quel.')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Client Card Details */}
            {selectedClient && (
              <div className="p-4 rounded-xl bg-surface-container border border-border-base flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="text-sm font-bold text-on-surface">
                    {selectedClient.prenom} {selectedClient.nom}
                  </div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    {selectedClient.entreprise} • {selectedClient.adresse}, {selectedClient.ville}
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    Email : {selectedClient.email} • Tél : {selectedClient.telephone}
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[11px] text-on-surface-variant block">{t('Solde client en cours')}</span>
                  <span className={`text-xs font-bold ${selectedClient.soldeDu > 0 ? 'text-warning' : 'text-success'}`}>
                    {formatCurrency(selectedClient.soldeDu)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Commande & Dates */}
          <div className="bg-surface rounded-2xl p-5 sm:p-6 shadow-sm border border-border-base flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">calendar_today</span>
              <h2 className="text-base sm:text-lg font-bold text-on-surface m-0">{t('Paramètres & Commande')}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Commande associée */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                  {t('Commande liée')} <span className="text-[10px] text-on-surface-variant/70 normal-case">{t('(optionnel)')}</span>
                </label>
                <select
                  value={selectedCommandeId}
                  onChange={(e) => handleSelectCommande(e.target.value)}
                  className="w-full bg-input-bg rounded-xl h-11 px-3 text-xs sm:text-sm text-on-surface outline-none border border-border-base focus:border-primary transition-all cursor-pointer"
                >
                  <option value="">{t('-- Aucune commande --')}</option>
                  {relevantCommandes.map((cmd) => (
                    <option key={cmd.id} value={cmd.id}>
                      {cmd.numero} - {cmd.clientNom} ({formatCurrency(cmd.totalTTC)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date d'émission */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                  {t("Date d'émission")} <span className="text-primary">*</span>
                </label>
                <input
                  required
                  type="date"
                  value={dateEmission}
                  onChange={(e) => setDateEmission(e.target.value)}
                  className="w-full bg-input-bg rounded-xl h-11 px-3 text-xs sm:text-sm text-on-surface outline-none border border-border-base focus:border-primary transition-all [color-scheme:dark]"
                />
              </div>

              {/* Date d'échéance */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                  {t("Date d'échéance")} <span className="text-primary">*</span>
                </label>
                <input
                  required
                  type="date"
                  value={dateEcheance}
                  onChange={(e) => setDateEcheance(e.target.value)}
                  className="w-full bg-input-bg rounded-xl h-11 px-3 text-xs sm:text-sm text-on-surface outline-none border border-border-base focus:border-primary transition-all [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Lignes d'articles */}
          <div className="bg-surface rounded-2xl p-5 sm:p-6 shadow-sm border border-border-base flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">inventory_2</span>
                <h2 className="text-base sm:text-lg font-bold text-on-surface m-0">{t('Lignes de facturation')}</h2>
              </div>
              <span className="text-xs font-semibold text-on-surface-variant">
                {rows.length} {rows.length > 1 ? t('articles') : t('article')}
              </span>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[560px]">
                <thead>
                  <tr className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold border-b border-border-base">
                    <th className="pb-3 pr-3">{t('Désignation / Prestation')}</th>
                    <th className="pb-3 px-2 text-center w-24">{t('Quantité')}</th>
                    <th className="pb-3 px-2 text-right w-32">{t('Prix Unit. HT')}</th>
                    <th className="pb-3 px-2 text-right w-32">{t('Total HT')}</th>
                    <th className="pb-3 pl-2 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base/50 text-xs">
                  {rows.map((row) => (
                    <tr key={row.id} className="group hover:bg-surface-container/30 transition-colors">
                      <td className="py-3 pr-3">
                        <input
                          required
                          type="text"
                          value={row.description}
                          onChange={(e) => updateRow(row.id, 'description', e.target.value)}
                          placeholder={t("Nom de l'article ou description du service...")}
                          className="w-full bg-input-bg rounded-lg h-10 px-3 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none border border-border-base focus:border-primary transition-all shadow-inner"
                        />
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="relative flex items-center bg-input-bg rounded-lg border border-border-base focus-within:border-primary transition-all h-10 w-full shadow-inner">
                          <input
                            required
                            type="number"
                            min="1"
                            value={row.quantity}
                            onChange={(e) => updateRow(row.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full bg-transparent text-center text-xs sm:text-sm font-bold text-on-surface outline-none pr-6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                            <button
                              type="button"
                              onClick={() => updateRow(row.id, 'quantity', row.quantity + 1)}
                              className="w-4 h-3 flex items-center justify-center rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                              title={t('Augmenter (+1)')}
                            >
                              <span className="material-symbols-outlined text-[12px]">expand_less</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => updateRow(row.id, 'quantity', Math.max(1, row.quantity - 1))}
                              className="w-4 h-3 flex items-center justify-center rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                              title={t('Diminuer (-1)')}
                            >
                              <span className="material-symbols-outlined text-[12px]">expand_more</span>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="relative flex items-center bg-input-bg rounded-lg border border-border-base focus-within:border-primary transition-all h-10 w-full shadow-inner">
                          <input
                            required
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.unitPrice}
                            onChange={(e) => updateRow(row.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full bg-transparent pl-2 pr-7 text-right text-xs sm:text-sm font-bold text-on-surface outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-xs pointer-events-none">
                            {currencySymbol}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right font-extrabold text-on-surface whitespace-nowrap text-xs sm:text-sm">
                        {formatCurrency(row.quantity * row.unitPrice)}
                      </td>
                      <td className="py-3 pl-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeRow(row.id)}
                          className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                          title={t('Supprimer la ligne')}
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={addInvoiceRow}
              className="mt-2 self-start flex items-center gap-1.5 text-primary hover:text-primary-hover text-xs sm:text-sm font-bold transition-colors py-2 px-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>{t("Ajouter une ligne d'article")}</span>
            </button>
          </div>

          {/* Notes et Mentions */}
          <div className="bg-surface rounded-2xl p-5 sm:p-6 shadow-sm border border-border-base flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">notes</span>
              <h2 className="text-base sm:text-lg font-bold text-on-surface m-0">{t('Conditions & Notes')}</h2>
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('Saisissez vos instructions, conditions de règlement, références bancaires...')}
              className="w-full bg-input-bg rounded-xl py-3 px-4 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none border border-border-base focus:border-primary transition-all resize-none shadow-inner"
            ></textarea>
          </div>
        </div>

        {/* Sidebar (Right 4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface rounded-2xl p-5 sm:p-6 shadow-sm border border-border-base flex flex-col gap-5 sticky top-24">
            <h2 className="text-base sm:text-lg font-bold text-on-surface m-0 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">calculate</span>
              {t('Récapitulatif Financier')}
            </h2>

            <div className="flex flex-col gap-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-on-surface">
                <span className="text-on-surface-variant">{t('Sous-total HT')}</span>
                <span className="font-semibold text-on-surface">
                  {formatCurrency(subtotalHT)}
                </span>
              </div>
              <div className="flex items-center justify-between text-on-surface">
                <span className="text-on-surface-variant">{t('TVA (20%)')}</span>
                <span className="font-semibold text-on-surface">
                  {formatCurrency(taxAmount)}
                </span>
              </div>
              <div className="h-px bg-border-base w-full my-1"></div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm sm:text-base font-bold text-on-surface uppercase tracking-wider">
                  {t('Total TTC')}
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-primary tracking-tight text-right">
                  {formatCurrency(totalTTC)}
                </span>
              </div>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3.5 mt-1 pt-4 border-t border-border-base">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs sm:text-sm text-on-surface group-hover:text-primary transition-colors">
                  {t('Envoyer par email au client')}
                </span>
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary bg-input-bg border-border-base cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs sm:text-sm text-on-surface group-hover:text-primary transition-colors">
                  {t('Marquer payée immédiatement')}
                </span>
                <input
                  type="checkbox"
                  checked={markPaid}
                  onChange={(e) => setMarkPaid(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary bg-input-bg border-border-base cursor-pointer"
                />
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col gap-3 mt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>{isSubmitting ? t('Création en cours...') : t('Créer & Enregistrer la facture')}</span>
              </button>
              <Link
                href="/dashboard/factures"
                className="w-full h-11 bg-transparent hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-semibold text-xs sm:text-sm rounded-xl transition-all border border-border-base flex items-center justify-center cursor-pointer"
              >
                {t('Annuler')}
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
