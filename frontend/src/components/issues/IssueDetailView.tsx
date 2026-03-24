'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { BASE_SPRING } from '@/lib/animations';
import { X, Clock, User, Tag, Calendar } from 'lucide-react';

interface Issue {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigned_to?: { name: string; avatar?: string };
  created_at: string;
}

interface IssueDetailViewProps {
  issue: Issue;
  onClose: () => void;
}

export const IssueDetailView: React.FC<IssueDetailViewProps> = ({ issue, onClose }) => {
  return (
    <GlassCard
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={BASE_SPRING}
      className="fixed right-0 top-0 h-full w-full max-w-lg z-[60] p-8 flex flex-col shadow-2xl rounded-none border-l border-border-glow"
    >
      <div className="flex items-center justify-between mb-8">
        <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">Issue Details</span>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-foreground/5 rounded-full transition-colors text-foreground/40 hover:text-foreground"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <h2 className="text-2xl font-bold mb-4">{issue.title}</h2>
        
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-xl text-xs font-bold">
            <div className="w-1.5 h-1.5 bg-brand-primary rounded-full" />
            {issue.status.toUpperCase()}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 text-foreground/60 rounded-xl text-xs font-bold">
            <Tag size={14} />
            {issue.priority.toUpperCase()}
          </div>
        </div>

        <div className="space-y-6">
          <section>
            <h4 className="text-sm font-bold text-foreground/40 uppercase tracking-wider mb-3">Description</h4>
            <div className="p-4 bg-foreground/5 rounded-2xl text-sm leading-relaxed">
              {issue.description || 'No description provided.'}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-bold text-foreground/40 uppercase tracking-wider mb-3">Assignee</h4>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-accent/20 rounded-full flex items-center justify-center text-brand-primary font-bold text-xs border border-brand-accent/30">
                  {issue.assigned_to?.name.charAt(0) || 'U'}
                </div>
                <span className="text-sm font-medium">{issue.assigned_to?.name || 'Unassigned'}</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground/40 uppercase tracking-wider mb-3">Created</h4>
              <div className="flex items-center gap-3 text-foreground/60 text-sm">
                <Calendar size={16} />
                <span>{new Date(issue.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-border-glow flex gap-3">
        <button className="flex-1 bg-brand-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-transform">
          Edit Issue
        </button>
        <button className="flex-1 bg-foreground/5 text-foreground py-3 rounded-xl font-bold hover:bg-foreground/10 transition-colors">
          Delete
        </button>
      </div>
    </GlassCard>
  );
};
