'use client';

import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { TransitionWrapper } from './TransitionWrapper';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';
import { AppLogo } from '@/components/ui/AppLogo';

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
        >
          <AppLogo size="sm" showWordmark={false} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      {/* Content shifts right only on lg+ where sidebar is not an overlay */}
      <div className={`flex-1 min-h-screen relative transition-[margin-left] duration-200 ease ${
        collapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        <Topbar />
        <main className="h-screen pt-16 overflow-y-auto">
          <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-12">
            <div className="max-w-7xl mx-auto w-full">
              <TransitionWrapper>
                {children}
              </TransitionWrapper>
            </div>
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
