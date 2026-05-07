'use client';

import { ArrowRight, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { LandingButtonLink } from './LandingButtonLink';

interface LandingCtaProps {
  isAuthenticated: boolean;
}

export function LandingCta({ isAuthenticated }: LandingCtaProps) {
  const { t } = useLocale();
  return (
    <section id="cta" className="landing-section px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <GlassCard glow className="landing-panel relative overflow-hidden rounded-[2rem] p-7 sm:p-10 lg:p-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.14),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.10),transparent_30%)]" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="landing-kicker text-brand-primary">{t('landing.cta.kicker')}</div>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {t('landing.cta.headline')}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-foreground/60 sm:mt-5 sm:text-lg">
                {t('landing.cta.description')}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <LandingButtonLink
                href={isAuthenticated ? '/dashboard' : '/register'}
                size="lg"
                className="w-full justify-center sm:w-auto"
              >
                {isAuthenticated ? <LayoutDashboard size={18} /> : <UserPlus size={18} />}
                {isAuthenticated ? t('landing.cta.dashboard') : t('landing.cta.createAccount')}
                <ArrowRight size={18} />
              </LandingButtonLink>
              {!isAuthenticated && (
                <LandingButtonLink
                  href="/login"
                  variant="ghost"
                  size="lg"
                  className="w-full justify-center sm:w-auto"
                >
                  <LogIn size={18} />
                  {t('landing.cta.signIn')}
                </LandingButtonLink>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
