'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Settings, 
  HelpCircle, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BASE_SPRING } from '@/lib/animations';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Settings, label: 'Settings', href: '/settings' },
  { icon: HelpCircle, label: 'Help', href: '/help' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={BASE_SPRING}
      className="fixed left-0 top-0 h-full w-64 z-50 flex flex-col p-4 bg-background border-r border-border-glow shadow-sm"
    >
      <div className="flex items-center gap-2 px-2 py-6">
        <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">S</span>
        </div>
        <span className="text-xl font-bold tracking-tight">SyncMind</span>
      </div>

      <nav className="flex-1 mt-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-brand-primary/10 text-brand-primary' 
                    : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="w-1.5 h-1.5 bg-brand-primary rounded-full"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-border-glow">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </motion.aside>
  );
};
