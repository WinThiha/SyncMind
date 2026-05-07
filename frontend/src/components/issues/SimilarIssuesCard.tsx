'use client';

import { SimilarIssue } from '@/lib/api/issues';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface SimilarIssuesCardProps {
  issues: SimilarIssue[];
  projectKey?: string;
}

export function SimilarIssuesCard({ issues, projectKey = 'PROJ' }: SimilarIssuesCardProps) {
  if (issues.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden mt-4"
    >
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-amber-500" />
          <h4 className="text-sm font-bold text-amber-500 uppercase tracking-wider">
            Possible Duplicates ({issues.length})
          </h4>
        </div>

        <div className="space-y-2">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="group bg-white/5 border border-white/10 hover:border-amber-500/30 rounded-lg p-3 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-foreground/60 uppercase tracking-tight">
                      {issue.key ?? `${projectKey}-${issue.key_number}`}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tight ${
                      issue.similarity > 0.9 ? 'bg-amber-500/20 text-amber-500' : 'bg-white/10 text-foreground/40'
                    }`}>
                      {Math.round(issue.similarity * 100)}% Match
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground group-hover:text-amber-200 transition-colors line-clamp-1">
                    {issue.summary}
                  </p>
                </div>
                <Link
                  href={`/projects/${issue.project_id}/issues/${issue.key ?? `${projectKey}-${issue.key_number}`}`}
                  target="_blank"
                  className="shrink-0 p-1.5 rounded-lg bg-white/5 text-foreground/40 hover:bg-white/10 hover:text-foreground transition-all"
                >
                  <ExternalLink size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
