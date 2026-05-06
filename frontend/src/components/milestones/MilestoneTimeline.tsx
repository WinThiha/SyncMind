'use client';

import { motion } from 'framer-motion';
import type { Milestone } from '@/lib/api/milestones';

interface MilestoneTimelineProps {
  milestones: Milestone[];
  onSelect: (milestone: Milestone) => void;
}

function getTimelinePosition(milestone: Milestone, minDate: Date, maxDate: Date): { left: string; width: string } {
  const totalMs = maxDate.getTime() - minDate.getTime() || 1;
  const startMs = milestone.start_date
    ? new Date(milestone.start_date).getTime()
    : minDate.getTime();
  const endMs = milestone.due_date
    ? new Date(milestone.due_date).getTime()
    : startMs + totalMs * 0.1;

  const left = ((startMs - minDate.getTime()) / totalMs) * 100;
  const width = Math.max(((endMs - startMs) / totalMs) * 100, 3);

  return {
    left: `${Math.min(left, 97)}%`,
    width: `${Math.min(width, 100 - left)}%`,
  };
}

const barColors: Record<string, string> = {
  open: 'bg-foreground/20',
  in_progress: 'bg-brand-primary',
  closed: 'bg-green-500',
};

export function MilestoneTimeline({ milestones, onSelect }: MilestoneTimelineProps) {
  const dated = milestones.filter((m) => m.due_date || m.start_date);
  if (dated.length === 0) return null;

  const dates = dated.flatMap((m) => [m.start_date, m.due_date].filter(Boolean) as string[]);
  const minDate = new Date(Math.min(...dates.map((d) => new Date(d).getTime())));
  const maxDate = new Date(Math.max(...dates.map((d) => new Date(d).getTime())));

  // Pad range by 5%
  const rangeMs = maxDate.getTime() - minDate.getTime();
  minDate.setTime(minDate.getTime() - rangeMs * 0.05);
  maxDate.setTime(maxDate.getTime() + rangeMs * 0.05);

  const today = new Date();
  const todayLeft =
    today >= minDate && today <= maxDate
      ? `${((today.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * 100}%`
      : null;

  return (
    <div className="relative mt-2 mb-6 px-2">
      {/* Today line */}
      {todayLeft && (
        <div
          className="absolute top-0 bottom-0 w-px bg-brand-primary/40 z-10"
          style={{ left: todayLeft }}
        >
          <span className="absolute -top-5 left-1 text-[10px] font-bold text-brand-primary/60 whitespace-nowrap">
            Today
          </span>
        </div>
      )}

      <div className="space-y-3">
        {dated.map((m) => {
          const { left, width } = getTimelinePosition(m, minDate, maxDate);
          return (
            <div key={m.id} className="flex items-center gap-3">
              <span className="text-xs text-foreground/40 w-28 shrink-0 truncate">{m.name}</span>
              <div className="relative flex-1 h-6">
                <motion.button
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  onClick={() => onSelect(m)}
                  title={m.name}
                  className={`absolute h-6 rounded-full cursor-pointer hover:brightness-110 transition-all ${barColors[m.status] ?? barColors.open} ${m.is_overdue ? 'ring-1 ring-red-500/50' : ''}`}
                  style={{ left, width }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
