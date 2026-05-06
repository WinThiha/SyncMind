'use client';

import { ArrowRight, Sparkles, Search, GitBranch, Users } from 'lucide-react';
import { LandingButtonLink } from './LandingButtonLink';

interface LandingHeroProps {
  isAuthenticated: boolean;
}

const capabilityChips = [
  { icon: GitBranch, label: 'Project workflows' },
  { icon: Search, label: 'Semantic search' },
  { icon: Sparkles, label: 'AI issue drafting' },
  { icon: Users, label: 'Member roles' },
];

export function LandingHero({ isAuthenticated }: LandingHeroProps) {
  return (
    <section className="landing-section relative overflow-hidden px-4 pb-8 pt-28 sm:px-6 lg:px-8 lg:pt-32">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="relative z-10 max-w-3xl">
          <span className="landing-kicker mb-5 inline-flex rounded-full border border-brand-primary/20 bg-brand-primary/10 px-4 py-2 text-brand-primary">
            Built for project and issue flow
          </span>
          <h1 className="text-5xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Keep projects, issues, and AI assistance in one focused workspace.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-foreground/60 sm:text-xl">
            SyncMind helps teams organize projects, triage issues, search with natural language, and move faster with AI-assisted issue setup and suggestions.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LandingButtonLink href={isAuthenticated ? '/dashboard' : '/register'} size="lg">
              {isAuthenticated ? 'Go to dashboard' : 'Create account'}
              <ArrowRight size={18} />
            </LandingButtonLink>
            <LandingButtonLink href="#capabilities" variant="secondary" size="lg">
              Explore capabilities
            </LandingButtonLink>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {capabilityChips.map((chip) => (
              <div key={chip.label} className="landing-panel flex items-center gap-3 rounded-2xl px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <chip.icon size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{chip.label}</div>
                  <div className="text-xs text-foreground/45">Available in the current app</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-8 top-10 h-40 w-40 rounded-full bg-brand-primary/15 blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-brand-accent/20 blur-3xl" />
          <div className="landing-panel relative overflow-hidden rounded-[2rem] p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-border-glow/40 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/60" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/60" />
              </div>
              <div className="rounded-full border border-border-glow/40 bg-foreground/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/45">
                sync-workspace / issues
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
              <div className="rounded-2xl border border-border-glow/40 bg-background/55 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="landing-kicker text-brand-primary">Issue queue</div>
                    <h2 className="mt-2 text-lg font-bold text-foreground">Critical path triage</h2>
                  </div>
                  <div className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-500">urgent</div>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    { key: 'SM-1042', title: 'Database migration deadlock in production', tags: ['Backend', 'Urgent'] },
                    { key: 'SM-1043', title: 'Refactor WebSocket authentication logic', tags: ['Security'] },
                    { key: 'SM-1044', title: 'Improve dark mode toggle behavior on dashboard', tags: ['UI/UX'] },
                  ].map((issue) => (
                    <div key={issue.key} className="rounded-2xl border border-border-glow/30 bg-foreground/[0.03] p-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full bg-brand-primary/10 px-2.5 py-1 text-[11px] font-bold tracking-[0.12em] text-brand-primary">
                          {issue.key}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold leading-6 text-foreground">{issue.title}</div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {issue.tags.map((tag) => (
                              <span key={tag} className="rounded-full bg-foreground/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/55">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-2xl border border-border-glow/40 bg-background/55 p-4">
                  <div className="landing-kicker text-foreground/45">Team velocity</div>
                  <div className="mt-4 flex h-24 items-end gap-2">
                    {[38, 62, 54, 86, 70].map((height, index) => (
                      <div
                        key={index}
                        className={`w-full rounded-t-xl ${index === 3 ? 'bg-brand-primary' : 'bg-brand-primary/40'}`}
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-foreground/45">
                    <span>Current sprint</span>
                    <span className="text-brand-primary">+14% throughput</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between rounded-2xl border border-border-glow/40 bg-background/55 p-4">
                  <div>
                    <div className="landing-kicker text-brand-primary">AI assistant</div>
                    <h3 className="mt-2 text-lg font-bold text-foreground">Suggests duplicates and assignees</h3>
                    <p className="mt-3 text-sm leading-6 text-foreground/55">
                      The issue creation flow can surface similar issues, recommend owners, and prefill context from the current project.
                    </p>
                  </div>
                  <div className="mt-5 rounded-2xl border border-brand-primary/20 bg-brand-primary/8 p-3 text-sm text-foreground/70">
                    Search by the bug you remember, not the key you forgot.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}