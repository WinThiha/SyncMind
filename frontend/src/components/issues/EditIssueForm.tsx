'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';
import { getIssue, updateIssue } from '@/lib/api/issues';
import { getProject, getProjectMembers, ProjectMember } from '@/lib/api/projects';
import { getMilestones, type Milestone } from '@/lib/api/milestones';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import MarkdownEditor from '@/components/shared/MarkdownEditor';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Type,
  AlignLeft,
  Layers,
  AlertCircle,
  Clock,
  User,
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  History as HistoryIcon,
  AlertTriangle,
  Calendar,
  Flag,
} from 'lucide-react';

interface EditIssueFormProps {
  projectId: number | string;
  issueKey: string;
}

// ── Shared label / input primitives ──────────────────────────────────────────

function FieldLabel({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-1.5 text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2 ml-0.5">
      <Icon size={13} className="text-brand-primary" />
      {children}
    </label>
  );
}

function SelectField({
  name, value, onChange, children, className = '',
}: {
  name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode; className?: string;
}) {
  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full appearance-none bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 pr-10 outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30 transition-all font-semibold text-sm cursor-pointer ${className}`}
      >
        {children}
      </select>
      <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/30" />
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────

function EditSkeleton() {
  return (
    <div className="max-w-5xl mx-auto animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-full bg-foreground/8" />
        <div className="space-y-1.5">
          <div className="h-5 w-48 bg-foreground/8 rounded-lg" />
          <div className="h-3 w-32 bg-foreground/5 rounded-lg" />
        </div>
      </div>
      <GlassCard className="p-5 sm:p-8 space-y-6">
        <div className="h-11 bg-foreground/5 rounded-xl" />
        <div className="h-40 bg-foreground/5 rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-11 bg-foreground/5 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-11 bg-foreground/5 rounded-xl" />)}
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-border-glow">
          <div className="h-10 w-24 bg-foreground/5 rounded-xl" />
          <div className="h-10 w-32 bg-brand-primary/20 rounded-xl" />
        </div>
      </GlassCard>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EditIssueForm({ projectId, issueKey }: EditIssueFormProps) {
  const { t } = useLocale();
  const [formData, setFormData] = useState({
    summary: '',
    description: '',
    issue_type: '',
    priority: '',
    status: '',
    assignee_id: '',
    estimated_hours: '',
    actual_hours: '',
    due_date: '',
    milestone_id: '',
  });

  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const [projectData, membersData, issueData, milestonesData] = await Promise.all([
          getProject(projectId),
          getProjectMembers(projectId),
          getIssue(projectId, issueKey),
          getMilestones(projectId),
        ]);
        setProject(projectData);
        setMembers(membersData);
        setMilestones(milestonesData);
        setFormData({
          summary: issueData.summary || '',
          description: issueData.description || '',
          issue_type: issueData.issue_type || '',
          priority: issueData.priority || '',
          status: issueData.status || '',
          assignee_id: issueData.assignee_id?.toString() || '',
          estimated_hours: issueData.estimated_hours?.toString() || '',
          actual_hours: issueData.actual_hours?.toString() || '',
          due_date: issueData.due_date?.slice(0, 10) || '',
          milestone_id: issueData.milestone_id?.toString() || '',
        });
      } catch {
        setError(t('issues.edit.loadError'));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [projectId, issueKey]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateIssue(projectId, issueKey, {
        ...formData,
        assignee_id: formData.assignee_id ? parseInt(formData.assignee_id) : null,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        actual_hours: formData.actual_hours ? parseFloat(formData.actual_hours) : null,
        milestone_id: formData.milestone_id ? parseInt(formData.milestone_id) : null,
        due_date: formData.due_date || null,
      });
      router.push(`/projects/${projectId}/issues`);
    } catch (err: any) {
      setError(err.response?.data?.message || t('issues.edit.error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <EditSkeleton />;

  return (
    <div className="max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <motion.button
          whileHover={{ x: -3 }}
          onClick={() => router.back()}
          className="p-2 hover:bg-foreground/5 rounded-full transition-colors text-foreground/40 hover:text-foreground shrink-0"
        >
          <ChevronLeft size={22} />
        </motion.button>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('issues.edit.title')}</h1>
            <span className="bg-brand-primary/10 text-brand-primary text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border border-brand-primary/20 shrink-0">
              {issueKey}
            </span>
          </div>
          <p className="text-foreground/50 text-sm mt-0.5">{t('issues.edit.subtitle')}</p>
        </div>
      </div>

      <GlassCard className="p-5 sm:p-8">
        {/* ── Error banner ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-sm font-medium"
            >
              <AlertTriangle size={16} className="shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">

          {/* ── Summary ── */}
          <div>
            <FieldLabel icon={Type}>{t('issues.create.summary')}</FieldLabel>
            <input
              type="text"
              name="summary"
              required
              value={formData.summary}
              onChange={handleChange}
              placeholder={t('issues.edit.summaryPlaceholder')}
              className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30 transition-all font-semibold text-base placeholder:text-foreground/25 placeholder:font-normal"
            />
          </div>

          {/* ── Description ── */}
          <div>
            <FieldLabel icon={AlignLeft}>{t('issues.create.description')}</FieldLabel>
            <div className="rounded-xl overflow-hidden border border-border-glow bg-foreground/[0.02] min-h-[180px]">
              <MarkdownEditor
                value={formData.description}
                onChange={(v) => setFormData((prev) => ({ ...prev, description: v }))}
                placeholder={t('issues.edit.descriptionPlaceholder')}
                rows={8}
              />
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="border-t border-border-glow/60" />

          {/* ── Classification: Type · Priority · Status ── */}
          <div>
            <p className="text-[10px] font-bold text-foreground/25 uppercase tracking-widest mb-4">{t('issues.edit.classification')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              <div>
                <FieldLabel icon={Layers}>{t('issues.create.type')}</FieldLabel>
                <SelectField name="issue_type" value={formData.issue_type} onChange={handleChange}>
                  {project?.issue_types?.map((type: string) => (
                    <option key={type} value={type}>{type}</option>
                  )) ?? <option value="Task">{t('issues.create.fallbackTask')}</option>}
                </SelectField>
              </div>

              <div>
                <FieldLabel icon={AlertCircle}>{t('issues.create.priority')}</FieldLabel>
                <SelectField name="priority" value={formData.priority} onChange={handleChange}>
                  <option value="low">{t('issues.search.priorityLow')}</option>
                  <option value="normal">{t('issues.search.priorityNormal')}</option>
                  <option value="high">{t('issues.search.priorityHigh')}</option>
                </SelectField>
              </div>

              <div>
                <FieldLabel icon={CheckCircle2}>{t('issues.edit.status')}</FieldLabel>
                <SelectField name="status" value={formData.status} onChange={handleChange}>
                  <option value="open">{t('issues.search.statusOpen')}</option>
                  <option value="in_progress">{t('issues.search.statusInProgress')}</option>
                  <option value="resolved">{t('issues.search.statusResolved')}</option>
                  <option value="closed">{t('issues.search.statusClosed')}</option>
                </SelectField>
              </div>
            </div>
          </div>

          {/* ── Schedule: Due Date · Milestone ── */}
          <div>
            <p className="text-[10px] font-bold text-foreground/25 uppercase tracking-widest mb-4">{t('issues.edit.schedule')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <FieldLabel icon={Calendar}>{t('issues.create.dueDate')}</FieldLabel>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30 transition-all font-semibold text-sm"
                />
              </div>

              <div>
                <FieldLabel icon={Flag}>{t('issues.create.milestone')}</FieldLabel>
                <SelectField name="milestone_id" value={formData.milestone_id} onChange={handleChange}>
                  <option value="">{t('issues.create.noMilestone')}</option>
                  {milestones
                    .filter((m) => m.status !== 'closed' || formData.milestone_id === m.id.toString())
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}{m.status === 'closed' ? ' (closed)' : ''}
                      </option>
                    ))}
                </SelectField>
                {milestones.length === 0 && (
                  <p className="text-[10px] text-foreground/30 mt-1.5 ml-0.5">
                    {t('issues.edit.noMilestones')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Assignment & Time tracking ── */}
          <div>
            <p className="text-[10px] font-bold text-foreground/25 uppercase tracking-widest mb-4">{t('issues.edit.assignmentAndTime')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              <div>
                <FieldLabel icon={User}>{t('issues.create.assignee')}</FieldLabel>
                <SelectField name="assignee_id" value={formData.assignee_id} onChange={handleChange}>
                  <option value="">{t('issues.create.unassigned')}</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </SelectField>
              </div>

              <div>
                <FieldLabel icon={Clock}>{t('issues.create.estimate')}</FieldLabel>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  name="estimated_hours"
                  placeholder={t('issues.edit.estimatePlaceholder')}
                  value={formData.estimated_hours}
                  onChange={handleChange}
                  className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30 transition-all font-semibold text-sm placeholder:text-foreground/25 placeholder:font-normal"
                />
              </div>

              <div>
                <FieldLabel icon={HistoryIcon}>{t('issues.edit.actualHours')}</FieldLabel>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  name="actual_hours"
                  placeholder={t('issues.edit.actualPlaceholder')}
                  value={formData.actual_hours}
                  onChange={handleChange}
                  className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30 transition-all font-semibold text-sm placeholder:text-foreground/25 placeholder:font-normal"
                />
              </div>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="pt-5 border-t border-border-glow flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <GlassButton
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="w-full sm:w-auto"
            >
              {t('common.cancel')}
            </GlassButton>
            <GlassButton
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto min-w-[130px]"
            >
              {saving ? t('issues.edit.saving') : t('issues.edit.saveChanges')}
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
