'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getIssue, updateIssue, Issue } from '@/lib/api/issues';
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
  CheckCircle2,
  Calendar,
  ChevronLeft,
  History as HistoryIcon
} from 'lucide-react';

interface EditIssueFormProps {
  projectId: number | string;
  issueKey: string;
}

export default function EditIssueForm({ projectId, issueKey }: EditIssueFormProps) {
  const [formData, setFormData] = useState({
    summary: '',
    description: '',
    issue_type: '',
    priority: '',
    status: '',
    assignee_id: '',
    estimated_hours: '',
    actual_hours: '',
  });
  
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const [projectData, membersData, issueData] = await Promise.all([
          getProject(projectId),
          getProjectMembers(projectId),
          getIssue(projectId, issueKey)
        ]);
        
        setProject(projectData);
        setMembers(membersData);
        setFormData({
          summary: issueData.summary || '',
          description: issueData.description || '',
          issue_type: issueData.issue_type || '',
          priority: issueData.priority || '',
          status: issueData.status || '',
          assignee_id: issueData.assignee_id?.toString() || '',
          estimated_hours: issueData.estimated_hours?.toString() || '',
          actual_hours: issueData.actual_hours?.toString() || '',
        });
      } catch (err) {
        console.error('Failed to load edit data', err);
        setError('Failed to load issue data.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [projectId, issueKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await updateIssue(projectId, issueKey, {
        ...formData,
        assignee_id: formData.assignee_id ? parseInt(formData.assignee_id) : null,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        actual_hours: formData.actual_hours ? parseFloat(formData.actual_hours) : null
      });
      router.push(`/projects/${projectId}/issues`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update issue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <motion.button 
          whileHover={{ x: -4 }}
          onClick={() => router.back()} 
          className="p-2 hover:bg-foreground/5 rounded-full transition-colors text-foreground/40 hover:text-foreground"
        >
          <ChevronLeft size={24} />
        </motion.button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Issue {issueKey}</h1>
          <p className="text-foreground/60 text-sm mt-1">Update all properties and time tracking data.</p>
        </div>
      </div>

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
          {/* Summary */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-foreground/60 uppercase tracking-wider ml-1">
              <Type size={16} className="text-brand-primary" />
              Summary
            </label>
            <input
              type="text"
              name="summary"
              required
              className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium text-lg"
              value={formData.summary}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-foreground/60 uppercase tracking-wider ml-1">
              <AlignLeft size={16} className="text-brand-primary" />
              Description
            </label>
            <div className="rounded-xl overflow-hidden border border-border-glow bg-foreground/[0.02]">
              <MarkdownEditor 
                value={formData.description} 
                onChange={handleDescriptionChange}
                placeholder="Provide more details..."
                rows={8}
              />
            </div>
          </div>

          {/* 3-Column Grid: Type, Priority, Status */}
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
                className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold appearance-none cursor-pointer"
              >
                {project?.issue_types?.map((type: string) => (
                  <option key={type} value={type}>{type}</option>
                )) || <option value="Task">Task</option>}
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
                className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold appearance-none cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-foreground/60 uppercase tracking-wider ml-1">
                <CheckCircle2 size={16} className="text-brand-primary" />
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold appearance-none cursor-pointer"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* 3-Column Grid: Assignee, Estimate, Actual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-foreground/60 uppercase tracking-wider ml-1">
                <User size={16} className="text-brand-primary" />
                Assignee
              </label>
              <select
                name="assignee_id"
                value={formData.assignee_id}
                onChange={handleChange}
                className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold appearance-none cursor-pointer"
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
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
                className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold"
                value={formData.estimated_hours}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-foreground/60 uppercase tracking-wider ml-1">
                <HistoryIcon size={16} className="text-brand-primary" />
                Actual Hours
              </label>
              <input
                type="number"
                step="0.5"
                name="actual_hours"
                placeholder="e.g. 4.5"
                className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold"
                value={formData.actual_hours}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-border-glow flex justify-end gap-4">
            <GlassButton
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="px-8"
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              disabled={saving}
              className="px-10"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
