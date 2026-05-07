'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';

export const IssueSkeleton: React.FC = () => {
  return (
    <GlassCard 
      className="p-6 mb-4 flex items-center justify-between"
      children={null}
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Status indicator dot */}
        <div className="w-2 h-2 rounded-full bg-foreground/10 animate-pulse shrink-0" />
        
        <div className="flex-1 space-y-2">
          {/* Title skeleton */}
          <div className="w-2/3 h-5 bg-foreground/10 rounded-lg animate-pulse" />
          
          {/* Badges row */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-4 bg-foreground/5 rounded-full animate-pulse" />
            <div className="w-16 h-4 bg-foreground/5 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Right-side metadata */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-foreground/5 rounded-md animate-pulse" />
          <div className="w-4 h-4 bg-foreground/5 rounded-md animate-pulse" />
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-foreground/5 rounded-md animate-pulse" />
          <div className="w-4 h-4 bg-foreground/5 rounded-md animate-pulse" />
        </div>
      </div>
    </GlassCard>
  );
};
