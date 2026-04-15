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
import { useSidebar } from '@/context/SidebarContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Settings, label: 'Settings', href: '/settings' },
  { icon: HelpCircle, label: 'Help', href: '/help' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-50 flex flex-col p-4 bg-background border-r border-border-glow shadow-sm transition-[width] duration-200 ease ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className={`flex items-center gap-2 px-2 py-6 ${collapsed ? 'justify-center' : ''}`}>
        <button
          onClick={toggle}
          className="shrink-0 p-1 rounded hover:bg-foreground/5 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronRight
            size={20}
            className={`transition-transform duration-200 ${collapsed ? 'rotate-0' : 'rotate-180'}`}
          />
        </button>
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 overflow-hidden"
          >
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight whitespace-nowrap">SyncMind</span>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 flex flex-col gap-1 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="group relative block">
              <motion.div
                whileHover={collapsed ? {} : { x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-2 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'
                }`}
              >
                <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
                  <item.icon size={20} className="shrink-0" />
                  {collapsed && (
                    <span className="absolute left-full top-1/2 -translate-y-1/2 ml-6 px-2 py-1 bg-foreground text-background text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                      {item.label}
                    </span>
                  )}
                  <span className={`font-medium whitespace-nowrap transition-opacity duration-200 ${
                    collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                  }`}>{item.label}</span>
                </div>
                {isActive && !collapsed && (
                  <motion.div
                    layoutId="active-indicator"
                    className="w-1.5 h-1.5 bg-brand-primary rounded-full shrink-0"
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
          className={`group relative w-full flex items-center px-3 py-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors ${
            collapsed ? 'justify-center' : 'gap-3'
          }`}
        >
          <LogOut size={20} className="shrink-0" />
          {collapsed && (
            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-6 px-2 py-1 bg-foreground text-background text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              Logout
            </span>
          )}
          <span className={`font-medium whitespace-nowrap transition-opacity duration-200 ${
            collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
          }`}>Logout</span>
        </button>
      </div>
    </aside>
  );
};
