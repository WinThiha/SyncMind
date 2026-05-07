'use client';

import React from 'react';
import Link from 'next/link';
import { Folder, Users, Layers, ChevronRight, GitBranch } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { FAST_SPRING } from '@/lib/animations';
import type { Project } from '@/lib/api/projects';

interface ProjectCardProps {
  project: Project;
}

function relativeTime(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const issueTypes = project.issue_types ?? [];
  const visibleTypes = issueTypes.slice(0, 3);
  const hiddenCount = issueTypes.length - visibleTypes.length;

  return (
    <Link href={`/projects/${project.id}`}>
      <GlassCard
        glow
        whileHover={{ y: -4, scale: 1.015 }}
        whileTap={{ scale: 0.98 }}
        transition={FAST_SPRING}
        className="p-6 h-full flex flex-col group cursor-pointer"
      >
        {/* Top row: icon + key badge */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300 shrink-0">
            <Folder size={22} />
          </div>
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-foreground/5 border border-border-glow text-foreground/40 uppercase tracking-widest shrink-0 mt-1">
            {project.key}
          </span>
        </div>

        {/* Project name */}
        <h3 className="text-lg font-bold mb-4 group-hover:text-brand-primary transition-colors line-clamp-2 leading-snug">
          {project.name}
        </h3>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/50">
            <Users size={13} className="text-foreground/35" />
            <span>{project.members_count ?? 0} member{project.members_count !== 1 ? 's' : ''}</span>
          </div>
          <div className="w-px h-3 bg-border-glow" />
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/50">
            <Layers size={13} className="text-foreground/35" />
            <span>{project.issues_count ?? 0} issue{project.issues_count !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Issue type tags */}
        {issueTypes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {visibleTypes.map((type) => (
              <span
                key={type}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-foreground/5 border border-border-glow/60 text-foreground/40 uppercase tracking-wide"
              >
                {type}
              </span>
            ))}
            {hiddenCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-foreground/5 border border-border-glow/60 text-foreground/30">
                +{hiddenCount}
              </span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer: updated time + hover CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-border-glow/30 mt-2">
          <span className="text-[11px] text-foreground/30 font-medium flex items-center gap-1">
            <GitBranch size={11} />
            {relativeTime(project.updated_at)}
          </span>
          <span className="flex items-center gap-1 text-brand-primary text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Open <ChevronRight size={14} />
          </span>
        </div>
      </GlassCard>
    </Link>
  );
};
