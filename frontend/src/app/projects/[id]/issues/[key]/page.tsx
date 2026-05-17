'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, use, useCallback } from 'react';
import { createIssueComment, getIssue, Issue, deleteIssue, updateIssue, summarizeIssue, type ThreadSummary } from '@/lib/api/issues';
import { getProject, getProjectMembers, Project, type ProjectMember } from '@/lib/api/projects';
import { getMilestones, type Milestone } from '@/lib/api/milestones';
import Markdown from '@/components/shared/Markdown';
import { ActivityComment, ActivityHistoryEntry } from '@/components/issues/hooks/useActivityEntities';
import MarkdownEditor from '@/components/shared/MarkdownEditor';
import SummaryCard from '@/components/issues/SummaryCard';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ChevronLeft, Edit2, Trash2, FileText,
  CheckCircle2, AlertCircle, Calendar, Copy, Check,
  ChevronDown, Flag, AlertTriangle,
  Clock, History as HistoryIcon, MessageSquare, Send, Sparkles, User as UserIcon, ArrowRight,
} from 'lucide-react';
import { useActivityEntities } from '@/components/issues/hooks/useActivityEntities';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Comment extends ActivityComment {}

interface HistoryEntry extends ActivityHistoryEntry {}

interface IssueWithExtras extends Issue {
  comments?: Comment[];
  history?: HistoryEntry[];
}

interface ProjectWithMembers extends Project {
  members?: Array<{ id: number; pivot: { role: string } }>;
}

// ── Config ────────────────────────────────────────────────────────────────────

