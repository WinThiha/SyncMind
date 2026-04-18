'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { FAST_SPRING } from '@/lib/animations';
import { Clock, MessageSquare, Tag } from 'lucide-react';

interface Issue {
  id: number;
  title: string;
  status: string;
  priority: string;
  comments_count?: number;
  similarity?: number;
}

interface IssueListItemProps {
  issue: Issue;
  onClick?: () => void;
}

const statusColors: Record<string, string> = {
  todo: 'bg-foreground/10 text-foreground/60',
  'in-progress': 'bg-brand-primary/10 text-brand-primary',
  done: 'bg-green-500/10 text-green-500',
};

const priorityColors: Record<string, string> = {
  low: 'bg-foreground/5 text-foreground/40',
  medium: 'bg-yellow-500/10 text-yellow-600',
  high: 'bg-red-500/10 text-red-500',
};

export const IssueListItem: React.FC<IssueListItemProps> = ({ issue, onClick }) => {
  return (
    <GlassCard
      glow
      transition={FAST_SPRING}
      onClick={onClick}
      className="p-6 mb-4 flex items-center justify-between cursor-pointer group"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className={`w-2 h-2 rounded-full ${issue.status === 'done' ? 'bg-green-500' : 'bg-brand-primary'}`} />
        <div className="flex-1">
          <h4 className="font-semibold group-hover:text-brand-primary transition-colors line-clamp-1">
            {issue.title}
          </h4>
          <div className="flex items-center gap-4 mt-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusColors[issue.status] || statusColors.todo}`}>
              {issue.status}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${priorityColors[issue.priority] || priorityColors.low}`}>
              {issue.priority}
            </span>
            {issue.similarity !== undefined && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                {Math.round(issue.similarity * 100)}% Match
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-foreground/40 text-sm">
        <div className="flex items-center gap-1">
          <MessageSquare size={14} />
          <span>{issue.comments_count || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>2h</span>
        </div>
      </div>
    </GlassCard>
  );
};
