'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) {
  const pathname = usePathname();
  const { t } = useStore();

  const links = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: 'dashboard' },
    { href: '/dashboard/clients', label: t('nav.clients'), icon: 'group' },
    { href: '/dashboard/produits', label: t('nav.products'), icon: 'inventory_2' },
    { href: '/dashboard/commandes', label: t('nav.orders'), icon: 'shopping_cart' },
    { href: '/dashboard/factures', label: t('nav.invoices'), icon: 'receipt_long' },
    { href: '/dashboard/paiements', label: t('nav.payments'), icon: 'payments' },
    { href: '/dashboard/historique', label: t('nav.history'), icon: 'history' },
  ];

  const getLinkClasses = (href: string) => {
    const isActive = pathname === href;
    const baseClasses = 'flex items-center gap-3 px-4 py-3 rounded-lg transition-all';
    const activeClasses = 'bg-primary/10 text-primary font-label-md';
    const inactiveClasses = 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface';

    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    <aside className={`fixed left-0 top-0 h-full w-72 bg-surface-container z-50 flex flex-col border-r border-border-base transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <div className="h-20 flex items-center px-6 gap-3 border-b border-border-base">
        <img 
          alt="GestPro Logo" 
          className="h-8 w-auto object-contain" 
          src="/logo.svg" 
        />
        <span className="font-headline-md text-headline-md text-primary tracking-tight">GestPro</span>
      </div>
      
      <nav className="flex-1 px-4 mt-4 space-y-1">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={getLinkClasses(link.href)} onClick={onClose}>
            <span className="material-symbols-outlined">{link.icon}</span>
            <span className="font-label-md text-label-md">{link.label}</span>
          </Link>
        ))}

        <div className="pt-4 mt-4 border-t border-border-base">
          <Link href="/dashboard/parametres" className={getLinkClasses('/dashboard/parametres')} onClick={onClose}>
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">{t('nav.settings')}</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}
