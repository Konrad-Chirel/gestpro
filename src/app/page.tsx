'use client';

import Link from 'next/link';
import { useStore } from '@/context/StoreContext';

export default function LandingPage() {
  const { theme, toggleTheme } = useStore();

  return (
    <div className="bg-background font-body-md text-on-surface min-h-screen transition-colors duration-200">
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border-base transition-colors duration-200">
        <div className="h-20 max-w-7xl mx-auto px-6 lg:px-container-margin flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              alt="Logo GestPro" 
              className="h-8 w-auto object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCM6JLGmVhSMYt55BtetS883ocjr2mnODZfHbA9CzKQ0WAh10x_CwqLciLoi2hASgZnYYRnrTtKXxyDe2wNojF6XUqxFL8AIghoQZF1ucdxr8NO19nG86KFc1dGCqlYbN6Ccits7OMWQeIgWKamds0gyeeXjTC7Rj8MsGd0fLR4sAWYLLgY6j7jWNHo57T4o5bdcKDXnFHDhFilu23GUyVABL9UIYjHFa6RYLeLofnIRyg9xp3cMPt3"
            />
            <span className="text-xl font-headline-md font-bold tracking-tight text-text-primary">GestPro</span>
          </div>
          <div className="hidden md:flex items-center gap-4 bg-surface-container-low px-4 py-1.5 rounded-full border border-border-base">
            <button className="text-label-md text-primary">Français</button>
            <span className="text-border-base">|</span>
            <button className="text-label-md text-on-surface-variant hover:text-on-surface transition-colors">Anglais</button>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <Link 
              href="/dashboard" 
              className="bg-primary hover:bg-primary-hover text-on-primary font-label-md text-label-md px-6 py-3 rounded-xl transition-all duration-200 shadow-md shadow-primary/20" 
              data-path="dashboard-overview"
            >
              Accéder au dashboard
            </Link>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full bg-background transition-colors duration-200">
        <div className="flex flex-col w-full font-body-md text-on-surface">
          {/* HERO SECTION */}
          <section 
            className="relative w-full overflow-hidden rounded-b-[48px] border-b border-border-base pb-section-padding pt-24 lg:pt-32" 
            style={{ 
              background: theme === 'light'
                ? 'radial-gradient(125% 125% at 50% 10%, #F8FAFC 40%, #FFEDD5 100%)'
                : 'radial-gradient(125% 125% at 50% 10%, #0A0A0A 40%, #1A0D06 100%)'
            }}
          >
            {/* Decorative dot pattern overlay */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-20" 
              style={{ 
                backgroundImage: 'radial-gradient(circle at 1px 1px, #ffb690 1px, transparent 0)', 
                backgroundSize: '32px 32px', 
                maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)', 
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)' 
              }}
            ></div>
            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-container-margin flex flex-col items-center text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-high border border-border-base text-label-sm font-label-sm text-primary mb-8 animate-[fade-in-up_0.8s_ease-out]">
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                Simplifiez
              </div>
              {/* H1 */}
              <h1 className="font-display-lg text-[40px] md:text-display-lg text-text-primary tracking-tight max-w-4xl mb-6 animate-[fade-in-up_1s_ease-out_0.2s_both]">
                Facturation simplifiée, <br className="hidden md:block"/>
                <span className="text-primary italic font-light">résultats amplifiés.</span>
              </h1>
              {/* P */}
              <p className="font-body-lg text-on-surface-variant max-w-2xl mb-12 animate-[fade-in-up_1s_ease-out_0.4s_both]">
                Suivez chaque paiement, gérez vos clients et obtenez une vue claire de vos finances avec un tableau de bord simple, élégant et résolument pensé pour la productivité de votre entreprise.
              </p>
              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 animate-[fade-in-up_1s_ease-out_0.6s_both]">
                <Link 
                  href="/login" 
                  className="h-12 px-8 flex items-center justify-center rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-label-md transition-all duration-300 w-full sm:w-auto shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_30px_rgba(234,88,12,0.5)]"
                >
                  Commencer maintenant
                </Link>
                <Link 
                  href="/login" 
                  className="h-12 px-8 flex items-center justify-center rounded-xl border border-border-base hover:bg-surface-container-high text-text-primary font-label-md transition-all duration-300 w-full sm:w-auto"
                >
                  Voir la démo
                </Link>
              </div>
              {/* Dashboard Mockup */}
              <div className="w-full max-w-5xl relative animate-[fade-in-up_1.2s_ease-out_0.8s_both] group">
                {/* Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-primary/30 transition-colors duration-700"></div>
                {/* Glass Frame */}
                <div className="relative p-3 rounded-3xl bg-surface/40 backdrop-blur-md border border-border-base shadow-2xl">
                  <div className="relative rounded-2xl overflow-hidden border border-border-base bg-surface-container aspect-[16/9] flex items-center justify-center">
                    <img 
                      alt="Aperçu du tableau de bord GestPro" 
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4j2KzhP0oV6wf1lz-UHmfteUo6PCjskzYllYsjKWrauzS1-Kl5r4CZkoFaPkfMjF9h-kSpju9DFiQkMGUlr-tK82jmenxgdog56qy0ZBj4V-PxpW38uAcK9FD1_kU4jiGeRAHww8TgOqRRzCa0_JS9SBxve1NswaFFjYnRRNtfBrhe95DH04Xl--IEXd1LZ1EtNyWsS_3Di9sX4EyDuVVWPEOmz2z8X_6zxzzJE4HIO6GyCkrNkLy"
                    />
                    {/* Abstract fallback if image fails */}
                    <div className="absolute inset-0 -z-10 flex flex-col">
                      <div className="h-14 border-b border-border-base flex items-center px-6 gap-4">
                        <div className="w-32 h-4 bg-surface-container-high rounded-full"></div>
                        <div className="w-64 h-4 bg-surface-container-highest rounded-full ml-auto"></div>
                      </div>
                      <div className="flex-1 flex p-6 gap-6">
                        <div className="w-48 hidden md:flex flex-col gap-4">
                          <div className="h-8 bg-surface-container-high rounded-lg w-full"></div>
                          <div className="h-8 bg-surface-container-high rounded-lg w-3/4"></div>
                          <div className="h-8 bg-surface-container-high rounded-lg w-5/6"></div>
                        </div>
                        <div className="flex-1 flex flex-col gap-6">
                          <div className="h-48 bg-surface-container-high rounded-xl w-full"></div>
                          <div className="flex-1 flex gap-6">
                            <div className="flex-1 bg-surface-container-high rounded-xl"></div>
                            <div className="w-1/3 flex flex-col gap-4">
                              <div className="flex-1 bg-surface-container-high rounded-xl"></div>
                              <div className="flex-1 bg-surface-container-high rounded-xl"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FEATURES SECTION */}
          <section className="w-full py-section-padding bg-background transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-6 lg:px-container-margin">
              {/* Section Header */}
              <div className="flex flex-col items-center text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-border-base text-label-sm font-label-sm text-on-surface-variant mb-6 uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[16px] text-primary">bolt</span>
                  Fonctionnalités clés
                </div>
                <h2 className="font-headline-lg text-[32px] md:text-[40px] leading-tight text-text-primary max-w-3xl">
                  Simplifiez vos finances, <br/>
                  <span className="text-on-surface-variant">amplifiez votre productivité.</span>
                </h2>
              </div>
              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pt-8">
                {/* Card 1 */}
                <div className="group p-8 rounded-2xl bg-surface border border-border-base hover:border-primary/30 hover:bg-surface-container transition-all duration-300 relative overflow-hidden flex flex-col h-full animate-float">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors"></div>
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-border-base flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">monitoring</span>
                  </div>
                  <h3 className="font-headline-md text-lg text-text-primary mb-3">Analyses poussées</h3>
                  <p className="font-body-sm text-on-surface-variant flex-1">
                    Visualisez vos revenus en temps réel avec des graphiques dynamiques et des rapports détaillés sur 30 jours.
                  </p>
                </div>
                {/* Card 2 */}
                <div className="group p-8 rounded-2xl bg-surface border border-border-base hover:border-primary/30 hover:bg-surface-container transition-all duration-300 relative overflow-hidden flex flex-col h-full mt-0 md:-mt-8 animate-float-delayed">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors"></div>
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-border-base flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">dashboard_customize</span>
                  </div>
                  <h3 className="font-headline-md text-lg text-text-primary mb-3">Tableau central</h3>
                  <p className="font-body-sm text-on-surface-variant flex-1">
                    Gérez tout depuis une interface unique et épurée, conçue pour démultiplier votre efficacité quotidienne.
                  </p>
                </div>
                {/* Card 3 */}
                <div className="group p-8 rounded-2xl bg-surface border border-border-base hover:border-primary/30 hover:bg-surface-container transition-all duration-300 relative overflow-hidden flex flex-col h-full animate-float">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors"></div>
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-border-base flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">receipt_long</span>
                  </div>
                  <h3 className="font-headline-md text-lg text-text-primary mb-3">Facturation rapide</h3>
                  <p className="font-body-sm text-on-surface-variant flex-1">
                    Générez et envoyez des factures professionnelles en quelques clics, suivez les statuts de paiement.
                  </p>
                </div>
                {/* Card 4 */}
                <div className="group p-8 rounded-2xl bg-surface border border-border-base hover:border-primary/30 hover:bg-surface-container transition-all duration-300 relative overflow-hidden flex flex-col h-full mt-0 md:-mt-8 animate-float-delayed">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors"></div>
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-border-base flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">group</span>
                  </div>
                  <h3 className="font-headline-md text-lg text-text-primary mb-3">Gestion clients</h3>
                  <p className="font-body-sm text-on-surface-variant flex-1">
                    Centralisez les informations de vos clients et accédez rapidement à l'historique de leurs transactions.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA SECTION */}
          <section className="w-full py-section-padding bg-background transition-colors duration-200">
            <div className="max-w-5xl mx-auto px-6 lg:px-container-margin">
              <div className="relative overflow-hidden rounded-[32px] bg-primary-container/10 border border-primary/20 p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Decorative abstract shape */}
                <svg className="absolute -right-24 -bottom-24 w-96 h-96 text-primary/10 pointer-events-none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path d="M45.7,-76.4C58.9,-69.3,69.1,-55.3,77.5,-40.8C85.9,-26.3,92.5,-11.3,91.3,3C90.1,17.3,81.1,30.8,70.5,41.9C59.9,53,47.7,61.7,34.4,68.7C21.1,75.7,6.7,81,-7.2,84.1C-21.1,87.2,-34.5,88.1,-46.8,82.7C-59.1,77.3,-70.3,65.6,-78.4,52.1C-86.5,38.6,-91.5,23.3,-92.4,7.8C-93.3,-7.7,-90.1,-23.4,-82.1,-36.5C-74.1,-49.6,-61.3,-60.1,-47.5,-66.8C-33.7,-73.5,-18.9,-76.4,-2.8,-71.8C13.3,-67.2,26.6,-55.1,32.5,-83.5L45.7,-76.4Z" fill="currentColor" transform="translate(100 100) scale(1.1)"></path>
                </svg>
                <div className="relative z-10 flex-1">
                  <h2 className="font-headline-lg text-[32px] text-text-primary mb-4">
                    Prêt à prendre le contrôle de vos finances ?
                  </h2>
                  <p className="font-body-lg text-on-surface-variant max-w-xl">
                    Rejoignez des milliers de professionnels qui simplifient leur gestion quotidienne avec GestPro.
                  </p>
                </div>
                <div className="relative z-10 flex-shrink-0 w-full md:w-auto">
                  <Link 
                    href="/login" 
                    className="h-12 px-8 flex items-center justify-center rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-label-md transition-all duration-300 whitespace-nowrap shadow-lg shadow-primary/20"
                  >
                    Commencer maintenant !
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="w-full bg-surface-container-lowest py-section-padding border-t border-border-base">
        <div className="max-w-7xl mx-auto px-6 lg:px-container-margin flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <img 
              alt="Logo GestPro" 
              className="h-6 w-auto object-contain grayscale" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCM6JLGmVhSMYt55BtetS883ocjr2mnODZfHbA9CzKQ0WAh10x_CwqLciLoi2hASgZnYYRnrTtKXxyDe2wNojF6XUqxFL8AIghoQZF1ucdxr8NO19nG86KFc1dGCqlYbN6Ccits7OMWQeIgWKamds0gyeeXjTC7Rj8MsGd0fLR4sAWYLLgY6j7jWNHo57T4o5bdcKDXnFHDhFilu23GUyVABL9UIYjHFa6RYLeLofnIRyg9xp3cMPt3"
            />
            <span className="font-headline-md text-on-surface-variant opacity-50">GestPro</span>
          </div>
          <p className="text-body-sm text-on-surface-variant">© 2024 GestPro. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link className="text-label-sm text-on-surface-variant hover:text-primary" href="#">Confidentialité</Link>
            <Link className="text-label-sm text-on-surface-variant hover:text-primary" href="#">Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
