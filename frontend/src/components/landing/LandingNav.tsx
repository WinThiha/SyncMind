'use client';

import Link from 'next/link';
import { BrainCircuit, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';
import { LandingButtonLink } from './LandingButtonLink';

interface LandingNavProps {
  isAuthenticated: boolean;
  userName?: string | null;
}

export function LandingNav({ isAuthenticated, userName }: LandingNavProps) {

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
            {isAuthenticated ? (
              <>
                <span className="hidden md:block text-sm text-foreground/55 font-medium mr-1">
                  {userName ? `Hi, ${userName.split(' ')[0]}` : 'Signed in'}
                </span>
                <LandingButtonLink href="/dashboard" variant="primary" size="sm">
                  <LayoutDashboard size={16} />
                  Dashboard
                </LandingButtonLink>
              </>
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

      </div>
    </header>
  );
}