const statusCfg: Record<string, { cls: string; labelKey: string }> = {
  open:        { cls: 'bg-blue-500/10 text-blue-500 border-blue-500/20',                 labelKey: 'issues.search.statusOpen' },
  in_progress: { cls: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',  labelKey: 'issues.search.statusInProgress' },
  resolved:    { cls: 'bg-green-500/10 text-green-500 border-green-500/20',              labelKey: 'issues.search.statusResolved' },
  closed:      { cls: 'bg-foreground/8 text-foreground/45 border-foreground/10',         labelKey: 'issues.search.statusClosed' },
};

const priorityCfg: Record<string, { cls: string; labelKey: string }> = {
  high:   { cls: 'bg-red-500/10 text-red-500 border-red-500/20',          labelKey: 'issues.search.priorityHigh' },
  normal: { cls: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', labelKey: 'issues.search.priorityNormal' },
  low:    { cls: 'bg-foreground/8 text-foreground/45 border-foreground/10', labelKey: 'issues.search.priorityLow' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string, t: (key: string, params?: Record<string, string | number>) => string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return t('issues.detail.relative.justNow');
  if (diff < 3600) return t('issues.detail.relative.minutesAgo', { count: Math.floor(diff / 60) });
  if (diff < 86400) return t('issues.detail.relative.hoursAgo', { count: Math.floor(diff / 3600) });
  if (diff < 604800) return t('issues.detail.relative.daysAgo', { count: Math.floor(diff / 86400) });
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-border-glow/50 last:border-0">
      <span className="text-[10px] font-bold text-foreground/35 uppercase tracking-widest shrink-0">
        {label}
      </span>
      <div className="text-right min-w-0">{children}</div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-3 w-32 bg-foreground/5 rounded-full" />
        <div className="h-6 w-72 bg-foreground/8 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-40 bg-foreground/5 rounded-2xl" />
          <div className="h-56 bg-foreground/5 rounded-2xl" />
        </div>
        <div className="space-y-4">
          <div className="h-64 bg-foreground/5 rounded-2xl" />
          <div className="h-24 bg-foreground/5 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function IssueDetailPage({ params }: { params: Promise<{ id: string; key: string }> }) {
  const { id: projectId, key: issueKey } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLocale();

  const [issue, setIssue]           = useState<IssueWithExtras | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [members, setMembers]       = useState<ProjectMember[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [canEdit, setCanEdit]       = useState(false);
  const [canDelete, setCanDelete]   = useState(false);
  const [quickData, setQuickData]   = useState({
    status: '',
    priority: '',
    assignee_id: '',
    estimated_hours: '',
    actual_hours: '',
  });
  const [newComment, setNewComment] = useState('');
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ThreadSummary | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // UX states
  const [confirmDelete, setConfirmDelete]     = useState(false);
  const [deleting, setDeleting]               = useState(false);
  const [copied, setCopied]                   = useState(false);

  const loadIssue = useCallback(async () => {
    setLoading(true);
    try {
      const [issueData, projectData, milestonesData] = await Promise.all([
        getIssue(projectId, issueKey),
        getProject(projectId) as Promise<ProjectWithMembers>,
        getMilestones(projectId),
      ]);
      setIssue(issueData as IssueWithExtras);
      setMilestones(milestonesData);
      setQuickData({
        status: issueData.status || '',
        priority: issueData.priority || '',
        assignee_id: issueData.assignee_id?.toString() || '',
        estimated_hours: issueData.estimated_hours?.toString() || '',
        actual_hours: issueData.actual_hours?.toString() || '',
      });
      const member = projectData.members?.find((m) => m.id === user?.id);
      const isCreator = projectData.creator_id === user?.id;
      const isAdmin = member?.pivot?.role === 'admin' || isCreator;
      setCanDelete(isAdmin);
      setCanEdit(isAdmin || issueData.assignee_id === user?.id);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setError(status === 404 ? t('issues.detail.notFound') : t('issues.detail.loadError'));
    } finally {
      setLoading(false);
    }
  }, [projectId, issueKey, t, user]);

  useEffect(() => {
    if (user) loadIssue();
  }, [loadIssue, user]);

  useEffect(() => {
    async function loadMembers() {
      try {
        const data = await getProjectMembers(projectId);
        setMembers(data);
      } catch (err) {
        console.error('Failed to load project members', err);
      }
    }
    if (user) loadMembers();
  }, [projectId, user]);

  // Keyboard shortcut: E → edit page
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.key === 'e' && canEdit && issue) {
        router.push(`/projects/${projectId}/issues/${issue.key}/edit`);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [canEdit, issue, projectId, router]);

  const handleCopyKey = () => {
    if (!issue) return;
    navigator.clipboard.writeText(issue.key).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteIssue(projectId, issueKey);
      router.push(`/issues?project_id=${projectId}`);
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const hasQuickChanges = (currentIssue = issue) => {
    if (!currentIssue) return false;
    return quickData.status !== currentIssue.status ||
      quickData.priority !== currentIssue.priority ||
      quickData.assignee_id !== (currentIssue.assignee_id?.toString() || '') ||
      quickData.estimated_hours !== (currentIssue.estimated_hours?.toString() || '') ||
      quickData.actual_hours !== (currentIssue.actual_hours?.toString() || '');
  };

  const handleSummarize = async (force = false) => {
    if (!issue) return;
    setSummarizing(true);
    setSummaryError(null);
    try {
      const result = await summarizeIssue(projectId, issue.key, force);
      setSummary(result);
    } catch {
      setSummaryError(t('issues.detail.summaryError'));
    } finally {
      setSummarizing(false);
    }
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue) return;

    const hasChanges = hasQuickChanges(issue);
    if (!newComment.trim() && !hasChanges) return;

    setSubmittingUpdate(true);
    setUpdateError(null);
    try {
      if (hasChanges) {
        await updateIssue(projectId, issue.key, {
          status: quickData.status,
          priority: quickData.priority,
          assignee_id: quickData.assignee_id ? parseInt(quickData.assignee_id, 10) : null,
          estimated_hours: quickData.estimated_hours ? parseFloat(quickData.estimated_hours) : null,
          actual_hours: quickData.actual_hours ? parseFloat(quickData.actual_hours) : null,
        });
      }

      if (newComment.trim()) {
        await createIssueComment(projectId, issue.key, { content: newComment });
      }

      setNewComment('');
      setSummary(null);
      await loadIssue();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setUpdateError(message ?? t('issues.edit.error'));
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const { activityEntities } = useActivityEntities(
    (issue?.comments || []) as ActivityComment[],
    (issue?.history || []) as ActivityHistoryEntry[],
    {
      members,
      resolveAssignee: (oldValue, newValue) => {
        const oldMember = members.find(m => m.id.toString() === oldValue?.toString());
        const newMember = members.find(m => m.id.toString() === newValue?.toString());
        return {
          displayField: t('issues.create.assignee').toLowerCase(),
          displayOld: oldMember ? oldMember.name : (oldValue || t('issues.history.none')),
          displayNew: newMember ? newMember.name : (newValue || t('issues.history.none')),
        };
      },
    },
  );

  if (loading) return <PageSkeleton />;

  if (error || !issue) {
    return (
      <GlassCard className="p-10 text-center max-w-md mx-auto mt-8">
        <AlertTriangle size={32} className="text-red-500/60 mx-auto mb-4" />
        <p className="text-foreground/70 font-semibold mb-4">{error ?? t('issues.detail.notFound')}</p>
        <Link
          href={`/issues?project_id=${projectId}`}
          className="text-brand-primary text-sm font-bold underline underline-offset-4"
        >
          {t('issues.detail.backToIssues')}
        </Link>
      </GlassCard>
    );
  }

  const status   = statusCfg[issue.status]   ?? statusCfg.open;
  const priority = priorityCfg[issue.priority] ?? priorityCfg.low;
  const milestone = issue.milestone_id
    ? milestones.find((m) => m.id === issue.milestone_id)
    : null;

  return (
    <div className="max-w-7xl mx-auto">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-1.5 text-xs text-foreground/35 mb-3 ml-1">
        <button
          onClick={() => router.push(`/issues?project_id=${projectId}`)}
          className="hover:text-foreground transition-colors font-medium flex items-center gap-1"
        >
          <ChevronLeft size={13} />
          {t('issues.page.title')}
        </button>
        <span>/</span>
        <span className="text-foreground/55 font-bold">{issue.key}</span>
      </div>

      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div className="min-w-0 flex-1">
          {/* Key + badges */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {/* Key with copy button */}
            <button
              onClick={handleCopyKey}
              title={t('issues.detail.copyIssueKey')}
              className="group flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border border-brand-primary/20 hover:bg-brand-primary/20 transition-colors shrink-0"
            >
              {copied ? <Check size={10} /> : <Copy size={10} className="opacity-50 group-hover:opacity-100" />}
              {issue.key}
            </button>
            <span className="text-[10px] font-medium text-foreground/35 bg-foreground/5 px-2 py-0.5 rounded-full shrink-0">
              {issue.issue_type}
            </span>
            {/* Keyboard hint */}
            <span className="hidden md:inline text-[10px] text-foreground/20 ml-1">
              {t('issues.detail.press')}
              {' '}
              <kbd className="px-1.5 py-0.5 bg-foreground/8 border border-foreground/10 rounded text-[9px] font-mono">E</kbd>
              {' '}
              {t('issues.detail.toEdit')}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{issue.summary}</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {canEdit && (
            <Link href={`/projects/${projectId}/issues/${issue.key}/edit`}>
              <GlassButton variant="ghost" size="sm">
                <Edit2 size={14} />
                <span className="hidden sm:inline">{t('issues.detail.edit')}</span>
              </GlassButton>
            </Link>
          )}

          {canDelete && (
            <AnimatePresence mode="wait">
              {confirmDelete ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-[11px] text-foreground/50 font-medium hidden sm:inline">{t('issues.detail.deletePrompt')}</span>
                  <GlassButton variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
                    <Trash2 size={13} />
                    {deleting ? t('issues.detail.deleting') : t('issues.detail.confirm')}
                  </GlassButton>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-[11px] text-foreground/40 hover:text-foreground transition-colors font-medium px-1"
                  >
                    {t('common.cancel')}
                  </button>
                </motion.div>
              ) : (
                <motion.div key="delete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <GlassButton variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
                    <Trash2 size={14} />
                    <span className="hidden sm:inline">{t('issues.detail.delete')}</span>
                  </GlassButton>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px] gap-5">

        {/* ── Main column ── */}
        <div className="space-y-5">

          {/* Description */}
          <GlassCard className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 text-brand-primary">
                <FileText size={15} />
                <h2 className="text-[10px] font-bold uppercase tracking-widest">{t('issues.create.description')}</h2>
              </div>
              {canEdit && !issue.description && (
                <Link
                  href={`/projects/${projectId}/issues/${issue.key}/edit`}
                  className="text-[10px] font-bold text-brand-primary hover:text-brand-primary/70 transition-colors flex items-center gap-1"
                >
                  <Edit2 size={11} /> {t('issues.detail.addDescription')}
                </Link>
              )}
            </div>
            <div className="text-sm leading-relaxed text-foreground/75 min-h-[60px]">
              {issue.description
                ? <Markdown content={issue.description} />
                : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileText size={28} className="text-foreground/15 mb-2" />
                    <p className="text-foreground/30 text-sm italic">{t('issues.detail.noDescription')}</p>
                  </div>
                )}
            </div>
          </GlassCard>

          {/* AI Summary */}
          <GlassCard className="p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
              <div className="flex items-center gap-2 text-brand-primary">
                <Sparkles size={15} />
                <h2 className="text-[10px] font-bold uppercase tracking-widest">{t('issues.detail.activity')}</h2>
              </div>
              {!summary && !summarizing && (
                <button
                  onClick={() => handleSummarize()}
                  className="inline-flex items-center justify-center text-[10px] font-bold text-brand-primary hover:text-brand-primary/80 bg-brand-primary/5 px-3 py-1.5 rounded-xl border border-brand-primary/10 transition-all w-fit"
                >
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  {t('issues.detail.summarizeThread')}
                </button>
              )}
            </div>

            {summaryError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-wider mb-4">
                {summaryError}
              </div>
            )}

            <SummaryCard
              summary={summary}
              loading={summarizing}
              onRefresh={() => handleSummarize(true)}
            />

            {!summary && !summarizing && !summaryError && (
              <p className="text-sm text-foreground/35 italic">{t('issues.detail.noActivity')}</p>
            )}
          </GlassCard>

          {/* Quick update */}
          {canEdit && (
            <GlassCard className="p-5 sm:p-6">
              <div className="flex items-center gap-2 text-brand-primary mb-5">
                <MessageSquare size={15} />
                <h2 className="text-[10px] font-bold uppercase tracking-widest">{t('issues.detail.updateAndPost')}</h2>
              </div>

              <form onSubmit={handleQuickSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2">
                      <CheckCircle2 size={12} className="text-brand-primary" />
                      {t('issues.edit.status')}
                    </label>
                    <div className="relative">
                      <select
                        value={quickData.status}
                        onChange={(e) => setQuickData({ ...quickData, status: e.target.value })}
                        className="w-full appearance-none bg-background border border-border-glow rounded-xl px-3 py-2.5 pr-8 text-xs font-bold text-foreground/70 outline-none cursor-pointer hover:border-brand-primary/30 transition-all"
                      >
                        {Object.entries(statusCfg).map(([val, cfg]) => (
                          <option key={val} value={val}>{t(cfg.labelKey)}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/30" />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2">
                      <AlertCircle size={12} className="text-brand-primary" />
                      {t('issues.create.priority')}
                    </label>
                    <div className="relative">
                      <select
                        value={quickData.priority}
                        onChange={(e) => setQuickData({ ...quickData, priority: e.target.value })}
                        className="w-full appearance-none bg-background border border-border-glow rounded-xl px-3 py-2.5 pr-8 text-xs font-bold text-foreground/70 outline-none cursor-pointer hover:border-brand-primary/30 transition-all"
                      >
                        <option value="low">{t('issues.search.priorityLow')}</option>
                        <option value="normal">{t('issues.search.priorityNormal')}</option>
                        <option value="high">{t('issues.search.priorityHigh')}</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/30" />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2">
                      <UserIcon size={12} className="text-brand-primary" />
                      {t('issues.create.assignee')}
                    </label>
                    <div className="relative">
                      <select
                        value={quickData.assignee_id}
                        onChange={(e) => setQuickData({ ...quickData, assignee_id: e.target.value })}
                        className="w-full appearance-none bg-background border border-border-glow rounded-xl px-3 py-2.5 pr-8 text-xs font-bold text-foreground/70 outline-none cursor-pointer hover:border-brand-primary/30 transition-all"
                      >
                        <option value="">{t('issues.create.unassigned')}</option>
                        {members.map((member) => (
                          <option key={member.id} value={member.id}>{member.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/30" />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2">
                      <Clock size={12} className="text-brand-primary" />
                      {t('issues.detail.estHours')}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={quickData.estimated_hours}
                      onChange={(e) => setQuickData({ ...quickData, estimated_hours: e.target.value })}
                      placeholder={t('issues.detail.hoursPlaceholder')}
                      className="w-full bg-foreground/5 border border-border-glow rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30 transition-all"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2">
                      <HistoryIcon size={12} className="text-brand-primary" />
                      {t('issues.detail.actHours')}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={quickData.actual_hours}
                      onChange={(e) => setQuickData({ ...quickData, actual_hours: e.target.value })}
                      placeholder={t('issues.detail.hoursPlaceholder')}
                      className="w-full bg-foreground/5 border border-border-glow rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30 transition-all"
                    />
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-border-glow bg-foreground/[0.02]">
                  <MarkdownEditor
                    value={newComment}
                    onChange={setNewComment}
                    placeholder={t('issues.detail.commentPlaceholder')}
                    rows={3}
                  />
                </div>

                <AnimatePresence>
                  {updateError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-xs text-red-500 font-medium"
                    >
                      <AlertTriangle size={12} />
                      {updateError}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="flex justify-end">
                  <GlassButton
                    type="submit"
                    size="sm"
                    disabled={submittingUpdate || (!newComment.trim() && !hasQuickChanges())}
                  >
                    <Send size={14} />
                    {t('issues.detail.updateAndPost')}
                  </GlassButton>
                </div>
              </form>
            </GlassCard>
          )}

          {/* Activity Feed */}
          <GlassCard className="p-5 sm:p-6">
            <div className="flex items-center gap-2 text-brand-primary mb-5">
              <HistoryIcon size={15} />
              <h2 className="text-[10px] font-bold uppercase tracking-widest">{t('issues.detail.activity')}</h2>
            </div>

            <div className="space-y-6">
              {activityEntities.length === 0 ? (
                <p className="text-sm text-foreground/35 italic">{t('issues.detail.noActivity')}</p>
              ) : (
                activityEntities.map((entity) => (
                  <div key={entity.id} className="relative flex gap-4">
                    <div className="absolute left-[18px] top-[40px] bottom-[-32px] w-px bg-border-glow/20 last:hidden" />
                    <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center z-10 shadow-sm border bg-background text-brand-primary border-border-glow font-bold text-xs">
                      {entity.user.name.charAt(0)}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">{entity.user.name}</span>
                        <span className="text-[10px] font-bold text-foreground/30 uppercase">
                          {new Date(entity.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <div className="bg-foreground/[0.03] border border-border-glow/30 rounded-xl overflow-hidden">
                        {entity.history.length > 0 && (
                          <div className={`p-4 space-y-2 bg-foreground/[0.01] ${entity.comments.length > 0 ? 'border-b border-border-glow/10' : ''}`}>
                            {entity.formattedHistory.map((h) => (
                              <div key={h.id} className="flex items-center gap-3 text-xs font-bold">
                                <span className="text-foreground/40 uppercase tracking-wider shrink-0">{h.displayField}:</span>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-foreground/30 line-through font-medium">{h.displayOld}</span>
                                  <ArrowRight size={10} className="text-brand-primary/40" />
                                  <span className="text-brand-primary">{h.displayNew}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {entity.comments.length > 0 && (
                          <div className="p-5 text-sm leading-relaxed text-foreground/80">
                            {entity.comments.map((c: any) => (
                              <div key={c.id} className="whitespace-pre-wrap">{c.content}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">

          {/* Properties */}
          <GlassCard className="p-5">
            <h2 className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest pb-3 border-b border-border-glow mb-1">
              {t('issues.detail.properties')}
            </h2>

            {/* Status */}
            <PropRow label={t('issues.edit.status')}>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${status.cls}`}>
                <CheckCircle2 size={9} />
                {t(status.labelKey)}
              </span>
            </PropRow>

            <PropRow label={t('issues.create.priority')}>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${priority.cls}`}>
                <AlertCircle size={9} />
                {t(priority.labelKey)}
              </span>
            </PropRow>

            <PropRow label={t('issues.create.assignee')}>
              {issue.assignee ? (
                <div className="flex items-center justify-end gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-brand-primary/15 border border-brand-primary/25 flex items-center justify-center shrink-0">
                    <span className="text-brand-primary font-bold text-[8px]">{issue.assignee.name.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-semibold truncate max-w-[120px]">{issue.assignee.name}</span>
                </div>
              ) : (
                <span className="text-sm text-foreground/30 italic">{t('issues.detail.unassigned')}</span>
              )}
            </PropRow>

            {issue.creator && (
              <PropRow label={t('issues.detail.reporter')}>
                <span className="text-sm font-semibold text-foreground/60">{issue.creator.name}</span>
              </PropRow>
            )}

            {milestone && (
              <PropRow label={t('issues.create.milestone')}>
                <Link
                  href={`/projects/${projectId}/milestones/${milestone.id}`}
                  className="flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:underline underline-offset-2 transition-colors justify-end max-w-[140px] truncate"
                >
                  <Flag size={12} className="shrink-0" />
                  <span className="truncate">{milestone.name}</span>
                </Link>
              </PropRow>
            )}

            {issue.due_date && (
              <PropRow label={t('issues.create.dueDate')}>
                <span className={`text-sm font-semibold flex items-center gap-1 justify-end ${new Date(issue.due_date) < new Date() ? 'text-red-500' : 'text-foreground/60'}`}>
                  <Calendar size={12} />
                  {new Date(issue.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </PropRow>
            )}

            <PropRow label={t('issues.detail.created')}>
              <span className="text-xs text-foreground/35" title={new Date(issue.created_at).toLocaleString()}>
                {relativeTime(issue.created_at, t)}
              </span>
            </PropRow>
          </GlassCard>

          {/* Time tracking */}
          {(issue.estimated_hours || issue.actual_hours) && (
            <GlassCard className="p-5">
              <h2 className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mb-3 pb-2 border-b border-border-glow">
                {t('issues.detail.timeTracking')}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: t('issues.detail.estimate'), value: issue.estimated_hours },
                  { label: t('issues.detail.actual'),   value: issue.actual_hours },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center p-3 rounded-xl bg-foreground/[0.03] border border-border-glow/40">
                    <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-lg font-black text-foreground/60">{value ? `${value}h` : '—'}</p>
                  </div>
                ))}
              </div>

              {/* Visual burn-down bar when both values are present */}
              {issue.estimated_hours && issue.actual_hours && (
                <div className="mt-3">
                  <div className="h-1.5 bg-foreground/8 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        Number(issue.actual_hours) > Number(issue.estimated_hours)
                          ? 'bg-red-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, (Number(issue.actual_hours) / Number(issue.estimated_hours)) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-foreground/30 mt-1 text-right font-medium">
                    {t('issues.detail.loggedPercent', { percent: Math.round((Number(issue.actual_hours) / Number(issue.estimated_hours)) * 100) })}
                  </p>
                </div>
              )}
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
