'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import { useStore } from '@/context/StoreContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isHydrated } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !user) {
      router.replace('/login');
    }
  }, [isHydrated, user, router]);

  // If hydrated and no user, show a smooth loading indicator while redirecting
  if (isHydrated && !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-text-secondary font-medium">Redirection vers la connexion...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface overflow-x-hidden w-full">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <TopHeader onMenuClick={() => setIsSidebarOpen(true)} />
      <main className="md:pl-72 pt-20 min-h-screen bg-background w-full">
        {children}
      </main>
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
