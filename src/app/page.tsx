'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';

export default function LandingPage() {
  const { theme, toggleTheme, user } = useStore();

  return (
    <div className="bg-background font-body-md text-on-surface min-h-screen transition-colors duration-150 selection:bg-primary/20 selection:text-primary">
      {/* ── TOP NAVIGATION BAR ── */}
      <header className="sticky top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-border-base transition-colors duration-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-sm sm:text-base shadow-xs shadow-primary/30">
              GP
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg tracking-tight text-text-primary leading-none">
                GestPro
              </span>
              <span className="text-[10px] text-text-secondary font-medium tracking-wide">
                ERP Commercial &amp; Facturation
              </span>
            </div>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
            <a href="#cockpit" className="hover:text-text-primary transition-colors">
              Aperçu en direct
            </a>
            <a href="#modules" className="hover:text-text-primary transition-colors">
              Modules
            </a>
            <a href="#workflow" className="hover:text-text-primary transition-colors">
              Workflow
            </a>
            <a href="#securite" className="hover:text-text-primary transition-colors">
              Sécurité &amp; RLS
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              className="w-9 h-9 rounded-lg border border-border-base bg-surface hover:bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Dashboard Access Button */}
            <Link
              href={user ? '/dashboard' : '/login'}
              className="inline-flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-medium text-xs sm:text-sm transition-colors shadow-xs shadow-primary/20 cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
                dashboard
              </span>
              <span>{user ? 'Mon tableau de bord' : 'Accéder à l’espace'}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full">
        {/* ── HERO SECTION ── */}
        <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-border-base overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
            {/* Sub-badge: Institutional & precise */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-base bg-surface text-xs font-medium text-text-secondary mb-6 sm:mb-8 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Version 2026 · Système certifié pour PME et cabinets</span>
            </div>

            {/* Main Headline: Strict, authoritative, no AI italic gimmick */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary max-w-4xl leading-[1.12]">
              La gestion commerciale et la facturation, avec la rigueur d’un progiciel moderne.
            </h1>

            {/* Value Proposition */}
            <p className="mt-5 sm:mt-6 text-sm sm:text-lg text-text-secondary max-w-2xl leading-relaxed">
              Bons de commande, suivi précis des encaissements en FCFA et EUR, factures certifiées, acomptes et relances automatisées — réunis dans un outil conçu pour la vitesse et la conformité comptable.
            </p>

            {/* CTAs */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Link
                href={user ? '/dashboard' : '/login'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-semibold text-sm transition-all shadow-sm shadow-primary/25 cursor-pointer"
              >
                <span>Ouvrir l’espace entreprise</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <a
                href="#cockpit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-xl border border-border-base bg-surface hover:bg-surface-container text-text-primary font-medium text-sm transition-colors cursor-pointer"
              >
                <span>Voir la démonstration interactive</span>
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </a>
            </div>

            {/* ── LIVE INTERACTIVE SOFTWARE COCKPIT (HERO PROOF) ── */}
            <div id="cockpit" className="w-full max-w-6xl mt-12 sm:mt-16 scroll-mt-24">
              <div className="rounded-2xl border border-border-base bg-surface shadow-xl overflow-hidden text-left">
                {/* Window Topbar */}
                <div className="px-4 sm:px-6 py-3 border-b border-border-base bg-surface-container-low flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="w-3 h-3 rounded-full bg-red-400/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
                    <span className="ml-3 font-mono text-[11px] text-text-secondary hidden sm:inline">
                      gestpro.app › factures › FAC-2026-084
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      Encaissée intégralement
                    </span>
                  </div>
                </div>

                {/* Cockpit Content: Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border-base">
                  {/* Left: Real Detailed Invoice Preview (8 cols) */}
                  <div className="lg:col-span-8 p-5 sm:p-8 flex flex-col gap-6 bg-surface">
                    {/* Invoice Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-border-base">
                      <div>
                        <div className="font-mono text-xs font-semibold text-primary">FACTURE CERTIFIÉE</div>
                        <div className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight mt-0.5">
                          FAC-2026-084
                        </div>
                        <div className="text-xs text-text-secondary mt-1">
                          Émise le 04 nov. 2026 · Échéance au 18 nov. 2026
                        </div>
                      </div>

                      <div className="sm:text-right text-xs space-y-0.5 text-text-secondary">
                        <div className="font-semibold text-text-primary text-sm">
                          Groupe Hôtelier Baobab S.A.R.L.
                        </div>
                        <div>NINEA : 004829102-2B3</div>
                        <div>Corniche Ouest, Dakar, Sénégal</div>
                      </div>
                    </div>

                    {/* Invoice Line Items */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-border-base text-text-secondary font-semibold">
                            <th className="pb-2.5">Désignation de la prestation</th>
                            <th className="pb-2.5 text-center">Qté</th>
                            <th className="pb-2.5 text-right">Prix Unitaire</th>
                            <th className="pb-2.5 text-right">Total HT</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-base text-text-primary">
                          <tr>
                            <td className="py-3 pr-2">
                              <div className="font-medium text-text-primary">
                                Refonte Système Commercial &amp; Architecture Web
                              </div>
                              <div className="text-[11px] text-text-secondary">
                                Phase 1 : Cadrage, maquettes validées et interfaces client
                              </div>
                            </td>
                            <td className="py-3 text-center tabular-nums font-mono text-text-secondary">1</td>
                            <td className="py-3 text-right tabular-nums font-medium">1 850 000 FCFA</td>
                            <td className="py-3 text-right tabular-nums font-semibold">1 850 000 FCFA</td>
                          </tr>
                          <tr>
                            <td className="py-3 pr-2">
                              <div className="font-medium text-text-primary">
                                Intégration Passerelles de Paiement Régionales
                              </div>
                              <div className="text-[11px] text-text-secondary">
                                Rapprochement temps réel Wave, Orange Money et Cartes
                              </div>
                            </td>
                            <td className="py-3 text-center tabular-nums font-mono text-text-secondary">1</td>
                            <td className="py-3 text-right tabular-nums font-medium">950 000 FCFA</td>
                            <td className="py-3 text-right tabular-nums font-semibold">950 000 FCFA</td>
                          </tr>
                          <tr>
                            <td className="py-3 pr-2">
                              <div className="font-medium text-text-primary">
                                Infrastructure Cloud Dédiée &amp; Déploiement
                              </div>
                              <div className="text-[11px] text-text-secondary">
                                Configuration base de données Supabase PostgreSQL &amp; CDN
                              </div>
                            </td>
                            <td className="py-3 text-center tabular-nums font-mono text-text-secondary">1</td>
                            <td className="py-3 text-right tabular-nums font-medium">650 000 FCFA</td>
                            <td className="py-3 text-right tabular-nums font-semibold">650 000 FCFA</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Invoice Totals & Balance */}
                    <div className="pt-4 border-t border-border-base flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-base bg-surface-container text-xs font-medium text-text-secondary">
                          <span className="material-symbols-outlined text-[16px] text-emerald-500">
                            check_circle
                          </span>
                          <span>Règlement reçu par virement bancaire</span>
                        </span>
                      </div>

                      <div className="space-y-1.5 text-right sm:w-64">
                        <div className="flex justify-between text-xs text-text-secondary">
                          <span>Sous-total HT :</span>
                          <span className="tabular-nums font-mono">3 450 000 FCFA</span>
                        </div>
                        <div className="flex justify-between text-xs text-text-secondary">
                          <span>TVA légale (18%) :</span>
                          <span className="tabular-nums font-mono">621 000 FCFA</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-text-primary pt-1 border-t border-border-base">
                          <span>Total TTC :</span>
                          <span className="tabular-nums font-mono text-primary text-base">
                            4 071 000 FCFA
                          </span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <span>Reste dû :</span>
                          <span className="tabular-nums font-mono">0 FCFA</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Financial Health & Operations Strip (4 cols) */}
                  <div className="lg:col-span-4 p-5 sm:p-6 bg-surface-container-low flex flex-col justify-between gap-6">
                    <div>
                      <div className="text-xs font-semibold text-text-secondary tracking-wider uppercase mb-4">
                        Synthèse d’activité du cabinet
                      </div>

                      <div className="space-y-4">
                        <div className="p-3.5 rounded-xl border border-border-base bg-surface">
                          <div className="text-xs text-text-secondary">Encaissements du mois</div>
                          <div className="text-xl sm:text-2xl font-bold text-text-primary tabular-nums mt-0.5">
                            24 850 000 FCFA
                          </div>
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">trending_up</span>
                            <span>+18.4% vs mois précédent</span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl border border-border-base bg-surface">
                          <div className="text-xs text-text-secondary">Taux de recouvrement à date</div>
                          <div className="text-xl sm:text-2xl font-bold text-text-primary tabular-nums mt-0.5">
                            96.2%
                          </div>
                          <div className="w-full bg-surface-container h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96.2%' }} />
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl border border-border-base bg-surface">
                          <div className="text-xs text-text-secondary">Délai moyen de règlement</div>
                          <div className="text-xl sm:text-2xl font-bold text-text-primary tabular-nums mt-0.5">
                            11 jours
                          </div>
                          <div className="text-[11px] text-text-secondary mt-1">
                            Sur 42 factures émises ce trimestre
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Instant Actions */}
                    <div className="pt-4 border-t border-border-base space-y-2">
                      <Link
                        href={user ? '/dashboard/factures' : '/login'}
                        className="w-full py-2.5 px-3 rounded-lg bg-surface hover:bg-surface-container border border-border-base text-xs font-semibold text-text-primary flex items-center justify-between transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-primary">
                            download
                          </span>
                          <span>Exporter le registre comptable</span>
                        </span>
                        <span className="text-[10px] text-text-secondary font-mono">PDF / CSV</span>
                      </Link>

                      <Link
                        href={user ? '/dashboard/commandes/nouveau' : '/login'}
                        className="w-full py-2.5 px-3 rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        <span>Créer une commande ou facture</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── METRICS & TRUST STRIP ── */}
        <section className="border-b border-border-base bg-surface py-8 sm:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-border-base">
              <div className="pt-4 md:pt-0 md:px-6 first:pl-0">
                <div className="font-mono text-xl sm:text-2xl font-bold text-text-primary tabular-nums">
                  100% RLS
                </div>
                <div className="text-xs text-text-secondary mt-1">
                  Isolation stricte des données par entreprise sur PostgreSQL Supabase
                </div>
              </div>

              <div className="pt-4 md:pt-0 md:px-6">
                <div className="font-mono text-xl sm:text-2xl font-bold text-text-primary tabular-nums">
                  FCFA &amp; EUR
                </div>
                <div className="text-xs text-text-secondary mt-1">
                  Multi-devises natif sans erreur d’arrondi ni taux de change ambigu
                </div>
              </div>

              <div className="pt-4 md:pt-0 md:px-6">
                <div className="font-mono text-xl sm:text-2xl font-bold text-text-primary tabular-nums">
                  PDF &amp; Resend
                </div>
                <div className="text-xs text-text-secondary mt-1">
                  Édition vectorielle immédiate et envoi certifié des factures par email
                </div>
              </div>

              <div className="pt-4 md:pt-0 md:px-6 last:pr-0">
                <div className="font-mono text-xl sm:text-2xl font-bold text-text-primary tabular-nums">
                  &lt; 150 ms
                </div>
                <div className="text-xs text-text-secondary mt-1">
                  Navigation fluide propulsée par le moteur Next.js 16 App Router
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CORE MODULES (ARCHITECTURAL GRID) ── */}
        <section id="modules" className="py-16 sm:py-24 border-b border-border-base bg-background scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="max-w-2xl mb-12 sm:mb-16">
              <span className="text-xs font-semibold text-primary font-mono uppercase tracking-wider">
                Structure du progiciel
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-text-primary mt-2">
                Les quatre piliers de votre gestion d’entreprise.
              </h2>
              <p className="text-sm sm:text-base text-text-secondary mt-3 leading-relaxed">
                Chaque module a été architecturé pour éliminer les ressaisies manuelles, sécuriser la trésorerie et accélérer le cycle de conversion de vos devis en encaissements réels.
              </p>
            </div>

            {/* Grid 2x2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Module 1: Commandes */}
              <div className="p-6 sm:p-8 rounded-2xl border border-border-base bg-surface flex flex-col justify-between gap-6 hover:border-primary/40 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-5">
                    <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-text-primary">
                    Bons de commande &amp; Devis
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary mt-2 leading-relaxed">
                    Créez des bons de commande exhaustifs avec calcul automatique des lignes HT, remises et TVA. Suivez le cycle de chaque dossier à travers des statuts clairs : <em>En attente</em>, <em>Confirmée</em>, <em>En préparation</em>, et <em>Livrée</em>.
                  </p>
                </div>
                <div className="pt-4 border-t border-border-base flex items-center justify-between text-xs font-medium text-text-secondary">
                  <span>Transformation en facture en 1 clic</span>
                  <span className="font-mono text-primary">/commandes</span>
                </div>
              </div>

              {/* Module 2: Facturation */}
              <div className="p-6 sm:p-8 rounded-2xl border border-border-base bg-surface flex flex-col justify-between gap-6 hover:border-primary/40 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-5">
                    <span className="material-symbols-outlined text-[22px]">receipt_long</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-text-primary">
                    Facturation certifiée &amp; Reste dû
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary mt-2 leading-relaxed">
                    Générez des factures légales avec numérotation chronologique continue (ex. <code>FAC-2026-</code>), gestion des acomptes intermédiaires et calcul instantané du solde restant dû. Téléchargement PDF vectoriel conforme.
                  </p>
                </div>
                <div className="pt-4 border-t border-border-base flex items-center justify-between text-xs font-medium text-text-secondary">
                  <span>Mentions légales &amp; NINEA/SIRET</span>
                  <span className="font-mono text-primary">/factures</span>
                </div>
              </div>

              {/* Module 3: Paiements & Rapprochement */}
              <div className="p-6 sm:p-8 rounded-2xl border border-border-base bg-surface flex flex-col justify-between gap-6 hover:border-primary/40 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-5">
                    <span className="material-symbols-outlined text-[22px]">payments</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-text-primary">
                    Rapprochement &amp; Encaissements
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary mt-2 leading-relaxed">
                    Enregistrez chaque flux par virement bancaire, carte, chèque ou espèces. Le lettrage avec la facture correspondante s’effectue automatiquement, passant le statut en <em>Payée</em> dès que le solde atteint zéro.
                  </p>
                </div>
                <div className="pt-4 border-t border-border-base flex items-center justify-between text-xs font-medium text-text-secondary">
                  <span>Traçabilité financière totale</span>
                  <span className="font-mono text-primary">/paiements</span>
                </div>
              </div>

              {/* Module 4: Clients & Délais */}
              <div className="p-6 sm:p-8 rounded-2xl border border-border-base bg-surface flex flex-col justify-between gap-6 hover:border-primary/40 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-5">
                    <span className="material-symbols-outlined text-[22px]">group</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-text-primary">
                    Répertoire clients &amp; Encours
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary mt-2 leading-relaxed">
                    Fiches tiers complètes avec coordonnées des interlocuteurs, conditions de règlement (Comptant, 14 jours, 30 jours), historique des commandes et vue en direct de l’encours client pour éviter les impayés.
                  </p>
                </div>
                <div className="pt-4 border-t border-border-base flex items-center justify-between text-xs font-medium text-text-secondary">
                  <span>Maîtrise du risque client</span>
                  <span className="font-mono text-primary">/clients</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WORKFLOW TIMELINE ── */}
        <section id="workflow" className="py-16 sm:py-24 border-b border-border-base bg-surface scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12 sm:mb-16">
              <span className="text-xs font-semibold text-primary font-mono uppercase tracking-wider">
                Fluidité opérationnelle
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-text-primary mt-2">
                De la commande au paiement, sans aucune rupture.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              <div className="p-5 rounded-xl border border-border-base bg-surface-container-low flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary">01</span>
                  <span className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <h4 className="font-bold text-sm text-text-primary">Émission de la commande</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Sélection du client, ajout des références depuis le catalogue produits et calcul immédiat des totaux.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border-base bg-surface-container-low flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary">02</span>
                  <span className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <h4 className="font-bold text-sm text-text-primary">Génération de la facture</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Attribution du numéro chronologique officiel, fixation de la date d’échéance et édition PDF instantanée.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border-base bg-surface-container-low flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary">03</span>
                  <span className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <h4 className="font-bold text-sm text-text-primary">Expédition par email (Resend)</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Transmission sécurisée avec le PDF en pièce jointe et suivi de la délivrabilité auprès du client.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border-base bg-surface-container-low flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-500">04</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <h4 className="font-bold text-sm text-text-primary">Encaissement &amp; Lettrage</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Saisie du versement, rapprochement comptable automatique et mise à jour de la balance de trésorerie.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECURITY & TECHNICAL INTEGRITY ── */}
        <section id="securite" className="py-16 sm:py-24 border-b border-border-base bg-background scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 sm:p-12 rounded-3xl border border-border-base bg-surface flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-base bg-surface-container text-xs font-medium text-text-secondary">
                  <span className="material-symbols-outlined text-[16px] text-emerald-500">lock</span>
                  <span>Sécurité des données d’entreprise</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                  Vos informations financières protégées par Row Level Security.
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Chaque compte d’entreprise possède son périmètre étanche sur notre cluster PostgreSQL Supabase. Aucune fuite d’informations entre organisations n’est physiquement possible au niveau de la couche SQL.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full lg:w-auto shrink-0 font-mono text-xs">
                <div className="p-4 rounded-xl border border-border-base bg-surface-container-low">
                  <div className="text-text-secondary">Base de données</div>
                  <div className="font-bold text-text-primary mt-1">PostgreSQL 16</div>
                </div>
                <div className="p-4 rounded-xl border border-border-base bg-surface-container-low">
                  <div className="text-text-secondary">Chiffrement</div>
                  <div className="font-bold text-text-primary mt-1">AES-256 / SSL</div>
                </div>
                <div className="p-4 rounded-xl border border-border-base bg-surface-container-low">
                  <div className="text-text-secondary">Authentification</div>
                  <div className="font-bold text-text-primary mt-1">Supabase Auth</div>
                </div>
                <div className="p-4 rounded-xl border border-border-base bg-surface-container-low">
                  <div className="text-text-secondary">Messagerie transactionnelle</div>
                  <div className="font-bold text-text-primary mt-1">Resend API</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL EXECUTIVE CTA ── */}
        <section className="py-16 sm:py-24 bg-surface">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-text-primary max-w-2xl">
              Prêt à accélérer la gestion et le recouvrement de vos factures ?
            </h2>
            <p className="text-sm sm:text-base text-text-secondary mt-4 max-w-xl leading-relaxed">
              Connectez-vous immédiatement à votre espace ou créez votre compte d’entreprise pour démarrer vos émissions de documents.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href={user ? '/dashboard' : '/login'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-semibold text-sm transition-all shadow-md shadow-primary/20 cursor-pointer"
              >
                <span>Accéder à GestPro</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="w-full border-t border-border-base bg-background py-8 sm:py-12 transition-colors duration-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
              GP
            </div>
            <span className="font-bold text-sm text-text-primary">GestPro S.A.S</span>
            <span className="text-xs text-text-secondary">· Progiciel ERP &amp; Facturation</span>
          </div>

          <p className="text-xs text-text-secondary m-0">
            © 2026 GestPro. Tous droits réservés.
          </p>

          <div className="flex items-center gap-6 text-xs text-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Système opérationnel</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
