'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderKanban,
  MessageSquare,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  getDashboard,
  type DashboardActivity,
  type DashboardData,
  type DashboardIssue,
  type DashboardProjectHealth,
} from '@/lib/api/dashboard';

const summaryIcons = {
  active_projects: FolderKanban,
  my_open_issues: Clock3,
  due_soon: CalendarDays,
  overdue: AlertTriangle,
};

const dashboardCardSurface =
  'border-slate-300/75 bg-white/80 shadow-[0_18px_36px_-24px_rgba(15,23,42,0.35),inset_0_1px_0_rgba(255,255,255,0.82)] dark:border-border-glow dark:bg-[var(--bg-surface)] dark:shadow-[0_8px_32px_0_var(--glass-shadow)]';

function relativeTime(value: string | null): string {
  if (!value) return '';
  const diff = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatDate(value: string | null, fallback: string): string {
  if (!value) return fallback;
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300/80 bg-white/60 px-4 py-8 text-center text-sm font-semibold text-foreground/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] dark:border-border-glow/60 dark:bg-foreground/[0.02] dark:text-foreground/45">
      {children}
    </div>
  );
}

function PanelHeader({ title, description, icon }: { title: string; description: string; icon?: ReactNode }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm font-semibold text-foreground/70 dark:text-foreground/50">{description}</p>
      </div>
      {icon && <div className="text-foreground/65 dark:text-foreground/40">{icon}</div>}
    </div>
  );
}

function IssueRow({ issue, noDueDate, compact = false }: { issue: DashboardIssue; noDueDate: string; compact?: boolean }) {
  return (
    <Link
      href={`/projects/${issue.project_id}/issues/${issue.key}`}
      className="group relative block rounded-xl border border-slate-300/75 bg-white/75 p-4 pr-10 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.38),inset_0_1px_0_rgba(255,255,255,0.82)] transition hover:-translate-y-[1px] hover:border-slate-400/70 hover:bg-white hover:shadow-md active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 dark:border-border-glow/50 dark:bg-background/55 dark:hover:border-border-glow/70 dark:hover:bg-background"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-brand-primary px-2 py-1 text-xs font-black text-white">{issue.key}</span>
            <span className="text-xs font-bold text-foreground/70 dark:text-foreground/45">{issue.project_name}</span>
          </div>
          <h3 className="line-clamp-2 font-semibold leading-snug transition group-hover:text-brand-primary">
            {issue.summary}
          </h3>
        </div>
        <div className={`flex flex-wrap gap-2 ${compact ? '' : 'md:justify-end'}`}>
          <Pill>{issue.status.replaceAll('_', ' ')}</Pill>
          <Pill>{issue.priority}</Pill>
          <Pill>{formatDate(issue.due_date, noDueDate)}</Pill>
        </div>
      </div>
      <ArrowUpRight
        size={16}
        className="absolute right-4 top-4 text-foreground/60 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-primary dark:text-foreground/35"
      />
    </Link>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg border border-slate-300/75 bg-white/75 px-2.5 py-1 text-xs font-bold capitalize text-foreground/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-border-glow/50 dark:bg-foreground/5 dark:text-foreground/60">
      {children}
    </span>
  );
}

function SummarySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <GlassCard key={item} className={`p-5 ${dashboardCardSurface}`}>
          <div className="h-4 w-28 rounded bg-foreground/10" />
          <div className="mt-4 h-8 w-12 rounded bg-foreground/10" />
          <div className="mt-3 h-3 w-20 rounded bg-foreground/10" />
        </GlassCard>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <SummarySkeleton />
      <main className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
        {[1, 2, 3, 4].map((item) => (
          <GlassCard key={item} className={`min-h-64 p-5 ${dashboardCardSurface}`}>
            <div className="h-5 w-36 rounded bg-foreground/10" />
            <div className="mt-3 h-3 w-52 rounded bg-foreground/10" />
            <div className="mt-6 space-y-3">
              <div className="h-16 rounded-xl bg-foreground/10" />
              <div className="h-16 rounded-xl bg-foreground/10" />
              <div className="h-16 rounded-xl bg-foreground/10" />
            </div>
          </GlassCard>
        ))}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useLocale();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setError(false);
        const data = await getDashboard();
        if (active) setDashboard(data);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const summaryCards = useMemo(() => {
    if (!dashboard) return [];
    return [
      {
        key: 'active_projects' as const,
        label: t('dashboard.summary.activeProjects'),
        value: dashboard.summary.active_projects,
        helper: t('dashboard.summary.activeProjectsHelper'),
      },
      {
        key: 'my_open_issues' as const,
        label: t('dashboard.summary.myOpenIssues'),
        value: dashboard.summary.my_open_issues,
        helper: t('dashboard.summary.myOpenIssuesHelper'),
      },
      {
        key: 'due_soon' as const,
        label: t('dashboard.summary.dueSoon'),
        value: dashboard.summary.due_soon,
        helper: t('dashboard.summary.dueSoonHelper'),
      },
      {
        key: 'overdue' as const,
        label: t('dashboard.summary.overdue'),
        value: dashboard.summary.overdue,
        helper: t('dashboard.summary.overdueHelper'),
      },
    ];
  }, [dashboard, t]);

  if (!user) return null;

  return (
    <div className="space-y-6 pb-12">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border-glow bg-background/65 px-3 py-1 text-xs font-bold text-brand-primary shadow-sm backdrop-blur">
            <Sparkles size={14} />
            {t('dashboard.cockpit')}
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t('dashboard.welcome', { name: user.name.split(' ')[0] })}
          </h1>
          <p className="mt-2 text-sm font-medium text-foreground/70 sm:text-base dark:text-foreground/55">{t('dashboard.subtitle')}</p>
        </div>

        <GlassButton onClick={() => router.push('/projects/new')} className="self-start md:self-auto">
          <Plus size={18} />
          <span className="hidden sm:inline">{t('dashboard.createProject')}</span>
          <span className="sm:hidden">{t('dashboard.newProject')}</span>
        </GlassButton>
      </header>

      {error && (
        <GlassCard className={`border-red-500/50 p-5 text-sm font-semibold text-red-600 dark:border-red-500/30 dark:text-red-500 ${dashboardCardSurface}`}>
          {t('dashboard.error')}
        </GlassCard>
      )}

      {loading ? (
        <DashboardSkeleton />
      ) : dashboard ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = summaryIcons[card.key];
              return (
                <GlassCard key={card.key} className={`p-5 ${dashboardCardSurface}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-foreground/75 dark:text-foreground/50">{card.label}</p>
                      <p className="mt-3 text-3xl font-black tracking-tight">{card.value}</p>
                      <p className="mt-1 text-xs font-bold text-foreground/70 dark:text-foreground/40">{card.helper}</p>
                    </div>
                    <div className="rounded-xl bg-brand-primary p-3 text-white shadow-lg shadow-brand-primary/20">
                      <Icon size={18} />
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </section>

          <main className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
            <div className="space-y-6">
              <GlassCard className={`p-5 ${dashboardCardSurface}`}>
                <PanelHeader title={t('dashboard.myWork')} description={t('dashboard.myWorkDescription')} />
                {dashboard.my_work.length === 0 ? (
                  <EmptyState>{t('dashboard.empty.myWork')}</EmptyState>
                ) : (
                  <div className="space-y-3">
                    {dashboard.my_work.map((issue) => (
                      <IssueRow key={issue.id} issue={issue} noDueDate={t('dashboard.noDueDate')} />
                    ))}
                  </div>
                )}
              </GlassCard>

              <section>
                <div className="mb-4">
                  <h2 className="text-lg font-bold tracking-tight">{t('dashboard.projectHealth')}</h2>
                  <p className="mt-1 text-sm font-semibold text-foreground/70 dark:text-foreground/50">
                    {t('dashboard.projectHealthDescription')}
                  </p>
                </div>
                {dashboard.project_health.length === 0 ? (
                  <GlassCard className={`p-5 ${dashboardCardSurface}`}>
                    <EmptyState>{t('dashboard.empty.projectHealth')}</EmptyState>
                  </GlassCard>
                ) : (
                  <div className="grid gap-4 xl:grid-cols-2">
                    {dashboard.project_health.map((project) => (
                      <ProjectHealthCard
                        key={project.id}
                        project={project}
                        labels={{
                          issues: t('dashboard.issues'),
                          overdue: t('dashboard.summary.overdue'),
                          members: t('dashboard.members'),
                        }}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside className="space-y-6">
              <GlassCard className={`p-5 ${dashboardCardSurface}`}>
                <PanelHeader
                  title={t('dashboard.upcoming')}
                  description={t('dashboard.upcomingDescription')}
                  icon={<CalendarDays size={19} />}
                />
                {dashboard.upcoming.length === 0 ? (
                  <EmptyState>{t('dashboard.empty.upcoming')}</EmptyState>
                ) : (
                  <div className="space-y-3">
                    {dashboard.upcoming.map((issue) => (
                      <IssueRow key={issue.id} issue={issue} noDueDate={t('dashboard.noDueDate')} compact />
                    ))}
                  </div>
                )}
              </GlassCard>

              <GlassCard className={`p-5 ${dashboardCardSurface}`}>
                <PanelHeader title={t('dashboard.recentActivity')} description={t('dashboard.recentActivityDescription')} />
                {dashboard.recent_activity.length === 0 ? (
                  <EmptyState>{t('dashboard.empty.recentActivity')}</EmptyState>
                ) : (
                  <div className="space-y-4">
                    {dashboard.recent_activity.map((activity, index) => (
                      <ActivityItem key={`${activity.type}-${activity.created_at}-${index}`} activity={activity} />
                    ))}
                  </div>
                )}
              </GlassCard>
            </aside>
          </main>
        </>
      ) : null}
    </div>
  );
}

function ProjectHealthCard({
  project,
  labels,
}: {
  project: DashboardProjectHealth;
  labels: { issues: string; overdue: string; members: string };
}) {
  return (
    <GlassCard className={`group p-5 ${dashboardCardSurface}`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-lg border border-slate-300/70 bg-white/80 px-2 py-1 text-xs font-black text-foreground/80 shadow-sm dark:border-transparent dark:bg-background dark:text-foreground/70">
              {project.key}
            </span>
            <Pill>{project.progress}%</Pill>
          </div>
          <h3 className="line-clamp-2 text-lg font-bold">{project.name}</h3>
        </div>
        <Link
          href={`/projects/${project.id}`}
          aria-label={`Open ${project.name}`}
          className="rounded-lg p-1 text-foreground/65 transition hover:bg-foreground/5 hover:text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30 dark:text-foreground/40"
        >
          <ArrowUpRight size={17} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-foreground/10">
        <div className="h-full rounded-full bg-brand-primary" style={{ width: `${project.progress}%` }} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <StatTile label={labels.issues} value={project.issues_count} />
        <StatTile label={labels.overdue} value={project.overdue_issues_count} />
        <StatTile label={labels.members} value={project.members_count} />
      </div>
    </GlassCard>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-300/70 bg-white/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-border-glow/30 dark:bg-background/55">
      <p className="text-lg font-black">{value}</p>
      <p className="text-[11px] font-black text-foreground/70 dark:text-foreground/45">{label}</p>
    </div>
  );
}

function ActivityItem({ activity }: { activity: DashboardActivity }) {
  const { t } = useLocale();
  const Icon = activity.type === 'comment' ? MessageSquare : CheckCircle2;
  const activityText =
    activity.type === 'comment'
      ? t('dashboard.activity.commented', { actor: activity.actor ?? 'Someone', issue: activity.issue_key ?? '' })
      : t('dashboard.activity.changed', {
          actor: activity.actor ?? 'Someone',
          field: activity.field ?? '',
          issue: activity.issue_key ?? '',
        });
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-[44px] items-center rounded-xl border border-slate-300/65 bg-white/75 px-2 text-foreground/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-transparent dark:bg-foreground/5 dark:text-foreground/55">
        <Icon size={15} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground/80 dark:text-foreground/75">{activityText}</p>
        <p className="mt-1 text-xs font-bold text-foreground/70 dark:text-foreground/40">
          {activity.project_name}
          {activity.created_at ? ` · ${relativeTime(activity.created_at)}` : ''}
        </p>
      </div>
    </div>
  );
}
