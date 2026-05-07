'use client';

import { useState } from 'react';
import { useLocale } from '@/context/LocaleContext';
import api from '@/lib/axios';
import MarkdownEditor from '../shared/MarkdownEditor';
import Markdown from '../shared/Markdown';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, AlertTriangle } from 'lucide-react';

function relativeTime(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: { name: string };
}

interface CommentsProps {
  projectId: number | string;
  issueKey: string;
  initialComments: Comment[];
}

export default function Comments({ projectId, issueKey, initialComments }: CommentsProps) {
  const { t } = useLocale();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await api.post(
        `/api/projects/${projectId}/issues/${issueKey}/comments`,
        { content: newComment },
      );
      setComments((prev) => [...prev, response.data.data]);
      setNewComment('');
    } catch (err: any) {
      setError(err.response?.data?.message ?? t('issues.comments.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlassCard className="p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-brand-primary mb-5">
        <MessageSquare size={15} />
        <h2 className="text-[10px] font-bold uppercase tracking-widest">
          {t('issues.comments.title')} {comments.length > 0 && <span className="ml-1 text-foreground/30">({comments.length})</span>}
        </h2>
      </div>

      {/* Comment list */}
      <div className="space-y-4 mb-6">
        {comments.length === 0 ? (
          <p className="text-sm text-foreground/30 italic py-2">{t('issues.comments.empty')}</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0 font-bold text-xs text-brand-primary">
                {comment.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-sm font-bold">{comment.user.name}</span>
                  <span
                    className="text-[10px] text-foreground/35"
                    title={new Date(comment.created_at).toLocaleString()}
                  >
                    {relativeTime(comment.created_at)}
                  </span>
                </div>
                <div className="text-sm leading-relaxed text-foreground/70 bg-foreground/[0.03] border border-border-glow/40 rounded-xl p-3.5">
                  <Markdown content={comment.content} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New comment form */}
      <form onSubmit={handleSubmit} className="border-t border-border-glow pt-5 space-y-3">
        <div className="rounded-xl overflow-hidden border border-border-glow focus-within:border-brand-primary/30 focus-within:ring-4 focus-within:ring-brand-primary/10 transition-all bg-foreground/[0.02]">
          <MarkdownEditor
            value={newComment}
            onChange={setNewComment}
            placeholder={t('issues.comments.placeholder')}
            rows={3}
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-xs text-red-500 font-medium"
            >
              <AlertTriangle size={12} />
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="flex justify-end">
          <GlassButton
            type="submit"
            size="sm"
            disabled={submitting || !newComment.trim()}
          >
            <Send size={14} />
            {submitting ? t('issues.comments.posting') : t('issues.comments.post')}
          </GlassButton>
        </div>
      </form>
    </GlassCard>
  );
}
