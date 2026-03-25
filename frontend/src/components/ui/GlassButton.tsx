'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { FAST_SPRING } from '@/lib/animations';

interface GlassButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90',
    secondary: 'bg-foreground/5 text-foreground hover:bg-foreground/10',
    ghost: 'bg-transparent text-foreground/60 hover:text-foreground hover:bg-foreground/5',
    danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-lg shadow-red-500/10',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-bold',
    md: 'px-5 py-2.5 text-sm font-bold',
    lg: 'px-8 py-4 text-base font-bold',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={FAST_SPRING}
      className={`rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
