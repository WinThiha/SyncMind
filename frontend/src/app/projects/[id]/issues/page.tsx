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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ x: -4 }}
            onClick={() => router.push(`/projects/${unwrappedParams.id}`)} 
            className="p-2 hover:bg-foreground/5 rounded-full transition-colors text-foreground/40 hover:text-foreground"
          >
            <ChevronLeft size={24} />
          </motion.button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Issues</h1>
              <span className="text-foreground/40 text-sm font-medium">/</span>
              <span className="text-foreground/60 text-sm font-bold">{project?.name || 'Loading...'}</span>
            </div>
            <p className="text-foreground/60 text-sm mt-1">Manage and track your project tasks.</p>
          </div>
        </div>

        <GlassButton
          onClick={() => router.push(`/projects/${unwrappedParams.id}/issues/new`)}
        >
          <Plus size={18} />
          New Issue
        </GlassButton>
      </div>

      <IssueList projectId={unwrappedParams.id} />
    </div>
  );
}
