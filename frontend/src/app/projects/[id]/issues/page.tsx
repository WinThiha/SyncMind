'use client';

import React, { useEffect, useState } from 'react';
import { getProject, Project } from '@/lib/api/projects';
import { useRouter } from 'next/navigation';
import IssueList from '@/components/issues/IssueList';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus } from 'lucide-react';
import { GlassButton } from '@/components/ui/GlassButton';

export default function IssueListPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const [project, setProject] = useState<Project | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadProject() {
      try {
        const data = await getProject(unwrappedParams.id);
        setProject(data);
      } catch {
      }
    }
    loadProject();
  }, [unwrappedParams.id]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => router.push(`/projects/${unwrappedParams.id}`)}
            className="p-2 hover:bg-foreground/5 rounded-full transition-colors text-foreground/40 hover:text-foreground shrink-0"
          >
            <ChevronLeft size={22} />
          </motion.button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Issues</h1>
              <span className="text-foreground/30 text-sm hidden sm:inline">/</span>
              <span className="text-foreground/60 text-sm font-bold truncate hidden sm:block">{project?.name || 'Loading...'}</span>
            </div>
            <p className="text-foreground/60 text-sm mt-0.5">Manage and track your project tasks.</p>
          </div>
        </div>

        <GlassButton
          onClick={() => router.push(`/projects/${unwrappedParams.id}/issues/new`)}
          className="self-start sm:self-auto shrink-0"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">New Issue</span>
          <span className="sm:hidden">New</span>
        </GlassButton>
      </div>

      <IssueList projectId={unwrappedParams.id} />
    </div>
  );
}
