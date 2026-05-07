'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { createIssue } from '@/lib/api/issues';
import { suggestIssueFields, getSimilarIssues, SimilarIssue } from '@/lib/api/issues';
import { getProject, getProjectMembers, ProjectMember } from '@/lib/api/projects';
import { getMilestones, type Milestone } from '@/lib/api/milestones';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import MarkdownEditor from '../shared/MarkdownEditor';
import { SimilarIssuesCard } from './SimilarIssuesCard';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Type,
  AlignLeft,
  Layers,
  AlertCircle,
  Clock,
  User,
  Sparkles,
  Calendar,
  Flag,
} from 'lucide-react';

interface CreateIssueFormProps {
  projectId: number | string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateIssueForm({ projectId, onSuccess, onCancel }: CreateIssueFormProps) {
  const { t } = useLocale();
  const [formData, setFormData] = useState({
    summary: '',
    description: '',
    issue_type: 'Task',
    priority: 'normal',
    assignee_id: '',
    estimated_hours: '',
    status: 'open',
    due_date: '',
    milestone_id: '',
  });

  // Track which fields have been manually touched by the user
  const touchedFields = useRef<Set<string>>(new Set());

  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [assigneeSuggestions, setAssigneeSuggestions] = useState<Array<{ assignee_id: number; reason: string }>>([]);
  const [similarIssues, setSimilarIssues] = useState<SimilarIssue[]>([]);
  const [isSearchingSimilar, setIsSearchingSimilar] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [projectData, membersData, milestonesData] = await Promise.all([
          getProject(projectId),
          getProjectMembers(projectId),
          getMilestones(projectId),
        ]);
        setProject(projectData);
        setMembers(membersData);
        setMilestones(milestonesData);
        if (projectData.issue_types?.length > 0) {
          setFormData(prev => ({ ...prev, issue_type: projectData.issue_types[0] }));
        }
      } catch (err) {
        console.error('Failed to load project data', err);
      }
    }
    loadData();
  }, [projectId]);

  // Debounced semantic search for similar issues
  useEffect(() => {
    if (formData.summary.length < 5) {
      setSimilarIssues([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingSimilar(true);
      try {
        const issues = await getSimilarIssues(projectId, formData.summary);
        // Only show issues with similarity > 0.7
        setSimilarIssues(issues.filter(i => i.similarity > 0.7));
      } catch (err) {
        console.error('Failed to fetch similar issues', err);
      } finally {
        setIsSearchingSimilar(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData.summary, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createIssue(projectId, {
        ...formData,
        assignee_id: formData.assignee_id ? parseInt(formData.assignee_id) : undefined,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : undefined,
        milestone_id: formData.milestone_id ? parseInt(formData.milestone_id) : undefined,
        due_date: formData.due_date || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || t('issues.create.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    touchedFields.current.add(name);
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'assignee_id') {
      setAssigneeSuggestions([]);
    }
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    touchedFields.current.add(name);
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'summary' && value !== formData.summary) {
      setAssigneeSuggestions([]);
    }
  };

  const handleAssignFromSuggestion = (assigneeId: number) => {
    touchedFields.current.add('assignee_id');
    setFormData(prev => ({ ...prev, assignee_id: String(assigneeId) }));
    setAssigneeSuggestions([]);
  };

  const getMemberName = (memberId: number): string => {
    const member = members.find(m => m.id === memberId);
    return member?.name ?? t('common.user');
  };

  const handleDescriptionChange = (value: string) => {
    if (value !== formData.description) {
      touchedFields.current.add('description');
    }
    setFormData(prev => ({ ...prev, description: value }));
  };

  const handleAISuggest = async () => {
    if (!formData.summary.trim()) {
      setAiError(t('issues.create.aiError'));
      return;
    }
    setAiLoading(true);
    setAiError(null);
    setAssigneeSuggestions([]);

    try {
      const suggestions = await suggestIssueFields(projectId, formData.summary);
      setFormData(prev => {
        const next = { ...prev };
        if (suggestions.description && !touchedFields.current.has('description')) {
          next.description = suggestions.description;
        }
        if (suggestions.issue_type && !touchedFields.current.has('issue_type')) {
          next.issue_type = suggestions.issue_type;
        }
        if (suggestions.priority && !touchedFields.current.has('priority')) {
          next.priority = suggestions.priority;
        }
        if (suggestions.estimated_hours != null && !touchedFields.current.has('estimated_hours')) {
          next.estimated_hours = String(suggestions.estimated_hours);
        }
        return next;
      });
      setAssigneeSuggestions(suggestions.assignee_suggestions || []);
    } catch (err: any) {
      setAiError(err.response?.data?.message || t('issues.create.aiSuggestFailed'));
    } finally {
      setAiLoading(false);
    }
  };

  const shimmer = aiLoading
    ? 'animate-pulse bg-brand-primary/5 pointer-events-none'
    : '';

  return (
    <GlassCard className="p-10 w-full">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-8 text-sm font-medium"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Summary + AI button */}
        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label className="flex items-center gap-2 text-sm font-bold text-foreground/60 uppercase tracking-wider">
              <Type size={16} className="text-brand-primary" />
              {t('issues.create.summary')}
            </label>
            <button
              type="button"
              onClick={handleAISuggest}
              disabled={aiLoading || !formData.summary.trim()}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles size={13} className={aiLoading ? 'animate-spin' : ''} />
              {aiLoading ? t('issues.create.aiThinking') : t('issues.create.aiSuggest')}
            </button>
          </div>
          <input
            type="text"
            name="summary"
            required
            placeholder={t('issues.create.summaryPlaceholder')}
            className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium text-lg"
            value={formData.summary}
            onChange={handleSummaryChange}
          />
          <AnimatePresence>
            {isSearchingSimilar && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[10px] font-bold text-brand-primary/60 uppercase tracking-widest mt-2 ml-1"
              >
                {t('issues.create.checkingDuplicates')}
              </motion.p>
            )}
          </AnimatePresence>
          <SimilarIssuesCard issues={similarIssues} projectKey={project?.key} />
          {aiError && (
            <p className="text-xs text-red-400 mt-1">{aiError}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-foreground/60 uppercase tracking-wider ml-1">
            <AlignLeft size={16} className="text-brand-primary" />
            {t('issues.create.description')}
          </label>
          <div className={`rounded-xl overflow-hidden border border-border-glow bg-foreground/[0.02] ${shimmer}`}>
            <MarkdownEditor
              value={formData.description}
              onChange={handleDescriptionChange}
              placeholder={t('issues.create.descriptionPlaceholder')}
              rows={8}
            />
          </div>
        </div>

        {/* Grid for other fields - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-foreground/60 uppercase tracking-wider ml-1">
              <Layers size={16} className="text-brand-primary" />
              {t('issues.create.type')}
            </label>
            <select
              name="issue_type"
              value={formData.issue_type}
              onChange={handleChange}
              disabled={aiLoading}
              className={`w-full bg-background text-foreground border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold appearance-none cursor-pointer ${shimmer}`}
            >
              {project?.issue_types?.map((type: string) => (
                <option key={type} value={type} className="bg-background text-foreground">{type}</option>
              )) || (
                <>
                  <option value="Task" className="bg-background text-foreground">{t('issues.create.fallbackTask')}</option>
                  <option value="Bug" className="bg-background text-foreground">{t('issues.create.fallbackBug')}</option>
                  <option value="Request" className="bg-background text-foreground">{t('issues.create.fallbackRequest')}</option>
                </>
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-foreground/60 uppercase tracking-wider ml-1">
              <AlertCircle size={16} className="text-brand-primary" />
              {t('issues.create.priority')}
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              disabled={aiLoading}
              className={`w-full bg-background text-foreground border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold appearance-none cursor-pointer ${shimmer}`}
            >
              <option value="low" className="bg-background text-foreground">{t('issues.create.priorityLow')}</option>
              <option value="normal" className="bg-background text-foreground">{t('issues.create.priorityNormal')}</option>
              <option value="high" className="bg-background text-foreground">{t('issues.create.priorityHigh')}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-foreground/60 uppercase tracking-wider ml-1">
              <Clock size={16} className="text-brand-primary" />
              {t('issues.create.estimate')}
            </label>
            <input
              type="number"
              step="0.5"
              name="estimated_hours"
              placeholder={t('issues.create.estimatePlaceholder')}
              disabled={aiLoading}
              className={`w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold ${shimmer}`}
              value={formData.estimated_hours}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Assignee */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-foreground/60 uppercase tracking-wider ml-1">
              <User size={16} className="text-brand-primary" />
              {t('issues.create.assignee')}
            </label>
            <select
              name="assignee_id"
              value={formData.assignee_id}
              onChange={handleChange}
              disabled={aiLoading}
              className={`w-full bg-background text-foreground border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold appearance-none cursor-pointer ${shimmer}`}
            >
              <option value="" className="bg-background text-foreground">{t('issues.create.unassigned')}</option>
              {members.map((member) => (
                <option key={member.id} value={member.id} className="bg-background text-foreground">{member.name}</option>
              ))}
            </select>
            {assigneeSuggestions.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">{t('issues.create.aiSuggestions')}</p>
                {assigneeSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between gap-3 p-3 rounded-lg bg-brand-primary/5 border border-brand-primary/20"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">{getMemberName(suggestion.assignee_id)}</p>
                      <p className="text-xs text-foreground/60 mt-0.5 line-clamp-2">{suggestion.reason}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAssignFromSuggestion(suggestion.assignee_id)}
                      className="shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-colors"
                    >
                      <User size={12} />
                      {t('issues.create.assign')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-foreground/40 uppercase tracking-wider">
              <Calendar size={12} />
              {t('issues.create.dueDate')}
            </label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-brand-primary/50 transition-colors"
            />
          </div>

          {milestones.length > 0 && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-foreground/40 uppercase tracking-wider">
                <Flag size={12} />
                {t('issues.create.milestone')}
              </label>
              <select
                name="milestone_id"
                value={formData.milestone_id}
                onChange={(e) => setFormData(prev => ({ ...prev, milestone_id: e.target.value }))}
                className="w-full px-4 py-3 bg-background text-foreground border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-brand-primary/50 transition-colors appearance-none"
              >
                <option value="" className="bg-background text-foreground">{t('issues.create.noMilestone')}</option>
                {milestones.filter(m => m.status !== 'closed').map((m) => (
                  <option key={m.id} value={m.id} className="bg-background text-foreground">{m.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-border-glow flex justify-end gap-4">
          <GlassButton
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="px-8"
          >
            {t('issues.create.cancel')}
          </GlassButton>
          <GlassButton
            type="submit"
            disabled={loading || aiLoading}
            className="px-10"
          >
            {loading ? t('issues.create.creating') : t('issues.create.submit')}
          </GlassButton>
        </div>
      </form>
    </GlassCard>
  );
}
