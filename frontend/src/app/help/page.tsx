'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Search,
  FolderPlus,
  UserPlus,
  ListTodo,
  Sparkles,
  Layers,
  Users,
  BrainCircuit,
  CalendarRange,
  ChevronDown,
  Mail,
  ExternalLink,
  ArrowRight,
  Key,
  Milestone,
} from 'lucide-react';
import { useModifierKey } from '@/hooks/useModifierKey';
import { useLocale } from '@/context/LocaleContext';

// ─── Components ───────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border-glow last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left group"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
          {q}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-foreground/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-foreground/55 leading-relaxed pb-5 pr-8">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HelpPage() {
  const [search, setSearch] = useState('');
  const { modKey } = useModifierKey();
  const { t } = useLocale();

  // ─── Quick-start steps ─────────────────────────────────────────────────────

  const quickStart = [
    {
      step: '01',
      icon: FolderPlus,
      title: t('help.quickstart.01.title'),
      description: t('help.quickstart.01.description'),
      href: '/projects/new',
      cta: t('help.quickstart.01.cta'),
    },
    {
      step: '02',
      icon: UserPlus,
      title: t('help.quickstart.02.title'),
      description: t('help.quickstart.02.description'),
      href: null,
      cta: null,
    },
    {
      step: '03',
      icon: ListTodo,
      title: t('help.quickstart.03.title'),
      description: t('help.quickstart.03.description'),
      href: null,
      cta: null,
    },
    {
      step: '04',
      icon: Sparkles,
      title: t('help.quickstart.04.title'),
      description: t('help.quickstart.04.description'),
      href: null,
      cta: null,
    },
  ];

  // ─── Feature cards ─────────────────────────────────────────────────────────

  const features = [
    {
      icon: Layers,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      title: t('help.features.0.title'),
      description: t('help.features.0.description'),
    },
    {
      icon: CalendarRange,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      title: t('help.features.1.title'),
      description: t('help.features.1.description'),
    },
    {
      icon: Users,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      title: t('help.features.2.title'),
      description: t('help.features.2.description'),
    },
    {
      icon: BrainCircuit,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      title: t('help.features.3.title'),
      description: t('help.features.3.description'),
    },
    {
      icon: Mail,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      title: t('help.features.4.title'),
      description: t('help.features.4.description'),
    },
    {
      icon: Milestone,
      color: 'text-pink-500',
      bg: 'bg-pink-500/10',
      title: t('help.features.5.title'),
      description: t('help.features.5.description'),
    },
  ];

  // ─── FAQ ───────────────────────────────────────────────────────────────────

  const faqs = [
    { q: t('help.faq.q.0'), a: t('help.faq.a.0') },
    { q: t('help.faq.q.1'), a: t('help.faq.a.1') },
    { q: t('help.faq.q.2'), a: t('help.faq.a.2') },
    { q: t('help.faq.q.3'), a: t('help.faq.a.3') },
    { q: t('help.faq.q.4'), a: t('help.faq.a.4') },
    { q: t('help.faq.q.5'), a: t('help.faq.a.5') },
    { q: t('help.faq.q.6'), a: t('help.faq.a.6') },
    { q: t('help.faq.q.7'), a: t('help.faq.a.7') },
    { q: t('help.faq.q.8'), a: t('help.faq.a.8') },
  ];

  const shortcuts = [
    { keys: [modKey, 'K'], label: t('help.shortcuts.focusSearch') },
    { keys: ['Esc'], label: t('help.shortcuts.closeDropdown') },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      search.trim() === '' ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8 sm:space-y-12">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
          <HelpCircle size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('help.title')}</h1>
          <p className="text-foreground/50 text-sm mt-0.5">
            {t('help.subtitle')}
          </p>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/35" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('help.searchPlaceholder')}
          className="w-full bg-foreground/5 border border-border-glow rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all placeholder:text-foreground/35"
        />
      </div>

      {/* ── Quick start (hidden when searching) ── */}
      {search.trim() === '' && (
        <section>
          <h2 className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-5">
            {t('help.gettingStarted')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickStart.map((item) => (
              <GlassCard key={item.step} className="p-5 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                    <item.icon size={18} className="text-brand-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-brand-primary/50 tracking-widest">
                        {t('help.step', { step: item.step })}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm mb-1.5">{item.title}</h3>
                    <p className="text-xs text-foreground/50 leading-relaxed">{item.description}</p>
                  </div>
                </div>
                {item.href && (
                  <Link
                    href={item.href}
                    className="self-start flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-secondary transition-colors"
                  >
                    {item.cta}
                    <ArrowRight size={12} />
                  </Link>
                )}
              </GlassCard>
            ))}
          </div>
        </section>
      )}

      {/* ── Features (hidden when searching) ── */}
      {search.trim() === '' && (
        <section>
          <h2 className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-5">
            {t('help.features')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f) => (
              <GlassCard key={f.title} className="p-5 flex gap-4">
                <div
                  className={`w-9 h-9 rounded-xl ${f.bg} flex items-center justify-center shrink-0`}
                >
                  <f.icon size={18} className={f.color} />
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1.5">{f.title}</h3>
                  <p className="text-xs text-foreground/50 leading-relaxed">{f.description}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <section>
        <h2 className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-5">
          {search.trim() ? t('help.searchResults', { query: search }) : t('help.faq')}
        </h2>

        <GlassCard className="px-6 py-2">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)
          ) : (
            <div className="py-12 text-center">
              <p className="text-foreground/40 font-medium text-sm">
                {t('help.noResults', { query: search })}
              </p>
              <button
                onClick={() => setSearch('')}
                className="mt-3 text-brand-primary text-sm font-bold underline underline-offset-4"
              >
                {t('help.clearSearch')}
              </button>
            </div>
          )}
        </GlassCard>
      </section>

      {/* ── Keyboard shortcuts (hidden when searching) ── */}
      {search.trim() === '' && (
        <section>
          <h2 className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-5">
            {t('help.keyboardShortcuts')}
          </h2>
          <GlassCard className="px-6 py-2 divide-y divide-border-glow">
            {shortcuts.map((s) => (
              <div key={s.label} className="flex items-center justify-between py-3.5">
                <span className="text-sm text-foreground/60 font-medium">{s.label}</span>
                <div className="flex items-center gap-1">
                  {s.keys.map((k) => (
                    <kbd
                      key={k}
                      className="px-2 py-0.5 bg-foreground/8 border border-foreground/12 rounded-md text-xs font-mono text-foreground/50"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </GlassCard>
        </section>
      )}

      {/* ── Contact / support ── */}
      {search.trim() === '' && (
        <section>
          <h2 className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-5">
            {t('help.stillNeedHelp')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GlassCard className="p-5 flex flex-col gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <ExternalLink size={18} className="text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">{t('help.reportBug')}</h3>
                <p className="text-xs text-foreground/45 leading-relaxed mb-3">
                  {t('help.reportBugDesc')}
                </p>
                <a
                  href="https://github.com/anthropics/claude-code/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-brand-primary hover:text-brand-secondary transition-colors flex items-center gap-1"
                >
                  {t('help.openGitHub')} <ExternalLink size={11} />
                </a>
              </div>
            </GlassCard>

            <GlassCard className="p-5 flex flex-col gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Key size={18} className="text-green-500" />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">{t('help.resetPassword')}</h3>
                <p className="text-xs text-foreground/45 leading-relaxed mb-3">
                  {t('help.resetPasswordDesc')}
                </p>
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-brand-primary hover:text-brand-secondary transition-colors flex items-center gap-1"
                >
                  {t('help.passwordResetLink')} <ArrowRight size={11} />
                </Link>
              </div>
            </GlassCard>

          </div>
        </section>
      )}
    </div>
  );
}
