'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { BASE_SPRING } from '@/lib/animations';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  glow = false,
  ...props 
}) => {
  return (
    <motion.div
      className={`glass-card ${glow ? 'hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-shadow duration-300' : ''} ${className}`}
      transition={BASE_SPRING}
      {...props}
    >
      {children}
    </motion.div>
  );
};
