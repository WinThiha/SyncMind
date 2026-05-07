'use client';

import React, { useEffect, useState } from 'react';
import { getProject, Project } from '@/lib/api/projects';
import { useRouter } from 'next/navigation';
import MemberManagement from '@/components/projects/MemberManagement';
import ProjectSettings from '@/components/projects/ProjectSettings';
import { ProjectDetailSkeleton } from '@/components/projects/ProjectDetailSkeleton';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Folder, 
  Layout, 
  BookOpen, 
  BarChart2, 
  Plus 
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { BASE_SPRING, FAST_SPRING } from '@/lib/animations';

interface ProjectWithMembers extends Project {
  members?: Array<{
    id: number;
    pivot: {
      role: string;
    };
  }>;
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const [project, setProject] = useState<ProjectWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    async function loadProject() {
      try {
        const data = await getProject(unwrappedParams.id);
        setProject(data as ProjectWithMembers);
      } catch {
        setError('Failed to load project details or you do not have permission.');
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [unwrappedParams.id]);

  if (loading) return <ProjectDetailSkeleton />;
  
  if (error || !project) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{error}</p>
        <button onClick={() => router.push('/dashboard')} className="mt-4 text-brand-primary underline font-bold">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const member = project.members?.find((m) => m.id === user?.id);
  const isCreator = project.creator_id === user?.id;
  const userRole = member?.pivot?.role || (isCreator ? 'creator' : 'normal');
  const canManageSettings = userRole === 'creator' || userRole === 'admin';

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-foreground/5 rounded-full transition-colors text-foreground/40 hover:text-foreground shrink-0"
          >
            <ChevronLeft size={22} />
          </motion.button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl truncate">{project.name}</h1>
              <span className="bg-brand-primary/10 text-brand-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-brand-primary/20 shrink-0">
                {project.key}
              </span>
              {isCreator && (
                <span className="bg-brand-accent/10 text-brand-accent text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-brand-accent/20 shrink-0">
                  Owner
                </span>
              )}
            </div>
            <p className="text-foreground/60 text-sm mt-0.5">Manage project details, members, and settings.</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push(`/projects/${unwrappedParams.id}/issues`)}
          className="self-start sm:self-auto shrink-0 bg-brand-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-primary/20 text-sm"
        >
          View Issues
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <GlassCard 
          glow
          whileHover={{ y: -4 }}
          onClick={() => router.push(`/projects/${unwrappedParams.id}/issues`)}
          className="p-6 cursor-pointer group"
        >
          <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary mb-4 group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300">
            <Layout size={24} />
          </div>
          <h3 className="font-bold text-lg mb-1">Issues</h3>
          <p className="text-sm text-foreground/60">Track tasks and bugs.</p>
        </GlassCard>

        <GlassCard className="p-6 opacity-40 cursor-not-allowed grayscale">
          <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 mb-4">
            <BookOpen size={24} />
          </div>
          <h3 className="font-bold text-lg mb-1">Wiki</h3>
          <p className="text-sm text-foreground/60">Documentation (Soon).</p>
        </GlassCard>

        <GlassCard
          glow
          whileHover={{ y: -4 }}
          onClick={() => router.push(`/projects/${unwrappedParams.id}/milestones`)}
          className="p-6 cursor-pointer group"
        >
          <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500 mb-4 group-hover:bg-yellow-500 group-hover:text-white transition-colors duration-300">
            <BarChart2 size={24} />
          </div>
          <h3 className="font-bold text-lg mb-1">Milestones</h3>
          <p className="text-sm text-foreground/60">Track schedule and progress.</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Folder size={20} className="text-brand-primary" />
              Project Overview
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-2">Issue Types</p>
                <div className="flex flex-wrap gap-2">
                  {project.issue_types?.map((type) => (
                    <span key={type} className="px-2.5 py-1 bg-foreground/5 text-foreground/70 text-xs font-bold rounded-lg border border-foreground/5">
                      {type}
                    </span>
                  )) || <span className="text-foreground/40 italic text-sm">None defined</span>}
                </div>
              </div>
              <div className="pt-4 border-t border-border-glow flex justify-between items-center">
                <span className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Your Role</span>
                <span className="text-sm font-bold capitalize bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-lg">
                  {userRole}
                </span>
              </div>
            </div>
          </GlassCard>

          <MemberManagement projectId={project.id} userRole={userRole === 'creator' ? 'admin' : userRole} />
        </div>

        <div className="space-y-8">
          {canManageSettings && (
            <ProjectSettings project={project} onUpdate={setProject} isOwner={isCreator} />
          )}
        </div>
      </div>
    </div>
  );
}
