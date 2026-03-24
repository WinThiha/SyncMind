'use client';

import React from 'react';
import { GlassCard } from './GlassCard';

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <GlassCard className={`p-8 h-full flex flex-col ${className}`} children={null}>
      {/* Header: Icon and Badge */}
      <div className="flex items-center justify-between gap-4 mb-10">
        <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl animate-pulse shrink-0" />
        <div className="w-28 h-9 bg-foreground/5 rounded-xl animate-pulse border border-foreground/5" />
      </div>

      {/* Title: Matching text-xl */}
      <div className="w-3/4 h-6 bg-foreground/10 rounded-lg animate-pulse mb-3" />
      
      {/* Description: Matching text-sm and leading-relaxed */}
      <div className="flex-1 space-y-3 mb-8">
        <div className="w-full h-3.5 bg-foreground/5 rounded-lg animate-pulse" />
        <div className="w-5/6 h-3.5 bg-foreground/5 rounded-lg animate-pulse" />
      </div>

      {/* Footer: Matching pt-5 and border-t */}
      <div className="pt-5 border-t border-border-glow/30 flex justify-between items-center">
        <div className="w-24 h-3.5 bg-brand-primary/10 rounded-lg animate-pulse" />
        <div className="w-4.5 h-4.5 bg-brand-primary/10 rounded-full animate-pulse" />
      </div>
    </GlassCard>
  );
};
