import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  SlidersHorizontal,
  UserCheck,
  AlertTriangle,
  Clock3,
  CircleDot,
  Bug,
  Sparkles,
  MessageSquare,
  CalendarDays,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

const issues = [
  {
    key: "SYNC-128",
    type: "Bug",
    title: "Login redirects incorrectly after email verification",
    project: "SyncMind Web",
    status: "In Progress",
    priority: "High",
    assignee: "Win Thiha",
    due: "Today",
    comments: 4,
    updated: "12m ago",
    ai: true,
  },
  {
    key: "SYNC-121",
    type: "Task",
    title: "Add dedicated issue filters page",
    project: "SyncMind Web",
    status: "Open",
    priority: "Medium",
    assignee: "Unassigned",
    due: "This week",
    comments: 2,
    updated: "Yesterday",
    ai: false,
  },
  {
    key: "SYNC-117",
    type: "Feature",
    title: "Support milestone timeline preview on dashboard",
    project: "Schedule Tracker",
    status: "Review",
    priority: "High",
    assignee: "Win Thiha",
    due: "May 20",
    comments: 8,
    updated: "2h ago",
    ai: true,
  },
  {
    key: "SYNC-109",
    type: "Bug",
    title: "Pending invitation empty state needs dark mode audit",
    project: "Email Invite",
    status: "Blocked",
    priority: "Critical",
    assignee: "Maya Chen",
    due: "Overdue",
    comments: 6,
    updated: "30m ago",
    ai: false,
  },
];

const quickFilters = [
  { label: "All", icon: CircleDot },
  { label: "Assigned to Me", icon: UserCheck },
  { label: "Overdue", icon: AlertTriangle },
  { label: "High Priority", icon: AlertTriangle },
  { label: "Recently Updated", icon: Clock3 },
  { label: "Unassigned", icon: UserCheck },
];

