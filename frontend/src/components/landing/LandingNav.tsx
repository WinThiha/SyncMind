'use client';

import Link from 'next/link';
import { ChevronRight, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';
import { LandingButtonLink } from './LandingButtonLink';

interface LandingNavProps {
  isAuthenticated: boolean;
  userName?: string | null;
}

const anchorLinks = [
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Start', href: '#cta' },
];

export function LandingNav({ isAuthenticated, userName }: LandingNavProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="glass-navbar mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-2xl px-4 py-3 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20">
            S
          </div>
          <div className="leading-tight">
            <div className="text-sm font-black tracking-[0.22em] text-foreground/50 uppercase">SyncMind</div>
            <div className="text-xs text-foreground/45 hidden sm:block">Project and issue workspace</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {anchorLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground/65 transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-border-glow/40 bg-foreground/5 px-3 py-2 text-sm text-foreground/70 md:flex">
                <span className="h-2 w-2 rounded-full bg-brand-primary" />
                {userName ? `Hi, ${userName.split(' ')[0]}` : 'Signed in'}
              </div>
              <LandingButtonLink href="/dashboard" variant="primary" size="sm">
                <LayoutDashboard size={16} />
                Dashboard
              </LandingButtonLink>
            </>
          ) : (
            <>
              <LandingButtonLink href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
                <LogIn size={16} />
                Sign in
              </LandingButtonLink>
              <LandingButtonLink href="/register" variant="primary" size="sm">
                <UserPlus size={16} />
                Get started
              </LandingButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}