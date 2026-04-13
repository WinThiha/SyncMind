'use client';

import { useState, useEffect, useRef } from 'react';
import { createIssue } from '@/lib/api/issues';
import { suggestIssueFields } from '@/lib/api/issues';
import { getProject, getProjectMembers, ProjectMember } from '@/lib/api/projects';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import MarkdownEditor from '../shared/MarkdownEditor';
import { motion } from 'framer-motion';
import {
  Type,
  AlignLeft,
  Layers,
  AlertCircle,
  Clock,
  User,
  Sparkles
} from 'lucide-react';

interface CreateIssueFormProps {
  projectId: number | string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateIssueForm({ projectId, onSuccess, onCancel }: CreateIssueFormProps) {
  const [formData, setFormData] = useState({
    summary: '',
    description: '',
    issue_type: 'Task',
    priority: 'normal',
    assignee_id: '',
    estimated_hours: '',
    status: 'open',
  });

  // Track which fields have been manually touched by the user
  const touchedFields = useRef<Set<string>>(new Set());

  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [projectData, membersData] = await Promise.all([
          getProject(projectId),
          getProjectMembers(projectId)
        ]);
        setProject(projectData);
        setMembers(membersData);
        if (projectData.issue_types?.length > 0) {
          setFormData(prev => ({ ...prev, issue_type: projectData.issue_types[0] }));
        }
      } catch (err) {
        console.error('Failed to load project data', err);
      }
    }
    loadData();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createIssue(projectId, {
        ...formData,
        assignee_id: formData.assignee_id ? parseInt(formData.assignee_id) : undefined,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : undefined
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create issue');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    touchedFields.current.add(name);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (value: string) => {
    if (value !== formData.description) {
      touchedFields.current.add('description');
    }
    setFormData(prev => ({ ...prev, description: value }));
  };

  const handleAISuggest = async () => {
    if (!formData.summary.trim()) {
      setAiError('Please enter a summary first.');
      return;
    }
    setAiLoading(true);
    setAiError(null);

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
        if (suggestions.assignee_id != null && !touchedFields.current.has('assignee_id')) {
          next.assignee_id = String(suggestions.assignee_id);
        }
        return next;
      });
    } catch (err: any) {
      setAiError(err.response?.data?.message || 'AI suggestion failed. Please try again.');
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
              Summary
            </label>
            <button
              type="button"
              onClick={handleAISuggest}
              disabled={aiLoading || !formData.summary.trim()}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles size={13} className={aiLoading ? 'animate-spin' : ''} />
              {aiLoading ? 'Thinking…' : 'Auto-fill with AI'}
            </button>
          </div>
          <input
            type="text"
            name="summary"
            required
            placeholder="What needs to be done?"
            className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium text-lg"
            value={formData.summary}
            onChange={handleChange}
          />
          {aiError && (
            <p className="text-xs text-red-400 mt-1">{aiError}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-foreground/60 uppercase tracking-wider ml-1">
            <AlignLeft size={16} className="text-brand-primary" />
            Description
          </label>
          <div className={`rounded-xl overflow-hidden border border-border-glow bg-foreground/[0.02] ${shimmer}`}>
            <MarkdownEditor
              value={formData.description}
              onChange={handleDescriptionChange}
              placeholder="Provide more details..."
              rows={8}
            />
          </div>
        </div>

        {/* Grid for other fields - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-foreground/60 uppercase tracking-wider ml-1">
              <Layers size={16} className="text-brand-primary" />
              Type
            </label>
            <select
              name="issue_type"
              value={formData.issue_type}
              onChange={handleChange}
              disabled={aiLoading}
              className={`w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold appearance-none cursor-pointer ${shimmer}`}
            >
              {project?.issue_types?.map((type: string) => (
                <option key={type} value={type} className="bg-background text-foreground">{type}</option>
              )) || (
                <>
                  <option value="Task" className="bg-background text-foreground">Task</option>
                  <option value="Bug" className="bg-background text-foreground">Bug</option>
                  <option value="Request" className="bg-background text-foreground">Request</option>
                </>
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-foreground/60 uppercase tracking-wider ml-1">
              <AlertCircle size={16} className="text-brand-primary" />
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              disabled={aiLoading}
              className={`w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold appearance-none cursor-pointer ${shimmer}`}
            >
              <option value="low" className="bg-background text-foreground">Low</option>
              <option value="normal" className="bg-background text-foreground">Normal</option>
              <option value="high" className="bg-background text-foreground">High</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-foreground/60 uppercase tracking-wider ml-1">
              <Clock size={16} className="text-brand-primary" />
              Estimate (hrs)
            </label>
            <input
              type="number"
              step="0.5"
              name="estimated_hours"
              placeholder="e.g. 8"
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
              Assignee
            </label>
            <select
              name="assignee_id"
              value={formData.assignee_id}
              onChange={handleChange}
              disabled={aiLoading}
              className={`w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold appearance-none cursor-pointer ${shimmer}`}
            >
              <option value="" className="bg-background text-foreground">Unassigned</option>
              {members.map((member) => (
                <option key={member.id} value={member.id} className="bg-background text-foreground">{member.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-border-glow flex justify-end gap-4">
          <GlassButton
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="px-8"
          >
            Cancel
          </GlassButton>
          <GlassButton
            type="submit"
            disabled={loading || aiLoading}
            className="px-10"
          >
            {loading ? 'Creating...' : 'Create Issue'}
          </GlassButton>
        </div>
      </form>
    </GlassCard>
  );
}
