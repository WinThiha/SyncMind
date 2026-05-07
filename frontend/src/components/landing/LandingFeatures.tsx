'use client';

import { BrainCircuit, GitBranch, Search, Sparkles, Users } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { GlassCard } from '@/components/ui/GlassCard';

export function LandingFeatures() {
  const { t } = useLocale();
  const features = [
    { icon: Sparkles, title: t('landing.features.1.title'), description: t('landing.features.1.description') },
    { icon: Search, title: t('landing.features.2.title'), description: t('landing.features.2.description') },
    { icon: GitBranch, title: t('landing.features.3.title'), description: t('landing.features.3.description') },
    { icon: Users, title: t('landing.features.4.title'), description: t('landing.features.4.description') },
    { icon: BrainCircuit, title: t('landing.features.5.title'), description: t('landing.features.5.description') },
  ];
  return (
    <section id="capabilities" className="landing-section px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="landing-kicker text-brand-primary">{t('landing.features.sectionKicker')}</div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {t('landing.features.sectionHeadline')}
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-foreground/55 md:text-right">
            {t('landing.features.sectionDescription')}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
          {features.map((feature) => (
            <GlassCard key={feature.title} glow className="landing-panel rounded-[1.75rem] p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary sm:h-12 sm:w-12">
                <feature.icon size={22} />
              </div>
              <h3 className="mt-5 text-lg font-bold text-foreground sm:mt-6 sm:text-xl">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-foreground/55">{feature.description}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
