import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";

export const metadata: Metadata = {
  title: "GestPro – Gestion de facturation simplifiée",
  description: "Suivez chaque paiement, gérez vos clients et obtenez une vue claire de vos finances avec un tableau de bord simple, élégant et résolument pensé pour la productivité de votre entreprise.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('gestpro_theme');
                  var d = document.documentElement;
                  if (t === 'light') {
                    d.classList.remove('dark');
                    d.classList.add('light');
                    d.setAttribute('data-theme', 'light');
                  } else {
                    d.classList.remove('light');
                    d.classList.add('dark');
                    d.setAttribute('data-theme', 'dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <link rel="preload" href="/fonts/material-symbols-outlined.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" rel="stylesheet" />
      </head>
      <body className="bg-background font-sans text-on-surface antialiased transition-colors duration-200">
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
