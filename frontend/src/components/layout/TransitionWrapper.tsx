'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { BASE_SPRING } from '@/lib/animations';

interface TransitionWrapperProps {
  children: React.ReactNode;
}

export const TransitionWrapper: React.FC<TransitionWrapperProps> = ({ children }) => {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={BASE_SPRING}
        className="flex-1 flex flex-col min-h-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
