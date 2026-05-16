'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  SlidersHorizontal,
  UserCheck,
  AlertTriangle,
  Clock3,
  CircleDot,
  Bug,
  Sparkles,
  MessageSquare,
  CalendarDays,
  ChevronDown,
  CheckCircle2,
  RotateCcw,
  X,
  Filter,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import {
  getGlobalIssues,
  getIssuesSummary,
  getGlobalSimilarIssues,
  GlobalIssue,
  IssuesSummary,
  GlobalSimilarIssue,
  type GetIssuesParams,
} from '@/lib/api/issues';
import { getProjects, Project } from '@/lib/api/projects';

const cardSurface =
  'border-slate-300/75 bg-white/80 shadow-[0_18px_36px_-24px_rgba(15,23,42,0.35),inset_0_1px_0_rgba(255,255,255,0.82)] dark:border-border-glow dark:bg-[var(--bg-surface)] dark:shadow-[0_8px_32px_0_var(--glass-shadow)]';

function cx(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

function Badge({ children, tone = 'default' }: { children: React.ReactNode; tone?: string }) {
  const tones: Record<string, string> = {
    default: 'border-[var(--badge-default-border)] bg-[var(--badge-default-bg)] text-[var(--badge-default-text)]',
    high: 'border-[var(--badge-high-border)] bg-[var(--badge-high-bg)] text-[var(--badge-high-text)]',
    critical: 'border-[var(--badge-critical-border)] bg-[var(--badge-critical-bg)] text-[var(--badge-critical-text)]',
    success: 'border-[var(--badge-success-border)] bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]',
    blue: 'border-[var(--badge-blue-border)] bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)]',
    muted: 'border-[var(--badge-muted-border)] bg-[var(--badge-muted-bg)] text-[var(--badge-muted-text)]',
  };
  return (
    <span className={cx('inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-black', tones[tone] || tones.default)}>
      {children}
    </span>
  );
}

function SelectPill({ label, value }: { label: string; value: string }) {
  return (
    <button className="group flex min-w-[150px] items-center justify-between gap-3 rounded-2xl border border-slate-300/75 bg-white px-4 py-3 text-left shadow-[0_10px_24px_-22px_rgba(15,23,42,0.38),inset_0_1px_0_rgba(255,255,255,0.82)] transition hover:-translate-y-[1px] hover:bg-white hover:shadow-md active:translate-y-0 dark:border-border-glow/50 dark:bg-foreground/5 dark:hover:bg-background">
      <span>
        <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-foreground/75 dark:text-foreground/40">{label}</span>
        <span className="mt-1 block text-sm font-semibold text-foreground dark:text-foreground/90">{value}</span>
      </span>
      <ChevronDown className="h-4 w-4 text-foreground/60 transition group-hover:text-foreground dark:text-foreground/40" />
    </button>
  );
}

function IssueIcon({ type }: { type: string }) {
  if (type === 'Bug') return <Bug className="h-4 w-4" />;
  if (type === 'Feature') return <Sparkles className="h-4 w-4" />;
  return <CheckCircle2 className="h-4 w-4" />;
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  note,
  active,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  note: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'rounded-xl border p-4 text-left transition hover:-translate-y-[1px] hover:shadow-md active:translate-y-0',
        active
          ? 'border-brand-primary/50 bg-brand-primary/5 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.38),inset_0_1px_0_rgba(255,255,255,0.82)] dark:border-brand-primary/30 dark:bg-brand-primary/10'
          : 'border-slate-300/75 bg-white/80 shadow-[0_18px_36px_-24px_rgba(15,23,42,0.35),inset_0_1px_0_rgba(255,255,255,0.82)] dark:border-border-glow/50 dark:bg-background/55 dark:hover:border-border-glow/70 dark:hover:bg-background'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="rounded-xl border border-slate-300/60 bg-white/80 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-border-glow/40 dark:bg-foreground/5">
          <Icon className="h-4 w-4 text-brand-primary" />
        </span>
        <span className="text-2xl font-black tracking-tight text-foreground dark:text-foreground/90">{value}</span>
      </div>
      <p className="mt-4 text-sm font-bold text-foreground dark:text-foreground/90">{label}</p>
      <p className="mt-1 text-xs font-bold text-foreground/70 dark:text-foreground/40">{note}</p>
    </button>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg border border-[var(--badge-pill-border)] bg-[var(--badge-pill-bg)] px-2.5 py-1 text-xs font-black capitalize text-[var(--badge-pill-text)]">
      {children}
    </span>
  );
}

function IssueCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-300/75 bg-white/75 p-4 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.38),inset_0_1px_0_rgba(255,255,255,0.82)] animate-pulse dark:border-border-glow/50 dark:bg-background/55 md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="h-6 w-16 rounded-lg bg-foreground/10" />
            <div className="h-4 w-20 rounded bg-foreground/10" />
          </div>
          <div className="h-5 w-64 rounded bg-foreground/10" />
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="h-3 w-24 rounded bg-foreground/5" />
            <div className="h-3 w-16 rounded bg-foreground/5" />
            <div className="h-3 w-20 rounded bg-foreground/5" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-6 w-16 rounded-full bg-foreground/10" />
          <div className="h-6 w-20 rounded-full bg-foreground/10" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-300/60 pt-4 dark:border-border-glow/40">
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-3 w-20 rounded bg-foreground/5" />
          <div className="h-3 w-20 rounded bg-foreground/5" />
        </div>
        <div className="h-7 w-24 rounded-full bg-foreground/10" />
      </div>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300/80 bg-white/60 px-4 py-8 text-center text-sm font-semibold text-foreground/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] dark:border-border-glow/60 dark:bg-foreground/[0.02] dark:text-foreground/45">
      {children}
    </div>
  );
}

export default function IssuesPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [summary, setSummary] = useState<IssuesSummary | null>(null);
  const [issues, setIssues] = useState<GlobalIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAISearchEnabled, setIsAISearchEnabled] = useState(false);
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [aiSearchResults, setAISearchResults] = useState<GlobalSimilarIssue[]>([]);

  const [activeFilter, setActiveFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dueDateFilter, setDueDateFilter] = useState<{ start?: string; end?: string }>({});

  const [showNewIssueModal, setShowNewIssueModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (e) {
        console.error('Failed to load projects', e);
      }
    }
    loadProjects();
  }, []);

  useEffect(() => {
    async function loadSummary() {
      setSummaryLoading(true);
      try {
        const data = await getIssuesSummary(selectedProjectId ?? undefined);
        setSummary(data);
      } catch (e) {
        console.error('Failed to load summary', e);
      } finally {
        setSummaryLoading(false);
      }
    }
    loadSummary();
  }, [selectedProjectId]);

  const loadIssues = useCallback(async () => {
    setLoading(true);
    try {
      const params: GetIssuesParams = {};
      if (selectedProjectId) params.project_id = selectedProjectId;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (dueDateFilter.start) params.due_date_start = dueDateFilter.start;
      if (dueDateFilter.end) params.due_date_end = dueDateFilter.end;
      if (searchQuery && !isAISearchEnabled) params.search = searchQuery;

      if (activeFilter === 'Assigned to Me') params.assignee = 'me';
      if (activeFilter === 'Unassigned') params.assignee = 'unassigned';
      if (activeFilter === 'High Priority') params.high_priority = true;
      if (activeFilter === 'Overdue') params.due_date = 'overdue';
      if (activeFilter === 'All') {
        params.assignee = undefined;
        params.high_priority = undefined;
        params.due_date = undefined;
      }

      const data = await getGlobalIssues(params);
      setIssues(data);
    } catch (e) {
      console.error('Failed to load issues', e);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId, statusFilter, priorityFilter, typeFilter, dueDateFilter, searchQuery, isAISearchEnabled, activeFilter]);

  const handleQuickFilterClick = (filterLabel: string) => {
    const newFilter = activeFilter === filterLabel ? 'All' : filterLabel;
    setActiveFilter(newFilter);
    setAISearchResults([]);
    const params: GetIssuesParams = {};
    if (selectedProjectId) params.project_id = selectedProjectId;
    if (statusFilter !== 'all') params.status = statusFilter;
    if (priorityFilter !== 'all') params.priority = priorityFilter;
    if (typeFilter !== 'all') params.type = typeFilter;
    if (dueDateFilter !== 'all') params.due_date = dueDateFilter;
    if (searchQuery && !isAISearchEnabled) params.search = searchQuery;
    if (newFilter === 'Assigned to Me') params.assignee = 'me';
    if (newFilter === 'Unassigned') params.assignee = 'unassigned';
    if (newFilter === 'High Priority') params.high_priority = true;
    if (newFilter === 'Overdue') params.due_date = 'overdue';
    setLoading(true);
    getGlobalIssues(params).then(setIssues).catch(e => console.error('Failed to load issues', e)).finally(() => setLoading(false));
  };

  const handleSearch = useCallback(() => {
    if (isAISearchEnabled && selectedProjectId && searchQuery.trim()) {
      setIsSearchingAI(true);
      const filters: Record<string, string> = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (priorityFilter !== 'all') filters.priority = priorityFilter;
      if (typeFilter !== 'all') filters.type = typeFilter;
      if (dueDateFilter.start) filters.due_date_start = dueDateFilter.start;
      if (dueDateFilter.end) filters.due_date_end = dueDateFilter.end;
      getGlobalSimilarIssues(selectedProjectId, searchQuery, filters)
        .then(r => setAISearchResults(r.filter((x: { similarity: number }) => x.similarity > 0.3)))
        .catch(() => setAISearchResults([]))
        .finally(() => setIsSearchingAI(false));
    } else {
      loadIssues();
    }
  }, [loadIssues, isAISearchEnabled, selectedProjectId, searchQuery, statusFilter, priorityFilter, typeFilter, dueDateFilter]);

  const performAISearch = useCallback(async () => {
    if (!selectedProjectId || !searchQuery.trim()) return;
    setIsSearchingAI(true);
    try {
      const filters: Record<string, string> = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (priorityFilter !== 'all') filters.priority = priorityFilter;
      if (typeFilter !== 'all') filters.type = typeFilter;
      if (dueDateFilter.start) filters.due_date_start = dueDateFilter.start;
      if (dueDateFilter.end) filters.due_date_end = dueDateFilter.end;
      const results = await getGlobalSimilarIssues(selectedProjectId, searchQuery, filters);
      setAISearchResults(results.filter(r => r.similarity > 0.3));
    } catch (e) {
      console.error('AI search failed', e);
      setAISearchResults([]);
    } finally {
      setIsSearchingAI(false);
    }
  }, [selectedProjectId, searchQuery, statusFilter, priorityFilter, typeFilter, dueDateFilter]);

  useEffect(() => {
    if (!isAISearchEnabled) {
      loadIssues();
    }
  }, []);

  const displayIssues = useMemo((): GlobalIssue[] => {
    if (isAISearchEnabled && aiSearchResults.length > 0) {
      return aiSearchResults.map(r => ({
        id: r.id,
        project_id: r.project_id,
        key: r.key,
        full_key: r.full_key || r.key,
        summary: r.summary,
        status: r.status,
        priority: r.priority,
        issue_type: r.issue_type || 'Task',
        comments_count: r.comments_count ?? 0,
        updated_at: r.updated_at || '',
        description: r.description || null,
        due_date: r.due_date || null,
        project_name: r.project_name,
        project_key: r.project_key,
        assignee: undefined,
        assignee_id: r.assignee_id,
      }));
    }
    return issues;
  }, [isAISearchEnabled, aiSearchResults, issues]);

  const finalIssues = useMemo(() => {
    if (!isAISearchEnabled || aiSearchResults.length === 0) return displayIssues;
    return aiSearchResults.map(r => ({
      id: r.id,
      project_id: r.project_id,
      key: r.key,
      full_key: r.full_key || r.key,
      summary: r.summary,
      status: r.status,
      priority: r.priority,
      issue_type: r.issue_type || 'Task',
      comments_count: r.comments_count ?? 0,
      updated_at: r.updated_at || '',
      description: r.description || null,
      due_date: r.due_date || null,
      project_name: r.project_name,
      project_key: r.project_key,
      assignee: r.assignee,
      assignee_id: r.assignee_id,
    }));
  }, [isAISearchEnabled, aiSearchResults, displayIssues]);

  const resetFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setTypeFilter('all');
    setDueDateFilter({});
    setActiveFilter('All');
    setSearchQuery('');
    setIsAISearchEnabled(false);
    setAISearchResults([]);
    setLoading(true);
    getGlobalIssues({ project_id: selectedProjectId ?? undefined })
      .then(setIssues)
      .catch(e => console.error('Failed to load issues', e))
      .finally(() => setLoading(false));
  };

  const handleNewIssue = () => {
    if (!selectedProjectId) {
      setShowNewIssueModal(true);
    } else {
      router.push(`/projects/${selectedProjectId}/issues/new`);
    }
  };

  const handleSelectProjectForNewIssue = (projectId: number) => {
    setShowNewIssueModal(false);
    router.push(`/projects/${projectId}/issues/new`);
  };

  const quickFilters = [
    { label: 'All', icon: CircleDot },
    { label: 'Assigned to Me', icon: UserCheck },
    { label: 'Overdue', icon: AlertTriangle },
    { label: 'High Priority', icon: AlertTriangle },
    { label: 'Unassigned', icon: UserCheck },
  ];

  return (
    <div className="space-y-6 pb-12">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Issues</h1>
          <p className="mt-2 text-sm font-medium text-foreground/70 dark:text-foreground/55">
            Showing work assigned to you across all projects. Filter, prioritize, and move issues forward from one focused view.
          </p>
        </div>

        <GlassButton onClick={handleNewIssue} className="self-start md:self-auto">
          <Plus size={18} /> New Issue
        </GlassButton>
      </header>

      {false && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryLoading ? (
          <>
            <GlassCard className={`p-4 ${cardSurface}`}><div className="h-24 animate-pulse rounded-xl bg-foreground/10" /></GlassCard>
            <GlassCard className={`p-4 ${cardSurface}`}><div className="h-24 animate-pulse rounded-xl bg-foreground/10" /></GlassCard>
            <GlassCard className={`p-4 ${cardSurface}`}><div className="h-24 animate-pulse rounded-xl bg-foreground/10" /></GlassCard>
            <GlassCard className={`p-4 ${cardSurface}`}><div className="h-24 animate-pulse rounded-xl bg-foreground/10" /></GlassCard>
          </>
        ) : summary ? (
          <>
            <SummaryCard
              label="Assigned to Me"
              value={summary.assigned_to_me}
              icon={UserCheck}
              note={selectedProjectId ? '' : `Across ${projects.length} projects`}
              active={activeFilter === 'Assigned to Me'}
              onClick={() => setActiveFilter(activeFilter === 'Assigned to Me' ? 'All' : 'Assigned to Me')}
            />
            <SummaryCard
              label="Overdue"
              value={summary.overdue}
              icon={AlertTriangle}
              note="Needs attention"
              active={activeFilter === 'Overdue'}
              onClick={() => setActiveFilter(activeFilter === 'Overdue' ? 'All' : 'Overdue')}
            />
            <SummaryCard
              label="High Priority"
              value={summary.high_priority}
              icon={AlertTriangle}
              note="Open or in progress"
              active={activeFilter === 'High Priority'}
              onClick={() => setActiveFilter(activeFilter === 'High Priority' ? 'All' : 'High Priority')}
            />
            <SummaryCard
              label="Unassigned"
              value={summary.unassigned}
              icon={UserX}
              note="No one assigned"
              active={activeFilter === 'Unassigned'}
              onClick={() => setActiveFilter(activeFilter === 'Unassigned' ? 'All' : 'Unassigned')}
            />
          </>
        ) : null}
      </div>}

      <GlassCard className={`p-4 ${cardSurface}`}>
        <div className="mb-4">
          <label className="mb-2 block text-xs font-black uppercase tracking-widest text-foreground/55 dark:text-foreground/40">
            Project
          </label>
          <select
            value={selectedProjectId ?? ''}
            onChange={e => setSelectedProjectId(e.target.value ? Number(e.target.value) : null)}
            className="w-full max-w-xs rounded-xl border border-slate-300/75 bg-white/70 px-4 py-3 text-sm font-semibold text-foreground outline-none ring-brand-primary/30 transition focus:ring-2 focus:ring-brand-primary/20 hover:bg-white shadow-[0_10px_24px_-22px_rgba(15,23,42,0.38),inset_0_1px_0_rgba(255,255,255,0.82)] dark:border-border-glow/50 dark:bg-foreground/5 dark:text-foreground/90 dark:hover:bg-background dark:shadow-[0_8px_32px_0_var(--glass-shadow)]"
          >
            <option value="">All projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  if (isAISearchEnabled && selectedProjectId) {
                    setAISearchResults([]);
                    performAISearch();
                  } else {
                    loadIssues();
                  }
                }
              }}
              placeholder="Search issues, keys, descriptions..."
              className="w-full rounded-xl border border-slate-300/75 bg-white py-4 pl-12 pr-24 text-sm font-medium text-foreground outline-none ring-brand-primary/30 transition focus:ring-2 focus:ring-brand-primary/20 placeholder:text-foreground/50 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.38),inset_0_1px_0_rgba(255,255,255,0.82)] dark:border-border-glow/50 dark:bg-foreground/5 dark:text-foreground/90 dark:placeholder:text-foreground/40 dark:shadow-[0_8px_32px_0_var(--glass-shadow)]"
            />
            <button
              onClick={() => {
                if (!selectedProjectId) return;
                setIsAISearchEnabled(!isAISearchEnabled);
              }}
              disabled={!selectedProjectId}
              title={!selectedProjectId ? 'AI search requires a specific project' : isAISearchEnabled ? 'Switch to keyword search' : 'Switch to AI search'}
              className={cx(
                'absolute right-4 top-1/2 -translate-y-1/2 rounded-lg border px-3 py-1.5 text-xs font-bold transition',
                isAISearchEnabled
                  ? 'border-brand-primary bg-brand-primary text-white shadow-md'
                  : 'border-slate-300 bg-white text-foreground/70 hover:bg-white hover:text-foreground dark:border-border-glow/50 dark:bg-foreground/5 dark:text-foreground/40',
                !selectedProjectId && 'opacity-40 cursor-not-allowed'
              )}
            >
              <Sparkles className={cx('h-4 w-4', isAISearchEnabled && 'animate-pulse')} />
            </button>
          </div>
          <button
            onClick={handleSearch}
            className="rounded-xl border border-brand-primary/40 bg-brand-primary/10 px-6 py-3 text-sm font-bold text-brand-primary transition hover:bg-brand-primary/20 dark:border-border-glow/50 flex items-center gap-2"
          >
            <Search className="h-4 w-4" /> Search
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {quickFilters.map(filter => {
            const Icon = filter.icon;
            const active = activeFilter === filter.label;
            return (
              <button
                key={filter.label}
                onClick={() => handleQuickFilterClick(filter.label)}
                className={cx(
                  'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-bold transition',
                  active
                    ? 'border-brand-primary/50 bg-brand-primary/10 text-brand-primary shadow-md'
                    : 'border-slate-300 bg-white text-foreground/80 hover:bg-white hover:-translate-y-[1px] hover:shadow-md active:translate-y-0 dark:border-border-glow/50 dark:bg-foreground/5 dark:text-foreground/60 dark:hover:bg-background'
                )}
              >
                <Icon className="h-4 w-4" /> {filter.label}
                {active && <span className="ml-0.5 text-brand-primary">✓</span>}
              </button>
            );
          })}
        </div>

        <div className="mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-foreground/80 transition hover:bg-white dark:border-border-glow/50 dark:bg-foreground/5 dark:text-foreground/60 dark:hover:bg-background"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            <ChevronDown className={cx('h-4 w-4 transition-transform', showFilters && 'rotate-180')} />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid gap-3 md:grid-cols-4 mb-4">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-foreground/80 outline-none cursor-pointer hover:bg-white shadow-[0_10px_24px_-22px_rgba(15,23,42,0.38),inset_0_1px_0_rgba(255,255,255,0.82)] dark:border-border-glow/50 dark:bg-foreground/5 dark:text-foreground/60 dark:hover:bg-background dark:shadow-[0_8px_32px_0_var(--glass-shadow)]"
                >
                  <option value="all">ALL STATUS</option>
                  <option value="open">OPEN</option>
                  <option value="in_progress">IN PROGRESS</option>
                  <option value="resolved">RESOLVED</option>
                  <option value="closed">CLOSED</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                  className="appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-foreground/80 outline-none cursor-pointer hover:bg-white shadow-[0_10px_24px_-22px_rgba(15,23,42,0.38),inset_0_1px_0_rgba(255,255,255,0.82)] dark:border-border-glow/50 dark:bg-foreground/5 dark:text-foreground/60 dark:hover:bg-background dark:shadow-[0_8px_32px_0_var(--glass-shadow)]"
                >
                  <option value="all">ALL PRIORITY</option>
                  <option value="high">HIGH</option>
                  <option value="normal">NORMAL</option>
                  <option value="low">LOW</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-foreground/80 outline-none cursor-pointer hover:bg-white shadow-[0_10px_24px_-22px_rgba(15,23,42,0.38),inset_0_1px_0_rgba(255,255,255,0.82)] dark:border-border-glow/50 dark:bg-foreground/5 dark:text-foreground/60 dark:hover:bg-background dark:shadow-[0_8px_32px_0_var(--glass-shadow)]"
                >
                  <option value="all">ALL TYPE</option>
                  <option value="Bug">Bug</option>
                  <option value="Task">Task</option>
                  <option value="Feature">Feature</option>
                  <option value="Story">Story</option>
                </select>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/55 dark:text-foreground/40">Due Date Range</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dueDateFilter.start || ''}
                      onChange={e => setDueDateFilter(prev => ({ ...prev, start: e.target.value }))}
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-3 text-xs font-bold text-foreground/80 outline-none hover:bg-white shadow-[0_10px_24px_-22px_rgba(15,23,42,0.38),inset_0_1px_0_rgba(255,255,255,0.82)] dark:border-border-glow/50 dark:bg-foreground/5 dark:text-foreground/60 dark:hover:bg-background dark:shadow-[0_8px_32px_0_var(--glass-shadow)]"
                    />
                    <input
                      type="date"
                      value={dueDateFilter.end || ''}
                      onChange={e => setDueDateFilter(prev => ({ ...prev, end: e.target.value }))}
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-3 text-xs font-bold text-foreground/80 outline-none hover:bg-white shadow-[0_10px_24px_-22px_rgba(15,23,42,0.38),inset_0_1px_0_rgba(255,255,255,0.82)] dark:border-border-glow/50 dark:bg-foreground/5 dark:text-foreground/60 dark:hover:bg-background dark:shadow-[0_8px_32px_0_var(--glass-shadow)]"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground dark:text-foreground/90">{finalIssues.length} matching issues</h2>
          <p className="text-sm font-semibold text-foreground/60 dark:text-foreground/50">Sorted by recently updated</p>
        </div>
        <button
          onClick={resetFilters}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-foreground/80 transition hover:-translate-y-[1px] hover:bg-white hover:shadow-md active:translate-y-0 dark:border-border-glow/50 dark:bg-foreground/5 dark:text-foreground/60 dark:hover:bg-background"
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <>
            <IssueCardSkeleton />
            <IssueCardSkeleton />
            <IssueCardSkeleton />
          </>
        ) : isSearchingAI ? (
          <>
            <IssueCardSkeleton />
            <IssueCardSkeleton />
            <IssueCardSkeleton />
            <div className="py-4 text-center text-xs font-bold uppercase tracking-widest text-foreground/40 animate-pulse">
              AI is searching for similar issues...
            </div>
          </>
        ) : finalIssues.length === 0 ? (
          <EmptyState>
            {isAISearchEnabled && searchQuery.trim()
              ? "AI couldn't find any relevant issues"
              : 'No issues found matching your filters'}
          </EmptyState>
        ) : (
          finalIssues.map((issue, index) => {
            const aiMatch = isAISearchEnabled ? aiSearchResults.find(r => r.id === issue.id) : null;
            return (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                className="group rounded-xl border border-slate-300/80 bg-gradient-to-br from-white via-white to-slate-50 p-4 ring-1 ring-white transition hover:-translate-y-[1px] hover:border-slate-400 active:translate-y-0 md:p-5 dark:border-border-glow/50 dark:bg-background/55 dark:bg-none dark:ring-0 dark:hover:border-border-glow/70 dark:hover:bg-background"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge tone="blue">
                        <span className="mr-1.5 inline-flex"><IssueIcon type={issue.issue_type} /></span>
                        {issue.issue_type}
                      </Badge>
                      <span className="rounded-lg border border-[var(--badge-key-border)] bg-[var(--badge-key-bg)] px-2 py-1 text-xs font-black text-[var(--badge-key-text)]">{issue.full_key || issue.key}</span>
                      {aiMatch && (
                        <Badge tone="success">
                          <Sparkles className="mr-1.5 h-3 w-3" />
                          {Math.round(aiMatch.similarity * 100)}% match
                        </Badge>
                      )}
                    </div>
                    <h3 className="line-clamp-2 font-semibold leading-snug text-slate-950 transition group-hover:text-brand-primary dark:text-foreground/90">
                      {issue.summary}
                    </h3>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-foreground/50">
                      {'project_name' in issue && issue.project_name && <span className="font-bold text-slate-800 dark:text-foreground/50">{issue.project_name}</span>}
                      <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:inline-block" />
                      <Pill>{issue.status.replace('_', ' ')}</Pill>
                      {issue.assignee && (
                        <>
                          <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:inline-block" />
                          <span>{issue.assignee.name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <Badge tone={issue.priority === 'critical' ? 'critical' : issue.priority === 'high' ? 'high' : 'muted'}>
                      {issue.priority}
                    </Badge>
                    {issue.due_date && (
                      <Badge tone={new Date(issue.due_date) < new Date() ? 'critical' : 'default'}>
                        <CalendarDays className="mr-1.5 h-3 w-3" /> {new Date(issue.due_date).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-300 pt-4 text-xs text-slate-600 dark:border-border-glow/40 dark:text-foreground/50">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" /> {issue.comments_count || 0} comments
                    </span>
                    {issue.updated_at && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5" /> Updated {new Date(issue.updated_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => router.push(`/projects/${issue.project_id}/issues/${issue.key}`)}
                    className="rounded-full px-3 py-1.5 font-bold text-brand-primary transition hover:bg-brand-primary/10"
                  >
                    Open issue
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {showNewIssueModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-white/20 bg-[var(--bg-surface)] p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground dark:text-foreground/90">Select project for new issue</h3>
                  <p className="mt-1 text-sm font-semibold text-foreground/70 dark:text-foreground/50">Choose which project to create the issue in.</p>
                </div>
                <button
                  onClick={() => setShowNewIssueModal(false)}
                  className="rounded-full p-1 text-foreground/60 transition hover:bg-foreground/5 hover:text-foreground dark:text-foreground/40"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2">
                {projects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => handleSelectProjectForNewIssue(project.id)}
                    className="w-full rounded-xl border border-slate-300/75 bg-white/70 px-4 py-3 text-left transition hover:-translate-y-[1px] hover:bg-white hover:shadow-md active:translate-y-0 dark:border-border-glow/50 dark:bg-foreground/5 dark:hover:bg-background"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/20 text-brand-primary text-sm font-bold">
                        {project.key.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground dark:text-foreground/90">{project.name}</p>
                        <p className="text-xs font-bold text-foreground/70 dark:text-foreground/50">{project.key}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowNewIssueModal(false)}
                className="mt-4 w-full rounded-xl border border-slate-300/75 bg-white/70 px-4 py-3 text-sm font-bold text-foreground/75 transition hover:-translate-y-[1px] hover:bg-white hover:shadow-md active:translate-y-0 dark:border-border-glow/50 dark:bg-foreground/5 dark:text-foreground/60 dark:hover:bg-background"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
