'use client';

import { useLocale } from '@/context/LocaleContext';
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
  const { t } = useLocale();
  if (!summary && !loading) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-indigo-50 border border-indigo-200 rounded-lg overflow-hidden mb-6"
    >
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="flex items-center text-indigo-900 font-bold text-lg">
            <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
            {t('issues.detail.aiThreadSummary')}
          </h3>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-md transition-colors disabled:opacity-50"
            title={t('issues.detail.regenerateSummary')}
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center space-y-3">
            <div className="inline-block animate-pulse bg-indigo-200 h-2 w-32 rounded"></div>
            <div className="animate-pulse bg-indigo-200 h-2 w-full rounded"></div>
            <div className="animate-pulse bg-indigo-200 h-2 w-3/4 rounded"></div>
            <p className="text-sm text-indigo-600 font-medium">{t('issues.detail.analyzing')}</p>
          </div>
        ) : summary && (
          <div className="space-y-6">
            <div className="prose prose-indigo max-w-none">
              <Markdown content={summary.summary} className="text-indigo-900 text-sm leading-relaxed" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-indigo-100">
              {summary.decisions.length > 0 && (
                <div>
                  <h4 className="flex items-center text-sm font-bold text-green-800 mb-2">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {t('issues.detail.decisions')}
                  </h4>
                  <ul className="space-y-1.5">
                    {summary.decisions.map((d, i) => (
                      <li key={i} className="text-xs text-green-900 flex items-start">
                        <span className="mr-1.5 mt-1">•</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.action_items.length > 0 && (
                <div>
                  <h4 className="flex items-center text-sm font-bold text-blue-800 mb-2">
                    <ListTodo className="w-4 h-4 mr-2" />
                    {t('issues.detail.actionItems')}
                  </h4>
                  <ul className="space-y-1.5">
                    {summary.action_items.map((ai, i) => (
                      <li key={i} className="text-xs text-blue-900 flex items-start">
                        <span className="mr-1.5 mt-1">•</span>
                        {ai}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-indigo-100 flex items-center">
              <MessageSquare className="w-4 h-4 text-indigo-400 mr-2" />
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider mr-2">{t('issues.detail.consensus')}:</span>
              <span className="text-xs text-indigo-700 font-medium">{summary.consensus}</span>
            </div>
          </div>
        )}
      </div>
      <div className="bg-indigo-100 px-4 py-2 flex justify-between items-center">
        <span className="text-[10px] text-indigo-500 font-medium italic">
          {t('issues.detail.aiDisclaimer')}
        </span>
      </div>
    </motion.div>
  );
}
