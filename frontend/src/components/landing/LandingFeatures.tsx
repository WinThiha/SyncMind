'use client';

import { BrainCircuit, GitBranch, Search, Sparkles, Users } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

const features = [
  {
    icon: Sparkles,
    title: 'AI-assisted issue creation',
    description: 'Draft richer issue descriptions and metadata faster with AI assistance that fits into the existing create flow.',
  },
  {
    icon: Search,
    title: 'Semantic issue search',
    description: 'Find work by natural-language context instead of relying only on exact issue keys or rigid filters.',
  },
  {
    icon: GitBranch,
    title: 'Project and issue workflows',
    description: 'Keep projects, roles, comments, history, and issue lifecycle actions in a single operational surface.',
  },
  {
    icon: Users,
    title: 'Member-aware collaboration',
    description: 'Project admins can manage members and assign work with clear, role-based boundaries.',
  },
  {
    icon: BrainCircuit,
    title: 'Duplicate detection',
    description: 'Surface similar issues early so teams avoid filing redundant work and can reuse existing context.',
  },
];

export function LandingFeatures() {
  return (
    <section id="capabilities" className="landing-section px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="landing-kicker text-brand-primary">Capabilities</div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Everything on the landing page maps to something the product already does.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-foreground/55 md:text-right">
            These sections only reference implemented SyncMind workflows — no placeholder marketing claims.
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
