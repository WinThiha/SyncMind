'use client';

import Link from 'next/link';
import React from 'react';
import { motion } from 'framer-motion';
import { FAST_SPRING } from '@/lib/animations';

interface LandingButtonLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantClasses = {
  primary: 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 border-transparent',
  secondary: 'bg-foreground/5 text-foreground hover:bg-foreground/10 border-border-glow/30',
  ghost: 'bg-transparent text-foreground/70 hover:text-foreground hover:bg-foreground/5 border-transparent',
};

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-3 text-sm',
  lg: 'px-7 py-4 text-base',
};

export function LandingButtonLink({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}: LandingButtonLinkProps) {
  return (
    <motion.div whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={FAST_SPRING} className="inline-flex">
      <Link
        href={href}
        className={`inline-flex items-center justify-center gap-2 rounded-xl border font-bold transition-colors duration-200 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      >
        {children}
      </Link>
    </motion.div>
  );
}