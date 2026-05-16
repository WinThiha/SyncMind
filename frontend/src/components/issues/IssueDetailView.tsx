'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useLocale } from '@/context/LocaleContext';
import { confirmAction } from '@/lib/alert';
import MarkdownEditor from '../shared/MarkdownEditor';
import { 
  X, 
  Tag, 
  Calendar, 
  MessageSquare, 
  History, 
  User, 
  Clock,
  Send,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronDown,
  Edit2,
  ArrowRight,
  Maximize2,
  Sparkles
} from 'lucide-react';
import { GlassButton } from '@/components/ui/GlassButton';
import { BASE_SPRING } from '@/lib/animations';
import { getIssue, createIssueComment, updateIssue, summarizeIssue, ThreadSummary } from '@/lib/api/issues';
import SummaryCard from './SummaryCard';
import { getProjectMembers, ProjectMember } from '@/lib/api/projects';
import { useAuth } from '@/context/AuthContext';
import { useActivityEntities } from './hooks/useActivityEntities';

interface Issue {
  id: number;
  project_id: number | string;
  key: string;
  summary: string;
  description: string;
  status: string;
  priority: string;
  assigned_to?: { id: number; name: string; avatar?: string };
  assignee?: { id: number; name: string; avatar?: string };
  assignee_id?: number;
  created_at: string;
  comments?: any[];
  history?: any[];
  estimated_hours?: number | string;
  actual_hours?: number | string;
}

interface IssueDetailViewProps {
  issue: Issue;
  onIssueMutated?: () => Promise<void> | void;
  onClose: () => void;
}

