'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Folder, Users, ChevronRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { FAST_SPRING } from '@/lib/animations';

interface Project {
  id: number;
  name: string;
  description: string;
  members_count: number;
}

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Link href={`/projects/${project.id}`}>
      <GlassCard 
        glow
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={FAST_SPRING}
        className="p-8 h-full flex flex-col group cursor-pointer"
      >
        <div className="flex items-center justify-between gap-4 mb-10">
          <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300 shrink-0">
            <Folder size={28} />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-foreground/5 rounded-xl text-xs font-bold text-foreground/60 border border-foreground/5">
            <Users size={16} />
            {project.members_count} members
          </div>
        </div>

        <h3 className="text-xl font-bold mb-3 group-hover:text-brand-primary transition-colors">
          {project.name}
        </h3>
        <p className="text-sm text-foreground/60 line-clamp-2 mb-8 flex-1 leading-relaxed">
          {project.description}
        </p>

        <div className="flex items-center justify-between text-brand-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 duration-300 pt-5 border-t border-border-glow/30">
          <span>View Project</span>
          <ChevronRight size={18} />
        </div>
      </GlassCard>
    </Link>
  );
};
