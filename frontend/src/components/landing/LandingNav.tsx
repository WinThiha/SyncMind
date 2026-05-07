'use client';

import { useState } from 'react';
import { useLocale } from '@/context/LocaleContext';
import Link from 'next/link';
import { BrainCircuit, LayoutDashboard, LogIn, UserPlus, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LandingButtonLink } from './LandingButtonLink';
import { ToolbarPreferences } from '@/components/toolbar/ToolbarPreferences';

interface LandingNavProps {
  isAuthenticated: boolean;
  userName?: string | null;
}

export function LandingNav({ isAuthenticated, userName }: LandingNavProps) {
  const { t } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const anchorLinks = [
    { label: t('landing.nav.capabilities'), href: '#capabilities' },
    { label: t('landing.nav.start'), href: '#cta' },
  ];

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

          {/* Centre anchor links — desktop only */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {anchorLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
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
                <LandingButtonLink href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <LogIn size={16} />
                  {t('landing.nav.signIn')}
                </LandingButtonLink>
                <LandingButtonLink href="/register" variant="primary" size="sm">
                  <UserPlus size={16} />
                  <span className="hidden sm:inline">{t('landing.nav.getStarted')}</span>
                </LandingButtonLink>
              </>
            )}

            {/* Hamburger — hidden on md+ */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? t('landing.nav.closeMenu') : t('landing.nav.openMenu')}
              className="md:hidden p-2 rounded-xl text-foreground/55 hover:bg-foreground/5 hover:text-foreground transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown — animated */}
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
              <div className="px-3 py-3 flex flex-col gap-0.5">
                {anchorLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground/65 hover:bg-foreground/5 hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground/65 hover:bg-foreground/5 hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <LogIn size={16} />
                    {t('landing.nav.signIn')}
                  </Link>
                )}
                {isAuthenticated && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground/65 hover:bg-foreground/5 hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <LayoutDashboard size={16} />
                    {t('landing.nav.goToDashboard')}
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </header>
  );
}
