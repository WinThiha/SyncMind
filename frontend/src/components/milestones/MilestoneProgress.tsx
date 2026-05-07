'use client';

import { motion } from 'framer-motion';

interface MilestoneProgressProps {
  percentage: number;
  completed: number;
  total: number;
  showLabel?: boolean;
}

export function MilestoneProgress({ percentage, completed, total, showLabel = true }: MilestoneProgressProps) {
  const color =
    percentage === 100
      ? 'bg-green-500'
      : percentage >= 50
      ? 'bg-brand-primary'
      : 'bg-brand-primary/70';

  return (
    <div className="w-full">
      <div className="h-1.5 w-full bg-foreground/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      {showLabel && (
        <p className="text-[11px] text-foreground/40 mt-1">
          {completed} / {total} issues completed
        </p>
      )}
    </div>
  );
}
