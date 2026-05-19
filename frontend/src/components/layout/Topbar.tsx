'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Settings, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { useLocale } from '@/context/LocaleContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ToolbarPreferences } from '@/components/toolbar/ToolbarPreferences';

export const Topbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar();
  const { t } = useLocale();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setDropdownOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 h-16 z-40 flex items-center gap-3 px-4 sm:px-5 bg-background/95 backdrop-blur-sm border-b border-border-glow transition-[left] duration-200 ease ${
        collapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-64'
      }`}
    >
      {/* Mobile hamburger — opens sidebar overlay */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={t('nav.topbar.openNav')}
        className="lg:hidden shrink-0 p-2 rounded-lg hover:bg-foreground/8 transition-colors text-foreground/50 hover:text-foreground"
      >
        <Menu size={18} />
      </button>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2 shrink-0">
        <ToolbarPreferences className="hidden md:flex" />

        {/* Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-xl hover:bg-foreground/5 transition-colors"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center shrink-0 font-bold text-xs text-brand-primary">
              {initials}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-sm font-semibold text-foreground truncate max-w-[100px]">{user?.name ?? t('common.user')}</p>
              {user?.position && (
                <p className="text-[11px] text-foreground/40 truncate max-w-[100px]">{user.position}</p>
              )}
            </div>
            <ChevronDown
              size={14}
              className={`text-foreground/35 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 bg-background border border-border-glow rounded-2xl shadow-xl shadow-black/10 overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-border-glow">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center shrink-0 font-bold text-sm text-brand-primary">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{user?.name}</p>
                      <p className="text-[11px] text-foreground/40 truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="p-1.5">
                  <Link
                    href="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/70 hover:bg-foreground/5 hover:text-foreground transition-colors"
                  >
                    <Settings size={16} className="text-foreground/40" />
                    {t('nav.topbar.settings')}
                  </Link>

                  <div className="my-1 border-t border-border-glow" />

                  <button
                    onClick={() => { setDropdownOpen(false); logout(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/8 transition-colors"
                  >
                    <LogOut size={16} />
                    {t('nav.topbar.signOut')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
