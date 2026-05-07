'use client';

import { useEffect, useState } from 'react';
import { getProjects, Project } from '@/lib/api/projects';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { useLocale } from '@/context/LocaleContext';

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLocale();

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        setError(t('projects.list.error'));
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) return <GlassCard className="p-6 text-red-500">{error}</GlassCard>;

  if (projects.length === 0) {
    return (
      <GlassCard className="text-center py-16 text-foreground/40 mt-4 border-dashed">
        {t('projects.list.empty')}
      </GlassCard>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6 pb-12">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
