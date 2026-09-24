'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';

export default function NouveauClientPage() {
  const router = useRouter();
  const { addClient, t } = useStore();

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [entreprise, setEntreprise] = useState('');
  const [ninea, setNinea] = useState('');
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('');
  const [codePostal, setCodePostal] = useState('');
  const [pays, setPays] = useState('Sénégal');
  const [statut, setStatut] = useState<'actif' | 'inactif'>('actif');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim() || !email.trim()) return;

    setIsSubmitting(true);

    try {
      const created = addClient({
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim(),
        telephone: telephone.trim() || '+221 77 000 00 00',
        entreprise: entreprise.trim() || 'Particulier',
        ninea: ninea.trim(),
        adresse: adresse.trim() || 'Non renseignée',
        ville: ville.trim() || 'Dakar',
        codePostal: codePostal.trim() || '10000',
        pays: pays.trim() || 'Sénégal',
        statut,
      });

      router.push(`/dashboard/clients/${created.id}`);
    } catch (err) {
      console.error('Error creating client', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen py-6 sm:py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-start relative">
      {/* Decorative ambient background blurs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl pointer-events-none transform translate-x-1/4 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-tertiary-container/5 blur-3xl pointer-events-none transform -translate-x-1/3 translate-y-1/3"></div>

      <div className="w-full max-w-2xl bg-surface-container-low rounded-2xl border border-border-base shadow-xl p-5 sm:p-8 md:p-10 flex flex-col gap-8 relative z-10">
        {/* Header */}
        <header className="flex items-center gap-4 sm:gap-6 border-b border-border-base/60 pb-6">
          <Link
            href="/dashboard/clients"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface hover:bg-surface-container-high border border-border-base transition-colors flex items-center justify-center text-on-surface hover:text-primary shadow-sm shrink-0 cursor-pointer"
            title={t('Retour aux clients')}
          >
            <span className="material-symbols-outlined text-[22px] sm:text-[24px]">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight m-0">
              {t('Nouveau Client')}
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5 m-0">
              {t('Ajouter un nouveau contact professionnel à la base de données.')}
            </p>
          </div>
        </header>

        {/* Form */}
        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
          {/* Section 1: Informations Personnelles */}
          <section className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px] text-primary">person</span>
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-on-surface m-0">
                {t('Informations Personnelles')}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="flex flex-col gap-2">
                <label className="font-medium text-xs sm:text-sm text-on-surface-variant" htmlFor="prenom">
                  {t('Prénom')} <span className="text-primary">*</span>
                </label>
                <input
                  id="prenom"
                  type="text"
                  required
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Amadou"
                  className="h-11 sm:h-12 w-full bg-surface border border-border-base rounded-lg px-4 text-sm sm:text-base text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary shadow-sm outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-xs sm:text-sm text-on-surface-variant" htmlFor="nom">
                  {t('Nom')} <span className="text-primary">*</span>
                </label>
                <input
                  id="nom"
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Diallo"
                  className="h-11 sm:h-12 w-full bg-surface border border-border-base rounded-lg px-4 text-sm sm:text-base text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary shadow-sm outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="flex flex-col gap-2">
                <label className="font-medium text-xs sm:text-sm text-on-surface-variant" htmlFor="email">
                  {t('Adresse Email')} <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
                    mail
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="amadou.diallo@example.com"
                    className="h-11 sm:h-12 w-full bg-surface border border-border-base rounded-lg pl-10 pr-4 text-sm sm:text-base text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary shadow-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-xs sm:text-sm text-on-surface-variant" htmlFor="telephone">
                  {t('Téléphone')}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
                    phone
                  </span>
                  <input
                    id="telephone"
                    type="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="+221 77 123 45 67"
                    className="h-11 sm:h-12 w-full bg-surface border border-border-base rounded-lg pl-10 pr-4 text-sm sm:text-base text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary shadow-sm outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="h-px w-full bg-border-base"></div>

          {/* Section 2: Informations Professionnelles */}
          <section className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-tertiary-container/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px] text-tertiary-container">
                  domain
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-on-surface m-0">
                {t('Informations Professionnelles')}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="flex flex-col gap-2">
                <label className="font-medium text-xs sm:text-sm text-on-surface-variant" htmlFor="entreprise">
                  {t("Nom de l'entreprise")}
                </label>
                <input
                  id="entreprise"
                  type="text"
                  value={entreprise}
                  onChange={(e) => setEntreprise(e.target.value)}
                  placeholder="Diallo Trading SARL"
                  className="h-11 sm:h-12 w-full bg-surface border border-border-base rounded-lg px-4 text-sm sm:text-base text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary shadow-sm outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-xs sm:text-sm text-on-surface-variant" htmlFor="ninea">
                  {t('NINEA / Registre du commerce')}
                </label>
                <input
                  id="ninea"
                  type="text"
                  value={ninea}
                  onChange={(e) => setNinea(e.target.value)}
                  placeholder="Ex: 009876543"
                  className="h-11 sm:h-12 w-full bg-surface border border-border-base rounded-lg px-4 text-sm sm:text-base text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary shadow-sm outline-none transition-all font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-medium text-xs sm:text-sm text-on-surface-variant" htmlFor="adresse">
                {t('Adresse de facturation')}
              </label>
              <textarea
                id="adresse"
                rows={2}
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                placeholder="123 Rue de la République..."
                className="w-full bg-surface border border-border-base rounded-lg p-3.5 text-sm sm:text-base text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary shadow-sm outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              <div className="flex flex-col gap-2">
                <label className="font-medium text-xs sm:text-sm text-on-surface-variant" htmlFor="ville">
                  {t('Ville')}
                </label>
                <input
                  id="ville"
                  type="text"
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  placeholder="Dakar"
                  className="h-11 sm:h-12 w-full bg-surface border border-border-base rounded-lg px-4 text-sm sm:text-base text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary shadow-sm outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-xs sm:text-sm text-on-surface-variant" htmlFor="codepostal">
                  {t('Code Postal')}
                </label>
                <input
                  id="codepostal"
                  type="text"
                  value={codePostal}
                  onChange={(e) => setCodePostal(e.target.value)}
                  placeholder="10000"
                  className="h-11 sm:h-12 w-full bg-surface border border-border-base rounded-lg px-4 text-sm sm:text-base text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary shadow-sm outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-xs sm:text-sm text-on-surface-variant" htmlFor="statut">
                  {t('Statut du compte')}
                </label>
                <select
                  id="statut"
                  value={statut}
                  onChange={(e) => setStatut(e.target.value as 'actif' | 'inactif')}
                  className="h-11 sm:h-12 w-full bg-surface border border-border-base rounded-lg px-4 text-sm sm:text-base text-on-surface focus:border-primary focus:ring-1 focus:ring-primary shadow-sm outline-none transition-all cursor-pointer"
                >
                  <option value="actif">{t('Actif')}</option>
                  <option value="inactif">{t('Inactif')}</option>
                </select>
              </div>
            </div>
          </section>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-border-base">
            <Link
              href="/dashboard/clients"
              className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 rounded-lg font-medium text-sm text-on-surface-variant hover:text-on-surface bg-surface hover:bg-surface-container-high border border-border-base shadow-sm transition-all flex items-center justify-center cursor-pointer"
            >
              {t('Annuler')}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 rounded-lg font-semibold text-sm text-on-primary bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? t('Enregistrement...') : t('Enregistrer le client')}</span>
              <span className="material-symbols-outlined text-[18px]">save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
