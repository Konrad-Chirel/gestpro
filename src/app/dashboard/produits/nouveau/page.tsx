'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';

export default function NouveauProduitPage() {
  const router = useRouter();
  const { addProduit, currencySymbol, toBasePrice, t } = useStore();

  const generateSKU = (cat: string) => {
    const prefixMap: Record<string, string> = {
      alimentaire: 'ALI',
      entretien: 'ENT',
      boissons: 'BOI',
      divers: 'DIV',
    };
    const prefix = prefixMap[cat.toLowerCase()] || 'PRD';
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${randomNum}`;
  };

  const [nom, setNom] = useState('');
  const [categorie, setCategorie] = useState('alimentaire');
  const [sku, setSku] = useState(() => generateSKU('alimentaire'));
  const [isManualSku, setIsManualSku] = useState(false);
  const [prix, setPrix] = useState('');
  const [tva, setTva] = useState('18');
  const [stock, setStock] = useState('');
  const [alerte, setAlerte] = useState('');
  const [description, setDescription] = useState('');
  const [imageName, setImageName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleGenerateSku = () => {
    setSku(generateSKU(categorie));
    setIsManualSku(false);
  };

  const handleCategorieChange = (newCat: string) => {
    setCategorie(newCat);
    if (!isManualSku) {
      setSku(generateSKU(newCat));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;

    setIsSubmitted(true);

    const rawPrix = parseFloat(prix) || 0;
    const basePrix = toBasePrice(rawPrix);
    addProduit({
      nom: nom.trim(),
      sku: sku.trim() || `PROD-${Date.now().toString().slice(-5)}`,
      categorie,
      prix: basePrix,
      tva: parseFloat(tva) || 18,
      stock: parseInt(stock) || 0,
      alerte: parseInt(alerte) || 10,
      description: description.trim() || undefined,
      image: imageName || undefined,
    });

    setTimeout(() => {
      router.push('/dashboard/produits');
    }, 600);
  };

  return (
    <div className="w-full pb-16 flex flex-col px-4 sm:px-8 py-6 sm:py-8 gap-6 sm:gap-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/produits"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors shrink-0"
          title={t('Retour aux produits')}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight m-0">
          {t('Nouveau produit')}
        </h1>
      </div>

      {/* Main Form Card */}
      <div className="w-full max-w-3xl mx-auto bg-surface rounded-xl p-6 sm:p-8 shadow-xl border border-border-base flex flex-col gap-8 sm:gap-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Section 1: Informations de base */}
          <div className="flex flex-col gap-6">
            <h2 className="text-base sm:text-lg font-semibold text-on-surface flex items-center gap-2 m-0">
              <span className="material-symbols-outlined text-primary">info</span>
              {t('Informations de base')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm font-medium text-on-surface-variant" htmlFor="nom">
                  {t('Nom du produit')} <span className="text-primary">*</span>
                </label>
                <input
                  id="nom"
                  required
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Café en grains 1kg"
                  className="bg-input-bg text-on-surface placeholder:text-on-surface-variant/50 h-12 px-4 rounded-lg outline-none focus:ring-1 focus:ring-primary border border-border-base transition-all shadow-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-medium text-on-surface-variant" htmlFor="sku">
                    {t('SKU / Code barres')} <span className="text-primary">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSku}
                    className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors cursor-pointer"
                    title={t('Générer automatiquement un nouveau SKU')}
                  >
                    <span className="material-symbols-outlined text-[15px]">autorenew</span>
                    <span>{t('Générer')}</span>
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="sku"
                    required
                    type="text"
                    value={sku}
                    onChange={(e) => {
                      setSku(e.target.value);
                      setIsManualSku(true);
                    }}
                    placeholder="Ex: PROD-12345"
                    className="w-full bg-input-bg text-on-surface placeholder:text-on-surface-variant/50 h-12 pl-4 pr-11 rounded-lg outline-none focus:ring-1 focus:ring-primary border border-border-base transition-all shadow-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateSku}
                    className="absolute right-2 w-8 h-8 rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors cursor-pointer"
                    title={t('Générer un autre code')}
                  >
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs sm:text-sm font-medium text-on-surface-variant" htmlFor="categorie">
                  {t('Catégorie')} <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <select
                    id="categorie"
                    value={categorie}
                    onChange={(e) => handleCategorieChange(e.target.value)}
                    className="w-full bg-input-bg text-on-surface h-12 pl-4 pr-10 rounded-lg outline-none focus:ring-1 focus:ring-primary border border-border-base transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="alimentaire">{t('categories.alimentaire')}</option>
                    <option value="entretien">{t('categories.entretien')}</option>
                    <option value="boissons">{t('categories.boissons')}</option>
                    <option value="divers">{t('Divers')}</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border-base"></div>

          {/* Section 2: Prix et Stock */}
          <div className="flex flex-col gap-6">
            <h2 className="text-base sm:text-lg font-semibold text-on-surface flex items-center gap-2 m-0">
              <span className="material-symbols-outlined text-primary">inventory_2</span>
              {t('Prix et Stock')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm font-medium text-on-surface-variant" htmlFor="prix">
                  {t('Prix unitaire HT')} <span className="text-primary">*</span>
                </label>
                <div className="relative flex items-center bg-input-bg rounded-lg border border-border-base focus-within:border-primary transition-all shadow-sm h-12">
                  <span className="pl-4 text-on-surface-variant font-medium text-base select-none">
                    {currencySymbol}
                  </span>
                  <input
                    id="prix"
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={prix}
                    onChange={(e) => setPrix(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent text-on-surface placeholder:text-on-surface-variant/50 h-full pl-2 pr-12 text-sm sm:text-base font-semibold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() =>
                        setPrix((prev) => (Math.max(0, (parseFloat(prev) || 0) + 1)).toFixed(2))
                      }
                      className="w-7 h-4 flex items-center justify-center rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                      title={`Augmenter (+1 ${currencySymbol})`}
                    >
                      <span className="material-symbols-outlined text-[15px]">expand_less</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPrix((prev) => (Math.max(0, (parseFloat(prev) || 0) - 1)).toFixed(2))
                      }
                      className="w-7 h-4 flex items-center justify-center rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                      title={`Diminuer (-1 ${currencySymbol})`}
                    >
                      <span className="material-symbols-outlined text-[15px]">expand_more</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm font-medium text-on-surface-variant" htmlFor="tva">
                  {t('Taux de TVA')} <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <select
                    id="tva"
                    value={tva}
                    onChange={(e) => setTva(e.target.value)}
                    className="w-full bg-input-bg text-on-surface h-12 pl-4 pr-10 rounded-lg outline-none focus:ring-1 focus:ring-primary border border-border-base transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="20">20%</option>
                    <option value="18">18%</option>
                    <option value="10">10%</option>
                    <option value="5.5">5.5%</option>
                    <option value="0">0%</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm font-medium text-on-surface-variant" htmlFor="stock">
                  {t('Stock initial')}
                </label>
                <div className="relative flex items-center justify-between bg-input-bg rounded-lg border border-border-base focus-within:border-primary transition-all shadow-sm h-12 px-2">
                  <button
                    type="button"
                    onClick={() => setStock((prev) => String(Math.max(0, (parseInt(prev) || 0) - 1)))}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:scale-95"
                    title="Diminuer (-1)"
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <input
                    id="stock"
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="0"
                    className="w-full bg-transparent text-center text-on-surface font-semibold text-base outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => setStock((prev) => String((parseInt(prev) || 0) + 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:scale-95"
                    title="Augmenter (+1)"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm font-medium text-on-surface-variant" htmlFor="alerte">
                  {t("Seuil d'alerte")}
                </label>
                <div className="relative flex items-center justify-between bg-input-bg rounded-lg border border-border-base focus-within:border-primary transition-all shadow-sm h-12 px-2">
                  <button
                    type="button"
                    onClick={() => setAlerte((prev) => String(Math.max(0, (parseInt(prev) || 0) - 1)))}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:scale-95"
                    title="Diminuer (-1)"
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <input
                    id="alerte"
                    type="number"
                    min="0"
                    value={alerte}
                    onChange={(e) => setAlerte(e.target.value)}
                    placeholder="10"
                    className="w-full bg-transparent text-center text-on-surface font-semibold text-base outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => setAlerte((prev) => String((parseInt(prev) || 0) + 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:scale-95"
                    title="Augmenter (+1)"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border-base"></div>

          {/* Section 3: Description */}
          <div className="flex flex-col gap-6">
            <h2 className="text-base sm:text-lg font-semibold text-on-surface flex items-center gap-2 m-0">
              <span className="material-symbols-outlined text-primary">description</span>
              {t('Description')}
            </h2>
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-medium text-on-surface-variant" htmlFor="description">
                {t('Détails du produit')}
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez les caractéristiques du produit..."
                className="bg-input-bg text-on-surface placeholder:text-on-surface-variant/50 p-4 rounded-lg outline-none focus:ring-1 focus:ring-primary border border-border-base transition-all shadow-sm resize-none"
              ></textarea>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border-base"></div>

          {/* Section 4: Image du produit */}
          <div className="flex flex-col gap-6">
            <h2 className="text-base sm:text-lg font-semibold text-on-surface flex items-center gap-2 m-0">
              <span className="material-symbols-outlined text-primary">image</span>
              {t('Image du produit')}
            </h2>
            <div className="relative w-full h-48 rounded-xl bg-input-bg border-2 border-dashed border-border-base hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant group-hover:text-primary transition-colors z-10">
                cloud_upload
              </span>
              <div className="flex flex-col items-center z-10 px-4 text-center">
                <span className="text-sm sm:text-base font-medium text-on-surface">
                  {imageName ? `${t('Fichier sélectionné :')} ${imageName}` : t("Cliquez pour uploader ou glissez-déposez")}
                </span>
                <span className="text-xs text-on-surface-variant mt-1">
                  {t("PNG, JPG, WEBP jusqu'à 5MB")}
                </span>
              </div>
              <input
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                type="file"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-border-base flex flex-col sm:flex-row items-center justify-end gap-4">
            <Link
              href="/dashboard/produits"
              className="w-full sm:w-auto px-8 h-12 rounded-lg text-sm font-medium text-on-surface-variant bg-transparent border border-border-base hover:bg-surface-container-high hover:text-on-surface transition-colors flex items-center justify-center"
            >
              {t('Annuler')}
            </Link>
            <button
              type="submit"
              disabled={isSubmitted}
              className="w-full sm:w-auto px-8 h-12 rounded-lg text-sm font-semibold text-on-primary bg-primary hover:bg-primary-hover transition-colors shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>{isSubmitted ? t('Enregistrement...') : t('Enregistrer le produit')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
