'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStore, Client } from '@/context/StoreContext';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = String(params?.id || '');

  const {
    getClient,
    updateClient,
    deleteClient,
    getClientOrders,
    getClientInvoices,
    getClientPayments,
    isHydrated,
    formatCurrency,
    t,
    companySettings,
  } = useStore();

  const client = getClient(clientId);
  const clientOrders = getClientOrders(clientId);
  const clientInvoices = getClientInvoices(clientId);
  const clientPayments = getClientPayments(clientId);

  const [activeTab, setActiveTab] = useState<'commandes' | 'factures' | 'paiements'>('commandes');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editPrenom, setEditPrenom] = useState('');
  const [editNom, setEditNom] = useState('');
  const [editEntreprise, setEditEntreprise] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTelephone, setEditTelephone] = useState('');
  const [editAdresse, setEditAdresse] = useState('');
  const [editVille, setEditVille] = useState('');
  const [editStatut, setEditStatut] = useState<'actif' | 'inactif'>('actif');

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const openEditModal = () => {
    if (!client) return;
    setEditPrenom(client.prenom);
    setEditNom(client.nom);
    setEditEntreprise(client.entreprise);
    setEditEmail(client.email);
    setEditTelephone(client.telephone);
    setEditAdresse(client.adresse);
    setEditVille(client.ville);
    setEditStatut(client.statut);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    updateClient(client.id, {
      prenom: editPrenom,
      nom: editNom,
      entreprise: editEntreprise,
      email: editEmail,
      telephone: editTelephone,
      adresse: editAdresse,
      ville: editVille,
      statut: editStatut,
    });
    setIsEditModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!client) return;
    deleteClient(client.id);
    router.push('/dashboard/clients');
  };

  if (!isHydrated) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not found state
  if (!client) {
    return (
      <div className="w-full max-w-[1280px] mx-auto py-16 px-4 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-2">
          <span className="material-symbols-outlined text-4xl">person_off</span>
        </div>
        <h1 className="text-2xl font-bold text-on-surface m-0">{t('Client introuvable')}</h1>
        <p className="text-sm text-on-surface-variant max-w-md m-0">
          {companySettings?.language === 'en'
            ? `No client corresponds to identifier #${clientId}. It may have been deleted.`
            : `Aucun client ne correspond à l'identifiant #${clientId}. Il a peut-être été supprimé.`}
        </p>
        <Link
          href="/dashboard/clients"
          className="mt-4 px-6 py-2.5 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:bg-primary-hover transition-colors inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>{t('Retour à la liste des clients')}</span>
        </Link>
      </div>
    );
  }

  const initials = `${client.prenom?.[0] || ''}${client.nom?.[0] || ''}`.toUpperCase() || 'CL';
  const totalInvoiced = clientInvoices.reduce((sum, f) => sum + f.totalTTC, 0) || client.totalDepense;
  const totalDue = clientInvoices.reduce((sum, f) => sum + f.resteDu, 0);

  return (
    <div className="w-full pb-16 flex flex-col px-4 sm:px-8 py-6 sm:py-8 gap-6 sm:gap-8 max-w-[1400px] mx-auto">
      {/* Header with Back Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-base/60 pb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/dashboard/clients"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface hover:bg-surface-container-high border border-border-base transition-colors flex items-center justify-center text-on-surface hover:text-primary shadow-sm shrink-0 cursor-pointer"
            title={t('Retour aux clients')}
          >
            <span className="material-symbols-outlined text-[22px] sm:text-[24px]">arrow_back</span>
          </Link>

          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg sm:text-xl shrink-0 shadow-sm">
            {initials}
          </div>

          <div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface m-0">
                {client.entreprise || `${client.prenom} ${client.nom}`}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full font-medium text-xs uppercase tracking-wider flex items-center gap-1.5 border ${
                  client.statut === 'actif'
                    ? 'bg-success/15 text-success border-success/20'
                    : 'bg-warning/15 text-warning border-warning/20'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    client.statut === 'actif' ? 'bg-success' : 'bg-warning'
                  }`}
                ></span>
                {client.statut === 'actif' ? t('Actif') : t('Inactif')}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant m-0 mt-1">
              {client.ville || 'Dakar'}, {client.pays || 'Sénégal'} • {companySettings?.language === 'en' ? 'Contact: ' : 'Contact : '}{client.prenom} {client.nom}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={openEditModal}
            className="flex-1 sm:flex-none h-10 sm:h-11 px-4 sm:px-6 rounded-lg bg-surface text-on-surface border border-border-base hover:bg-surface-container-high hover:border-primary transition-colors text-sm font-medium flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            <span>{t('Modifier')}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex-1 sm:flex-none h-10 sm:h-11 px-4 sm:px-6 rounded-lg bg-error/15 text-error border border-error/20 hover:bg-error hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            <span>{t('Supprimer')}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Information & Résumé Financier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations Principales */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border-base p-5 sm:p-6 flex flex-col gap-6 shadow-sm">
          <h2 className="text-base sm:text-lg font-semibold text-on-surface m-0 border-b border-border-base pb-3">
            {t('Informations Principales')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">
                {t('Contact Principal')}
              </span>
              <span className="text-sm sm:text-base font-medium text-on-surface">
                {client.prenom} {client.nom}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">
                {t('Numéro de Téléphone')}
              </span>
              <span className="text-sm sm:text-base font-medium text-on-surface">
                {client.telephone}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">
                {t('Adresse Email')}
              </span>
              <span className="text-sm sm:text-base font-medium text-on-surface">
                {client.email}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">
                NINEA
              </span>
              <span className="text-sm sm:text-base font-mono text-on-surface">
                {client.ninea || t('Non renseigné')}
              </span>
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">
                {t('Adresse Postale')}
              </span>
              <span className="text-sm sm:text-base text-on-surface">
                {client.adresse}, {client.ville} {client.codePostal}, {client.pays}
              </span>
            </div>
          </div>
        </div>

        {/* Résumé Financier */}
        <div className="bg-surface-container-high rounded-xl border border-border-base p-5 flex flex-col gap-4 shadow-md relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
          <h2 className="text-base font-semibold text-on-surface m-0 relative z-10">{t('Résumé Financier')}</h2>

          <div className="flex items-center justify-between gap-2 border-b border-border-base pb-3 relative z-10">
            <span className="text-xs font-medium text-on-surface-variant whitespace-nowrap">
              {t('Facturation Totale')}
            </span>
            <span className="text-sm font-bold text-primary whitespace-nowrap text-right font-mono">
              {formatCurrency(totalInvoiced)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 border-b border-border-base pb-3 relative z-10">
            <span className="text-xs font-medium text-on-surface-variant whitespace-nowrap">
              {t('Solde Restant Dû')}
            </span>
            <span
              className={`text-sm font-bold whitespace-nowrap text-right font-mono ${
                totalDue > 0 ? 'text-warning' : 'text-success'
              }`}
            >
              {formatCurrency(totalDue)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 pb-1 relative z-10">
            <span className="text-xs font-medium text-on-surface-variant whitespace-nowrap">
              {t('Délai Paiement Moyen')}
            </span>
            <span className="text-sm font-bold text-on-surface whitespace-nowrap text-right">
              {client.delaiPaiement ? t(client.delaiPaiement) : t('30 Jours')}
            </span>
          </div>

          <Link
            href="/dashboard/factures/nouveau"
            className="mt-auto h-11 w-full rounded-lg bg-primary text-on-primary hover:bg-primary-hover transition-colors text-sm font-semibold flex items-center justify-center gap-2 relative z-10 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>{t('Nouvelle Facture')}</span>
          </Link>
        </div>
      </div>

      {/* Tabs & Table */}
      <div className="mt-2 flex flex-col w-full">
        {/* Tab Buttons */}
        <div className="flex border-b border-border-base gap-6 sm:gap-8 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('commandes')}
            className={`pb-3 text-sm font-semibold relative transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'commandes' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t('Commandes')} ({clientOrders.length})
            {activeTab === 'commandes' && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-t-sm"></span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('factures')}
            className={`pb-3 text-sm font-semibold relative transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'factures' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t('Factures')} ({clientInvoices.length})
            {activeTab === 'factures' && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-t-sm"></span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paiements')}
            className={`pb-3 text-sm font-semibold relative transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'paiements' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t('Paiements')} ({clientPayments.length})
            {activeTab === 'paiements' && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-t-sm"></span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6 w-full overflow-x-auto">
          {/* TAB 1: COMMANDES */}
          {activeTab === 'commandes' && (
            <div className="min-w-[700px] w-full">
              {clientOrders.length === 0 ? (
                <div className="bg-surface rounded-xl p-8 border border-border-base text-center text-on-surface-variant text-sm">
                  {t('Aucune commande enregistrée pour ce client.')}
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-border-base">
                      <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        {t('N° Commande')}
                      </th>
                      <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        {t('Date')}
                      </th>
                      <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        {t('Articles')}
                      </th>
                      <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        {t('Montant TTC')}
                      </th>
                      <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        {t('Statut')}
                      </th>
                      <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">
                        {t('Actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-on-surface divide-y divide-border-base">
                    {clientOrders.map((cmd) => (
                      <tr key={cmd.id} className="hover:bg-surface-container-high/50 transition-colors">
                        <td className="py-4 px-6 font-mono text-primary font-medium">{cmd.numero}</td>
                        <td className="py-4 px-6 text-on-surface-variant">{cmd.dateCreation}</td>
                        <td className="py-4 px-6 text-on-surface-variant">
                          {cmd.articles?.length || 1} {t('article(s)')}
                        </td>
                        <td className="py-4 px-6 font-bold font-mono">
                          {formatCurrency(cmd.totalTTC)}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                              cmd.statut === 'livree'
                                ? 'bg-success/15 text-success'
                                : cmd.statut === 'attente'
                                ? 'bg-warning/15 text-warning'
                                : 'bg-primary/15 text-primary'
                            }`}
                          >
                            {cmd.statut === 'livree' ? t('Livrée') : cmd.statut === 'attente' ? t('En attente') : t('Confirmée')}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            href={`/dashboard/commandes/${cmd.id || '1'}`}
                            className="text-on-surface-variant hover:text-primary transition-colors inline-block"
                            title={t('Voir la commande')}
                          >
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 2: FACTURES */}
          {activeTab === 'factures' && (
            <div className="min-w-[700px] w-full">
              {clientInvoices.length === 0 ? (
                <div className="bg-surface rounded-xl p-8 border border-border-base text-center text-on-surface-variant text-sm">
                  {t('Aucune facture émise pour ce client.')}
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-border-base">
                      <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        {t('N° Facture')}
                      </th>
                      <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        {t("Date d'émission")}
                      </th>
                      <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        {t('Montant TTC')}
                      </th>
                      <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        {t('Reste Dû')}
                      </th>
                      <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        {t('Statut')}
                      </th>
                      <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">
                        {t('Actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-on-surface divide-y divide-border-base">
                    {clientInvoices.map((fac) => (
                      <tr key={fac.id} className="hover:bg-surface-container-high/50 transition-colors">
                        <td className="py-4 px-6 font-mono text-primary font-medium">{fac.numero}</td>
                        <td className="py-4 px-6 text-on-surface-variant">{fac.dateEmission}</td>
                        <td className="py-4 px-6 font-medium font-mono">{formatCurrency(fac.totalTTC)}</td>
                        <td className="py-4 px-6 font-semibold font-mono text-warning">
                          {formatCurrency(fac.resteDu)}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                              fac.statut === 'payee'
                                ? 'bg-success/15 text-success'
                                : fac.statut === 'retard'
                                ? 'bg-error/15 text-error'
                                : 'bg-warning/15 text-warning'
                            }`}
                          >
                            {fac.statut === 'payee'
                              ? t('Payée')
                              : fac.statut === 'retard'
                              ? t('En retard')
                              : t('En attente')}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            href={`/dashboard/factures/${fac.id}`}
                            className="text-on-surface-variant hover:text-primary transition-colors inline-block"
                            title={t('Voir la facture')}
                          >
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 3: PAIEMENTS */}
          {activeTab === 'paiements' && (
            <div className="min-w-[650px] w-full">
              {clientPayments.length === 0 ? (
                <div className="bg-surface rounded-xl p-8 border border-border-base text-center text-on-surface-variant text-sm">
                  {t('Aucun paiement enregistré pour ce client.')}
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-border-base">
                      <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        {t('Réf. Paiement')}
                      </th>
                      <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        {t('Facture')}
                      </th>
                      <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        {t('Date')}
                      </th>
                      <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        {t('Méthode')}
                      </th>
                      <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        {t('Montant')}
                      </th>
                      <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">
                        {t('Statut')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-on-surface divide-y divide-border-base">
                    {clientPayments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-surface-container-high/50 transition-colors">
                        <td className="py-4 px-6 font-mono text-primary font-medium">{pay.reference}</td>
                        <td className="py-4 px-6 text-on-surface-variant font-mono">{pay.factureNumero}</td>
                        <td className="py-4 px-6 text-on-surface-variant">{pay.date}</td>
                        <td className="py-4 px-6 capitalize">{t(pay.methode)}</td>
                        <td className="py-4 px-6 font-bold font-mono text-success">
                          {formatCurrency(pay.montant)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                              pay.statut === 'reussi'
                                ? 'bg-success/15 text-success'
                                : 'bg-warning/15 text-warning'
                            }`}
                          >
                            {pay.statut === 'reussi' ? t('Réussi') : t('En attente')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Client Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl border border-border-base p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-border-base pb-3">
              <h3 className="text-lg font-bold text-on-surface m-0">{t('Modifier les coordonnées')}</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-on-surface-variant font-medium">{t('Prénom')}</label>
                  <input
                    type="text"
                    required
                    value={editPrenom}
                    onChange={(e) => setEditPrenom(e.target.value)}
                    className="h-10 bg-input-bg border border-border-base rounded-lg px-3 text-sm text-on-surface outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-on-surface-variant font-medium">{t('Nom')}</label>
                  <input
                    type="text"
                    required
                    value={editNom}
                    onChange={(e) => setEditNom(e.target.value)}
                    className="h-10 bg-input-bg border border-border-base rounded-lg px-3 text-sm text-on-surface outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-on-surface-variant font-medium">{t('Entreprise')}</label>
                <input
                  type="text"
                  value={editEntreprise}
                  onChange={(e) => setEditEntreprise(e.target.value)}
                  className="h-10 bg-input-bg border border-border-base rounded-lg px-3 text-sm text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-on-surface-variant font-medium">{t('Email')}</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="h-10 bg-input-bg border border-border-base rounded-lg px-3 text-sm text-on-surface outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-on-surface-variant font-medium">{t('Téléphone')}</label>
                  <input
                    type="tel"
                    value={editTelephone}
                    onChange={(e) => setEditTelephone(e.target.value)}
                    className="h-10 bg-input-bg border border-border-base rounded-lg px-3 text-sm text-on-surface outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-xs text-on-surface-variant font-medium">{t('Ville')}</label>
                  <input
                    type="text"
                    value={editVille}
                    onChange={(e) => setEditVille(e.target.value)}
                    className="h-10 bg-input-bg border border-border-base rounded-lg px-3 text-sm text-on-surface outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-on-surface-variant font-medium">{t('Statut')}</label>
                  <select
                    value={editStatut}
                    onChange={(e) => setEditStatut(e.target.value as 'actif' | 'inactif')}
                    className="h-10 bg-input-bg border border-border-base rounded-lg px-2 text-xs text-on-surface outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="actif">{t('Actif')}</option>
                    <option value="inactif">{t('Inactif')}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-base">
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
                  {t('Enregistrer les modifications')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl border border-border-base p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3 text-error">
              <div className="w-10 h-10 rounded-full bg-error/15 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface m-0">{t('Supprimer le client ?')}</h3>
            </div>

            <p className="text-sm text-on-surface-variant m-0 leading-relaxed">
              {t('Êtes-vous sûr de vouloir supprimer définitivement')}{' '}
              <strong className="text-on-surface font-semibold">
                {client.prenom} {client.nom} ({client.entreprise})
              </strong>{' '}
              {t('? Vous serez redirigé vers la liste des clients.')}
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
