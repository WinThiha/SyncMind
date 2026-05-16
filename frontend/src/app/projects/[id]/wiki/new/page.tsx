'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { WikiPageEditor } from '@/components/wiki/WikiPageEditor';
import { createWikiPage } from '@/lib/api/wiki';
import { getProject, Project } from '@/lib/api/projects';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';

export default function WikiNewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = React.use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLocale();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const proj = await getProject(projectId);
        setProject(proj);

        const isAdmin =
          user &&
          (proj.creator_id === user.id ||
            (proj as any).members?.find((m: any) => m.id === user.id)?.pivot?.role === 'admin');

        if (!isAdmin) {
          router.replace(`/projects/${projectId}/wiki`);
          return;
        }
      } catch {
        router.push(`/projects/${projectId}/wiki`);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId, user, router]);

  async function handleSave(title: string, content: string) {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const newPage = await createWikiPage(projectId, { title, content });
      router.push(`/projects/${projectId}/wiki/${newPage.id}`);
    } catch {
      setSaving(false);
    }
  }

  if (loading) {
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
          onClick={() => router.push(`/projects/${projectId}/wiki`)}
          className="p-2 hover:bg-foreground/5 rounded-full transition-colors text-foreground/40 hover:text-foreground shrink-0"
          aria-label={t('wiki.new.cancel')}
        >
          <ChevronLeft size={22} />
        </button>
        <div>
          <p className="text-xs text-foreground/40 uppercase font-bold tracking-wider mb-0.5">Wiki</p>
          <h1 className="text-2xl font-bold">{t('wiki.new.title')}</h1>
        </div>
      </div>
      <GlassCard className="p-4 sm:p-6 flex-1">
        <WikiPageEditor
          projectId={projectId}
          onSave={handleSave}
          onCancel={() => router.push(`/projects/${projectId}/wiki`)}
          saving={saving}
        />
      </GlassCard>
    </div>
  );
}
