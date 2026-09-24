'use client';
import { useState } from 'react';
import { useStore } from '@/context/StoreContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  factureId?: string;
  montant?: number;
}

export default function PaymentModal({ isOpen, onClose, factureId = 'FAC-2026-0038', montant = 676.00 }: PaymentModalProps) {
  const { currencySymbol, t } = useStore();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-border-base">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border-base">
          <h2 className="font-headline-md text-text-primary m-0">{t('Enregistrer un paiement')}</h2>
          <button onClick={onClose} className="text-text-secondary hover:bg-surface-container hover:text-text-primary rounded-full p-2 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-text-secondary">{t('Facture associée')}</label>
            <div className="px-4 py-3 bg-surface-container-high rounded-xl font-body-md text-text-primary flex items-center gap-2 border border-border-base">
              <span className="material-symbols-outlined text-primary">receipt_long</span>
              {factureId}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-text-secondary">{t('Montant reçu')} ({currencySymbol})</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">payments</span>
              <input type="number" defaultValue={montant} className="w-full h-12 bg-input-bg border border-border-base rounded-xl pl-12 pr-4 text-body-md font-display-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-text-secondary">{t('Mode de paiement')}</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">account_balance</span>
              <select className="w-full h-12 bg-input-bg border border-border-base rounded-xl pl-12 pr-10 text-body-md text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none">
                <option>{t('Virement Bancaire')}</option>
                <option>{t('Carte de Crédit')}</option>
                <option>{t('Chèque')}</option>
                <option>{t('Espèces')}</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">expand_more</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-text-secondary">{t('Date de paiement')}</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">calendar_month</span>
              <input type="date" defaultValue="2026-08-29" className="w-full h-12 bg-input-bg border border-border-base rounded-xl pl-12 pr-4 text-body-md text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 bg-surface-container-lowest border-t border-border-base flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-2 rounded-full font-label-md text-text-secondary hover:bg-surface-container-high transition-colors">{t('Annuler')}</button>
          <button onClick={onClose} className="px-6 py-2 rounded-full bg-primary text-on-primary font-label-md shadow-md hover:bg-primary-hover transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check</span>
            {t('Valider')}
          </button>
        </div>
      </div>
    </div>
  );
}
