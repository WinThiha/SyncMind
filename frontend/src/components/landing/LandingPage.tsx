'use client';

import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { LandingNav } from './LandingNav';
import { LandingHero } from './LandingHero';
import { LandingFeatures } from './LandingFeatures';
import { LandingCta } from './LandingCta';
import { LandingFooter } from './LandingFooter';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const isAuthenticated = Boolean(user);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex items-center gap-4 rounded-3xl border border-border-glow/40 bg-background/75 px-6 py-4 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary text-white font-black shadow-lg shadow-brand-primary/20">
            S
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/45">SyncMind</div>
            <div className="text-base text-foreground/70">Preparing landing page...</div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="landing-page min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_24%)]" />
      <div className="absolute inset-0 -z-10 landing-grid opacity-60" />

      <LandingNav isAuthenticated={isAuthenticated} userName={user?.name ?? null} />
      <LandingHero isAuthenticated={isAuthenticated} />
      <LandingFeatures />
      <LandingCta isAuthenticated={isAuthenticated} />
      <LandingFooter isAuthenticated={isAuthenticated} />
    </main>
  );
}