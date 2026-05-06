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

// ─── Quick-start steps ───────────────────────────────────────────────────────

const quickStart = [
  {
    step: '01',
    icon: FolderPlus,
    title: 'Create a project',
    description:
      'Click "Create New Project" on the dashboard. Give it a name, a short key (e.g. PROJ), and pick the issue types your team uses.',
    href: '/projects/new',
    cta: 'Create project',
  },
  {
    step: '02',
    icon: UserPlus,
    title: 'Invite your team',
    description:
      'Open the project, scroll to Members, and enter an email address. Existing users are added instantly; new users receive an invite link.',
    href: null,
    cta: null,
  },
  {
    step: '03',
    icon: ListTodo,
    title: 'Track issues',
    description:
      'Create issues for every task or bug. Assign them, set priorities, link to a milestone, and add a due date to keep the team aligned.',
    href: null,
    cta: null,
  },
  {
    step: '04',
    icon: Sparkles,
    title: 'Use AI features',
    description:
      'Let the AI auto-fill issue fields from a short summary, find similar issues semantically, or summarise long comment threads in one click.',
    href: null,
    cta: null,
  },
];

// ─── Feature cards ────────────────────────────────────────────────────────────

const features = [
  {
    icon: Layers,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    title: 'Issues',
    description:
      'The core unit of work. Each issue gets a unique key (e.g. PROJ-12), status, priority, assignee, due date, and milestone link. Full edit history is kept automatically.',
  },
  {
    icon: CalendarRange,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    title: 'Milestones',
    description:
      'Group issues into time-boxed milestones with a start date, due date, and status. Progress is calculated live from the linked issues so you always know where the release stands.',
  },
  {
    icon: Users,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    title: 'Team members',
    description:
      'Two roles: Admin (can manage members, settings, and milestones) and Normal (can create and update issues). Admins can transfer ownership or invite people by email.',
  },
  {
    icon: BrainCircuit,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    title: 'AI assistant',
    description:
      'Three AI capabilities built in: field auto-fill from a summary, semantic issue search (finds related issues even with different wording), and comment thread summarisation.',
  },
  {
    icon: Mail,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    title: 'Email invitations',
    description:
      'Add someone who isn\'t registered yet and SyncMind sends them an invite email. The link takes them straight into the project after they create an account.',
  },
  {
    icon: Milestone,
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
    title: 'Issue history',
    description:
      'Every field change on an issue — status, priority, assignee — is recorded with a timestamp and the user who made the change. Nothing gets lost silently.',
  },
];

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: 'What is the difference between Admin and Normal member roles?',
    a: 'Admins can invite or remove members, update project settings, create and edit milestones, and transfer ownership. Normal members can create, update, and comment on issues but cannot change project membership or settings.',
  },
  {
    q: 'How do I invite someone who does not have a SyncMind account yet?',
    a: 'Enter their email in the Members panel just like any other invite. SyncMind detects that the email is not registered, creates a pending invitation, and emails them a link. The link is valid for 7 days. You can cancel a pending invite from the Members panel at any time.',
  },
  {
    q: 'What are issue keys and how are they assigned?',
    a: 'Every project has a short uppercase key (e.g. PROJ). Issues are numbered sequentially within the project, producing keys like PROJ-1, PROJ-2, and so on. Keys are permanent — they are never reused even if an issue is deleted.',
  },
  {
    q: 'How does the AI issue auto-fill work?',
    a: 'Type a short summary on the Create Issue form and click the AI suggest button. The AI reads the summary and returns suggested values for type, priority, status, and up to three assignee recommendations with a reason for each. You can accept or override any suggestion.',
  },
  {
    q: 'How does semantic issue search work?',
    a: 'Each issue is converted to a vector embedding when it is created or updated. The search uses cosine similarity against those embeddings, so it finds conceptually related issues even when the exact words differ — useful for spotting duplicates before creating a new issue.',
  },
  {
    q: 'How do milestones relate to issues?',
    a: 'Milestones are independent records with their own start date, due date, and status. You link an issue to a milestone by setting its Milestone field. The milestone\'s progress bar reflects the percentage of linked issues that are in a completed status.',
  },
  {
    q: 'Can I change my email address?',
    a: 'Yes — go to Settings and update the Email field. The change takes effect immediately. If your new address is already taken by another account, validation will prevent the update.',
  },
  {
    q: 'I forgot my password. What should I do?',
    a: 'Click "Forgot password?" on the login screen. Enter your email and SyncMind will send a reset link that is valid for 60 minutes. The link takes you to a form where you can set a new password.',
  },
  {
    q: 'Does SyncMind support Google login?',
    a: 'Yes. Click "Continue with Google" on the login or register page. If the Google email matches an existing account, you are logged in directly. If not, you are taken to a short form to complete registration.',
  },
];

// Shortcuts are built dynamically in the component using the platform modifier key.

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

  const shortcuts = [
    { keys: [modKey, 'K'], label: 'Focus search bar' },
    { keys: ['Esc'], label: 'Close dropdown / blur search' },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      search.trim() === '' ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
          <HelpCircle size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
          <p className="text-foreground/50 text-sm mt-0.5">
            Everything you need to get the most out of SyncMind.
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
          placeholder="Search for a topic or question..."
          className="w-full bg-foreground/5 border border-border-glow rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all placeholder:text-foreground/35"
        />
      </div>

      {/* ── Quick start (hidden when searching) ── */}
      {search.trim() === '' && (
        <section>
          <h2 className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-5">
            Getting started
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
                        STEP {item.step}
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
            Features
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
          {search.trim() ? `Results for "${search}"` : 'Frequently asked questions'}
        </h2>

        <GlassCard className="px-6 py-2">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)
          ) : (
            <div className="py-12 text-center">
              <p className="text-foreground/40 font-medium text-sm">
                No results found for &ldquo;{search}&rdquo;
              </p>
              <button
                onClick={() => setSearch('')}
                className="mt-3 text-brand-primary text-sm font-bold underline underline-offset-4"
              >
                Clear search
              </button>
            </div>
          )}
        </GlassCard>
      </section>

      {/* ── Keyboard shortcuts (hidden when searching) ── */}
      {search.trim() === '' && (
        <section>
          <h2 className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-5">
            Keyboard shortcuts
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
            Still need help?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GlassCard className="p-5 flex flex-col gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <ExternalLink size={18} className="text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">Report a bug</h3>
                <p className="text-xs text-foreground/45 leading-relaxed mb-3">
                  Found something broken? Open an issue on GitHub.
                </p>
                <a
                  href="https://github.com/anthropics/claude-code/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-brand-primary hover:text-brand-secondary transition-colors flex items-center gap-1"
                >
                  Open GitHub <ExternalLink size={11} />
                </a>
              </div>
            </GlassCard>

            <GlassCard className="p-5 flex flex-col gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Key size={18} className="text-green-500" />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">Reset password</h3>
                <p className="text-xs text-foreground/45 leading-relaxed mb-3">
                  Can&apos;t log in? Request a reset link via email.
                </p>
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-brand-primary hover:text-brand-secondary transition-colors flex items-center gap-1"
                >
                  Reset password <ArrowRight size={11} />
                </Link>
              </div>
            </GlassCard>

          </div>
        </section>
      )}
    </div>
  );
}
