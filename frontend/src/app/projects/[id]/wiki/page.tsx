'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, BookOpen, Plus, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { WikiPageList } from '@/components/wiki/WikiPageList';
import { getWikiPages, WikiPageSummary } from '@/lib/api/wiki';
import { getProject, Project } from '@/lib/api/projects';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';

export default function WikiHomePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = React.use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLocale();

  const [project, setProject] = useState<Project | null>(null);
  const [pages, setPages] = useState<WikiPageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [proj, wikiPages] = await Promise.all([
          getProject(projectId),
          getWikiPages(projectId),
        ]);
        setProject(proj);
        setPages(wikiPages);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  const isAdmin =
    user &&
    project &&
    (project.creator_id === user.id ||
      (project as any).members?.find((m: any) => m.id === user.id)?.pivot?.role === 'admin');

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-10 w-48 bg-foreground/5 rounded-xl" />
        <div className="h-64 bg-foreground/5 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push(`/projects/${projectId}`)}
          className="p-2 hover:bg-foreground/5 rounded-full transition-colors text-foreground/40 hover:text-foreground"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="flex items-center gap-2">
          <BookOpen size={22} className="text-green-500" />
          <h1 className="text-2xl font-bold tracking-tight">
            {project?.name} Wiki
          </h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="lg:hidden flex items-center gap-2 w-full text-sm font-medium px-3 py-2 rounded-xl border border-border-glow bg-foreground/5 hover:bg-foreground/10 text-foreground/70 hover:text-foreground transition-colors"
        >
          <FileText size={14} />
          {t('wiki.list.pages')}
          {sidebarOpen ? <ChevronUp size={14} className="ml-auto" /> : <ChevronDown size={14} className="ml-auto" />}
        </button>

        {/* Sidebar page list */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block lg:w-60 lg:shrink-0 lg:self-start lg:sticky lg:top-4`}>
          <GlassCard className="p-0 overflow-hidden">
            <WikiPageList pages={pages} projectId={projectId} isAdmin={!!isAdmin} />
          </GlassCard>
        </div>

        {/* Main content area */}
        <div className="flex-1 min-w-0">
          {pages.length === 0 ? (
            <GlassCard className="p-8 sm:p-12 text-center">
              <BookOpen size={40} className="mx-auto mb-4 text-foreground/20" />
              <h2 className="text-xl font-bold mb-2">{t('wiki.home.noPages')}</h2>
              <p className="text-foreground/50 text-sm mb-6">
                {isAdmin ? t('wiki.home.emptyDescAdmin') : t('wiki.home.emptyDescMember')}
              </p>
              {isAdmin && (
                <GlassButton onClick={() => router.push(`/projects/${projectId}/wiki/new`)}>
                  <Plus size={15} />
                  {t('wiki.home.createFirstPage')}
                </GlassButton>
              )}
            </GlassCard>
          ) : (
            <GlassCard className="p-8 text-center text-foreground/40">
              <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">{t('wiki.home.selectPageHint')}</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
