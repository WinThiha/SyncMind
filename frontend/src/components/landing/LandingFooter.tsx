'use client';

import Link from 'next/link';
import { LayoutDashboard, LogIn, UserPlus } from 'lucide-react';
import { LandingButtonLink } from './LandingButtonLink';
import { AppLogo } from '@/components/ui/AppLogo';

interface LandingFooterProps {
  isAuthenticated: boolean;
}

const footerAnchors = [
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Start', href: '#cta' },
];

export function LandingFooter({ isAuthenticated }: LandingFooterProps) {
  return (
    <footer className="px-4 pb-10 pt-4 sm:px-6 sm:pb-12 lg:px-8 lg:pb-14">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-border-glow/30 bg-background/65 px-5 py-7 backdrop-blur-xl sm:px-8 sm:py-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          {/* Brand block */}
          <div className="max-w-md">
            <Link href="/" className="flex items-center gap-3">
              <AppLogo size="sm" showWordmark={false} />
              <div>
                <div className="text-sm font-black tracking-[0.24em] uppercase text-foreground/55">SyncMind</div>
                <div className="text-xs text-foreground/45">Project and issue workspace</div>
              </div>
            </Link>
            <p className="mt-4 text-sm leading-6 text-foreground/55">
              Project management, issue workflows, AI assistance, and route-safe public entry — built to mirror what exists today.
            </p>
          </div>

          {/* Links + actions */}
          <div className="flex flex-wrap items-center gap-2">
            {footerAnchors.map((anchor) => (
              <Link
                key={anchor.href}
                href={anchor.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-foreground/65 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                {anchor.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <LandingButtonLink href="/dashboard" variant="primary" size="sm">
                <LayoutDashboard size={16} />
                Dashboard
              </LandingButtonLink>
            ) : (
              <>
                <LandingButtonLink href="/login" variant="ghost" size="sm">
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

        <div className="mt-8 flex flex-col gap-2 border-t border-border-glow/20 pt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 SyncMind. All rights reserved.</p>
          <p>Landing page built from implemented routes only.</p>
        </div>
      </div>
    </footer>
  );
}
