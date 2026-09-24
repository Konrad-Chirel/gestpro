'use client';

import Link from 'next/link';
import { useStore } from '@/context/StoreContext';

export default function LandingPage() {
  const { theme, toggleTheme } = useStore();

  return (
    <div className="bg-background font-body-md text-on-surface min-h-screen transition-colors duration-200">
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border-base transition-colors duration-200">
        <div className="h-16 sm:h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-container-margin flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <img 
              alt="Logo GestPro" 
              className="h-7 sm:h-8 w-auto object-contain shrink-0" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCM6JLGmVhSMYt55BtetS883ocjr2mnODZfHbA9CzKQ0WAh10x_CwqLciLoi2hASgZnYYRnrTtKXxyDe2wNojF6XUqxFL8AIghoQZF1ucdxr8NO19nG86KFc1dGCqlYbN6Ccits7OMWQeIgWKamds0gyeeXjTC7Rj8MsGd0fLR4sAWYLLgY6j7jWNHo57T4o5bdcKDXnFHDhFilu23GUyVABL9UIYjHFa6RYLeLofnIRyg9xp3cMPt3"
            />
            <span className="text-lg sm:text-xl font-headline-md font-bold tracking-tight text-text-primary">GestPro</span>
          </div>

          {/* Language Selector (Desktop) */}
          <div className="hidden md:flex items-center gap-4 bg-surface-container-low px-4 py-1.5 rounded-full border border-border-base">
            <button className="text-label-md text-primary">Français</button>
            <span className="text-border-base">|</span>
            <button className="text-label-md text-on-surface-variant hover:text-on-surface transition-colors">Anglais</button>
          </div>

          {/* Right Action Icons & Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[20px] sm:text-[22px]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Dashboard Access Button */}
            <Link 
              href="/dashboard" 
              className="bg-primary hover:bg-primary-hover text-on-primary font-semibold text-xs sm:text-sm h-9 sm:h-11 px-3 sm:px-5 rounded-xl transition-all duration-200 shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap active:scale-95" 
              data-path="dashboard-overview"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">dashboard</span>
              <span className="hidden sm:inline">Accéder au dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Link>

            {/* User Profile Avatar */}
            <Link
              href="/login"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface border border-border-base flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors shrink-0 shadow-sm"
              title="Connexion"
            >
              <span className="material-symbols-outlined text-[18px] sm:text-[20px]">person</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full bg-background transition-colors duration-200">
        <div className="flex flex-col w-full font-body-md text-on-surface">
          {/* HERO SECTION */}
          <section 
            className="relative w-full overflow-hidden rounded-b-[32px] sm:rounded-b-[48px] border-b border-border-base pb-12 sm:pb-section-padding pt-20 sm:pt-24 lg:pt-32" 
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
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-container-margin flex flex-col items-center text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-surface-container-high border border-border-base text-xs sm:text-label-sm font-label-sm text-primary mb-6 sm:mb-8 animate-[fade-in-up_0.8s_ease-out]">
                <span className="material-symbols-outlined text-[15px] sm:text-[16px]">bolt</span>
                Simplifiez
              </div>

              {/* H1 */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-display-lg font-extrabold text-text-primary tracking-tight max-w-4xl mb-3 sm:mb-6 animate-[fade-in-up_1s_ease-out_0.2s_both] px-2">
                Facturation simplifiée, <br className="hidden sm:block"/>
                <span className="text-primary italic font-light">résultats amplifiés.</span>
              </h1>

              {/* P */}
              <p className="text-xs sm:text-base md:text-lg text-on-surface-variant max-w-2xl mb-8 sm:mb-12 animate-[fade-in-up_1s_ease-out_0.4s_both] px-3 leading-relaxed">
                Suivez chaque paiement, gérez vos clients et obtenez une vue claire de vos finances avec un tableau de bord simple, élégant et résolument pensé pour la productivité de votre entreprise.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-10 sm:mb-20 w-full sm:w-auto animate-[fade-in-up_1s_ease-out_0.6s_both] px-4">
                <Link 
                  href="/login" 
                  className="h-10 sm:h-12 px-6 sm:px-8 flex items-center justify-center rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs sm:text-label-md font-semibold transition-all duration-300 w-full sm:w-auto shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_30px_rgba(234,88,12,0.5)]"
                >
                  Commencer maintenant
                </Link>
                <Link 
                  href="/login" 
                  className="h-10 sm:h-12 px-6 sm:px-8 flex items-center justify-center rounded-xl border border-border-base hover:bg-surface-container-high text-text-primary text-xs sm:text-label-md font-semibold transition-all duration-300 w-full sm:w-auto"
                >
                  Voir la démo
                </Link>
              </div>

              {/* Dashboard Mockup */}
              <div className="w-full max-w-5xl relative animate-[fade-in-up_1.2s_ease-out_0.8s_both] group">
                {/* Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-primary/30 transition-colors duration-700"></div>
                {/* Glass Frame */}
                <div className="relative p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-surface/40 backdrop-blur-md border border-border-base shadow-2xl">
                  <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-border-base bg-surface-container aspect-[16/9] flex items-center justify-center">
                    <img 
                      alt="Aperçu du tableau de bord GestPro" 
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4j2KzhP0oV6wf1lz-UHmfteUo6PCjskzYllYsjKWrauzS1-Kl5r4CZkoFaPkfMjF9h-kSpju9DFiQkMGUlr-tK82jmenxgdog56qy0ZBj4V-PxpW38uAcK9FD1_kU4jiGeRAHww8TgOqRRzCa0_JS9SBxve1NswaFFjYnRRNtfBrhe95DH04Xl--IEXd1LZ1EtNyWsS_3Di9sX4EyDuVVWPEOmz2z8X_6zxzzJE4HIO6GyCkrNkLy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FEATURES SECTION */}
          <section className="w-full py-10 sm:py-16 md:py-section-padding bg-background transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-container-margin">
              {/* Section Header */}
              <div className="flex flex-col items-center text-center mb-8 sm:mb-16">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-border-base text-xs sm:text-label-sm font-label-sm text-on-surface-variant mb-4 sm:mb-6 uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-primary">bolt</span>
                  Fonctionnalités clés
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[40px] font-bold leading-tight text-text-primary max-w-3xl px-2">
                  Simplifiez vos finances, <br className="hidden sm:block"/>
                  <span className="text-on-surface-variant">amplifiez votre productivité.</span>
                </h2>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 pt-2 sm:pt-8">
                {/* Card 1 */}
                <div className="group p-5 sm:p-8 rounded-2xl bg-surface border border-border-base hover:border-primary/30 hover:bg-surface-container transition-all duration-300 relative overflow-hidden flex flex-col h-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors"></div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-surface-container-high border border-border-base flex items-center justify-center text-primary mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[20px] sm:text-[24px]">monitoring</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-text-primary mb-2 sm:mb-3">Analyses poussées</h3>
                  <p className="text-xs sm:text-body-sm text-on-surface-variant flex-1 leading-relaxed">
                    Visualisez vos revenus en temps réel avec des graphiques dynamiques et des rapports détaillés sur 30 jours.
                  </p>
                </div>

                {/* Card 2 */}
                <div className="group p-5 sm:p-8 rounded-2xl bg-surface border border-border-base hover:border-primary/30 hover:bg-surface-container transition-all duration-300 relative overflow-hidden flex flex-col h-full mt-0 md:-mt-8">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors"></div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-surface-container-high border border-border-base flex items-center justify-center text-primary mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[20px] sm:text-[24px]">dashboard_customize</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-text-primary mb-2 sm:mb-3">Tableau central</h3>
                  <p className="text-xs sm:text-body-sm text-on-surface-variant flex-1 leading-relaxed">
                    Gérez tout depuis une interface unique et épurée, conçue pour démultiplier votre efficacité quotidienne.
                  </p>
                </div>

                {/* Card 3 */}
                <div className="group p-5 sm:p-8 rounded-2xl bg-surface border border-border-base hover:border-primary/30 hover:bg-surface-container transition-all duration-300 relative overflow-hidden flex flex-col h-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors"></div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-surface-container-high border border-border-base flex items-center justify-center text-primary mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[20px] sm:text-[24px]">receipt_long</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-text-primary mb-2 sm:mb-3">Facturation rapide</h3>
                  <p className="text-xs sm:text-body-sm text-on-surface-variant flex-1 leading-relaxed">
                    Générez et envoyez des factures professionnelles en quelques clics, suivez les statuts de paiement.
                  </p>
                </div>

                {/* Card 4 */}
                <div className="group p-5 sm:p-8 rounded-2xl bg-surface border border-border-base hover:border-primary/30 hover:bg-surface-container transition-all duration-300 relative overflow-hidden flex flex-col h-full mt-0 md:-mt-8">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors"></div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-surface-container-high border border-border-base flex items-center justify-center text-primary mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[20px] sm:text-[24px]">group</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-text-primary mb-2 sm:mb-3">Gestion clients</h3>
                  <p className="text-xs sm:text-body-sm text-on-surface-variant flex-1 leading-relaxed">
                    Centralisez les informations de vos clients et accédez rapidement à l'historique de leurs transactions.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA SECTION */}
          <section className="w-full py-10 sm:py-16 md:py-section-padding bg-background transition-colors duration-200">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-container-margin">
              <div className="relative overflow-hidden rounded-2xl sm:rounded-[32px] bg-primary-container/10 border border-primary/20 p-6 sm:p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
                {/* Decorative abstract shape */}
                <svg className="absolute -right-24 -bottom-24 w-72 sm:w-96 h-72 sm:h-96 text-primary/10 pointer-events-none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path d="M45.7,-76.4C58.9,-69.3,69.1,-55.3,77.5,-40.8C85.9,-26.3,92.5,-11.3,91.3,3C90.1,17.3,81.1,30.8,70.5,41.9C59.9,53,47.7,61.7,34.4,68.7C21.1,75.7,6.7,81,-7.2,84.1C-21.1,87.2,-34.5,88.1,-46.8,82.7C-59.1,77.3,-70.3,65.6,-78.4,52.1C-86.5,38.6,-91.5,23.3,-92.4,7.8C-93.3,-7.7,-90.1,-23.4,-82.1,-36.5C-74.1,-49.6,-61.3,-60.1,-47.5,-66.8C-33.7,-73.5,-18.9,-76.4,-2.8,-71.8C13.3,-67.2,26.6,-55.1,32.5,-83.5L45.7,-76.4Z" fill="currentColor" transform="translate(100 100) scale(1.1)"></path>
                </svg>

                <div className="relative z-10 flex-1 text-center md:text-left">
                  <h2 className="text-xl sm:text-2xl md:text-[32px] font-bold text-text-primary mb-2 sm:mb-4">
                    Prêt à prendre le contrôle de vos finances ?
                  </h2>
                  <p className="text-xs sm:text-base text-on-surface-variant max-w-xl leading-relaxed">
                    Rejoignez des milliers de professionnels qui simplifient leur gestion quotidienne avec GestPro.
                  </p>
                </div>

                <div className="relative z-10 flex-shrink-0 w-full sm:w-auto">
                  <Link 
                    href="/login" 
                    className="h-10 sm:h-12 px-6 sm:px-8 flex items-center justify-center rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs sm:text-label-md font-semibold transition-all duration-300 whitespace-nowrap shadow-lg shadow-primary/20 w-full sm:w-auto"
                  >
                    Commencer maintenant !
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-surface-container-lowest py-6 sm:py-10 border-t border-border-base transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-container-margin flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 text-center md:text-left">
          <div className="flex items-center gap-2 sm:gap-3">
            <img 
              alt="Logo GestPro" 
              className="h-5 sm:h-6 w-auto object-contain grayscale opacity-60" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCM6JLGmVhSMYt55BtetS883ocjr2mnODZfHbA9CzKQ0WAh10x_CwqLciLoi2hASgZnYYRnrTtKXxyDe2wNojF6XUqxFL8AIghoQZF1ucdxr8NO19nG86KFc1dGCqlYbN6Ccits7OMWQeIgWKamds0gyeeXjTC7Rj8MsGd0fLR4sAWYLLgY6j7jWNHo57T4o5bdcKDXnFHDhFilu23GUyVABL9UIYjHFa6RYLeLofnIRyg9xp3cMPt3"
            />
            <span className="font-bold text-sm sm:text-base text-on-surface-variant opacity-60">GestPro</span>
          </div>
          <p className="text-xs sm:text-body-sm text-on-surface-variant m-0">© 2024 GestPro. Tous droits réservés.</p>
          <div className="flex gap-4 sm:gap-6">
            <Link className="text-xs sm:text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Confidentialité</Link>
            <Link className="text-xs sm:text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
