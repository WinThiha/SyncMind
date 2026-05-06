'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { updateMilestone, deleteMilestone, type Milestone } from '@/lib/api/milestones';
import { Flag, Trash2, X } from 'lucide-react';

interface EditMilestoneFormProps {
  projectId: number | string;
  milestone: Milestone;
  onSuccess: () => void;
  onCancel: () => void;
  onDeleted: () => void;
}

export function EditMilestoneForm({ projectId, milestone, onSuccess, onCancel, onDeleted }: EditMilestoneFormProps) {
  const [form, setForm] = useState({
    name: milestone.name,
    description: milestone.description ?? '',
    start_date: milestone.start_date ?? '',
    due_date: milestone.due_date ?? '',
    status: milestone.status,
  });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: any = { ...form };
      if (!payload.start_date) payload.start_date = null;
      if (!payload.due_date) payload.due_date = null;
      if (!payload.description) payload.description = null;
      await updateMilestone(projectId, milestone.id, payload);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to update milestone.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete milestone "${milestone.name}"? Issues will be unlinked.`)) return;
    setDeleting(true);
    try {
      await deleteMilestone(projectId, milestone.id);
      onDeleted();
    } catch {
      setError('Failed to delete milestone.');
      setDeleting(false);
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Flag size={20} className="text-brand-primary" />
          Edit Milestone
        </h2>
        <button onClick={onCancel} className="p-2 rounded-lg hover:bg-foreground/5 text-foreground/40 hover:text-foreground transition-colors">
          <X size={18} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            className="mt-1 w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-brand-primary/50 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={2}
            className="mt-1 w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-brand-primary/50 transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Start Date</label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => set('start_date', e.target.value)}
              className="mt-1 w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-brand-primary/50 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Due Date</label>
            <input
              type="date"
              value={form.due_date}
              min={form.start_date || undefined}
              onChange={(e) => set('due_date', e.target.value)}
              className="mt-1 w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-brand-primary/50 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Status</label>
          <select
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
            className="mt-1 w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-brand-primary/50 transition-colors"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <GlassButton type="submit" disabled={loading} className="flex-1">
            {loading ? 'Saving…' : 'Save Changes'}
          </GlassButton>
          <GlassButton type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </GlassButton>
          <GlassButton type="button" variant="danger" onClick={handleDelete} disabled={deleting}>
            <Trash2 size={14} />
          </GlassButton>
        </div>
      </form>
    </GlassCard>
  );
}
