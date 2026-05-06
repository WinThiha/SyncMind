'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, AlertTriangle, CheckCircle2, Circle, Clock, Calendar } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { MilestoneProgress } from '@/components/milestones/MilestoneProgress';
import { EditMilestoneForm } from '@/components/milestones/EditMilestoneForm';
import { getMilestone, type MilestoneWithIssues } from '@/lib/api/milestones';
import { FAST_SPRING } from '@/lib/animations';

const statusConfig = {
  open: { icon: Circle, label: 'Open', className: 'bg-foreground/10 text-foreground/60' },
  in_progress: { icon: Clock, label: 'In Progress', className: 'bg-brand-primary/10 text-brand-primary' },
  closed: { icon: CheckCircle2, label: 'Closed', className: 'bg-green-500/10 text-green-500' },
};

const issueStatusColors: Record<string, string> = {
  open: 'bg-foreground/10 text-foreground/60',
  in_progress: 'bg-brand-primary/10 text-brand-primary',
  resolved: 'bg-green-500/10 text-green-500',
  closed: 'bg-green-500/10 text-green-500',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MilestoneDetailPage({
  params,
}: {
  params: Promise<{ id: string; milestoneId: string }>;
}) {
  const { id: projectId, milestoneId } = React.use(params);
  const router = useRouter();

  const [milestone, setMilestone] = useState<MilestoneWithIssues | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  async function load() {
    try {
      const data = await getMilestone(projectId, milestoneId);
      setMilestone(data);
    } catch {
      router.push(`/projects/${projectId}/milestones`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [projectId, milestoneId]);

  if (loading || !milestone) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-10 w-64 bg-foreground/5 rounded-xl" />
        <div className="h-48 bg-foreground/5 rounded-2xl" />
      </div>
    );
  }

  const status = statusConfig[milestone.status] ?? statusConfig.open;
  const StatusIcon = status.icon;

  if (editing) {
    return (
      <EditMilestoneForm
        projectId={projectId}
        milestone={milestone}
        onSuccess={() => { setEditing(false); load(); }}
        onCancel={() => setEditing(false)}
        onDeleted={() => router.push(`/projects/${projectId}/milestones`)}
      />
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => router.push(`/projects/${projectId}/milestones`)}
            className="p-2 hover:bg-foreground/5 rounded-full transition-colors text-foreground/40 hover:text-foreground"
          >
            <ChevronLeft size={24} />
          </motion.button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight">{milestone.name}</h1>
              <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${status.className}`}>
                <StatusIcon size={10} />
                {status.label}
              </span>
              {milestone.is_overdue && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                  <AlertTriangle size={10} />
                  Overdue
                </span>
              )}
            </div>
            {milestone.description && (
              <p className="text-foreground/60 text-sm mt-1">{milestone.description}</p>
            )}
          </div>
        </div>
        <GlassButton variant="secondary" onClick={() => setEditing(true)}>
          Edit
        </GlassButton>
      </div>

      {/* Summary card */}
      <GlassCard className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-1">Start Date</p>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Calendar size={14} className="text-foreground/40" />
              {formatDate(milestone.start_date)}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-1">Due Date</p>
            <div className={`flex items-center gap-2 text-sm font-semibold ${milestone.is_overdue ? 'text-red-500' : ''}`}>
              <Calendar size={14} className={milestone.is_overdue ? 'text-red-500' : 'text-foreground/40'} />
              {formatDate(milestone.due_date)}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-1">Progress</p>
            <p className="text-sm font-semibold">
              {milestone.progress.completed} / {milestone.progress.total} issues
            </p>
          </div>
        </div>
        <MilestoneProgress
          percentage={milestone.progress.percentage}
          completed={milestone.progress.completed}
          total={milestone.progress.total}
          showLabel={false}
        />
        <p className="text-right text-xs font-bold text-brand-primary/60 mt-1">
          {milestone.progress.percentage}% complete
        </p>
      </GlassCard>

      {/* Issues */}
      <h2 className="text-sm font-bold text-foreground/40 uppercase tracking-wider mb-4">
        Issues <span className="ml-1 text-foreground/20">({milestone.issues.length})</span>
      </h2>

      {milestone.issues.length === 0 ? (
        <GlassCard className="p-10 text-center">
          <p className="text-foreground/40 text-sm">No issues linked to this milestone yet.</p>
          <p className="text-xs text-foreground/30 mt-1">
            Set the milestone when creating or editing an issue.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {milestone.issues.map((issue: any) => (
            <motion.div
              key={issue.id}
              whileHover={{ x: 4 }}
              transition={FAST_SPRING}
              onClick={() => router.push(`/projects/${projectId}/issues/${issue.key ?? `${issue.project_id}-${issue.key_number}`}`)}
              className="glass-card p-4 flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-foreground/40 font-mono">
                  {issue.key ?? `#${issue.key_number}`}
                </span>
                <span className="font-medium group-hover:text-brand-primary transition-colors line-clamp-1">
                  {issue.summary}
                </span>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                {issue.due_date && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-foreground/40">
                    <Calendar size={10} />
                    {formatDate(issue.due_date)}
                  </span>
                )}
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${issueStatusColors[issue.status] ?? issueStatusColors.open}`}>
                  {issue.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
