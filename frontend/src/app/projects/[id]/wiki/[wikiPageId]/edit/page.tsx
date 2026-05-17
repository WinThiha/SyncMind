'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { WikiPageEditor } from '@/components/wiki/WikiPageEditor';
import { getWikiPage, updateWikiPage, WikiPage } from '@/lib/api/wiki';
import { getProject, Project } from '@/lib/api/projects';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';

export default function WikiPageEditPage({
  params,
}: {
  params: Promise<{ id: string; wikiPageId: string }>;
}) {
  const { id: projectId, wikiPageId } = React.use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLocale();

  const [project, setProject] = useState<Project | null>(null);
  const [page, setPage] = useState<WikiPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [proj, wikiPage] = await Promise.all([
          getProject(projectId),
          getWikiPage(projectId, wikiPageId),
        ]);
        setProject(proj);

        const isAdmin =
          user &&
          (proj.creator_id === user.id ||
            (proj as any).members?.find((m: any) => m.id === user.id)?.pivot?.role === 'admin');

        if (!isAdmin) {
          router.replace(`/projects/${projectId}/wiki/${wikiPageId}`);
          return;
        }

        setPage(wikiPage);
      } catch {
        router.push(`/projects/${projectId}/wiki`);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId, wikiPageId, user, router]);

  async function handleSave(title: string, content: string) {
    setSaving(true);
    try {
      await updateWikiPage(projectId, wikiPageId, { title, content });
      router.push(`/projects/${projectId}/wiki/${wikiPageId}`);
    } catch {
      setSaving(false);
    }
  }

  if (loading || !page) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-10 w-48 bg-foreground/5 rounded-xl" />
        <div className="h-96 bg-foreground/5 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push(`/projects/${projectId}/wiki/${wikiPageId}`)}
          className="p-2 hover:bg-foreground/5 rounded-full transition-colors text-foreground/40 hover:text-foreground shrink-0"
          aria-label={t('wiki.edit.cancel')}
        >
          <ChevronLeft size={22} />
        </button>
        <div>
          <p className="text-xs text-foreground/40 uppercase font-bold tracking-wider mb-0.5">Wiki</p>
          <h1 className="text-2xl font-bold">{page.title}</h1>
        </div>
      </div>
      <GlassCard className="p-4 sm:p-6 flex-1">
        <WikiPageEditor
          projectId={projectId}
          initialTitle={page.title}
          initialContent={page.content ?? ''}
          onSave={handleSave}
          onCancel={() => router.push(`/projects/${projectId}/wiki/${wikiPageId}`)}
          saving={saving}
        />
      </GlassCard>
    </div>
  );
}
