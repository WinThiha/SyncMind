'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, LayoutDashboard, Zap } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-black tracking-widest uppercase animate-pulse">
        Syncing...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-foreground">
      <GlassCard className="max-w-xl w-full p-12 text-center shadow-2xl border-border-glow/50 relative overflow-hidden">
        {/* Background glow decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-10">
          <div className="space-y-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-brand-primary rounded-3xl flex items-center justify-center text-white font-black text-3xl mx-auto shadow-xl shadow-brand-primary/20 mb-8"
            >
              S
            </motion.div>
            <h1 className="text-5xl font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">SyncMind</h1>
            <p className="text-lg text-foreground/50 font-medium leading-relaxed max-w-sm mx-auto">
              The ultimate workspace for mental clarity and high-velocity productivity.
            </p>
          </div>

          <div className="h-px bg-border-glow/50 w-1/2 mx-auto" />

          {user ? (
            <div className="flex flex-col space-y-6">
              <div className="flex items-center justify-center gap-3 bg-foreground/5 py-3 px-6 rounded-2xl border border-border-glow/30 w-fit mx-auto">
                <div className="w-8 h-8 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary font-bold text-xs uppercase">
                  {user.name.charAt(0)}
                </div>
                <p className="text-sm font-bold text-foreground/60 tracking-wide">
                  Signed in as <span className="text-foreground">{user.name}</span>
                </p>
              </div>
              <Link href="/dashboard" className="block">
                <GlassButton className="w-full py-5 text-base">
                  <LayoutDashboard size={20} />
                  GO TO DASHBOARD
                </GlassButton>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="flex-1">
                <GlassButton className="w-full py-5 text-base">
                  <LogIn size={20} />
                  SIGN IN
                </GlassButton>
              </Link>
              <Link href="/register" className="flex-1">
                <GlassButton variant="secondary" className="w-full py-5 text-base">
                  <UserPlus size={20} />
                  CREATE ACCOUNT
                </GlassButton>
              </Link>
            </div>
          )}
          
          <div className="pt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">
            <Zap size={12} className="text-brand-primary" />
            Built for modern high-velocity teams
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
