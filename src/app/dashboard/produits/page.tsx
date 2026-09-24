'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore, Produit } from '@/context/StoreContext';

export default function ProduitsPage() {
  const { produits, deleteProduit, updateProduit, formatCurrency, currencySymbol, t } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Produit | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Edit form state
  const [editNom, setEditNom] = useState('');
  const [editPrix, setEditPrix] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editCategorie, setEditCategorie] = useState('');

  const openEditModal = (p: Produit) => {
    setEditingProduct(p);
    setEditNom(p.nom);
    setEditPrix(p.prix.toString());
    setEditStock(p.stock.toString());
    setEditCategorie(p.categorie);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduit(editingProduct.id, {
      nom: editNom.trim() || editingProduct.nom,
      prix: parseFloat(editPrix) || 0,
      stock: parseInt(editStock) || 0,
      categorie: editCategorie || editingProduct.categorie,
    });
    setEditingProduct(null);
  };

  const handleDelete = (id: string) => {
    deleteProduit(id);
    setDeleteConfirmId(null);
  };

  // Helper to capitalize category
  const formatCategory = (cat: string) => {
    if (!cat) return t('categories.general');
    const lower = cat.toLowerCase();
    if (lower === 'alimentaire') return t('categories.alimentaire');
    if (lower === 'entretien') return t('categories.entretien');
    if (lower === 'boissons') return t('categories.boissons');
    return t(cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase());
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    (produits || []).forEach((p) => {
      if (p.categorie) set.add(p.categorie.toLowerCase());
    });
    if (!set.has('alimentaire')) set.add('alimentaire');
    if (!set.has('entretien')) set.add('entretien');
    return Array.from(set);
  }, [produits]);

  // Filtered products
  const filteredProduits = useMemo(() => {
    return (produits || []).filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.nom.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        p.categorie.toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === 'all' ||
        p.categorie.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [produits, searchQuery, selectedCategory]);

  return (
    <div className="w-full pb-16 flex flex-col px-4 sm:px-8 py-8 gap-8">
      <div className="flex flex-col w-full gap-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight m-0">
              {t('products.catalog')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-bold text-xs border border-border-base">
              {filteredProduits.length}
            </span>
          </div>
          <Link
            href="/dashboard/produits/nouveau"
            className="bg-primary hover:bg-primary-hover text-on-primary font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-6 rounded-full flex items-center gap-2 transition-colors shadow-md shadow-primary/20 shrink-0 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>{t('products.new')}</span>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-surface p-4 rounded-xl shadow-sm border border-border-base gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center bg-input-bg rounded-lg px-4 py-2 border border-border-base w-72 focus-within:border-primary transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant mr-2 text-[20px]">
                search
              </span>
              <input
                className="bg-transparent border-none focus:ring-0 text-body-sm font-body-sm w-full text-on-surface outline-none"
                placeholder={t('products.search_placeholder')}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-label-sm text-label-sm border border-border-base transition-colors cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    : 'bg-surface text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {t('categories.all')}
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('alimentaire')}
                className={`px-4 py-2 rounded-lg font-label-sm text-label-sm border border-border-base transition-colors cursor-pointer ${
                  selectedCategory === 'alimentaire'
                    ? 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    : 'bg-surface text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {t('categories.alimentaire')}
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('entretien')}
                className={`px-4 py-2 rounded-lg font-label-sm text-label-sm border border-border-base transition-colors cursor-pointer ${
                  selectedCategory === 'entretien'
                    ? 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    : 'bg-surface text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {t('categories.entretien')}
              </button>
              {categories
                .filter((c) => c !== 'alimentaire' && c !== 'entretien')
                .map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg font-label-sm text-label-sm border border-border-base transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                        : 'bg-surface text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {formatCategory(cat)}
                  </button>
                ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="flex items-center gap-2 px-4 py-2 text-on-surface-variant font-label-sm text-label-sm hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            {t('products.advanced_filters')}
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-6">
          {filteredProduits.length > 0 ? (
            filteredProduits.map((p) => {
              const isRupture = p.stock === 0;
              const isFaible = !isRupture && p.stock <= (p.alerte || 10);
              const productIcon =
                p.icon ||
                (p.categorie === 'entretien'
                  ? 'cleaning_services'
                  : p.categorie === 'boissons'
                  ? 'local_bar'
                  : 'inventory_2');

              return (
                <div
                  key={p.id}
                  className="bg-surface rounded-xl p-5 border border-border-base shadow-sm hover:shadow-md transition-shadow flex flex-col relative group"
                >
                  <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2 z-10">
                    <button
                      type="button"
                      onClick={() => openEditModal(p)}
                      className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer shadow-sm"
                      title="Modifier le produit"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(p.id)}
                      className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-error transition-colors cursor-pointer shadow-sm"
                      title="Supprimer le produit"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>

                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <span className="material-symbols-outlined">{productIcon}</span>
                  </div>

                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-base sm:text-lg text-on-surface line-clamp-1" title={p.nom}>
                      {p.nom}
                    </h3>
                  </div>

                  <span className="inline-block px-2.5 py-1 rounded bg-surface-container text-on-surface-variant text-xs font-medium w-fit mb-4">
                    {formatCategory(p.categorie)}
                  </span>

                  <div className="mt-auto pt-4 border-t border-border-base flex flex-wrap items-end justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-medium text-on-surface-variant whitespace-nowrap mb-0.5">
                        {t('products.unit_price')}
                      </span>
                      <span className="text-base sm:text-lg font-bold text-primary whitespace-nowrap">
                        {formatCurrency(p.prix)}
                      </span>
                    </div>

                    {isRupture ? (
                      <div className="px-2 py-0.5 rounded-full bg-error/15 text-error text-[11px] font-medium flex items-center gap-1 whitespace-nowrap shrink-0 border border-error/20">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        <span>{t('products.out_of_stock')} (0)</span>
                      </div>
                    ) : isFaible ? (
                      <div className="px-2 py-0.5 rounded-full bg-warning/15 text-warning text-[11px] font-medium flex items-center gap-1 whitespace-nowrap shrink-0 border border-warning/20">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        <span>{t('products.low_stock')} ({p.stock})</span>
                      </div>
                    ) : (
                      <div className="px-2 py-0.5 rounded-full bg-success/15 text-success text-[11px] font-medium flex items-center gap-1 whitespace-nowrap shrink-0 border border-success/20">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        <span>{t('products.in_stock')} ({p.stock})</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center p-8 bg-surface rounded-xl border border-border-base">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-3">
                inventory_2
              </span>
              <h3 className="text-lg font-bold text-on-surface mb-1">{t('Aucun produit trouvé')}</h3>
              <p className="text-sm text-on-surface-variant max-w-md mb-6">
                {t('Aucun article ne correspond à vos critères de recherche ou à la catégorie sélectionnée.')}
              </p>
              <Link
                href="/dashboard/produits/nouveau"
                className="bg-primary hover:bg-primary-hover text-on-primary font-medium text-sm h-10 px-5 rounded-full flex items-center gap-2 transition-colors shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>{t('Ajouter un produit')}</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-border-base flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[24px]">delete</span>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-on-surface mb-1">{t('Supprimer le produit ?')}</h3>
              <p className="text-xs text-on-surface-variant">
                {t('Cette action supprimera définitivement le produit du catalogue.')}
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 h-10 rounded-xl border border-border-base text-on-surface hover:bg-surface-container-high font-medium text-xs sm:text-sm transition-colors cursor-pointer"
              >
                {t('Annuler')}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 h-10 rounded-xl bg-error hover:bg-error/90 text-on-error font-medium text-xs sm:text-sm transition-colors cursor-pointer shadow-md"
              >
                {t('Supprimer')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border-base flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-border-base">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2 m-0">
                <span className="material-symbols-outlined text-primary text-[20px]">edit</span>
                {t('Modifier le produit')}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  {t('Nom du produit')}
                </label>
                <input
                  type="text"
                  required
                  value={editNom}
                  onChange={(e) => setEditNom(e.target.value)}
                  className="h-10 px-3 bg-surface-container border border-border-base rounded-lg text-sm text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    {t('common.price')} ({currencySymbol} {t('common.excl_tax')})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editPrix}
                    onChange={(e) => setEditPrix(e.target.value)}
                    className="h-10 px-3 bg-surface-container border border-border-base rounded-lg text-sm text-on-surface outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    {t('Stock')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="h-10 px-3 bg-surface-container border border-border-base rounded-lg text-sm text-on-surface outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  {t('Catégorie')}
                </label>
                <select
                  value={editCategorie}
                  onChange={(e) => setEditCategorie(e.target.value)}
                  className="h-10 px-3 bg-surface-container border border-border-base rounded-lg text-sm text-on-surface outline-none focus:border-primary cursor-pointer"
                >
                  <option value="alimentaire">{t('categories.alimentaire')}</option>
                  <option value="entretien">{t('categories.entretien')}</option>
                  <option value="boissons">{t('categories.boissons')}</option>
                  <option value="divers">{t('Divers')}</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-base">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 h-10 rounded-xl border border-border-base text-on-surface hover:bg-surface-container-high text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  {t('Annuler')}
                </button>
                <button
                  type="submit"
                  className="px-6 h-10 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs sm:text-sm font-semibold transition-colors shadow-md cursor-pointer"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
