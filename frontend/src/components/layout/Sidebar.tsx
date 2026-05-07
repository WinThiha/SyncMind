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
  X,
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
  const { collapsed, toggle, mobileOpen, setMobileOpen } = useSidebar();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-full z-50 flex flex-col py-4
          bg-background border-r border-border-glow shadow-sm
          transition-[width,transform] duration-200 ease
          w-64 ${collapsed ? 'lg:w-20' : 'lg:w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* ── Logo area ── */}

        {/* Desktop collapsed: icon-only toggle */}
        {collapsed && (
          <div className="hidden lg:flex items-center justify-center px-4 py-3 mb-2">
            <button
              onClick={toggle}
              aria-label="Expand sidebar"
              className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-brand-primary/40 hover:opacity-85 transition-opacity"
            >
              <BrainCircuit size={18} className="text-white" strokeWidth={1.75} />
            </button>
          </div>
        )}

        {/* Expanded logo: always on mobile, and on desktop when !collapsed */}
        <div className={`flex items-center justify-between px-4 py-3 mb-2 ${collapsed ? 'lg:hidden' : ''}`}>
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-brand-primary/40">
              <BrainCircuit size={18} className="text-white" strokeWidth={1.75} />
            </div>
            <span className="text-base font-bold tracking-tight whitespace-nowrap text-foreground">
              SyncMind
            </span>
          </motion.div>

          {/* Mobile: close button */}
          <button
            onClick={closeMobile}
            className="lg:hidden shrink-0 p-1.5 rounded-lg hover:bg-foreground/5 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={18} className="text-foreground/40" />
          </button>

          {/* Desktop: collapse button */}
          <button
            onClick={toggle}
            className="hidden lg:block shrink-0 p-1.5 rounded-lg hover:bg-foreground/5 transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronRight size={18} className="rotate-180 text-foreground/40" />
          </button>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 flex flex-col gap-0.5 px-2 mt-2">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className="group relative block"
              >
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center px-3 py-2.5 rounded-xl transition-colors ${
                    collapsed ? 'justify-between lg:justify-center' : 'justify-between'
                  } ${
                    isActive
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'text-foreground/55 hover:bg-foreground/5 hover:text-foreground'
                  }`}
                >
                  <div className={`flex items-center gap-3 ${collapsed ? 'lg:gap-0' : ''}`}>
                    <item.icon size={19} className="shrink-0" />

                    {/* Tooltip: desktop only when collapsed */}
                    {collapsed && (
                      <span className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-foreground text-background text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 shadow-lg">
                        {item.label}
                      </span>
                    )}

                    {/* Text: always on mobile, hidden on desktop when collapsed */}
                    <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${collapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : 'opacity-100'}`}>
                      {item.label}
                    </span>
                  </div>

                  {/* Active dot: always on mobile, hidden on desktop when collapsed */}
                  {isActive && (
                    <div className={`w-1.5 h-1.5 bg-brand-primary rounded-full shrink-0 ${collapsed ? 'lg:hidden' : ''}`} />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* ── User + Logout ── */}
        <div className="px-2 pt-3 border-t border-border-glow space-y-0.5">
          {/* User info: always on mobile, hidden on desktop when collapsed */}
          {user && (
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${collapsed ? 'lg:hidden' : ''}`}>
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
            onClick={() => { closeMobile(); logout(); }}
            className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground/50 hover:text-red-500 hover:bg-red-500/8 transition-colors ${collapsed ? 'lg:gap-0 lg:justify-center' : ''}`}
          >
            <LogOut size={19} className="shrink-0" />

            {collapsed && (
              <span className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-foreground text-background text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 shadow-lg">
                Logout
              </span>
            )}

            <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${collapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : 'opacity-100'}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};
