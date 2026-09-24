'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';

export default function ParametresPage() {
  const { companySettings, updateCompanySettings, t } = useStore();

  const [activeTab, setActiveTab] = useState<'general' | 'preferences' | 'facturation' | 'securite'>('general');
  const [isSaving, setIsSaving] = useState(false);

  // Form fields
  const [companyName, setCompanyName] = useState(companySettings?.companyName || 'GestPro S.A.S');
  const [siret, setSiret] = useState(companySettings?.siret || '123 456 789 00012');
  const [tva, setTva] = useState(companySettings?.tva || 'FR 12 345678901');
  const [address, setAddress] = useState(companySettings?.address || '15 Avenue des Champs-Élysées');
  const [zip, setZip] = useState(companySettings?.zip || '75008');
  const [city, setCity] = useState(companySettings?.city || 'Paris');

  // Preferences fields
  const [currency, setCurrency] = useState(companySettings?.currency || 'EUR');
  const [language, setLanguage] = useState(companySettings?.language || 'fr');
  const [dateFormat, setDateFormat] = useState(companySettings?.dateFormat || 'JJ/MM/AAAA');
  const [timezone, setTimezone] = useState(companySettings?.timezone || 'Africa/Dakar (GMT+0)');
  const [defaultTva, setDefaultTva] = useState(companySettings?.defaultTva ? String(companySettings.defaultTva) : '20');
  const [paymentTermsDays, setPaymentTermsDays] = useState(companySettings?.paymentTermsDays ? String(companySettings.paymentTermsDays) : '30');

  // Sync state when store hydrates
  useEffect(() => {
    if (companySettings) {
      if (companySettings.companyName) setCompanyName(companySettings.companyName);
      if (companySettings.siret) setSiret(companySettings.siret);
      if (companySettings.tva) setTva(companySettings.tva);
      if (companySettings.address) setAddress(companySettings.address);
      if (companySettings.zip) setZip(companySettings.zip);
      if (companySettings.city) setCity(companySettings.city);
      if (companySettings.currency) setCurrency(companySettings.currency);
      if (companySettings.language) setLanguage(companySettings.language);
      if (companySettings.dateFormat) setDateFormat(companySettings.dateFormat);
      if (companySettings.timezone) setTimezone(companySettings.timezone);
      if (companySettings.defaultTva) setDefaultTva(String(companySettings.defaultTva));
      if (companySettings.paymentTermsDays) setPaymentTermsDays(String(companySettings.paymentTermsDays));
    }
  }, [companySettings]);

  // Profile completion calculation
  const fields = [companyName, siret, tva, address, zip, city];
  const filledCount = fields.filter((v) => v && v.trim().length > 0).length;
  const profilePercentage = Math.round((filledCount / fields.length) * 100);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    updateCompanySettings({
      companyName: companyName.trim(),
      siret: siret.trim(),
      tva: tva.trim(),
      address: address.trim(),
      zip: zip.trim(),
      city: city.trim(),
      currency,
      language,
      dateFormat,
      timezone,
      defaultTva: parseFloat(defaultTva) || 20,
      paymentTermsDays: parseInt(paymentTermsDays) || 30,
    });
    setTimeout(() => {
      setIsSaving(false);
    }, 400);
  };

  return (
    <div className="flex flex-col w-full px-container-margin py-8 gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight m-0">{t('nav.settings')}</h1>
          <p className="text-xs sm:text-body-md text-text-secondary mt-1">{t('Gérez les informations de votre entreprise et vos préférences')}</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary hover:bg-primary-hover text-on-primary font-label-md h-10 px-6 rounded-full shadow-md transition-colors flex items-center justify-center gap-2 shrink-0 whitespace-nowrap cursor-pointer disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          <span className="hidden sm:inline">
            {isSaving ? t('Enregistrement...') : t('Enregistrer les modifications')}
          </span>
          <span className="sm:hidden">
            {isSaving ? t('En cours...') : t('common.save')}
          </span>
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Profile Card */}
          <div className="bg-surface rounded-2xl p-6 shadow-md relative overflow-hidden group border border-border-base">
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-24 h-24 rounded-full bg-surface-container-high border-4 border-surface shadow-sm flex items-center justify-center mb-4 relative">
                <span className="material-symbols-outlined text-[40px] text-text-secondary">corporate_fare</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('general')}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary-hover transition-colors cursor-pointer"
                  title={t("Modifier le nom de l'entreprise")}
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
              </div>
              <h3 className="text-lg sm:text-headline-md font-bold sm:font-headline-md text-text-primary truncate max-w-full px-2">
                {companyName || 'GestPro S.A.S'}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${profilePercentage >= 80 ? 'bg-success animate-pulse' : 'bg-warning animate-pulse'}`}></div>
                <span className={`font-label-sm ${profilePercentage >= 80 ? 'text-success' : 'text-warning'}`}>
                  {t('Profil complété à')} {profilePercentage}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Settings Navigation */}
          <div className="bg-surface rounded-2xl p-4 shadow-md flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label-md transition-colors cursor-pointer text-left ${
                activeTab === 'general'
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-text-secondary hover:bg-surface-container-high hover:text-text-primary'
              }`}
            >
              <span className="material-symbols-outlined">business</span>
              {t('Informations Générales')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preferences')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label-md transition-colors cursor-pointer text-left ${
                activeTab === 'preferences'
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-text-secondary hover:bg-surface-container-high hover:text-text-primary'
              }`}
            >
              <span className="material-symbols-outlined">settings_applications</span>
              {t('Préférences')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('facturation')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label-md transition-colors cursor-pointer text-left ${
                activeTab === 'facturation'
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-text-secondary hover:bg-surface-container-high hover:text-text-primary'
              }`}
            >
              <span className="material-symbols-outlined">receipt_long</span>
              {t('Facturation')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('securite')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label-md transition-colors cursor-pointer text-left ${
                activeTab === 'securite'
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-text-secondary hover:bg-surface-container-high hover:text-text-primary'
              }`}
            >
              <span className="material-symbols-outlined">security</span>
              {t('Sécurité')}
            </button>
          </div>
        </div>
        
        {/* Form Section */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {activeTab === 'general' && (
            <div className="bg-surface rounded-2xl p-5 sm:p-8 shadow-md">
              <h2 className="text-base sm:text-headline-md font-bold sm:font-headline-md text-text-primary mb-6 sm:mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px] sm:text-[24px]">corporate_fare</span>
                <span>{t("Informations de l'entreprise")}</span>
              </h2>
              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-label-md text-text-secondary" htmlFor="companyName">{t("Nom de l'entreprise")}</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">business</span>
                    <input
                      className="w-full h-12 bg-input-bg rounded-xl pl-12 pr-4 text-body-md text-text-primary outline-none focus:ring-1 focus:ring-primary border border-border-base transition-all"
                      id="companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-text-secondary" htmlFor="siret">{t('Numéro SIRET')}</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">tag</span>
                    <input
                      className="w-full h-12 bg-input-bg rounded-xl pl-12 pr-4 text-body-md text-text-primary outline-none focus:ring-1 focus:ring-primary border border-border-base transition-all font-mono"
                      id="siret"
                      type="text"
                      value={siret}
                      onChange={(e) => setSiret(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-text-secondary" htmlFor="tva">{t('Numéro de TVA')}</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">account_balance</span>
                    <input
                      className="w-full h-12 bg-input-bg rounded-xl pl-12 pr-4 text-body-md text-text-primary outline-none focus:ring-1 focus:ring-primary border border-border-base transition-all font-mono"
                      id="tva"
                      type="text"
                      value={tva}
                      onChange={(e) => setTva(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 md:col-span-2 mt-4">
                  <h3 className="font-label-lg text-text-primary mb-2 border-b border-border-base pb-2">{t('Coordonnées')}</h3>
                </div>
                
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-label-md text-text-secondary" htmlFor="address">{t('Adresse postale')}</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">location_on</span>
                    <input
                      className="w-full h-12 bg-input-bg rounded-xl pl-12 pr-4 text-body-md text-text-primary outline-none focus:ring-1 focus:ring-primary border border-border-base transition-all"
                      id="address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-text-secondary" htmlFor="zip">{t('Code Postal')}</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">markunread_mailbox</span>
                    <input
                      className="w-full h-12 bg-input-bg rounded-xl pl-12 pr-4 text-body-md text-text-primary outline-none focus:ring-1 focus:ring-primary border border-border-base transition-all"
                      id="zip"
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-text-secondary" htmlFor="city">{t('Ville')}</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">location_city</span>
                    <input
                      className="w-full h-12 bg-input-bg rounded-xl pl-12 pr-4 text-body-md text-text-primary outline-none focus:ring-1 focus:ring-primary border border-border-base transition-all"
                      id="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="bg-surface rounded-2xl p-5 sm:p-8 shadow-md">
              <h2 className="text-base sm:text-headline-md font-bold sm:font-headline-md text-text-primary mb-6 sm:mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px] sm:text-[24px]">settings_applications</span>
                <span>{t('Préférences régionales & système')}</span>
              </h2>
              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-text-secondary" htmlFor="currency">{t('Devise principale')}</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">payments</span>
                    <select
                      id="currency"
                      value={currency}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCurrency(val);
                        updateCompanySettings({ currency: val });
                      }}
                      className="w-full h-12 bg-input-bg rounded-xl pl-12 pr-4 text-body-md text-text-primary outline-none focus:ring-1 focus:ring-primary border border-border-base transition-all appearance-none cursor-pointer"
                    >
                      <option value="EUR">{t('Euro (€ - EUR)')}</option>
                      <option value="XOF">{t('Franc CFA (FCFA - XOF)')}</option>
                      <option value="USD">{t('Dollar US ($ - USD)')}</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-text-secondary" htmlFor="language">{t("Langue de l'interface")}</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">language</span>
                    <select
                      id="language"
                      value={language}
                      onChange={(e) => {
                        const val = e.target.value as 'fr' | 'en';
                        setLanguage(val);
                        updateCompanySettings({ language: val });
                      }}
                      className="w-full h-12 bg-input-bg rounded-xl pl-12 pr-4 text-body-md text-text-primary outline-none focus:ring-1 focus:ring-primary border border-border-base transition-all appearance-none cursor-pointer"
                    >
                      <option value="fr">{t('Français (FR)')}</option>
                      <option value="en">{t('English (US)')}</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2 mt-4">
                  <h3 className="font-label-lg text-text-primary mb-2 border-b border-border-base pb-2">{t('Format & Date')}</h3>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-text-secondary" htmlFor="dateFormat">{t('Format de date')}</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">calendar_month</span>
                    <input
                      className="w-full h-12 bg-input-bg rounded-xl pl-12 pr-4 text-body-md text-text-primary outline-none focus:ring-1 focus:ring-primary border border-border-base transition-all"
                      id="dateFormat"
                      type="text"
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-text-secondary" htmlFor="timezone">{t('Fuseau horaire')}</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">schedule</span>
                    <input
                      className="w-full h-12 bg-input-bg rounded-xl pl-12 pr-4 text-body-md text-text-primary outline-none focus:ring-1 focus:ring-primary border border-border-base transition-all"
                      id="timezone"
                      type="text"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    />
                  </div>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'facturation' && (
            <div className="bg-surface rounded-2xl p-5 sm:p-8 shadow-md">
              <h2 className="text-base sm:text-headline-md font-bold sm:font-headline-md text-text-primary mb-6 sm:mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px] sm:text-[24px]">receipt_long</span>
                <span>{t('Paramètres de Facturation')}</span>
              </h2>
              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-text-secondary" htmlFor="defaultTva">{t('Taux de TVA par défaut (%)')}</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">percent</span>
                    <select
                      id="defaultTva"
                      value={defaultTva}
                      onChange={(e) => setDefaultTva(e.target.value)}
                      className="w-full h-12 bg-input-bg rounded-xl pl-12 pr-4 text-body-md text-text-primary outline-none focus:ring-1 focus:ring-primary border border-border-base transition-all appearance-none cursor-pointer"
                    >
                      <option value="20">{t('20% (Taux normal)')}</option>
                      <option value="18">{t('18% (Taux standard)')}</option>
                      <option value="10">{t('10% (Taux intermédiaire)')}</option>
                      <option value="5.5">{t('5.5% (Taux réduit)')}</option>
                      <option value="0">{t('0% (Exonération)')}</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-text-secondary" htmlFor="paymentTerms">{t('Délai de paiement par défaut')}</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">event_available</span>
                    <select
                      id="paymentTerms"
                      value={paymentTermsDays}
                      onChange={(e) => setPaymentTermsDays(e.target.value)}
                      className="w-full h-12 bg-input-bg rounded-xl pl-12 pr-4 text-body-md text-text-primary outline-none focus:ring-1 focus:ring-primary border border-border-base transition-all appearance-none cursor-pointer"
                    >
                      <option value="0">{t('Comptant à réception')}</option>
                      <option value="14">{t('14 jours')}</option>
                      <option value="30">{t('30 jours fin de mois')}</option>
                      <option value="60">{t('60 jours')}</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2 mt-4">
                  <label className="font-label-md text-text-secondary" htmlFor="footerNote">{t('Mention légale de bas de facture')}</label>
                  <div className="relative group">
                    <input
                      className="w-full h-12 bg-input-bg rounded-xl px-4 text-body-md text-text-primary outline-none focus:ring-1 focus:ring-primary border border-border-base transition-all"
                      id="footerNote"
                      type="text"
                      defaultValue={`${companyName} ${t('au capital de')} 10 000 € - SIRET : ${siret}`}
                      readOnly
                    />
                  </div>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'securite' && (
            <div className="bg-surface rounded-2xl p-5 sm:p-8 shadow-md">
              <h2 className="text-base sm:text-headline-md font-bold sm:font-headline-md text-text-primary mb-6 sm:mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px] sm:text-[24px]">security</span>
                <span>{t('Sécurité & Authentification')}</span>
              </h2>
              <div className="flex flex-col gap-6">
                <div className="p-4 rounded-xl bg-surface-container-high/60 border border-border-base flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-success text-[24px]">verified_user</span>
                    <div>
                      <h4 className="font-label-lg text-text-primary m-0">{t('Authentification à deux facteurs (2FA)')}</h4>
                      <p className="font-body-sm text-text-secondary m-0">{t('Sécurisez votre compte en exigeant un code de validation')}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-success/15 text-success font-label-sm text-xs font-semibold">
                    {t('Activé')}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-high/60 border border-border-base flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[24px]">lock_reset</span>
                    <div>
                      <h4 className="font-label-lg text-text-primary m-0">{t('Mot de passe de session')}</h4>
                      <p className="font-body-sm text-text-secondary m-0">{t('Dernière modification il y a 28 jours')}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(t('Fonctionnalité de réinitialisation disponible pour le compte administrateur.'))}
                    className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-container border border-border-base text-xs font-medium text-text-primary transition-colors cursor-pointer"
                  >
                    {t('Modifier')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
