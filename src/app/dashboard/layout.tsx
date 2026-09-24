'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
