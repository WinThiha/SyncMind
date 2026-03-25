'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';

export const ProjectDetailSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-foreground/5 rounded-full" />
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-48 h-8 bg-foreground/10 rounded-lg" />
              <div className="w-12 h-5 bg-brand-primary/10 rounded-full" />
            </div>
            <div className="w-64 h-4 bg-foreground/5 rounded-lg" />
          </div>
        </div>
        <div className="w-32 h-11 bg-brand-primary/10 rounded-xl" />
      </div>

      {/* Stats/Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <GlassCard key={i} className="p-6" children={null}>
            <div className="w-12 h-12 bg-foreground/5 rounded-2xl mb-4" />
            <div className="w-24 h-6 bg-foreground/10 rounded-lg mb-2" />
            <div className="w-32 h-4 bg-foreground/5 rounded-lg" />
          </GlassCard>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Project Overview Skeleton */}
          <GlassCard className="p-6" children={null}>
            <div className="w-40 h-7 bg-foreground/10 rounded-lg mb-6" />
            <div className="space-y-4">
              <div>
                <div className="w-20 h-3 bg-foreground/5 rounded-full mb-3" />
                <div className="flex flex-wrap gap-2">
                  <div className="w-16 h-6 bg-foreground/5 rounded-lg" />
                  <div className="w-14 h-6 bg-foreground/5 rounded-lg" />
                  <div className="w-20 h-6 bg-foreground/5 rounded-lg" />
                </div>
              </div>
              <div className="pt-4 border-t border-border-glow flex justify-between items-center">
                <div className="w-16 h-3 bg-foreground/5 rounded-full" />
                <div className="w-20 h-7 bg-brand-primary/5 rounded-lg" />
              </div>
            </div>
          </GlassCard>

          {/* Member Management Skeleton placeholder */}
          <GlassCard className="p-6" children={null}>
            <div className="w-48 h-7 bg-foreground/10 rounded-lg mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-foreground/5 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="w-32 h-4 bg-foreground/10 rounded-lg" />
                    <div className="w-24 h-3 bg-foreground/5 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Settings/Sidebar Skeleton */}
        <div className="space-y-8">
          <GlassCard className="p-6" children={null}>
            <div className="w-40 h-7 bg-foreground/10 rounded-lg mb-6" />
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="w-24 h-3 bg-foreground/5 rounded-full" />
                  <div className="w-full h-10 bg-foreground/5 rounded-xl" />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
