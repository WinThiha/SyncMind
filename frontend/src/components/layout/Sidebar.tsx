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
  ChevronRight,
  BrainCircuit,
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
  const { user, logout } = useAuth();
  const { collapsed, toggle } = useSidebar();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-50 flex flex-col py-4 bg-background border-r border-border-glow shadow-sm transition-[width] duration-200 ease ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-3 mb-2 ${collapsed ? 'justify-center' : ''}`}>
        <button
          onClick={toggle}
          className="shrink-0 p-1.5 rounded-lg hover:bg-foreground/5 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronRight
            size={18}
            className={`transition-transform duration-200 text-foreground/40 ${collapsed ? 'rotate-0' : 'rotate-180'}`}
          />
        </button>

        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shrink-0 shadow-sm shadow-brand-primary/30">
              <BrainCircuit size={16} className="text-white" strokeWidth={1.75} />
            </div>
            <span className="text-base font-bold tracking-tight whitespace-nowrap text-foreground">
              SyncMind
            </span>
          </motion.div>
        )}

        {collapsed && (
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shadow-sm shadow-brand-primary/30">
            <BrainCircuit size={16} className="text-white" strokeWidth={1.75} />
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 mt-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className="group relative block">
              <motion.div
                whileTap={{ scale: 0.97 }}
                className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'text-foreground/55 hover:bg-foreground/5 hover:text-foreground'
                }`}
              >
                <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
                  <item.icon size={19} className="shrink-0" />

                  {/* Tooltip when collapsed */}
                  {collapsed && (
                    <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-foreground text-background text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 shadow-lg">
                      {item.label}
                    </span>
                  )}

                  <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${
                    collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                  }`}>
                    {item.label}
                  </span>
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

      {/* User + Logout */}
      <div className="px-2 pt-3 border-t border-border-glow space-y-0.5">
        {/* User info */}
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-brand-primary/15 border border-brand-primary/25 flex items-center justify-center shrink-0">
              <span className="text-brand-primary font-bold text-xs">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-[11px] text-foreground/40 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className={`group relative w-full flex items-center px-3 py-2.5 rounded-xl text-foreground/50 hover:text-red-500 hover:bg-red-500/8 transition-colors ${
            collapsed ? 'justify-center' : 'gap-3'
          }`}
        >
          <LogOut size={19} className="shrink-0" />

          {collapsed && (
            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-foreground text-background text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 shadow-lg">
              Logout
            </span>
          )}

          <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${
            collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
          }`}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};
