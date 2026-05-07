'use client';

import { ThreadSummary } from '@/lib/api/issues';
import Markdown from '../shared/Markdown';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, MessageSquare, ListTodo, RotateCcw } from 'lucide-react';

interface SummaryCardProps {
  summary: ThreadSummary | null;
  loading: boolean;
  onRefresh: () => void;
}

export default function SummaryCard({ summary, loading, onRefresh }: SummaryCardProps) {
  if (!summary && !loading) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-brand-primary/5 border border-brand-primary/20 rounded-2xl overflow-hidden mb-6"
    >
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="flex items-center text-foreground font-bold text-lg">
            <Sparkles className="w-5 h-5 mr-2 text-brand-primary" />
            AI Thread Summary
          </h3>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-colors disabled:opacity-50"
            title="Regenerate summary"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center space-y-3">
            <div className="inline-block animate-pulse bg-brand-primary/20 h-2 w-32 rounded"></div>
            <div className="animate-pulse bg-brand-primary/10 h-2 w-full rounded"></div>
            <div className="animate-pulse bg-brand-primary/10 h-2 w-3/4 rounded"></div>
            <p className="text-sm text-brand-primary font-medium">Analyzing discussion and history...</p>
          </div>
        ) : summary && (
          <div className="space-y-6">
            <div className="prose max-w-none">
              <Markdown content={summary.summary} className="text-foreground/80 text-sm leading-relaxed" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-brand-primary/10">
              {summary.decisions.length > 0 && (
                <div>
                  <h4 className="flex items-center text-sm font-bold text-green-500 mb-2">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Decisions
                  </h4>
                  <ul className="space-y-1.5">
                    {summary.decisions.map((d, i) => (
                      <li key={i} className="text-xs text-foreground/70 flex items-start">
                        <span className="mr-1.5 mt-1">•</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.action_items.length > 0 && (
                <div>
                  <h4 className="flex items-center text-sm font-bold text-brand-primary mb-2">
                    <ListTodo className="w-4 h-4 mr-2" />
                    Action Items
                  </h4>
                  <ul className="space-y-1.5">
                    {summary.action_items.map((ai, i) => (
                      <li key={i} className="text-xs text-foreground/70 flex items-start">
                        <span className="mr-1.5 mt-1">•</span>
                        {ai}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-brand-primary/10 flex items-center">
              <MessageSquare className="w-4 h-4 text-brand-primary/50 mr-2" />
              <span className="text-xs font-bold text-foreground/40 uppercase tracking-wider mr-2">Consensus:</span>
              <span className="text-xs text-foreground/70 font-medium">{summary.consensus}</span>
            </div>
          </div>
        )}
      </div>
      <div className="bg-brand-primary/5 border-t border-brand-primary/10 px-4 py-2 flex justify-between items-center">
        <span className="text-[10px] text-foreground/40 font-medium italic">
          AI-generated summaries can be inaccurate. Please verify critical decisions.
        </span>
      </div>
    </motion.div>
  );
}
