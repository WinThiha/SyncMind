'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, RefreshCw, AlertTriangle, CheckCircle, XCircle, Loader2, Plus } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import {
  summarizeMilestone,
  analyzeMilestoneRisk,
  suggestMilestoneIssues,
  type MilestoneSummaryResult,
  type MilestoneRiskResult,
  type MilestoneIssueSuggestion,
} from '@/lib/api/milestones-ai';
import { updateIssue } from '@/lib/api/issues';
import { useLocale } from '@/context/LocaleContext';
import { FAST_SPRING } from '@/lib/animations';

interface Props {
  projectId: string;
  milestoneId: string;
}

const verdictConfig = {
  on_track: {
    icon: CheckCircle,
    labelKey: 'milestones.ai.verdictOnTrack',
    className: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
  at_risk: {
    icon: AlertTriangle,
    labelKey: 'milestones.ai.verdictAtRisk',
    className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  critical: {
    icon: XCircle,
    labelKey: 'milestones.ai.verdictCritical',
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
};

export function MilestoneAIPanel({ projectId, milestoneId }: Props) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  const [summary, setSummary] = useState<MilestoneSummaryResult | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [risk, setRisk] = useState<MilestoneRiskResult | null>(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskError, setRiskError] = useState<string | null>(null);

  const [issueSuggestions, setIssueSuggestions] = useState<MilestoneIssueSuggestion[] | null>(null);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [issuesError, setIssuesError] = useState<string | null>(null);
  const [addingIssueId, setAddingIssueId] = useState<number | null>(null);

  async function handleSummarize(force = false) {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const res = await summarizeMilestone(projectId, milestoneId, force);
      setSummary(res.data);
    } catch {
      setSummaryError(t('milestones.ai.errorGeneric'));
    } finally {
      setSummaryLoading(false);
    }
  }

  async function handleRiskAnalysis(force = false) {
    setRiskLoading(true);
    setRiskError(null);
    try {
      const res = await analyzeMilestoneRisk(projectId, milestoneId, force);
      setRisk(res.data);
    } catch {
      setRiskError(t('milestones.ai.errorGeneric'));
    } finally {
      setRiskLoading(false);
    }
  }

  async function handleSuggestIssues() {
    setIssuesLoading(true);
    setIssuesError(null);
    try {
      const res = await suggestMilestoneIssues(projectId, milestoneId);
      setIssueSuggestions(res.data);
    } catch {
      setIssuesError(t('milestones.ai.errorGeneric'));
    } finally {
      setIssuesLoading(false);
    }
  }

  async function handleAddIssue(suggestion: MilestoneIssueSuggestion) {
    setAddingIssueId(suggestion.issue_id);
    try {
      await updateIssue(projectId, suggestion.key, { milestone_id: parseInt(milestoneId) });
      setIssueSuggestions((prev) => prev?.filter((s) => s.issue_id !== suggestion.issue_id) ?? null);
    } catch {
      // silently fail — the user can retry
    } finally {
      setAddingIssueId(null);
    }
  }

  return (
    <GlassCard className="mb-8 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-foreground/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-brand-primary" />
          <span className="font-bold text-sm">{t('milestones.ai.panelTitle')}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-foreground/40" /> : <ChevronDown size={16} className="text-foreground/40" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="ai-panel-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={FAST_SPRING}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-6 border-t border-foreground/5 pt-5">

              {/* Summary */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Summary</h3>
                  {summary ? (
                    <button
                      onClick={() => handleSummarize(true)}
                      disabled={summaryLoading}
                      className="flex items-center gap-1 text-xs text-foreground/40 hover:text-foreground/70 transition-colors"
                    >
                      <RefreshCw size={12} className={summaryLoading ? 'animate-spin' : ''} />
                      {t('milestones.ai.regenerate')}
                    </button>
                  ) : null}
                </div>
                {!summary && !summaryLoading && !summaryError && (
                  <GlassButton size="sm" variant="secondary" onClick={() => handleSummarize()}>
                    <Sparkles size={12} />
                    {t('milestones.ai.summarize')}
                  </GlassButton>
                )}
                {summaryLoading && <LoadingDots label={t('milestones.ai.loading')} />}
                {summaryError && <ErrorNote message={summaryError} />}
                {summary && (
                  <p className="text-sm text-foreground/80 leading-relaxed">{summary.summary}</p>
                )}
              </section>

              {/* Risk Analysis */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Risk Analysis</h3>
                  {risk ? (
                    <button
                      onClick={() => handleRiskAnalysis(true)}
                      disabled={riskLoading}
                      className="flex items-center gap-1 text-xs text-foreground/40 hover:text-foreground/70 transition-colors"
                    >
                      <RefreshCw size={12} className={riskLoading ? 'animate-spin' : ''} />
                      {t('milestones.ai.regenerate')}
                    </button>
                  ) : null}
                </div>
                {!risk && !riskLoading && !riskError && (
                  <GlassButton size="sm" variant="secondary" onClick={() => handleRiskAnalysis()}>
                    <Sparkles size={12} />
                    {t('milestones.ai.analyzeRisk')}
                  </GlassButton>
                )}
                {riskLoading && <LoadingDots label={t('milestones.ai.loading')} />}
                {riskError && <ErrorNote message={riskError} />}
                {risk && (
                  <div className="space-y-3">
                    <VerdictBadge verdict={risk.verdict} label={t(`milestones.ai.verdict${capitalize(toCamel(risk.verdict))}`)} />
                    {risk.signals.length > 0 && (
                      <ul className="space-y-1">
                        {risk.signals.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground/30 shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}
                    {risk.recommendation && (
                      <p className="text-xs text-foreground/60 italic">{risk.recommendation}</p>
                    )}
                  </div>
                )}
              </section>

              {/* Issue Suggestions */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Issue Suggestions</h3>
                </div>
                {issueSuggestions === null && !issuesLoading && !issuesError && (
                  <GlassButton size="sm" variant="secondary" onClick={handleSuggestIssues}>
                    <Sparkles size={12} />
                    {t('milestones.ai.suggestIssues')}
                  </GlassButton>
                )}
                {issuesLoading && <LoadingDots label={t('milestones.ai.loading')} />}
                {issuesError && <ErrorNote message={issuesError} />}
                {issueSuggestions !== null && issueSuggestions.length === 0 && (
                  <p className="text-sm text-foreground/40">{t('milestones.ai.noSuggestions')}</p>
                )}
                {issueSuggestions && issueSuggestions.length > 0 && (
                  <div className="space-y-2">
                    {issueSuggestions.map((s) => (
                      <motion.div
                        key={s.issue_id}
                        layout
                        transition={FAST_SPRING}
                        className="glass-card p-3 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold font-mono text-foreground/40">{s.key}</span>
                            <span className="text-sm font-medium truncate">{s.summary}</span>
                          </div>
                          <p className="text-xs text-foreground/50">{s.reason}</p>
                          <div className="mt-1.5 w-full h-1 bg-foreground/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-primary/60 rounded-full"
                              style={{ width: `${Math.round(s.score * 100)}%` }}
                            />
                          </div>
                        </div>
                        <GlassButton
                          size="sm"
                          variant="secondary"
                          disabled={addingIssueId === s.issue_id}
                          onClick={() => handleAddIssue(s)}
                          className="shrink-0"
                        >
                          {addingIssueId === s.issue_id
                            ? <Loader2 size={12} className="animate-spin" />
                            : <Plus size={12} />}
                          {t('milestones.ai.addToMilestone')}
                        </GlassButton>
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

function LoadingDots({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-foreground/40">
      <Loader2 size={14} className="animate-spin" />
      {label}
    </div>
  );
}

function ErrorNote({ message }: { message: string }) {
  return (
    <p className="text-sm text-red-500/80">{message}</p>
  );
}

function VerdictBadge({ verdict, label }: { verdict: 'on_track' | 'at_risk' | 'critical'; label: string }) {
  const cfg = verdictConfig[verdict] ?? verdictConfig.at_risk;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.className}`}>
      <Icon size={12} />
      {label}
    </span>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function toCamel(s: string) {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}
