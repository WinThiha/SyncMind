'use client';

import { ArrowRight, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { LandingButtonLink } from './LandingButtonLink';

interface LandingCtaProps {
  isAuthenticated: boolean;
}

export function LandingCta({ isAuthenticated }: LandingCtaProps) {
  return (
    <section id="cta" className="landing-section px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <GlassCard glow className="landing-panel relative overflow-hidden rounded-[2.25rem] p-8 sm:p-10 lg:p-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.14),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.10),transparent_30%)]" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="landing-kicker text-brand-primary">Start here</div>
              <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Ready to move from landing page to the workspace itself?
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-foreground/60 sm:text-lg">
                Use the public homepage to orient new visitors, then route them into auth or dashboard flow depending on whether they are already signed in.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <LandingButtonLink href={isAuthenticated ? '/dashboard' : '/register'} size="lg">
                {isAuthenticated ? <LayoutDashboard size={18} /> : <UserPlus size={18} />}
                {isAuthenticated ? 'Open dashboard' : 'Create account'}
                <ArrowRight size={18} />
              </LandingButtonLink>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}