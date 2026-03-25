'use client';

import { useState, useEffect } from 'react';
import { createIssue } from '@/lib/api/issues';
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
  CheckCircle2
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
  
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
  };

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
        {/* Summary - Full Width */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-foreground/60 uppercase tracking-wider ml-1">
            <Type size={16} className="text-brand-primary" />
            Summary
          </label>
          <input
            type="text"
            name="summary"
            required
            placeholder="What needs to be done?"
            className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium text-lg"
            value={formData.summary}
            onChange={handleChange}
          />
        </div>

        {/* Description - Full Width */}
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
              className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold appearance-none cursor-pointer"
            >
              {project?.issue_types?.map((type: string) => (
                <option key={type} value={type}>{type}</option>
              )) || (
                <>
                  <option value="Task">Task</option>
                  <option value="Bug">Bug</option>
                  <option value="Request">Request</option>
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
              className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold appearance-none cursor-pointer"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
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
        </div>

        {/* Assignee - Half Width (could be full or grid) */}
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
              className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold appearance-none cursor-pointer"
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>{member.name}</option>
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
            disabled={loading}
            className="px-10"
          >
            {loading ? 'Creating...' : 'Create Issue'}
          </GlassButton>
        </div>
      </form>
    </GlassCard>
  );
}
