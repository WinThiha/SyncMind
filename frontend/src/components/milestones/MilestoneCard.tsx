'use client';

import { motion } from 'framer-motion';
import { Calendar, AlertTriangle, CheckCircle2, Circle, Clock } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { MilestoneProgress } from './MilestoneProgress';
import { FAST_SPRING } from '@/lib/animations';
import type { Milestone } from '@/lib/api/milestones';
import { useLocale } from '@/context/LocaleContext';

interface MilestoneCardProps {
  milestone: Milestone;
  onClick?: () => void;
  onEdit?: () => void;
}

const statusConfig = {
  open: { icon: Circle, labelKey: 'milestones.status.open', className: 'bg-foreground/10 text-foreground/60' },
  in_progress: { icon: Clock, labelKey: 'milestones.status.inProgress', className: 'bg-brand-primary/10 text-brand-primary' },
  closed: { icon: CheckCircle2, labelKey: 'milestones.status.closed', className: 'bg-green-500/10 text-green-500' },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function MilestoneCard({ milestone, onClick, onEdit }: MilestoneCardProps) {
  const { t } = useLocale();
  const status = statusConfig[milestone.status] ?? statusConfig.open;
  const StatusIcon = status.icon;

  return (
    <GlassCard
      glow
      transition={FAST_SPRING}
      onClick={onClick}
      className="p-6 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-lg group-hover:text-brand-primary transition-colors truncate">
              {milestone.name}
            </h3>
            {milestone.is_overdue && (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 shrink-0">
                <AlertTriangle size={10} />
                {t('milestones.card.overdue')}
              </span>
            )}
          </div>
          {milestone.description && (
            <p className="text-sm text-foreground/50 mt-1 line-clamp-2">{milestone.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4 shrink-0">
          <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${status.className}`}>
            <StatusIcon size={10} />
            {t(status.labelKey)}
          </span>
          {onEdit && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1.5 rounded-lg text-foreground/30 hover:text-foreground hover:bg-foreground/5 transition-colors opacity-0 group-hover:opacity-100"
            >
              <span className="text-xs font-bold">{t('milestones.card.edit')}</span>
            </motion.button>
          )}
        </div>
      </div>

      <MilestoneProgress
        percentage={milestone.progress.percentage}
        completed={milestone.progress.completed}
        total={milestone.progress.total}
      />

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border-glow text-xs text-foreground/40">
        {milestone.start_date && (
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{t('milestones.card.start')}: {formatDate(milestone.start_date)}</span>
          </div>
        )}
        {milestone.due_date && (
          <div className={`flex items-center gap-1 ${milestone.is_overdue ? 'text-red-500' : ''}`}>
            <Calendar size={12} />
            <span>{t('milestones.card.due')}: {formatDate(milestone.due_date)}</span>
          </div>
        )}
        <span className="ml-auto font-bold text-brand-primary/60">
          {milestone.progress.percentage}%
        </span>
      </div>
    </GlassCard>
  );
}
