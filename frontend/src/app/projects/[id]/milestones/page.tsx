'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Flag, CalendarRange } from 'lucide-react';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { MilestoneCard } from '@/components/milestones/MilestoneCard';
import { MilestoneTimeline } from '@/components/milestones/MilestoneTimeline';
import { CreateMilestoneForm } from '@/components/milestones/CreateMilestoneForm';
import { EditMilestoneForm } from '@/components/milestones/EditMilestoneForm';
import { getMilestones, type Milestone } from '@/lib/api/milestones';
import { getProject, type Project } from '@/lib/api/projects';
import { BASE_SPRING } from '@/lib/animations';

export default function MilestonesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = React.use(params);
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Milestone | null>(null);

  async function load() {
    try {
      const [proj, ms] = await Promise.all([getProject(projectId), getMilestones(projectId)]);
      setProject(proj);
      setMilestones(ms);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [projectId]);

  const open = milestones.filter((m) => m.status === 'open');
  const inProgress = milestones.filter((m) => m.status === 'in_progress');
  const closed = milestones.filter((m) => m.status === 'closed');

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-10 w-48 bg-foreground/5 rounded-xl" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 bg-foreground/5 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => router.push(`/projects/${projectId}`)}
            className="p-2 hover:bg-foreground/5 rounded-full transition-colors text-foreground/40 hover:text-foreground shrink-0"
          >
            <ChevronLeft size={22} />
          </motion.button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Milestones</h1>
              {project?.key && (
                <span className="bg-brand-primary/10 text-brand-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-brand-primary/20 shrink-0">
                  {project.key}
                </span>
              )}
            </div>
            <p className="text-foreground/60 text-sm mt-0.5">{milestones.length} milestone{milestones.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <GlassButton
          onClick={() => { setShowCreate(true); setEditing(null); }}
          className="self-start sm:self-auto shrink-0 flex items-center gap-2"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Milestone</span>
          <span className="sm:hidden">New</span>
        </GlassButton>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={BASE_SPRING}
            className="mb-8"
          >
            <CreateMilestoneForm
              projectId={projectId}
              onSuccess={() => { setShowCreate(false); load(); }}
              onCancel={() => setShowCreate(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit form */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={BASE_SPRING}
            className="mb-8"
          >
            <EditMilestoneForm
              projectId={projectId}
              milestone={editing}
              onSuccess={() => { setEditing(null); load(); }}
              onCancel={() => setEditing(null)}
              onDeleted={() => { setEditing(null); load(); }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {milestones.length === 0 ? (
        <GlassCard className="p-10 sm:p-16 flex flex-col items-center text-center">
          <Flag size={40} className="text-foreground/20 mb-4" />
          <h3 className="font-bold text-lg mb-2">No milestones yet</h3>
          <p className="text-sm text-foreground/50 max-w-sm">
            Create milestones to track progress toward your project goals.
          </p>
          <GlassButton onClick={() => setShowCreate(true)} className="mt-6 flex items-center gap-2">
            <Plus size={16} />
            Create First Milestone
          </GlassButton>
        </GlassCard>
      ) : (
        <>
          {/* Timeline */}
          {milestones.some((m) => m.due_date || m.start_date) && (
            <GlassCard className="p-6 mb-8">
              <h2 className="text-sm font-bold text-foreground/40 uppercase tracking-wider flex items-center gap-2 mb-4">
                <CalendarRange size={14} />
                Timeline
              </h2>
              <MilestoneTimeline
                milestones={milestones}
                onSelect={(m) => router.push(`/projects/${projectId}/milestones/${m.id}`)}
              />
            </GlassCard>
          )}

          {/* In Progress */}
          {inProgress.length > 0 && (
            <Section title="In Progress" count={inProgress.length}>
              {inProgress.map((m) => (
                <MilestoneCard
                  key={m.id}
                  milestone={m}
                  onClick={() => router.push(`/projects/${projectId}/milestones/${m.id}`)}
                  onEdit={() => { setEditing(m); setShowCreate(false); }}
                />
              ))}
            </Section>
          )}

          {/* Open */}
          {open.length > 0 && (
            <Section title="Open" count={open.length}>
              {open.map((m) => (
                <MilestoneCard
                  key={m.id}
                  milestone={m}
                  onClick={() => router.push(`/projects/${projectId}/milestones/${m.id}`)}
                  onEdit={() => { setEditing(m); setShowCreate(false); }}
                />
              ))}
            </Section>
          )}

          {/* Closed */}
          {closed.length > 0 && (
            <Section title="Closed" count={closed.length}>
              {closed.map((m) => (
                <MilestoneCard
                  key={m.id}
                  milestone={m}
                  onClick={() => router.push(`/projects/${projectId}/milestones/${m.id}`)}
                  onEdit={() => { setEditing(m); setShowCreate(false); }}
                />
              ))}
            </Section>
          )}
        </>
      )}
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-bold text-foreground/40 uppercase tracking-wider mb-4">
        {title} <span className="ml-1 text-foreground/20">({count})</span>
      </h2>
      <div className="grid grid-cols-1 gap-4">{children}</div>
    </div>
  );
}
