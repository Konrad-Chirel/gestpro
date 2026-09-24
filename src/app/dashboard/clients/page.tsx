'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore, Client } from '@/context/StoreContext';

type StatusFilter = 'all' | 'actif' | 'inactif';
type SortOrder = 'commandes' | 'recent' | 'nom';

export default function ClientsPage() {
  const router = useRouter();
  const { clients, deleteClient, isHydrated, t } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Client deletion modal state
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const translateDateString = (str: string) => {
    if (!str) return '—';
    let res = str;
    const map: Record<string, string> = {
      'Jan': t('month.jan'),
      'Fév': t('month.feb'),
      'Mar': t('month.mar'),
      'Avr': t('month.apr'),
      'Mai': t('month.may'),
      'Juin': t('month.jun'),
      'Juil': t('month.jul'),
      'Août': t('month.aug'),
      'Sep': t('month.sep'),
      'Oct': t('month.oct'),
      'Nov': t('month.nov'),
      'Déc': t('month.dec'),
    };
    Object.entries(map).forEach(([k, v]) => {
      res = res.replace(k, v);
    });
    return res;
  };

  // Format date to localized style
  const formatClientDate = (dateStr: string) => {
    if (!dateStr) return '—';
    if (dateStr.includes(' ') && !dateStr.includes('-')) return translateDateString(dateStr);
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const months = [
        t('month.jan'), t('month.feb'), t('month.mar'), t('month.apr'),
        t('month.may'), t('month.jun'), t('month.jul'), t('month.aug'),
        t('month.sep'), t('month.oct'), t('month.nov'), t('month.dec')
      ];
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return dateStr;
    }
  };

  // Filtered & Sorted Clients
  const filteredClients = useMemo(() => {
    return clients
      .filter((c) => {
        const matchesQuery =
          `${c.prenom} ${c.nom}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.entreprise.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.telephone.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === 'all' ? true : c.statut === statusFilter;

        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sortOrder === 'commandes') {
          return b.commandesCount - a.commandesCount;
        }
        if (sortOrder === 'nom') {
          return `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [clients, searchQuery, statusFilter, sortOrder]);

  const handleDeleteConfirm = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete.id);
      setClientToDelete(null);
    }
  };

  const getInitials = (client: Client) => {
    const p = client.prenom ? client.prenom[0] : '';
    const n = client.nom ? client.nom[0] : '';
    return (p + n).toUpperCase() || 'CL';
  };

  return (
    <div className="w-full pb-16 flex flex-col px-4 sm:px-8 py-8 gap-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col w-full gap-6">
        
        {/* Header Section */}
        <div className="flex flex-col gap-6 w-full">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight m-0">
                Clients
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-bold text-xs border border-border-base">
                {filteredClients.length}
              </span>
            </div>
            <Link
              href="/dashboard/clients/nouveau"
              className="bg-primary hover:bg-primary-hover text-on-primary font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-6 rounded-full shadow-md transition-all flex items-center justify-center gap-2 shrink-0 whitespace-nowrap cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>{t('clients.new')}</span>
            </Link>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full relative">
            {/* Real-time Search Input */}
            <div className="flex-1 flex items-center bg-surface-container-high rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 min-h-[50px] sm:min-h-[54px] shadow-sm border border-border-base focus-within:border-primary transition-all">
              <span className="material-symbols-outlined text-on-surface-variant mr-3 text-[22px] shrink-0">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none focus:ring-0 w-full text-on-surface text-sm sm:text-base placeholder:text-on-surface-variant/50 font-medium py-1"
                placeholder={t('clients.search_placeholder')}
                type="text"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-on-surface-variant hover:text-on-surface p-1.5 transition-colors shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center justify-center gap-2 min-h-[50px] sm:min-h-[54px] px-5 sm:px-6 rounded-xl border shadow-sm transition-all shrink-0 whitespace-nowrap cursor-pointer font-medium text-sm sm:text-base ${
                  statusFilter !== 'all' || isFilterOpen
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-surface-container-high border-border-base text-on-surface hover:bg-surface-bright'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">filter_list</span>
                <span>{t('common.filter')}</span>
                {statusFilter !== 'all' && (
                  <span className="w-2 h-2 rounded-full bg-primary ml-0.5"></span>
                )}
                <span className="material-symbols-outlined text-[20px]">expand_more</span>
              </button>

              {/* Filter Dropdown Popover */}
              {isFilterOpen && (
                <div className="absolute right-0 top-[56px] sm:top-[60px] w-64 bg-surface-container-high border border-border-base rounded-xl shadow-2xl p-4 z-50 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-border-base pb-2">
                    <span className="text-xs font-bold uppercase text-on-surface">{t('common.filters')}</span>
                    {statusFilter !== 'all' && (
                      <button
                        type="button"
                        onClick={() => {
                          setStatusFilter('all');
                          setSortOrder('recent');
                        }}
                        className="text-[11px] text-primary hover:underline"
                      >
                        {t('common.reset')}
                      </button>
                    )}
                  </div>

                  {/* Statut Filter */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-on-surface-variant font-medium">{t('common.status')}</label>
                    <div className="grid grid-cols-3 gap-1 bg-input-bg p-1 rounded-lg border border-border-base">
                      <button
                        type="button"
                        onClick={() => setStatusFilter('all')}
                        className={`py-1.5 text-xs rounded font-medium transition-colors cursor-pointer ${
                          statusFilter === 'all'
                            ? 'bg-surface-variant text-on-surface font-semibold'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {t('common.all')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusFilter('actif')}
                        className={`py-1.5 text-xs rounded font-medium transition-colors cursor-pointer ${
                          statusFilter === 'actif'
                            ? 'bg-surface-variant text-success font-semibold'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {t('status.active')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusFilter('inactif')}
                        className={`py-1.5 text-xs rounded font-medium transition-colors cursor-pointer ${
                          statusFilter === 'inactif'
                            ? 'bg-surface-variant text-warning font-semibold'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {t('status.inactive')}
                      </button>
                    </div>
                  </div>

                  {/* Tri */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-on-surface-variant font-medium">{t('Trier par')}</label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                      className="bg-input-bg border border-border-base rounded-lg px-3 py-2 text-xs text-on-surface outline-none cursor-pointer"
                    >
                      <option value="recent">{t("Date d'ajout (Plus récents)")}</option>
                      <option value="commandes">{t('Commandes (Plus élevé)')}</option>
                      <option value="nom">{t('Nom alphabétique (A-Z)')}</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary-hover transition-colors cursor-pointer"
                  >
                    {t('Appliquer')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section (Table matching exact original mockup) */}
        <div className="flex flex-col gap-3 pb-12 w-full">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[900px] flex flex-col gap-3">
              
              {/* Table Header */}
              <div className="grid grid-cols-[180px_1fr_1.3fr_120px_110px_70px] gap-4 px-6 py-4 bg-surface-container-lowest rounded-xl shadow-sm items-center font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                <div>{t('clients.col_client')}</div>
                <div>{t('clients.col_company')}</div>
                <div>{t('clients.col_contact')}</div>
                <div>{t('clients.col_orders')}</div>
                <div>{t('clients.col_added_on')}</div>
                <div className="text-right">{t('clients.col_actions')}</div>
              </div>

              {/* Data Rows */}
              <div className="flex flex-col gap-2">
                {filteredClients.map((client) => {
                  const initials = getInitials(client);
                  return (
                    <div
                      key={client.id}
                      onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                      className="grid grid-cols-[180px_1fr_1.3fr_120px_110px_70px] gap-4 px-6 py-4.5 bg-surface rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 border border-border-base/40 transition-all items-center group cursor-pointer"
                    >
                      {/* Avatar & Nom */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-sm shrink-0 border border-border-base">
                          {initials}
                        </div>
                        <p className="font-medium text-sm text-on-surface group-hover:text-primary transition-colors m-0 truncate">
                          {client.prenom} {client.nom}
                        </p>
                      </div>

                      {/* Entreprise */}
                      <div className="min-w-0">
                        <p className="font-body-md text-sm text-on-surface m-0 truncate">
                          {client.entreprise || t('clients.individual')}
                        </p>
                      </div>

                      {/* Contact */}
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <p className="font-body-sm text-xs text-on-surface truncate m-0 font-medium">
                          {client.email}
                        </p>
                        <p className="font-label-sm text-xs text-on-surface-variant m-0 truncate">
                          {client.telephone}
                        </p>
                      </div>

                      {/* Commandes Badge */}
                      <div>
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 font-label-sm text-xs rounded-full ${
                            client.commandesCount > 15
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-surface-container-highest text-on-surface'
                          }`}
                        >
                          {client.commandesCount} {client.commandesCount > 1 ? t('clients.orders_count_many') : t('clients.orders_count_one')}
                        </span>
                      </div>

                      {/* Ajouté le (Date pure, sans statut) */}
                      <div>
                        <p className="font-body-sm text-sm text-on-surface-variant m-0 whitespace-nowrap">
                          {formatClientDate(client.createdAt)}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/clients/${client.id}`);
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors cursor-pointer"
                          title="Voir la fiche client"
                        >
                          <span className="material-symbols-outlined text-[19px]">visibility</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setClientToDelete(client);
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-error transition-colors cursor-pointer"
                          title="Supprimer le client"
                        >
                          <span className="material-symbols-outlined text-[19px]">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredClients.length === 0 && (
                  <div className="py-16 text-center bg-surface rounded-xl shadow-sm border border-dashed border-border-base flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                      <span className="material-symbols-outlined text-[28px]">{clients.length === 0 ? 'person_add' : 'person_search'}</span>
                    </div>
                    <p className="text-on-surface font-semibold text-sm m-0">
                      {clients.length === 0 ? t('Aucun client enregistré') : t('Aucun client trouvé pour votre recherche.')}
                    </p>
                    {clients.length === 0 ? (
                      <Link
                        href="/dashboard/clients/nouveau"
                        className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary text-xs font-semibold hover:bg-primary-hover transition-colors shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        <span>{t('clients.new_client')}</span>
                      </Link>
                    ) : (
                      (searchQuery || statusFilter !== 'all') && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('all');
                          }}
                          className="text-primary hover:underline text-xs font-semibold cursor-pointer"
                        >
                          {t('Effacer les filtres')}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {clientToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border-base p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-error/15 text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">delete</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-on-surface m-0">{t('Supprimer le client ?')}</h3>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1 m-0">
                {t('Êtes-vous sûr de vouloir supprimer')} &quot;{clientToDelete.prenom} {clientToDelete.nom}&quot; ? {t('Cette action est irréversible')}.
              </p>
            </div>
            <div className="flex justify-end items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
                className="px-4 py-2 rounded-xl border border-border-base text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                {t('Annuler')}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-error hover:bg-error/90 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              >
                {t('Supprimer')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
