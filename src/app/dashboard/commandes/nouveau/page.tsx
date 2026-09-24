'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore, OrderItem } from '@/context/StoreContext';

const CATALOG_PRODUCTS = [
  { name: 'Farine de blé', price: 1.20 },
  { name: 'Huile Végétale 1L', price: 3.50 },
  { name: 'Sucre en poudre 1kg', price: 1.10 },
  { name: 'Lait UHT 1L', price: 0.95 },
  { name: 'Licence Pro Annuelle', price: 450.00 },
  { name: 'Formation Initiale', price: 250.00 },
  { name: 'Support Premium', price: 120.00 },
  { name: 'Migration de données', price: 300.00 },
];

export default function NouvelleCommandePage() {
  const router = useRouter();
  const { clients, produits, addCommande, formatCurrency, currencySymbol, t, user, userProfile } = useStore();

  const catalogList = (produits && produits.length > 0)
    ? produits.map((p) => ({ name: p.nom, price: p.prix }))
    : CATALOG_PRODUCTS;

  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients.length > 0 ? clients[0].id : ''
  );
  const [dateLivraison, setDateLivraison] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [tvaRate, setTvaRate] = useState<number>(20);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState<OrderItem[]>([
    { id: '1', productName: 'Sucre en poudre 1kg', unitPrice: 1.10, quantity: 5 },
    { id: '2', productName: 'Huile Végétale 1L', unitPrice: 3.50, quantity: 2 },
  ]);
  const [customItemIds, setCustomItemIds] = useState<Set<string>>(new Set());

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const handleSelectProduct = (id: string, value: string) => {
    if (value === '__custom__') {
      setCustomItemIds((prev) => new Set(prev).add(id));
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, productName: '' } : item
        )
      );
    } else {
      const prod = catalogList.find((p) => p.name === value);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                productName: value,
                unitPrice: prod ? prod.price : item.unitPrice,
              }
            : item
        )
      );
    }
  };

  const handleCustomNameChange = (id: string, name: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, productName: name } : item
      )
    );
  };

  const switchToCatalog = (id: string) => {
    setCustomItemIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const matched = CATALOG_PRODUCTS.find((p) => p.name === item.productName);
          const fallback = matched || CATALOG_PRODUCTS[0];
          return {
            ...item,
            productName: fallback.name,
            unitPrice: fallback.price,
          };
        }
        return item;
      })
    );
  };

  const updateQuantity = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, qty) } : item
      )
    );
  };

  const updateUnitPrice = (id: string, price: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, unitPrice: Math.max(0, price) } : item
      )
    );
  };

  const addItem = () => {
    const nextId = String(Date.now());
    const defaultProduct = CATALOG_PRODUCTS[items.length % CATALOG_PRODUCTS.length];
    setItems((prev) => [
      ...prev,
      { id: nextId, productName: defaultProduct.name, unitPrice: defaultProduct.price, quantity: 1 },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) {
      const defaultProduct = CATALOG_PRODUCTS[0];
      setItems([{ id: String(Date.now()), productName: defaultProduct.name, unitPrice: defaultProduct.price, quantity: 1 }]);
    } else {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setCustomItemIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Calculations
  const subtotalHT = items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );
  const taxAmount = subtotalHT * (tvaRate / 100);
  const totalTTC = subtotalHT + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      alert(t('Veuillez sélectionner un client.'));
      return;
    }

    const validItems = items.filter((i) => i.productName.trim() !== '');
    if (validItems.length === 0) {
      alert(t('Veuillez ajouter au moins un article avec un nom.'));
      return;
    }

    setIsSubmitting(true);

    try {
      const created = addCommande({
        clientId: selectedClient.id,
        clientNom: `${selectedClient.prenom} ${selectedClient.nom} (${selectedClient.entreprise})`,
        clientEmail: selectedClient.email,
        dateLivraison: dateLivraison || 'À convenir',
        creeePar: userProfile?.full_name || user?.user_metadata?.full_name || 'Admin',
        statut: 'attente',
        articles: validItems,
        totalHT: subtotalHT,
        tva: taxAmount,
        totalTTC: totalTTC,
        notes: notes.trim(),
      });

      router.push(`/dashboard/commandes/${created.id}`);
    } catch (err) {
      console.error('Error creating commande', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto pb-16 px-4 sm:px-8 py-6 sm:py-8 flex flex-col gap-6 sm:gap-8">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 border-b border-border-base pb-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/dashboard/commandes"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-surface hover:bg-surface-container-high border border-border-base text-on-surface hover:text-primary transition-colors shadow-sm shrink-0 cursor-pointer"
            title={t('Retour aux commandes')}
          >
            <span className="material-symbols-outlined text-[20px] sm:text-[22px]">arrow_back</span>
          </Link>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight m-0">
            {t('Nouvelle commande')}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 bg-surface-container-high/60 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-border-base shrink-0">
          <span className="text-[11px] sm:text-xs text-on-surface-variant uppercase tracking-widest font-semibold hidden sm:inline">
            {t('Statut initial')}
          </span>
          <div className="px-2.5 py-1 rounded-md bg-warning/15 text-warning text-xs font-semibold flex items-center gap-1.5 border border-warning/20">
            <div className="w-2 h-2 rounded-full bg-warning animate-pulse"></div>
            {t('En attente')}
          </div>
        </div>
      </header>

      {/* Main Form Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8">
        {/* Main Form Area (Left) */}
        <div className="xl:col-span-8 flex flex-col gap-6 sm:gap-8">
          {/* Section Client */}
          <section className="bg-surface rounded-xl p-5 sm:p-6 shadow-sm border border-border-base">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-on-surface flex items-center gap-2.5 m-0">
                <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </span>
                {t('Client associé')}
              </h2>
              <Link
                href="/dashboard/clients/nouveau"
                className="h-8 px-3.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest border border-border-base text-primary hover:text-primary-hover transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>{t('Nouveau client')}</span>
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">
                {t('Sélectionner un client dans la base')}
              </label>
              <div className="relative">
                <select
                  required
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full h-12 bg-surface-container border border-border-base rounded-xl px-4 pr-10 text-sm text-on-surface outline-none appearance-none cursor-pointer focus:border-primary/60 transition-colors"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id} className="bg-surface text-on-surface">
                      {c.prenom} {c.nom} — {c.entreprise} ({c.ville || 'Sénégal'})
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined text-on-surface-variant absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[20px]">
                  expand_more
                </span>
              </div>

              {selectedClient && (
                <div className="mt-2 p-3 bg-surface-container-low rounded-lg border border-border-base/50 flex items-center justify-between text-xs text-on-surface-variant">
                  <span>
                    Email: <strong className="text-on-surface">{selectedClient.email}</strong>
                  </span>
                  <span>
                    {t('Téléphone')}: <strong className="text-on-surface">{selectedClient.telephone}</strong>
                  </span>
                  <span>
                    {t('Total commandes:')}{' '}
                    <strong className="text-primary">{selectedClient.commandesCount}</strong>
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Section Articles */}
          <section className="bg-surface rounded-xl p-5 sm:p-6 shadow-sm border border-border-base">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base sm:text-lg font-semibold text-on-surface flex items-center gap-2.5 m-0">
                <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                </span>
                {t('Articles de la commande')}
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary border border-border-base text-xs font-semibold transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>{t('Ajouter un article')}</span>
              </button>
            </div>

            {/* Articles Table Container */}
            <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
              <div className="min-w-[620px] flex flex-col gap-3">
                {/* Column Headers (Desktop) */}
                <div className="hidden md:flex items-center gap-3 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  <span className="w-6 text-center shrink-0">#</span>
                  <span className="flex-1 min-w-[200px]">{t('Article / Produit')}</span>
                  <span className="w-28 text-center shrink-0">{t('Quantité')}</span>
                  <span className="w-28 text-right pr-2 shrink-0">{t('P.U. HT')}</span>
                  <span className="w-24 text-right shrink-0">{t('Total HT')}</span>
                  <span className="w-9 shrink-0"></span>
                </div>

                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3.5 sm:p-4 rounded-xl bg-surface-container-low border border-border-base/70 flex flex-col md:flex-row items-stretch md:items-center gap-3 transition-all hover:border-border-base"
                  >
                    <span className="text-xs font-bold text-on-surface-variant w-6 text-center shrink-0">
                      #{index + 1}
                    </span>

                    {/* Article Name / Selector */}
                    <div className="flex-1 min-w-[200px] flex flex-col gap-1">
                      <label className="text-[11px] text-on-surface-variant font-medium md:hidden">
                        {t('Produit')}
                      </label>
                      {customItemIds.has(item.id) ? (
                        <div className="relative flex items-center gap-1.5 w-full">
                          <input
                            type="text"
                            value={item.productName}
                            onChange={(e) => handleCustomNameChange(item.id, e.target.value)}
                            placeholder={t("Saisir le nom de l'article...")}
                            required
                            className="w-full h-10 bg-input-bg border border-border-base rounded-lg px-3 text-sm text-on-surface outline-none focus:border-primary transition-colors"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => switchToCatalog(item.id)}
                            className="h-10 px-2.5 rounded-lg border border-border-base bg-surface-container hover:bg-surface-container-high text-xs text-on-surface-variant hover:text-primary transition-colors shrink-0 flex items-center gap-1"
                            title={t('Revenir au catalogue')}
                          >
                            <span className="material-symbols-outlined text-[16px]">list</span>
                            <span className="hidden sm:inline text-[11px] font-medium">{t('Catalogue')}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="relative w-full">
                          <select
                            value={item.productName}
                            onChange={(e) => handleSelectProduct(item.id, e.target.value)}
                            required
                            className="w-full h-10 bg-input-bg border border-border-base rounded-lg pl-3 pr-9 text-sm text-on-surface outline-none appearance-none cursor-pointer focus:border-primary transition-colors truncate"
                          >
                            <option value="" disabled>
                              {t('Sélectionner un produit...')}
                            </option>
                            {catalogList.map((p) => (
                              <option key={p.name} value={p.name} className="bg-surface text-on-surface">
                                {p.name} ({formatCurrency(p.price)})
                              </option>
                            ))}
                            {item.productName && !catalogList.some((p) => p.name === item.productName) && (
                              <option value={item.productName} className="bg-surface text-on-surface">
                                {item.productName}
                              </option>
                            )}
                            <option value="__custom__" className="bg-surface text-primary font-medium">
                              {t('+ Saisie personnalisée / Autre...')}
                            </option>
                          </select>
                          <span className="material-symbols-outlined text-on-surface-variant absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[20px]">
                            expand_more
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quantity Stepper */}
                    <div className="w-full md:w-28 shrink-0 flex flex-col gap-1">
                      <label className="text-[11px] text-on-surface-variant font-medium md:hidden">
                        {t('Quantité')}
                      </label>
                      <div className="flex items-center bg-input-bg rounded-lg border border-border-base h-10 px-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer shrink-0"
                        >
                          <span className="material-symbols-outlined text-[16px]">remove</span>
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-full text-center bg-transparent text-sm font-semibold text-on-surface outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer shrink-0"
                        >
                          <span className="material-symbols-outlined text-[16px]">add</span>
                        </button>
                      </div>
                    </div>

                    {/* Unit Price */}
                    <div className="w-full md:w-28 shrink-0 flex flex-col gap-1">
                      <label className="text-[11px] text-on-surface-variant font-medium md:hidden">
                        {t('Prix U. HT')}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => updateUnitPrice(item.id, parseFloat(e.target.value) || 0)}
                          className="w-full h-10 bg-input-bg border border-border-base rounded-lg pl-2.5 pr-8 text-sm text-right font-semibold text-on-surface outline-none focus:border-primary"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant pointer-events-none">
                          {currencySymbol}
                        </span>
                      </div>
                    </div>

                    {/* Total line */}
                    <div className="w-24 shrink-0 text-right font-mono font-bold text-sm text-on-surface hidden md:block whitespace-nowrap">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-error/15 hover:text-error transition-colors cursor-pointer shrink-0 self-end md:self-center"
                      title={t('Supprimer la ligne')}
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section Dates & Notes */}
          <section className="bg-surface rounded-xl p-5 sm:p-6 shadow-sm border border-border-base grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">
                {t('Date de livraison souhaitée')}
              </label>
              <input
                type="date"
                value={dateLivraison}
                onChange={(e) => setDateLivraison(e.target.value)}
                className="h-11 bg-input-bg border border-border-base rounded-lg px-4 text-sm text-on-surface outline-none focus:border-primary cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">
                {t('Taux de TVA')}
              </label>
              <select
                value={tvaRate}
                onChange={(e) => setTvaRate(parseFloat(e.target.value))}
                className="h-11 bg-input-bg border border-border-base rounded-lg px-4 text-sm text-on-surface outline-none focus:border-primary cursor-pointer"
              >
                <option value={20}>{t('20% (Standard)')}</option>
                <option value={18}>{t('18% (Sénégal standard)')}</option>
                <option value={10}>{t('10% (Intermédiaire)')}</option>
                <option value={0}>{t('0% (Exonéré)')}</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">
                {t('Instructions ou notes internes')}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("Ex: Livrer le matin à l'entrepôt 4, contact sur place...")}
                className="bg-input-bg border border-border-base rounded-lg p-3 text-sm text-on-surface outline-none focus:border-primary resize-none"
              />
            </div>
          </section>
        </div>

        {/* Sidebar Summary Area (Right) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="bg-surface rounded-xl border border-border-base shadow-lg overflow-hidden sticky top-24">
            <div className="p-5 sm:p-6 border-b border-border-base bg-surface-container/30">
              <h2 className="text-base font-semibold text-on-surface m-0">{t('Récapitulatif financier')}</h2>
            </div>

            <div className="p-5 sm:p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">{t('Sous-total HT')}</span>
                <span className="font-semibold text-on-surface font-mono">{formatCurrency(subtotalHT)}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">{t('TVA')} ({tvaRate}%)</span>
                <span className="font-semibold text-on-surface font-mono">{formatCurrency(taxAmount)}</span>
              </div>

              <div className="h-px w-full bg-border-base"></div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-base font-bold text-on-surface">{t('Total TTC')}</span>
                <span className="text-2xl font-extrabold text-primary font-mono tracking-tight">
                  {formatCurrency(totalTTC)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-5 bg-surface-container-high/30 border-t border-border-base flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-primary hover:bg-primary-hover text-on-primary rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 active:scale-98"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>{isSubmitting ? t('Création en cours...') : t('Créer la commande')}</span>
              </button>
              <Link
                href="/dashboard/commandes"
                className="w-full h-11 border border-border-base hover:bg-surface-container-high text-on-surface rounded-xl font-medium text-sm transition-all flex items-center justify-center cursor-pointer"
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
