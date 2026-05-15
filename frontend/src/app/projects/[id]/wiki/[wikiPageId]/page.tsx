'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Edit2, MessageCircle, BookOpen, Clock, User } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { WikiPageList } from '@/components/wiki/WikiPageList';
import { WikiPageView } from '@/components/wiki/WikiPageView';
import { WikiChatPanel } from '@/components/wiki/WikiChatPanel';
import { getWikiPages, getWikiPage, WikiPage, WikiPageSummary } from '@/lib/api/wiki';
import { getProject, Project } from '@/lib/api/projects';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { BASE_SPRING } from '@/lib/animations';

export default function WikiPageViewPage({
  params,
}: {
  params: Promise<{ id: string; wikiPageId: string }>;
}) {
  const { id: projectId, wikiPageId } = React.use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLocale();

  const [project, setProject] = useState<Project | null>(null);
  const [pages, setPages] = useState<WikiPageSummary[]>([]);
  const [page, setPage] = useState<WikiPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [proj, wikiPages, wikiPage] = await Promise.all([
          getProject(projectId),
          getWikiPages(projectId),
          getWikiPage(projectId, wikiPageId),
        ]);
        setProject(proj);
        setPages(wikiPages);
        setPage(wikiPage);
      } catch {
        router.push(`/projects/${projectId}/wiki`);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId, wikiPageId, router]);

  const isAdmin =
    user &&
    project &&
    (project.creator_id === user.id ||
      (project as any).members?.find((m: any) => m.id === user.id)?.pivot?.role === 'admin');

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-10 w-48 bg-foreground/5 rounded-xl" />
        <div className="h-96 bg-foreground/5 rounded-2xl" />
      </div>
    );
  }

  if (!page) return null;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push(`/projects/${projectId}/wiki`)}
          className="p-2 hover:bg-foreground/5 rounded-full transition-colors text-foreground/40 hover:text-foreground shrink-0"
          aria-label={t('wiki.view.back')}
        >
          <ChevronLeft size={22} />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen size={20} className="text-green-500 shrink-0" />
          <h1 className="text-2xl font-bold tracking-tight truncate">{page.title}</h1>
        </div>
        {isAdmin && (
          <GlassButton
            size="sm"
            variant="secondary"
            onClick={() => router.push(`/projects/${projectId}/wiki/${wikiPageId}/edit`)}
            className="ml-auto shrink-0"
          >
            <Edit2 size={13} />
            {t('wiki.view.edit')}
          </GlassButton>
        )}
      </div>

      <div className="flex gap-6">
        {/* Sidebar page list */}
        <GlassCard className="w-60 shrink-0 p-0 overflow-hidden self-start sticky top-4">
          <WikiPageList pages={pages} projectId={projectId} isAdmin={!!isAdmin} />
        </GlassCard>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <GlassCard className="p-8">
            {/* Page metadata */}
            <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-border-glow text-xs text-foreground/40">
              {page.author && (
                <span className="flex items-center gap-1">
                  <User size={11} />
                  {t('wiki.view.writtenBy')} <strong className="text-foreground/60">{page.author.name}</strong>
                </span>
              )}
              {page.last_editor && (
                <span className="flex items-center gap-1">
                  <Edit2 size={11} />
                  {t('wiki.view.lastEditedBy')} <strong className="text-foreground/60">{page.last_editor.name}</strong>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {new Date(page.updated_at).toLocaleDateString()}
              </span>
            </div>

            <WikiPageView content={page.content} />
          </GlassCard>
        </div>
      </div>

      {/* Floating chat toggle button */}
      <button
        onClick={() => setChatOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-brand-primary text-white px-4 py-2.5 rounded-2xl shadow-lg shadow-brand-primary/30 hover:bg-brand-primary/85 transition-colors font-medium text-sm"
        aria-label="Toggle AI chat"
      >
        <MessageCircle size={16} />
        {chatOpen ? t('wiki.view.closeChat') : t('wiki.view.askAi')}
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            key="chat"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={BASE_SPRING}
          >
            <WikiChatPanel projectId={projectId} onClose={() => setChatOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