const summaryCards = [
  { label: "Assigned to Me", value: 12, icon: UserCheck, note: "Across 4 projects" },
  { label: "Overdue", value: 3, icon: AlertTriangle, note: "Needs attention" },
  { label: "High Priority", value: 5, icon: AlertTriangle, note: "Open or in progress" },
  { label: "Unassigned", value: 7, icon: UserCheck, note: "Ready for triage" },
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Badge({ children, tone = "default" }) {
  const tones = {
    default: "border-white/15 bg-white/10 text-slate-200",
    high: "border-amber-300/30 bg-amber-300/10 text-amber-100",
    critical: "border-rose-300/30 bg-rose-400/10 text-rose-100",
    success: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
    blue: "border-sky-300/30 bg-sky-400/10 text-sky-100",
    muted: "border-white/10 bg-white/5 text-slate-300",
  };
  return (
    <span className={cx("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", tones[tone])}>
      {children}
    </span>
  );
}

function SelectPill({ label, value }) {
  return (
    <button className="group flex min-w-[150px] items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-left shadow-sm transition hover:bg-white/[0.1]">
      <span>
        <span className="block text-[11px] uppercase tracking-[0.2em] text-slate-400">{label}</span>
        <span className="mt-1 block text-sm font-medium text-slate-100">{value}</span>
      </span>
      <ChevronDown className="h-4 w-4 text-slate-400 transition group-hover:text-slate-200" />
    </button>
  );
}

function IssueIcon({ type }) {
  if (type === "Bug") return <Bug className="h-4 w-4" />;
  if (type === "Feature") return <Sparkles className="h-4 w-4" />;
  return <CheckCircle2 className="h-4 w-4" />;
}

export default function SyncMindIssuesPreview() {
  const [activeFilter, setActiveFilter] = useState("Assigned to Me");

  const visibleIssues = useMemo(() => {
    if (activeFilter === "Assigned to Me") return issues.filter((issue) => issue.assignee === "Win Thiha");
    if (activeFilter === "Overdue") return issues.filter((issue) => issue.due === "Overdue");
    if (activeFilter === "High Priority") return issues.filter((issue) => ["High", "Critical"].includes(issue.priority));
    if (activeFilter === "Unassigned") return issues.filter((issue) => issue.assignee === "Unassigned");
    return issues;
  }, [activeFilter]);

  return (
    <div className="min-h-screen overflow-hidden bg-[#080b18] p-6 text-slate-100">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-[-8%] top-[15%] h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute bottom-[-12%] left-[25%] h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-7xl">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-7"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Dedicated issues menu
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Issues</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Showing work assigned to you across all projects. Filter, prioritize, and move issues forward from one focused view.
              </p>
            </div>

            <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-white/10 transition hover:scale-[1.02] active:scale-[0.98]">
              <Plus className="h-4 w-4" /> New Issue
            </button>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              const active = activeFilter === card.label;
              return (
                <button
                  key={card.label}
                  onClick={() => setActiveFilter(card.label)}
                  className={cx(
                    "rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/[0.09]",
                    active ? "border-cyan-300/40 bg-cyan-300/10" : "border-white/10 bg-white/[0.055]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-2xl border border-white/10 bg-white/10 p-2">
                      <Icon className="h-4 w-4 text-cyan-100" />
                    </span>
                    <span className="text-2xl font-semibold text-white">{card.value}</span>
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-100">{card.label}</p>
                  <p className="mt-1 text-xs text-slate-400">{card.note}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/[0.07] py-4 pl-12 pr-24 text-sm text-white outline-none ring-cyan-300/40 placeholder:text-slate-500 focus:ring-4"
                placeholder="Search issues, keys, descriptions, projects..."
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-xs text-slate-400">
                Ctrl K
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {quickFilters.map((filter) => {
                const Icon = filter.icon;
                const active = activeFilter === filter.label;
                return (
                  <button
                    key={filter.label}
                    onClick={() => setActiveFilter(filter.label)}
                    className={cx(
                      "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition",
                      active
                        ? "border-cyan-300/50 bg-cyan-300/15 text-cyan-50 shadow-lg shadow-cyan-950/30"
                        : "border-white/10 bg-white/[0.06] text-slate-300 hover:bg-white/[0.1]"
                    )}
                  >
                    <Icon className="h-4 w-4" /> {filter.label}
                    {active && <span className="ml-0.5 text-cyan-200">✓</span>}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              <SelectPill label="Project" value="All projects" />
              <SelectPill label="Status" value="Open + active" />
              <SelectPill label="Assignee" value="Win Thiha" />
              <SelectPill label="Priority" value="Any priority" />
              <SelectPill label="Type" value="Any type" />
              <SelectPill label="Due date" value="Any date" />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">{visibleIssues.length} matching issues</h2>
              <p className="text-sm text-slate-400">Sorted by recently updated</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/[0.1]">
              More filters <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {visibleIssues.map((issue, index) => (
              <motion.article
                key={issue.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                className="group rounded-3xl border border-white/10 bg-white/[0.055] p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.085] md:p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge tone="blue">
                        <span className="mr-1.5 inline-flex"><IssueIcon type={issue.type} /></span>
                        {issue.type}
                      </Badge>
                      <span className="text-xs font-semibold tracking-wide text-slate-400">{issue.key}</span>
                      {issue.ai && <Badge tone="success"><Sparkles className="mr-1.5 h-3 w-3" /> AI summary ready</Badge>}
                    </div>
                    <h3 className="text-base font-semibold leading-6 text-white transition group-hover:text-cyan-100 md:text-lg">
                      {issue.title}
                    </h3>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
                      <span>{issue.project}</span>
                      <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:inline-block" />
                      <span>{issue.status}</span>
                      <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:inline-block" />
                      <span>{issue.assignee}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <Badge tone={issue.priority === "Critical" ? "critical" : issue.priority === "High" ? "high" : "muted"}>
                      {issue.priority}
                    </Badge>
                    <Badge tone={issue.due === "Overdue" ? "critical" : issue.due === "Today" ? "high" : "default"}>
                      <CalendarDays className="mr-1.5 h-3 w-3" /> {issue.due}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-slate-400">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> {issue.comments} comments</span>
                    <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> Updated {issue.updated}</span>
                  </div>
                  <button className="rounded-full px-3 py-1.5 font-medium text-cyan-100 transition hover:bg-cyan-300/10">Open issue</button>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
