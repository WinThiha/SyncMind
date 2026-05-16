import React from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  FolderKanban,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  Users,
  MessageSquare,
  Sparkles,
  Pin,
  ArrowUpRight,
  CalendarDays,
} from "lucide-react";

const summaryCards = [
  {
    label: "Active Projects",
    value: "8",
    helper: "+2 updated today",
    icon: FolderKanban,
  },
  {
    label: "My Open Issues",
    value: "14",
    helper: "5 in progress",
    icon: Clock3,
  },
  {
    label: "Due Soon",
    value: "6",
    helper: "Next 7 days",
    icon: CalendarDays,
  },
  {
    label: "Overdue",
    value: "3",
    helper: "Needs attention",
    icon: AlertTriangle,
  },
];

const myWork = [
  {
    key: "SYNC-42",
    title: "Add dashboard summary API",
    project: "SyncMind Core",
    status: "In Progress",
    priority: "High",
    due: "Today",
  },
  {
    key: "SYNC-39",
    title: "Improve pending invitation empty state",
    project: "Member Management",
    status: "Review",
    priority: "Medium",
    due: "Tomorrow",
  },
  {
    key: "SYNC-31",
    title: "Wire topbar search to global results",
    project: "App Shell",
    status: "Todo",
    priority: "High",
    due: "May 20",
  },
];

const projects = [
  {
    name: "SyncMind Core",
    key: "SYNC",
    role: "Owner",
    members: 6,
    open: 18,
    progress: 68,
    overdue: 2,
    milestone: "Dashboard cockpit",
    pinned: true,
  },
  {
    name: "Mobile Companion",
    key: "MOB",
    role: "Admin",
    members: 4,
    open: 9,
    progress: 42,
    overdue: 1,
    milestone: "MVP planning",
    pinned: false,
  },
  {
    name: "Internal QA Flow",
    key: "QA",
    role: "Member",
    members: 3,
    open: 5,
    progress: 81,
    overdue: 0,
    milestone: "Smoke test suite",
    pinned: false,
  },
];

const activities = [
  {
    icon: MessageSquare,
    text: "Alice commented on SYNC-42",
    time: "12 min ago",
  },
  {
    icon: CheckCircle2,
    text: "Bob moved SYNC-29 to Done",
    time: "48 min ago",
  },
  {
    icon: Users,
    text: "Mina accepted invitation to SyncMind Core",
    time: "2h ago",
  },
  {
    icon: Sparkles,
    text: "AI suggested 3 similar issues for SYNC-31",
    time: "3h ago",
  },
];

function GlassCard({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-3xl border border-white/40 bg-white/65 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

function Pill({ children }) {
  return (
    <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-xs font-medium text-slate-600">
      {children}
    </span>
  );
}

export default function SyncMindDashboardExample() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dbeafe,_transparent_32%),linear-gradient(135deg,_#f8fafc,_#eef2ff_45%,_#f8fafc)] p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur">
              <Sparkles size={14} /> Operational cockpit
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Welcome back, Win</h1>
            <p className="mt-2 text-sm text-slate-600 md:text-base">
              Here is what needs attention across your projects today.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex min-w-72 items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-slate-500 shadow-sm backdrop-blur">
              <Search size={17} />
              Search projects, issues, or commands
              <span className="ml-auto rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">⌘K</span>
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:shadow-xl">
              <Plus size={17} /> Create Project
            </button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <GlassCard key={card.label}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{card.label}</p>
                    <p className="mt-3 text-3xl font-bold">{card.value}</p>
                    <p className="mt-1 text-xs text-slate-500">{card.helper}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-950/90 p-3 text-white shadow-lg">
                    <Icon size={18} />
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </section>

        <main className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
          <div className="space-y-6">
            <GlassCard>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">My Work</h2>
                  <p className="text-sm text-slate-500">Assigned issues ordered by urgency.</p>
                </div>
                <button className="text-sm font-semibold text-slate-700 hover:text-slate-950">View all</button>
              </div>

              <div className="space-y-3">
                {myWork.map((issue) => (
                  <div
                    key={issue.key}
                    className="group rounded-2xl border border-slate-200/70 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-lg bg-slate-950 px-2 py-1 text-xs font-bold text-white">{issue.key}</span>
                          <span className="text-xs font-medium text-slate-500">{issue.project}</span>
                        </div>
                        <h3 className="font-semibold text-slate-900 group-hover:underline">{issue.title}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2 md:justify-end">
                        <Pill>{issue.status}</Pill>
                        <Pill>{issue.priority}</Pill>
                        <Pill>Due {issue.due}</Pill>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Project Health</h2>
                  <p className="text-sm text-slate-500">Pinned and recently active projects.</p>
                </div>
                <button className="text-sm font-semibold text-slate-700 hover:text-slate-950">Manage projects</button>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                {projects.map((project) => (
                  <GlassCard key={project.key} className="group">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-slate-700 shadow-sm">{project.key}</span>
                          <Pill>{project.role}</Pill>
                        </div>
                        <h3 className="text-lg font-bold">{project.name}</h3>
                      </div>
                      <div className="flex gap-2 text-slate-500">
                        {project.pinned && <Pin size={16} />}
                        <ArrowUpRight size={17} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>

                    <p className="mb-4 text-sm text-slate-500">Current milestone: {project.milestone}</p>

                    <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-slate-950" style={{ width: `${project.progress}%` }} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-2xl bg-white/70 p-3">
                        <p className="text-lg font-bold">{project.open}</p>
                        <p className="text-[11px] text-slate-500">Open</p>
                      </div>
                      <div className="rounded-2xl bg-white/70 p-3">
                        <p className="text-lg font-bold">{project.overdue}</p>
                        <p className="text-[11px] text-slate-500">Overdue</p>
                      </div>
                      <div className="rounded-2xl bg-white/70 p-3">
                        <p className="text-lg font-bold">{project.members}</p>
                        <p className="text-[11px] text-slate-500">Members</p>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <GlassCard>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Upcoming</h2>
                  <p className="text-sm text-slate-500">Schedule risks and deadlines.</p>
                </div>
                <CalendarDays size={19} className="text-slate-500" />
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                  <p className="text-sm font-bold text-amber-900">Sprint 3 deadline</p>
                  <p className="mt-1 text-xs text-amber-700">Ends in 2 days · 6 issues remaining</p>
                </div>
                <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4">
                  <p className="text-sm font-bold text-red-900">Invitation QA milestone</p>
                  <p className="mt-1 text-xs text-red-700">Overdue by 1 day · smoke test pending</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                  <p className="text-sm font-bold text-slate-800">Search command palette</p>
                  <p className="mt-1 text-xs text-slate-500">Starts next week</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Recent Activity</h2>
                  <p className="text-sm text-slate-500">Latest movement from your teams.</p>
                </div>
              </div>

              <div className="space-y-4">
                {activities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex gap-3">
                      <div className="mt-0.5 rounded-2xl bg-white p-2 shadow-sm">
                        <Icon size={15} className="text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{activity.text}</p>
                        <p className="mt-1 text-xs text-slate-500">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </aside>
        </main>
      </div>
    </div>
  );
}
