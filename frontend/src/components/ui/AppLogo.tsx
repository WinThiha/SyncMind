'use client';

import { BrainCircuit } from 'lucide-react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
}

const sizeMap = {
  sm: { box: 'w-8 h-8 rounded-lg', icon: 16, text: 'text-lg' },
  md: { box: 'w-12 h-12 rounded-xl', icon: 22, text: 'text-2xl' },
  lg: { box: 'w-16 h-16 rounded-2xl', icon: 28, text: 'text-4xl' },
};

export function AppLogo({ size = 'lg', showWordmark = true }: AppLogoProps) {
  const s = sizeMap[size];
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${s.box} bg-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/20 shrink-0`}
      >
        <BrainCircuit size={s.icon} className="text-white" strokeWidth={1.75} />
      </div>
      {showWordmark && (
        <h1 className={`${s.text} font-black tracking-tight text-foreground`}>
          SyncMind
        </h1>
      )}
    </div>
  );
}
