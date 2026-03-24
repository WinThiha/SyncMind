'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, message = 'Loading...' }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/20 backdrop-blur-md"
        >
          <div className="glass-card p-8 flex flex-col items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full"
            />
            <p className="text-sm font-bold text-foreground/60 tracking-widest uppercase">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
