'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStore, Commande } from '@/context/StoreContext';

export default function CommandeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cmdId = String(params?.id || '');

  const {
    getCommande,
    updateCommandeStatus,
    updateCommande,
    deleteCommande,
    isHydrated,
    formatCurrency,
    t,
    companySettings,
  } = useStore();
  const commande = getCommande(cmdId);

  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Edit fields
  const [editDateLivraison, setEditDateLivraison] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const openEditModal = () => {
    if (!commande) return;
    setEditDateLivraison(commande.dateLivraison || '');
    setEditNotes(commande.notes || '');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commande) return;
    updateCommande(commande.id, {
      dateLivraison: editDateLivraison,
      notes: editNotes,
    });
    setIsEditModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!commande) return;
    deleteCommande(commande.id);
    router.push('/dashboard/commandes');
  };

  if (!isHydrated) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not found fallback
  if (!commande) {
    return (
      <div className="w-full max-w-[1280px] mx-auto py-16 px-4 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-2">
          <span className="material-symbols-outlined text-4xl">remove_shopping_cart</span>
        </div>
        <h1 className="text-2xl font-bold text-on-surface m-0">{t('Commande introuvable')}</h1>
        <p className="text-sm text-on-surface-variant max-w-md m-0">
          {companySettings?.language === 'en'
            ? `Order #${cmdId} does not exist or has been deleted.`
            : `La commande #${cmdId} n'existe pas ou a été supprimée.`}
        </p>
        <Link
          href="/dashboard/commandes"
          className="mt-4 px-6 py-2.5 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:bg-primary-hover transition-colors inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>{t('Retour à la liste des commandes')}</span>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (statut: Commande['statut']) => {
    switch (statut) {
      case 'livree':
        return (
          <span className="px-3 py-1 rounded-full bg-success/15 text-success text-xs font-semibold flex items-center gap-1 border border-success/20">
            <span className="material-symbols-outlined text-[15px]">check_circle</span>
            {t('Livrée')}
          </span>
        );
      case 'preparation':
        return (
          <span className="px-3 py-1 rounded-full bg-tertiary-container/15 text-tertiary-container text-xs font-semibold flex items-center gap-1 border border-tertiary-container/20">
            <span className="material-symbols-outlined text-[15px]">package_2</span>
            {t('En préparation')}
          </span>
        );
      case 'confirmee':
        return (
          <span className="px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold flex items-center gap-1 border border-primary/20">
            <span className="material-symbols-outlined text-[15px]">thumb_up</span>
            {t('Confirmée')}
          </span>
        );
      case 'annulee':
        return (
          <span className="px-3 py-1 rounded-full bg-error/15 text-error text-xs font-semibold flex items-center gap-1 border border-error/20">
            <span className="material-symbols-outlined text-[15px]">cancel</span>
            {t('Annulée')}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-warning/15 text-warning text-xs font-semibold flex items-center gap-1 border border-warning/20">
            <span className="material-symbols-outlined text-[15px]">schedule</span>
            {t('En attente')}
          </span>
        );
    }
  };

  const STATUS_OPTIONS: { key: Commande['statut']; label: string; icon: string; color: string }[] = [
    { key: 'attente', label: t('En attente'), icon: 'schedule', color: 'text-warning' },
    { key: 'confirmee', label: t('Confirmée'), icon: 'thumb_up', color: 'text-primary' },
    { key: 'preparation', label: t('En préparation'), icon: 'package_2', color: 'text-tertiary-container' },
    { key: 'livree', label: t('Livrée'), icon: 'check_circle', color: 'text-success' },
    { key: 'annulee', label: t('Annulée'), icon: 'cancel', color: 'text-error' },
  ];

  return (
    <div className="w-full max-w-[1280px] mx-auto pb-16 px-4 sm:px-8 py-6 sm:py-8 flex flex-col gap-6 sm:gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface rounded-xl p-5 sm:p-6 border border-border-base shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/dashboard/commandes"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-surface hover:bg-surface-container-high border border-border-base text-on-surface hover:text-primary transition-colors shadow-sm shrink-0 cursor-pointer"
            title={t('Retour aux commandes')}
          >
            <span className="material-symbols-outlined text-[20px] sm:text-[22px]">arrow_back</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight m-0 font-mono">
              {commande.numero}
            </h1>
            {getStatusBadge(commande.statut)}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 relative">
          {/* Working Status Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsStatusMenuOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3.5 h-10 rounded-lg border border-border-base bg-surface hover:bg-surface-container-high text-on-surface transition-colors text-xs sm:text-sm font-medium cursor-pointer"
            >
              <span>{t('Changer statut')}</span>
              <span className="material-symbols-outlined text-[18px]">
                {isStatusMenuOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {isStatusMenuOpen && (
              <div className="absolute right-0 top-12 w-56 bg-surface rounded-xl border border-border-base shadow-2xl p-2 z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150">
                <span className="px-3 py-1.5 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  {t('Sélectionner un statut')}
                </span>
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      updateCommandeStatus(commande.id, opt.key);
                      setIsStatusMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      commande.statut === opt.key
                        ? 'bg-surface-container-high text-on-surface'
                        : 'hover:bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-[16px] ${opt.color}`}>
                        {opt.icon}
                      </span>
                      <span>{opt.label}</span>
                    </div>
                    {commande.statut === opt.key && (
                      <span className="material-symbols-outlined text-[16px] text-primary">
                        check
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Edit Button */}
          <button
            type="button"
            onClick={openEditModal}
            className="flex items-center gap-1.5 px-3.5 h-10 rounded-lg border border-border-base hover:bg-surface-container-high text-on-surface transition-colors text-xs sm:text-sm font-medium cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            <span>{t('Modifier')}</span>
          </button>

          {/* Generate Invoice Link */}
          <Link
            href="/dashboard/factures/nouveau"
            className="flex items-center gap-1.5 px-4 h-10 rounded-lg bg-primary text-on-primary hover:bg-primary-hover transition-colors text-xs sm:text-sm font-semibold shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>{t('Générer la facture')}</span>
          </Link>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-10 h-10 rounded-lg border border-border-base hover:bg-error/15 text-on-surface-variant hover:text-error transition-colors flex items-center justify-center cursor-pointer"
            title={t('Supprimer la commande')}
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6 sm:gap-8">
          {/* Informations de la commande */}
          <div className="bg-surface rounded-xl p-5 sm:p-6 border border-border-base shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border-base">
              <span className="material-symbols-outlined text-primary text-[22px]">info</span>
              <h2 className="text-base sm:text-lg font-semibold text-on-surface m-0">
                {t('Informations de la commande')}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">
                  {t('Numéro')}
                </span>
                <span className="text-sm sm:text-base font-bold text-on-surface font-mono">
                  {commande.numero}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">
                  {t('Client')}
                </span>
                <Link
                  className="text-sm sm:text-base font-semibold text-primary hover:text-primary-hover inline-flex items-center gap-1 transition-colors w-fit"
                  href={`/dashboard/clients/${commande.clientId || '1'}`}
                >
                  <span>{commande.clientNom}</span>
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </Link>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">
                  {t('Date de création')}
                </span>
                <span className="text-sm sm:text-base text-on-surface flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                    calendar_today
                  </span>
                  {commande.dateCreation}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">
                  {t('Date de livraison')}
                </span>
                <span className="text-sm sm:text-base text-on-surface flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                    local_shipping
                  </span>
                  {commande.dateLivraison ? commande.dateLivraison : t('Non renseignée')}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">
                  {t('Créée par')}
                </span>
                <span className="text-sm sm:text-base text-on-surface flex items-center gap-2 font-medium">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary text-[10px] font-bold shrink-0">
                    MD
                  </div>
                  {commande.creeePar}
                </span>
              </div>
            </div>

            {commande.notes && (
              <div className="mt-2 p-3 bg-surface-container-low rounded-lg border border-border-base text-xs text-on-surface-variant">
                <strong className="text-on-surface block mb-1">{t('Notes / Instructions :')}</strong>
                {commande.notes}
              </div>
            )}
          </div>

          {/* Articles commandés */}
          <div className="bg-surface rounded-xl border border-border-base shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 p-5 sm:p-6 border-b border-border-base bg-surface-container/30">
              <span className="material-symbols-outlined text-primary text-[22px]">inventory_2</span>
              <h2 className="text-base sm:text-lg font-semibold text-on-surface m-0">
                {t('Articles commandés')} ({commande.articles?.length || 0})
              </h2>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[550px]">
                <thead>
                  <tr className="bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider border-b border-border-base">
                    <th className="py-3 px-6">{t('Description / Produit')}</th>
                    <th className="py-3 px-6 text-center">{t('Quantité')}</th>
                    <th className="py-3 px-6 text-right">{t('Prix U. HT')}</th>
                    <th className="py-3 px-6 text-right">{t('Total HT')}</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-on-surface divide-y divide-border-base">
                  {(commande.articles || []).map((art, idx) => (
                    <tr key={art.id || idx} className="hover:bg-surface-container-high/30 transition-colors">
                      <td className="py-4 px-6 font-medium">{art.productName}</td>
                      <td className="py-4 px-6 text-center font-semibold">{art.quantity}</td>
                      <td className="py-4 px-6 text-right font-mono text-on-surface-variant">
                        {formatCurrency(art.unitPrice)}
                      </td>
                      <td className="py-4 px-6 text-right font-bold font-mono">
                        {formatCurrency(art.quantity * art.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) Summary */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface rounded-xl border border-border-base shadow-lg overflow-hidden sticky top-24">
            <div className="p-5 sm:p-6 border-b border-border-base bg-surface-container/30">
              <h2 className="text-base font-semibold text-on-surface m-0">{t('Récapitulatif financier')}</h2>
            </div>

            <div className="p-5 sm:p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">{t('Total HT')}</span>
                <span className="font-semibold text-on-surface font-mono">
                  {formatCurrency(commande.totalHT)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">{t('TVA (estimée)')}</span>
                <span className="font-semibold text-on-surface font-mono">
                  {formatCurrency(commande.tva)}
                </span>
              </div>

              <div className="h-px w-full bg-border-base"></div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-base font-bold text-on-surface">{t('Total TTC')}</span>
                <span className="text-2xl font-extrabold text-primary font-mono tracking-tight">
                  {formatCurrency(commande.totalTTC)}
                </span>
              </div>
            </div>

            <div className="p-5 bg-surface-container-high/30 border-t border-border-base flex flex-col gap-3">
              <Link
                href="/dashboard/factures/nouveau"
                className="w-full h-11 bg-primary hover:bg-primary-hover text-on-primary rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                <span>{t('Créer la facture')}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl border border-border-base p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-border-base pb-3">
              <h3 className="text-lg font-bold text-on-surface m-0">{t('Modifier la commande')}</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-on-surface-variant font-medium">{t('Date de livraison')}</label>
                <input
                  type="text"
                  value={editDateLivraison}
                  onChange={(e) => setEditDateLivraison(e.target.value)}
                  placeholder="Ex: 30/08/2026"
                  className="h-10 bg-input-bg border border-border-base rounded-lg px-3 text-sm text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-on-surface-variant font-medium">{t('Notes / Instructions')}</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder={companySettings?.language === 'en' ? 'Internal notes...' : 'Notes internes...'}
                  className="bg-input-bg border border-border-base rounded-lg p-3 text-sm text-on-surface outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-base">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border-base text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                >
                  {t('Annuler')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold transition-colors shadow-md cursor-pointer"
                >
                  {t('Enregistrer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl border border-border-base p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3 text-error">
              <div className="w-10 h-10 rounded-full bg-error/15 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface m-0">{t('Supprimer la commande ?')}</h3>
            </div>

            <p className="text-sm text-on-surface-variant m-0 leading-relaxed">
              {t('Êtes-vous sûr de vouloir supprimer définitivement la commande')}{' '}
              <strong className="text-on-surface font-semibold font-mono">
                {commande.numero}
              </strong>{' '}
              ?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2.5 rounded-lg border border-border-base text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors text-xs font-semibold cursor-pointer"
              >
                {t('Annuler')}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 rounded-lg bg-error hover:bg-error/90 text-white transition-colors text-xs font-semibold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>{t('Confirmer la suppression')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