export const IssueDetailView: React.FC<IssueDetailViewProps> = ({ issue: initialIssue, onIssueMutated, onClose }) => {
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);
  const [issue, setIssue] = useState<Issue>(initialIssue);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  
  // AI Summary State
  const [summary, setSummary] = useState<ThreadSummary | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const handleSummarize = async (force = false) => {
    setSummarizing(true);
    setSummaryError(null);
    try {
      const result = await summarizeIssue(issue.project_id, issue.key, force);
      setSummary(result);
    } catch (err: any) {
      setSummaryError(t('issues.detail.summaryError'));
    } finally {
      setSummarizing(false);
    }
  };
  
  const [quickData, setQuickData] = useState({
    status: '',
    priority: '',
    assignee_id: '',
    estimated_hours: '',
    actual_hours: ''
  });
  
  const { user } = useAuth();

  useEffect(() => {
    loadIssueDetails();
    loadMembers();
  }, [initialIssue.id, initialIssue.key, initialIssue.project_id]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const loadIssueDetails = async () => {
    setLoading(true);
    try {
      const data = await getIssue(initialIssue.project_id, initialIssue.key);
      setIssue(data);
      setQuickData({
        status: data.status,
        priority: data.priority,
        assignee_id: data.assignee_id?.toString() || '',
        estimated_hours: data.estimated_hours?.toString() || '',
        actual_hours: data.actual_hours?.toString() || ''
      });
    } catch (err) {
      console.error('Failed to load issue details', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const data = await getProjectMembers(initialIssue.project_id);
      setMembers(data);
    } catch (err) {
      console.error('Failed to load members', err);
    }
  };

  const handleDiscardComment = async () => {
    if (!newComment.trim()) { setIsEditorFocused(false); return; }
    const ok = await confirmAction({
      title: t('common.areYouSure'),
      text: t('issues.detail.discardConfirm'),
      confirmText: t('common.discard'),
      cancelText: t('common.cancel'),
    });
    if (ok) { setNewComment(''); setIsEditorFocused(false); }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasDataChanges = 
      quickData.status !== issue.status || 
      quickData.priority !== issue.priority ||
      quickData.assignee_id !== (issue.assignee_id?.toString() || '') ||
      quickData.estimated_hours !== (issue.estimated_hours?.toString() || '') ||
      quickData.actual_hours !== (issue.actual_hours?.toString() || '');

    if (!newComment.trim() && !hasDataChanges) return;

    setSubmittingComment(true);
    try {
      if (hasDataChanges) {
        await updateIssue(issue.project_id, issue.key, {
          status: quickData.status,
          priority: quickData.priority,
          assignee_id: quickData.assignee_id ? parseInt(quickData.assignee_id) : null,
          estimated_hours: quickData.estimated_hours ? parseFloat(quickData.estimated_hours) : null,
          actual_hours: quickData.actual_hours ? parseFloat(quickData.actual_hours) : null
        });
      }
      if (newComment.trim()) {
        await createIssueComment(issue.project_id, issue.key, { content: newComment });
      }
      setNewComment('');
      setIsEditorFocused(false);
      await loadIssueDetails();
      if (onIssueMutated) {
        await onIssueMutated();
      }
    } catch (err) {
      console.error('Failed to update issue or add comment', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const { activityEntities } = useActivityEntities(
    issue.comments || [],
    issue.history || [],
    {
      members,
      resolveAssignee: (oldValue, newValue) => {
        const oldMember = members.find(m => m.id.toString() === oldValue?.toString());
        const newMember = members.find(m => m.id.toString() === newValue?.toString());
        return {
          displayField: t('issues.create.assignee').toLowerCase(),
          displayOld: oldMember ? oldMember.name : (oldValue || t('issues.history.none')),
          displayNew: newMember ? newMember.name : (newValue || t('issues.history.none')),
        };
      },
    },
  );

  const currentAssignee = issue.assignee || issue.assigned_to;
  const overlay = (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]" />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={BASE_SPRING} className="fixed right-0 top-0 h-full w-full max-w-3xl z-[101] bg-background border-l border-border-glow shadow-2xl flex flex-col">
        <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 border-b border-border-glow">
          <div className="flex items-center gap-2 min-w-0">
            <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-bold px-2.5 py-1 rounded-full border border-brand-primary/20 shrink-0">{issue.key}</span>
            <h3 className="font-bold text-base sm:text-lg line-clamp-1 min-w-0">{issue.summary}</h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href={`/projects/${issue.project_id}/issues/${issue.key}/edit`}>
              <GlassButton variant="ghost" size="sm" className="gap-1.5">
                <Edit2 size={13} />
                <span className="hidden sm:inline">{t('issues.detail.edit')}</span>
              </GlassButton>
            </Link>
            <button onClick={onClose} className="p-1.5 hover:bg-foreground/5 rounded-full transition-colors text-foreground/40 hover:text-foreground"><X size={20} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8">
          <div className="max-w-3xl mx-auto space-y-12">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-brand-primary"><FileText size={18} /><h4 className="text-sm font-bold uppercase tracking-widest">{t('issues.create.description')}</h4></div>
              <div className="p-6 bg-foreground/[0.03] rounded-3xl text-sm leading-relaxed border border-border-glow/30 whitespace-pre-wrap shadow-inner min-h-[100px]">{issue.description || t('issues.detail.noDescription')}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 pt-6">
                <div className="space-y-4"><h4 className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{t('issues.edit.status')}</h4><div className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-xl text-xs font-bold border border-brand-primary/10 w-fit"><CheckCircle2 size={14} />{issue.status?.toUpperCase()}</div></div>
                <div className="space-y-4"><h4 className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{t('issues.create.priority')}</h4><div className="flex items-center gap-2 px-4 py-2 bg-foreground/5 text-foreground/60 rounded-xl text-xs font-bold border border-foreground/10 w-fit"><AlertCircle size={14} />{issue.priority?.toUpperCase()}</div></div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{t('issues.create.assignee')}</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-accent/20 rounded-2xl flex items-center justify-center text-brand-primary font-bold text-sm border border-brand-accent/30">{currentAssignee?.name?.charAt(0) || 'U'}</div>
                    <div><p className="text-sm font-bold">{currentAssignee?.name || t('issues.detail.unassigned')}</p><p className="text-[10px] text-foreground/40 font-medium">{t('issues.detail.assignedMember')}</p></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{t('issues.detail.timeTracking')}</h4>
                  <div className="flex flex-wrap gap-4">
                    <div><span className="text-[10px] font-medium text-foreground/40">{t('issues.detail.est')}</span><p className="text-xs font-bold text-foreground/60">{issue.estimated_hours || 0}h</p></div>
                    <div><span className="text-[10px] font-medium text-foreground/40">{t('issues.detail.act')}</span><p className="text-xs font-bold text-foreground/60">{issue.actual_hours || 0}h</p></div>
                  </div>
                </div>
              </div>
            </section>
            <div className="h-px bg-border-glow/50" />
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-brand-primary"><History size={18} /><h4 className="text-sm font-bold uppercase tracking-widest">{t('issues.detail.activity')}</h4></div>
                {!summary && !summarizing && (
                  <button
                    onClick={() => handleSummarize()}
                    className="flex items-center text-[10px] font-bold text-brand-primary hover:text-brand-primary/80 bg-brand-primary/5 px-3 py-1.5 rounded-xl border border-brand-primary/10 transition-all hover:shadow-[0_0_10px_rgba(var(--brand-primary-rgb),0.1)]"
                  >
                    <Sparkles className="w-3 h-3 mr-1.5" />
                    {t('issues.detail.summarizeThread')}
                  </button>
                )}
              </div>

              {summaryError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-wider">
                  {summaryError}
                </div>
              )}

              <SummaryCard 
                summary={summary} 
                loading={summarizing} 
                onRefresh={() => handleSummarize(true)} 
              />

              <div className="space-y-10">
                {loading ? <div className="flex items-center justify-center h-20 opacity-40"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div></div> : activityEntities.length === 0 ? <div className="text-center py-12 text-foreground/30 bg-foreground/[0.02] rounded-3xl border border-dashed border-border-glow"><p className="font-medium italic">{t('issues.detail.noActivity')}</p></div> :
                  activityEntities.map((entity) => (
                    <div key={entity.id} className="relative flex gap-5">
                      <div className="absolute left-[19px] top-[40px] bottom-[-40px] w-px bg-border-glow/20 last:hidden" /><div className="w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center z-10 shadow-sm border bg-background text-brand-primary border-border-glow font-bold text-xs">{entity.user.name.charAt(0)}</div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between"><span className="text-sm font-bold">{entity.user.name}</span><span className="text-[10px] font-bold text-foreground/30 uppercase">{new Date(entity.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></div>
                        <div className="bg-foreground/[0.03] border border-border-glow/30 rounded-2xl overflow-hidden shadow-sm">
                          {entity.history.length > 0 && (
                            <div className={`p-4 space-y-2 bg-foreground/[0.01] ${entity.comments.length > 0 ? 'border-b border-border-glow/10' : ''}`}>
                              {entity.formattedHistory.map((h) => (
                                <div key={h.id} className="flex items-center gap-3 text-[11px] font-bold"><span className="text-foreground/40 uppercase tracking-wider shrink-0">{h.displayField}:</span><div className="flex flex-wrap items-center gap-2"><span className="text-foreground/30 line-through font-medium">{h.displayOld}</span><ArrowRight size={10} className="text-brand-primary/40" /><span className="text-brand-primary">{h.displayNew}</span></div></div>
                              ))}
                            </div>
                          )}
                          {entity.comments.length > 0 && <div className="p-5 text-sm leading-relaxed text-foreground/80">{entity.comments.map((c: any) => <div key={c.id} className="whitespace-pre-wrap">{c.content}</div>)}</div>}
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </section>
          </div>
        </div>

        <div className="p-6 border-t border-border-glow bg-foreground/[0.02] shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
          <div className="relative group">
            {isEditorFocused || newComment.trim() ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                {/* Scrollable area for inputs if they get too tall */}
                <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-background border border-border-glow rounded-2xl p-4 shadow-sm space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-foreground/40 uppercase">{t('issues.edit.status')}</label>
                          <select value={quickData.status} onChange={(e) => setQuickData({...quickData, status: e.target.value})} className="w-full bg-background text-brand-primary border border-border-glow rounded-lg px-2 py-1.5 text-xs font-bold outline-none">
                            <option value="open" className="bg-background text-foreground">{t('issues.search.statusOpen')}</option><option value="in_progress" className="bg-background text-foreground">{t('issues.search.statusInProgress')}</option><option value="resolved" className="bg-background text-foreground">{t('issues.search.statusResolved')}</option><option value="closed" className="bg-background text-foreground">{t('issues.search.statusClosed')}</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-foreground/40 uppercase">{t('issues.create.priority')}</label>
                          <select value={quickData.priority} onChange={(e) => setQuickData({...quickData, priority: e.target.value})} className="w-full bg-background text-foreground border border-border-glow rounded-lg px-2 py-1.5 text-xs font-bold outline-none">
                            <option value="low" className="bg-background text-foreground">{t('issues.search.priorityLow')}</option><option value="normal" className="bg-background text-foreground">{t('issues.search.priorityNormal')}</option><option value="high" className="bg-background text-foreground">{t('issues.search.priorityHigh')}</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-foreground/40 uppercase">{t('issues.create.assignee')}</label>
                        <select value={quickData.assignee_id} onChange={(e) => setQuickData({...quickData, assignee_id: e.target.value})} className="w-full bg-background text-foreground border border-border-glow rounded-lg px-2 py-1.5 text-xs font-bold outline-none">
                          <option value="" className="bg-background text-foreground">{t('issues.create.unassigned')}</option>{members.map(m => <option key={m.id} value={m.id} className="bg-background text-foreground">{m.name.toUpperCase()}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="bg-background border border-border-glow rounded-2xl p-4 shadow-sm space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-foreground/40 uppercase">{t('issues.detail.estHours')}</label>
                        <div className="relative"><Clock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" /><input type="number" step="0.5" value={quickData.estimated_hours} onChange={(e) => setQuickData({...quickData, estimated_hours: e.target.value})} placeholder={t('issues.detail.hoursPlaceholder')} className="w-full bg-foreground/5 border border-border-glow rounded-lg pl-8 pr-3 py-1.5 text-xs font-bold outline-none" /></div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-foreground/40 uppercase">{t('issues.detail.actHours')}</label>
                        <div className="relative"><History size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" /><input type="number" step="0.5" value={quickData.actual_hours} onChange={(e) => setQuickData({...quickData, actual_hours: e.target.value})} placeholder={t('issues.detail.hoursPlaceholder')} className="w-full bg-foreground/5 border border-border-glow rounded-lg pl-8 pr-3 py-1.5 text-xs font-bold outline-none" /></div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-brand-primary/30 shadow-lg ring-4 ring-brand-primary/5 bg-background">
                    <MarkdownEditor value={newComment} onChange={setNewComment} placeholder={t('issues.detail.commentPlaceholder')} rows={3} />
                  </div>
                </div>

                <div className="flex justify-end gap-3 shrink-0">
                  <GlassButton variant="ghost" size="sm" onClick={handleDiscardComment}>{t('common.cancel')}</GlassButton>
                  <GlassButton size="sm" disabled={submittingComment} onClick={(e) => handleAddComment(e as any)}><Send size={14} />{t('issues.detail.updateAndPost')}</GlassButton>
                </div>
              </div>
            ) : (
              <div onClick={() => setIsEditorFocused(true)} className="w-full bg-background border border-border-glow rounded-2xl pl-12 pr-14 py-4 text-sm font-medium text-foreground/40 cursor-text hover:border-brand-primary/30 hover:shadow-md transition-all flex items-center shadow-inner"><div className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/30"><MessageSquare size={18} /></div>{t('issues.detail.updateAndPostPlaceholder')}<div className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/20"><Maximize2 size={16} /></div></div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );

  if (!mounted) {
    return null;
  }

  return createPortal(overlay, document.body);
};
