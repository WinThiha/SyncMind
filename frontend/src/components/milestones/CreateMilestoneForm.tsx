'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { createMilestone, type CreateMilestoneData } from '@/lib/api/milestones';
import { Flag, X } from 'lucide-react';

interface CreateMilestoneFormProps {
  projectId: number | string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateMilestoneForm({ projectId, onSuccess, onCancel }: CreateMilestoneFormProps) {
  const [form, setForm] = useState<CreateMilestoneData>({
    name: '',
    description: '',
    start_date: '',
    due_date: '',
    status: 'open',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof CreateMilestoneData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: CreateMilestoneData = { ...form };
      if (!payload.start_date) delete payload.start_date;
      if (!payload.due_date) delete payload.due_date;
      if (!payload.description) delete payload.description;
      await createMilestone(projectId, payload);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to create milestone.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Flag size={20} className="text-brand-primary" />
          New Milestone
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
            placeholder="e.g. v1.0 Launch"
            className="mt-1 w-full px-4 py-2.5 bg-background text-foreground border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-brand-primary/50 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Optional description"
            rows={2}
            className="mt-1 w-full px-4 py-2.5 bg-background text-foreground border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-brand-primary/50 transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Start Date</label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => set('start_date', e.target.value)}
              className="mt-1 w-full px-4 py-2.5 bg-background text-foreground border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-brand-primary/50 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Due Date</label>
            <input
              type="date"
              value={form.due_date}
              min={form.start_date || undefined}
              onChange={(e) => set('due_date', e.target.value)}
              className="mt-1 w-full px-4 py-2.5 bg-background text-foreground border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-brand-primary/50 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Status</label>
          <select
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
            className="mt-1 w-full px-4 py-2.5 bg-background text-foreground border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-brand-primary/50 transition-colors appearance-none"
          >
            <option value="open" className="bg-background text-foreground">Open</option>
            <option value="in_progress" className="bg-background text-foreground">In Progress</option>
            <option value="closed" className="bg-background text-foreground">Closed</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <GlassButton type="submit" disabled={loading} className="flex-1">
            {loading ? 'Creating…' : 'Create Milestone'}
          </GlassButton>
          <GlassButton type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </GlassButton>
        </div>
      </form>
    </GlassCard>
  );
}
