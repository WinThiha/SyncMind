'use client';

import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { TransitionWrapper } from './TransitionWrapper';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

function LayoutContent({ children }: AuthenticatedLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { collapsed } = useSidebar();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center text-white font-bold"
        >
          S
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <div className={`flex-1 min-h-screen relative transition-[margin-left] duration-200 ease ${
        collapsed ? 'ml-20' : 'ml-64'
      }`}>
        <Topbar />
        <main className="h-screen pt-24 px-10 pb-10 md:px-14 md:pb-14 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            <TransitionWrapper>
              {children}
            </TransitionWrapper>
          </div>
        </main>
      </div>
    </div>
  );
}

export const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
};
