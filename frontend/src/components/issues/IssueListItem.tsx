'use client';

import React from 'react';
import { useLocale } from '@/context/LocaleContext';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { FAST_SPRING } from '@/lib/animations';
import { MessageSquare, Calendar } from 'lucide-react';

interface Issue {
  id: number;
  title: string;
  status: string;
  priority: string;
  comments_count?: number;
  similarity?: number;
  due_date?: string | null;
}

interface IssueListItemProps {
  issue: Issue;
  onClick?: () => void;
}

const statusColors: Record<string, string> = {
  open: 'bg-foreground/10 text-foreground/60',
  in_progress: 'bg-brand-primary/10 text-brand-primary',
  resolved: 'bg-green-500/10 text-green-500',
  closed: 'bg-foreground/10 text-foreground/40',
};

const priorityColors: Record<string, string> = {
  low: 'bg-foreground/5 text-foreground/40',
  normal: 'bg-yellow-500/10 text-yellow-600',
  high: 'bg-red-500/10 text-red-500',
};

export const IssueListItem: React.FC<IssueListItemProps> = ({ issue, onClick }) => {
  const { t } = useLocale();
  return (
    <GlassCard
      glow
      transition={FAST_SPRING}
      onClick={onClick}
      className="p-4 sm:p-5 mb-3 sm:mb-4 cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${(issue.status === 'resolved' || issue.status === 'closed') ? 'bg-green-500' : 'bg-brand-primary'}`} />

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <h4 className="font-semibold group-hover:text-brand-primary transition-colors line-clamp-2 sm:line-clamp-1 text-sm sm:text-base">
              {issue.title}
            </h4>
            {/* Right metadata — desktop */}
            <div className="hidden sm:flex items-center gap-3 text-foreground/40 text-xs shrink-0">
              {issue.due_date && (
                <div className={`flex items-center gap-1 font-semibold ${new Date(issue.due_date) < new Date() ? 'text-red-400' : 'text-foreground/40'}`}>
                  <Calendar size={12} />
                  <span>{new Date(issue.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <MessageSquare size={13} />
                <span>{issue.comments_count || 0}</span>
              </div>
            </div>
          </div>

          {/* Badges row */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusColors[issue.status] || statusColors.open}`}>
              {issue.status}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${priorityColors[issue.priority] || priorityColors.low}`}>
              {issue.priority}
            </span>
            {issue.similarity !== undefined && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                {Math.round(issue.similarity * 100)}% {t('issues.search.match')}
              </span>
            )}
            {/* Due date — mobile only */}
            {issue.due_date && (
              <span className={`sm:hidden text-[10px] font-semibold flex items-center gap-1 ${new Date(issue.due_date) < new Date() ? 'text-red-400' : 'text-foreground/40'}`}>
                <Calendar size={10} />
                {new Date(issue.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
