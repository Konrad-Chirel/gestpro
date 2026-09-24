'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore, NotificationItem } from '@/context/StoreContext';

export default function TopHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const {
    t,
    theme,
    toggleTheme,
    clients,
    commandes,
    factures,
    paiements,
    produits,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    formatCurrency,
    user,
    userProfile,
    companySettings,
    logout,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // Close menus when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setIsSearchOpen(false);
      }
      if (notifContainerRef.current && !notifContainerRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMobileSearchOpen(false);
        setIsNotificationsOpen(false);
        setIsUserMenuOpen(false);
      }
      // Shortcut Ctrl+K or Cmd+K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
        desktopSearchInputRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Filter entities across the entire application for Omnisearch
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const matchedClients = clients
      .filter(
        (c) =>
          c.nom.toLowerCase().includes(q) ||
          c.prenom.toLowerCase().includes(q) ||
          c.entreprise.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.telephone.toLowerCase().includes(q)
      )
      .slice(0, 3);

    const matchedCommandes = commandes
      .filter(
        (cmd) =>
          cmd.numero.toLowerCase().includes(q) ||
          cmd.clientNom.toLowerCase().includes(q) ||
          cmd.statut.toLowerCase().includes(q)
      )
      .slice(0, 3);

    const matchedFactures = factures
      .filter(
        (f) =>
          f.numero.toLowerCase().includes(q) ||
          f.clientNom.toLowerCase().includes(q) ||
          f.statut.toLowerCase().includes(q)
      )
      .slice(0, 3);

    const matchedPaiements = paiements
      .filter(
        (p) =>
          p.reference.toLowerCase().includes(q) ||
          p.clientNom.toLowerCase().includes(q) ||
          p.methode.toLowerCase().includes(q)
      )
      .slice(0, 3);

    const matchedProduits = produits
      .filter(
        (prod) =>
          prod.nom.toLowerCase().includes(q) ||
          prod.sku.toLowerCase().includes(q) ||
          prod.categorie.toLowerCase().includes(q)
      )
      .slice(0, 3);

    const totalMatches =
      matchedClients.length +
      matchedCommandes.length +
      matchedFactures.length +
      matchedPaiements.length +
      matchedProduits.length;

    return {
      clients: matchedClients,
      commandes: matchedCommandes,
      factures: matchedFactures,
      paiements: matchedPaiements,
      produits: matchedProduits,
      totalMatches,
    };
  }, [searchQuery, clients, commandes, factures, paiements, produits]);

  const handleSelectSearchResult = (url: string) => {
    setIsSearchOpen(false);
    setIsMobileSearchOpen(false);
    setSearchQuery('');
    router.push(url);
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    markNotificationAsRead(notif.id);
    setIsNotificationsOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  // Reusable search results list component
  const renderResultsList = () => {
    if (!searchResults) return null;

    if (searchResults.totalMatches === 0) {
      return (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-[24px]">search_off</span>
          </div>
          <p className="text-sm font-semibold text-on-surface mb-1">Aucun résultat trouvé</p>
          <p className="text-xs text-on-surface-variant">
            Aucun élément ne correspond à &quot;{searchQuery}&quot;.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-on-surface-variant pb-2 border-b border-border-base">
          <span>
            {searchResults.totalMatches} résultat{searchResults.totalMatches > 1 ? 's' : ''} pour &quot;{searchQuery}&quot;
          </span>
          <button
            onClick={() => setSearchQuery('')}
            className="text-primary hover:underline cursor-pointer"
          >
            Effacer
          </button>
        </div>

        {/* Section: Clients */}
        {searchResults.clients.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">group</span>
              Clients ({searchResults.clients.length})
            </p>
            <div className="space-y-1">
              {searchResults.clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectSearchResult(`/dashboard/clients/${c.id}`)}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-surface-container-high text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {c.prenom.charAt(0)}{c.nom.charAt(0)}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                        {c.prenom} {c.nom}
                      </p>
                      <p className="text-[10px] text-on-surface-variant truncate">
                        {c.entreprise} • {c.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-medium">
                    Client
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Section: Commandes */}
        {searchResults.commandes.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">shopping_bag</span>
              Commandes ({searchResults.commandes.length})
            </p>
            <div className="space-y-1">
              {searchResults.commandes.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => handleSelectSearchResult(`/dashboard/commandes/${cmd.id}`)}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-surface-container-high text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-tertiary-container/10 text-tertiary-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                        {cmd.numero}
                      </p>
                      <p className="text-[10px] text-on-surface-variant truncate">
                        {cmd.clientNom} • {formatCurrency(cmd.totalTTC)}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                    {cmd.statut}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Section: Factures */}
        {searchResults.factures.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">description</span>
              Factures ({searchResults.factures.length})
            </p>
            <div className="space-y-1">
              {searchResults.factures.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleSelectSearchResult(`/dashboard/factures/${f.id}`)}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-surface-container-high text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary-container/15 text-primary-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">description</span>
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                        {f.numero}
                      </p>
                      <p className="text-[10px] text-on-surface-variant truncate">
                        {f.clientNom} • {formatCurrency(f.totalTTC)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      f.statut === 'payee'
                        ? 'bg-success/10 text-success'
                        : f.statut === 'retard'
                        ? 'bg-error/10 text-error'
                        : 'bg-amber-500/10 text-amber-500'
                    }`}
                  >
                    {f.statut === 'payee' ? 'Payée' : f.statut === 'retard' ? 'En retard' : 'En attente'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Section: Produits */}
        {searchResults.produits.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">inventory_2</span>
              Produits ({searchResults.produits.length})
            </p>
            <div className="space-y-1">
              {searchResults.produits.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectSearchResult('/dashboard/produits')}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-surface-container-high text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                        {p.nom}
                      </p>
                      <p className="text-[10px] text-on-surface-variant truncate">
                        SKU: {p.sku} • Stock: {p.stock}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-on-surface">
                    {formatCurrency(p.prix)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Section: Paiements */}
        {searchResults.paiements.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">payments</span>
              Paiements ({searchResults.paiements.length})
            </p>
            <div className="space-y-1">
              {searchResults.paiements.map((pay) => (
                <button
                  key={pay.id}
                  onClick={() => handleSelectSearchResult('/dashboard/paiements')}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-surface-container-high text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">payments</span>
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                        {pay.reference}
                      </p>
                      <p className="text-[10px] text-on-surface-variant truncate">
                        {pay.clientNom} • {pay.methode}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-success">
                    {formatCurrency(pay.montant)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const storedName = typeof window !== 'undefined' ? localStorage.getItem('gestpro_user_name') : null;
  const storedCompany = typeof window !== 'undefined' ? localStorage.getItem('gestpro_company_name') : null;
  const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('gestpro_user_email') : null;

  const displayName = userProfile?.full_name || user?.user_metadata?.full_name || storedName || 'Konrad Chirel';
  const displayCompany = userProfile?.company_name || companySettings?.companyName || storedCompany || 'GestPro S.A.S';
  const displayEmail = user?.email || userProfile?.email || storedEmail || '';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'KC';

  return (
    <>
      <header className="fixed top-0 left-0 md:left-72 right-0 h-20 bg-background/80 backdrop-blur-md z-40 border-b border-border-base flex items-center justify-between px-container-margin gap-4">
        {/* Left: Mobile hamburger & Desktop Global Search */}
        <div className="flex items-center w-full max-w-sm md:w-96 gap-2" ref={searchContainerRef}>
          {/* Hamburger button for mobile menu */}
          <button
            onClick={onMenuClick}
            aria-label="Ouvrir le menu"
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container-high text-on-surface-variant cursor-pointer transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>

          {/* Single clean mobile search trigger button */}
          <button
            onClick={() => {
              setIsMobileSearchOpen(true);
              setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
            }}
            aria-label="Ouvrir la recherche globale"
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>

          {/* Desktop Search Bar (hidden on mobile) */}
          <div className="hidden md:flex relative flex-1">
            <div
              className={`flex items-center bg-surface-container-high rounded-full w-full px-4 py-2.5 transition-all border ${
                isSearchOpen ? 'border-primary/50 ring-2 ring-primary/10' : 'border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-on-surface-variant mr-2 text-[20px] shrink-0">
                search
              </span>
              <input
                ref={desktopSearchInputRef}
                className="bg-transparent border-none focus:ring-0 text-sm w-full text-on-surface placeholder:text-on-surface-variant outline-none"
                placeholder={`${t('header.search')} (Ctrl+K)`}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-on-surface-variant hover:text-on-surface p-0.5 rounded-full"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Desktop Search Dropdown Modal */}
            {isSearchOpen && (
              <div className="absolute top-12 left-0 w-96 md:w-[480px] bg-surface rounded-2xl border border-border-base shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[80vh] overflow-y-auto">
                {!searchQuery.trim() ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-on-surface-variant pb-2 border-b border-border-base">
                      <span>Recherche globale GestPro</span>
                      <kbd className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] font-mono">
                        ESC pour fermer
                      </kbd>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                        Raccourcis & Accès rapides
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleSelectSearchResult('/dashboard/commandes/nouveau')}
                          className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-left transition-colors cursor-pointer text-xs"
                        >
                          <span className="material-symbols-outlined text-primary text-[18px]">add_shopping_cart</span>
                          <span className="font-medium text-on-surface">Nouvelle commande</span>
                        </button>
                        <button
                          onClick={() => handleSelectSearchResult('/dashboard/clients/nouveau')}
                          className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-left transition-colors cursor-pointer text-xs"
                        >
                          <span className="material-symbols-outlined text-tertiary text-[18px]">person_add</span>
                          <span className="font-medium text-on-surface">Nouveau client</span>
                        </button>
                        <button
                          onClick={() => handleSelectSearchResult('/dashboard/factures/nouveau')}
                          className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-left transition-colors cursor-pointer text-xs"
                        >
                          <span className="material-symbols-outlined text-secondary text-[18px]">post_add</span>
                          <span className="font-medium text-on-surface">Créer une facture</span>
                        </button>
                        <button
                          onClick={() => handleSelectSearchResult('/dashboard/historique')}
                          className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-left transition-colors cursor-pointer text-xs"
                        >
                          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">history</span>
                          <span className="font-medium text-on-surface">Historique d'activités</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-on-surface-variant text-center pt-2">
                      💡 Tapez un nom de client, numéro de commande (#CMD), facture (#FAC), paiement ou produit.
                    </p>
                  </div>
                ) : (
                  renderResultsList()
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Theme Toggle, Notifications with Badge & Dropdown, Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[22px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Notifications Icon with Dynamic Number Badge & Interactive Dropdown */}
          <div className="relative" ref={notifContainerRef}>
            <button
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              aria-label="Afficher les notifications"
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>

              {/* Dynamic Number Badge on Bell Icon */}
              {unreadNotificationsCount > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-error text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-md animate-pulse ring-2 ring-background">
                  {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                </span>
              ) : (
                <span className="sr-only">Aucune notification non lue</span>
              )}
            </button>

            {/* Notifications Dropdown Panel (Responsive for mobile & desktop) */}
            {isNotificationsOpen && (
              <div className="fixed sm:absolute top-20 sm:top-12 left-3 sm:left-auto right-3 sm:right-0 sm:w-96 bg-surface rounded-2xl border border-border-base shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border-base bg-surface-container-low/50">
                  <div className="flex items-center gap-2">
                    <h3 className="font-title-md text-title-md text-on-surface m-0">Notifications</h3>
                    {unreadNotificationsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-error/15 text-error text-[11px] font-bold">
                        {unreadNotificationsCount} nouvelle{unreadNotificationsCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-primary hover:underline font-medium cursor-pointer"
                    >
                      Tout marquer comme lu
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-[380px] overflow-y-auto divide-y divide-border-base/50">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-3 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[24px]">notifications_off</span>
                      </div>
                      <p className="text-sm font-semibold text-on-surface mb-1">Aucune notification</p>
                      <p className="text-xs text-on-surface-variant">Vous êtes totalement à jour !</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3.5 flex items-start gap-3 hover:bg-surface-container-high/60 transition-colors cursor-pointer ${
                          !notif.read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${notif.iconBg}`}
                        >
                          <span className={`material-symbols-outlined text-[18px] ${notif.iconColor}`}>
                            {notif.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <p
                              className={`text-xs truncate ${
                                !notif.read ? 'text-on-surface font-bold' : 'text-on-surface-variant font-medium'
                              }`}
                            >
                              {notif.title}
                            </p>
                            <span className="text-[10px] text-on-surface-variant shrink-0">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" title="Non lue"></div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-border-base bg-surface-container-low/30 flex items-center justify-between text-xs">
                    <button
                      onClick={clearAllNotifications}
                      className="text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                    >
                      Effacer tout
                    </button>
                    <Link
                      href="/dashboard/historique"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                    >
                      Voir l'historique complet
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div ref={userMenuRef} className="relative flex items-center gap-3 pl-2 sm:pl-6 border-l border-border-base shrink-0">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-3 text-left p-1 rounded-full sm:rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer group"
              aria-expanded={isUserMenuOpen}
            >
              <div className="text-right hidden sm:block">
                <p className="font-label-md text-label-md text-on-surface font-semibold group-hover:text-primary transition-colors">{displayName}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{displayCompany}</p>
              </div>
              <div
                className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm shadow-md shadow-primary/20 group-hover:scale-105 transition-transform shrink-0"
                title={`${displayName} - ${displayEmail}`}
              >
                {initials}
              </div>
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-surface rounded-2xl shadow-2xl border border-border-base py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-border-base">
                  <p className="text-sm font-bold text-on-surface truncate">{displayName}</p>
                  <p className="text-xs text-on-surface-variant truncate mt-0.5">{displayEmail || 'Connecté'}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary rounded-full uppercase tracking-wider">
                    {displayCompany}
                  </span>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <Link
                    href="/dashboard/parametres"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-high transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">settings</span>
                    <span>Mon profil & paramètres</span>
                  </Link>

                  <Link
                    href="/dashboard"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-high transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">dashboard</span>
                    <span>Tableau de bord</span>
                  </Link>
                </div>

                {/* Logout Button */}
                <div className="border-t border-border-base pt-1 mt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      setIsUserMenuOpen(false);
                      await logout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-colors text-left cursor-pointer font-medium"
                  >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    <span>Se déconnecter</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Dedicated Mobile Full-Screen Search Modal */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-background/98 backdrop-blur-xl flex flex-col p-4 md:hidden animate-in fade-in duration-150">
          {/* Top Search Input Bar on Mobile */}
          <div className="flex items-center gap-2 pb-3 border-b border-border-base">
            <button
              onClick={() => {
                setIsMobileSearchOpen(false);
                setSearchQuery('');
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer shrink-0"
              aria-label="Fermer la recherche"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>

            <div className="flex-1 flex items-center bg-surface-container-high rounded-full px-4 py-2 border border-border-base focus-within:border-primary">
              <span className="material-symbols-outlined text-on-surface-variant mr-2 text-[20px] shrink-0">
                search
              </span>
              <input
                ref={mobileSearchInputRef}
                autoFocus
                className="bg-transparent border-none focus:ring-0 text-sm w-full text-on-surface placeholder:text-on-surface-variant outline-none"
                placeholder="Rechercher clients, commandes, factures..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-on-surface-variant hover:text-on-surface p-1 rounded-full shrink-0"
                  aria-label="Effacer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Results / Shortcuts area on Mobile */}
          <div className="flex-1 overflow-y-auto pt-4 pb-8 space-y-4">
            {!searchQuery.trim() ? (
              <div className="space-y-4">
                <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                  Raccourcis & Accès rapides
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleSelectSearchResult('/dashboard/commandes/nouveau')}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-left transition-colors cursor-pointer text-xs"
                  >
                    <span className="material-symbols-outlined text-primary text-[20px]">add_shopping_cart</span>
                    <span className="font-medium text-on-surface">Nouvelle commande</span>
                  </button>
                  <button
                    onClick={() => handleSelectSearchResult('/dashboard/clients/nouveau')}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-left transition-colors cursor-pointer text-xs"
                  >
                    <span className="material-symbols-outlined text-tertiary text-[20px]">person_add</span>
                    <span className="font-medium text-on-surface">Nouveau client</span>
                  </button>
                  <button
                    onClick={() => handleSelectSearchResult('/dashboard/factures/nouveau')}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-left transition-colors cursor-pointer text-xs"
                  >
                    <span className="material-symbols-outlined text-secondary text-[20px]">post_add</span>
                    <span className="font-medium text-on-surface">Créer une facture</span>
                  </button>
                  <button
                    onClick={() => handleSelectSearchResult('/dashboard/historique')}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-left transition-colors cursor-pointer text-xs"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">history</span>
                    <span className="font-medium text-on-surface">Historique</span>
                  </button>
                </div>
                <div className="p-4 rounded-2xl bg-surface-container-low text-center mt-6">
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    💡 <strong>Recherche globale</strong> : tapez le nom d'un client, numéro de commande (#CMD), numéro de facture (#FAC), référence de paiement ou nom de produit pour y accéder immédiatement.
                  </p>
                </div>
              </div>
            ) : (
              renderResultsList()
            )}
          </div>
        </div>
      )}
    </>
  );
}
