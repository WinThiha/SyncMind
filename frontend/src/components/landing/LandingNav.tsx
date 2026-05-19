'use client';

import { useState } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  BrainCircuit,
  ChevronDown,
  Globe,
  LayoutDashboard,
  LogIn,
  Menu,
  Moon,
  Sun,
  UserPlus,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { LandingButtonLink } from './LandingButtonLink';
import { ToolbarPreferences } from '@/components/toolbar/ToolbarPreferences';
import { updateUserSettings } from '@/lib/api/settings';
import { LOCALE_OPTIONS } from '@/lib/i18n/localeOptions';

interface LandingNavProps {
  isAuthenticated: boolean;
  userName?: string | null;
}

export function LandingNav({ isAuthenticated, userName }: LandingNavProps) {
  const { t, locale, setLocale } = useLocale();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [savingLocale, setSavingLocale] = useState(false);

  const themeLabel = isDarkMode ? t('nav.topbar.themeLight') : t('nav.topbar.themeDark');

  const handleLocaleChange = async (nextLocale: string) => {
    const prev = locale;
    setLocale(nextLocale);
    if (!user) return;
    setSavingLocale(true);
    try {
      await updateUserSettings({ preferences: { locale: nextLocale as typeof locale } });
    } catch {
      setLocale(prev);
    } finally {
      setSavingLocale(false);
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="glass-navbar mx-auto max-w-7xl rounded-2xl overflow-hidden backdrop-blur-xl">

        {/* Main row */}
        <div className="flex items-center justify-between gap-3 px-4 py-3">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shrink-0 shadow-sm shadow-brand-primary/30">
              <BrainCircuit size={16} className="text-white" strokeWidth={1.75} />
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-sm font-black tracking-[0.22em] text-foreground/55 uppercase">SyncMind</div>
              <div className="text-[11px] text-foreground/40 hidden lg:block">Project and issue workspace</div>
            </div>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">

            {/* ToolbarPreferences: desktop only */}
            <div className="hidden sm:block">
              <ToolbarPreferences />
            </div>

            {isAuthenticated ? (
              <>
                <span className="hidden md:block text-sm text-foreground/55 font-medium mr-1">
                  {userName ? t('landing.nav.greeting', { name: userName.split(' ')[0] }) : t('landing.nav.signedIn')}
                </span>
                <LandingButtonLink href="/dashboard" variant="primary" size="sm">
                  <LayoutDashboard size={16} />
                  <span className="hidden sm:inline">{t('landing.nav.dashboard')}</span>
                </LandingButtonLink>
              </>
            ) : (
              <>
                {/* Sign In: desktop only — mobile users use the hamburger or Get Started */}
                <div className="hidden sm:block">
                  <LandingButtonLink href="/login" variant="ghost" size="sm">
                    <LogIn size={16} />
                    {t('landing.nav.signIn')}
                  </LandingButtonLink>
                </div>
                <LandingButtonLink href="/register" variant="primary" size="sm">
                  <UserPlus size={16} />
                  <span className="hidden sm:inline">{t('landing.nav.getStarted')}</span>
                </LandingButtonLink>
              </>
            )}

            {/* Hamburger — mobile/tablet only */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? t('landing.nav.closeMenu') : t('landing.nav.openMenu')}
              className="md:hidden p-2 rounded-xl text-foreground/55 hover:bg-foreground/5 hover:text-foreground transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden border-t border-border-glow/30"
            >
              <div className="px-4 py-4 flex flex-col gap-4">

                {/* Language */}
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                    {t('nav.toolbar.locale')}
                  </p>
                  <div className="relative">
                    <Globe size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                    <select
                      aria-label={t('nav.toolbar.locale')}
                      value={locale}
                      disabled={savingLocale}
                      onChange={e => void handleLocaleChange(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-border-glow bg-foreground/5 pl-9 pr-8 py-3 text-sm font-medium text-foreground outline-none transition-all focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30"
                    >
                      {LOCALE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-background text-foreground">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground/35" />
                  </div>
                </div>

                {/* Appearance */}
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                    Appearance
                  </p>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label={themeLabel}
                    className="w-full flex items-center gap-3 rounded-xl border border-border-glow bg-foreground/5 px-4 py-3 text-sm font-semibold text-foreground/70 hover:bg-foreground/10 hover:text-foreground transition-colors"
                  >
                    {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                    {themeLabel}
                  </button>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </header>
  );
}
