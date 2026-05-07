'use client';

import { useEffect, useState } from 'react';
import { getIssues, Issue, getSimilarIssues } from '@/lib/api/issues';
import { IssueListItem } from './IssueListItem';
import { IssueDetailView } from './IssueDetailView';
import { IssueSkeleton } from './IssueSkeleton';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatePresence, motion } from 'framer-motion';
import { Filter, RotateCcw, Search, ChevronDown, Sparkles } from 'lucide-react';

interface IssueListProps {
  projectId: number | string;
}

type IssueListEntry = Partial<Issue> & {
  id: number;
  project_id: number;
  summary: string;
  status: string;
  priority: string;
  key?: string;
  key_number?: number;
  full_key?: string;
  similarity?: number;
  comments_count?: number;
};

export default function IssueList({ projectId }: IssueListProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<IssueListEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<IssueListEntry | null>(null);

  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAISearchEnabled, setIsAISearchEnabled] = useState(false);
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [aiSearchResults, setAISearchResults] = useState<IssueListEntry[]>([]);

  const resolveIssueKey = (issue: IssueListEntry): string | null => {
    if (issue.full_key) return issue.full_key;
    if (issue.key) return issue.key;
    if (issue.key_number !== undefined && issue.key_number !== null) return String(issue.key_number);

    return null;
  };

  useEffect(() => {
    async function loadIssues() {
      try {
        const data = await getIssues(projectId);
        setIssues(data);
        setFilteredIssues(data);
      } catch (err) {
        setError('Failed to load issues');
      } finally {
        setLoading(false);
      }
    }
    loadIssues();
  }, [projectId]);

  useEffect(() => {
    if (isAISearchEnabled) {
      if (searchQuery.trim().length < 3) {
        setAISearchResults([]);
        setFilteredIssues([]);
        return;
      }

      const timer = setTimeout(async () => {
        setIsSearchingAI(true);
        try {
          const results = await getSimilarIssues(projectId, searchQuery);
          // Only show results with similarity > 0.3 as per design
          const validatedResults = results
            .filter(r => r.similarity > 0.3)
            .map((r): IssueListEntry => ({
              id: r.id,
              project_id: r.project_id,
              key: r.key,
              key_number: r.key_number,
              summary: r.summary,
              description: null,
              status: r.status,
              priority: r.priority,
              created_at: '',
              similarity: r.similarity,
            }));
          
          setAISearchResults(validatedResults);
          
          // Still apply status/priority filters to AI results
          let filtered = validatedResults;
          if (statusFilter !== 'all') filtered = filtered.filter(i => i.status === statusFilter);
          if (priorityFilter !== 'all') filtered = filtered.filter(i => i.priority === priorityFilter);
          setFilteredIssues(filtered);
        } catch (err) {
          console.error('AI Search failed', err);
        } finally {
          setIsSearchingAI(false);
        }
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      let filtered = issues;
      if (statusFilter !== 'all') filtered = filtered.filter(i => i.status === statusFilter);
      if (priorityFilter !== 'all') filtered = filtered.filter(i => i.priority === priorityFilter);
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(i => i.summary.toLowerCase().includes(query) || i.key.toLowerCase().includes(query));
      }
      setFilteredIssues(filtered);
    }
  }, [statusFilter, priorityFilter, searchQuery, issues, isAISearchEnabled, projectId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => <IssueSkeleton key={i} />)}
      </div>
    );
  }

  if (error) return <GlassCard className="p-8 text-red-500 font-bold text-center">{error}</GlassCard>;

  return (
    <div className="space-y-8">
      <GlassCard className="p-4 sm:p-5 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 bg-foreground/5 border border-border-glow rounded-2xl px-4 py-2.5 flex-1 min-w-0 group focus-within:ring-4 focus-within:ring-brand-primary/10 transition-all">
          <Search size={16} className="text-foreground/30 group-focus-within:text-brand-primary transition-colors shrink-0" />
          <input
            type="text"
            placeholder={isAISearchEnabled ? 'Search with AI...' : 'Search issues...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full min-w-0 placeholder:text-foreground/30 font-medium"
          />
          <button
            onClick={() => setIsAISearchEnabled(!isAISearchEnabled)}
            className={`p-1.5 rounded-xl transition-all shrink-0 ${isAISearchEnabled ? 'bg-brand-primary/20 text-brand-primary' : 'text-foreground/30 hover:text-brand-primary hover:bg-foreground/5'}`}
            title={isAISearchEnabled ? 'Switch to Keyword Search' : 'Switch to AI Search'}
          >
            <Sparkles size={16} className={isAISearchEnabled ? 'animate-pulse' : ''} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-foreground/30 shrink-0" />
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-background border border-border-glow rounded-xl px-3 py-2 pr-8 text-xs font-bold text-foreground/60 outline-none cursor-pointer hover:border-brand-primary/30 transition-all"
            >
              <option value="all">ALL STATUS</option>
              <option value="open">OPEN</option>
              <option value="in_progress">IN PROGRESS</option>
              <option value="resolved">RESOLVED</option>
              <option value="closed">CLOSED</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/30" />
          </div>

          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="appearance-none bg-background border border-border-glow rounded-xl px-3 py-2 pr-8 text-xs font-bold text-foreground/60 outline-none cursor-pointer hover:border-brand-primary/30 transition-all"
            >
              <option value="all">ALL PRIORITY</option>
              <option value="high">HIGH</option>
              <option value="normal">NORMAL</option>
              <option value="low">LOW</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/30" />
          </div>

          <button
            onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); setSearchQuery(''); }}
            className="p-2 hover:bg-foreground/5 rounded-xl transition-all text-foreground/30 hover:text-brand-primary"
            title="Reset Filters"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </GlassCard>

      <div className="space-y-4">
        {isSearchingAI ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <IssueSkeleton key={i} />)}
            <div className="text-center text-foreground/30 text-xs animate-pulse font-bold uppercase tracking-widest">AI is searching for similar issues...</div>
          </div>
        ) : filteredIssues.length === 0 ? (
          <GlassCard className="text-center py-20 text-foreground/30 border-dashed">
            <Filter size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-bold uppercase tracking-widest text-xs">
              {isAISearchEnabled 
                ? searchQuery.trim().length < 3 
                  ? "Enter at least 3 characters to start AI search" 
                  : "AI couldn't find any relevant issues" 
                : "No issues found matching your filters"}
            </p>
          </GlassCard>
        ) : (
          filteredIssues.map((issue) => (
            <IssueListItem 
              key={issue.id} 
              issue={{
                id: issue.id,
                project_id: issue.project_id,
                full_key: issue.full_key,
                key: issue.key,
                title: issue.summary,
                status: issue.status,
                priority: issue.priority,
                comments_count: issue.comments_count || 0,
                similarity: issue.similarity
              }} 
              onClick={() => {
                const key = resolveIssueKey(issue);
                if (!key) return;

                setSelectedIssue({
                  ...issue,
                  key,
                });
              }}
            />
          ))
        )}
      </div>

      <AnimatePresence>
        {selectedIssue && (
          <IssueDetailView 
            issue={{
              id: selectedIssue.id,
              project_id: selectedIssue.project_id,
              key: resolveIssueKey(selectedIssue) || '',
              title: selectedIssue.summary,
              description: selectedIssue.description || '',
              status: selectedIssue.status,
              priority: selectedIssue.priority,
              assigned_to: selectedIssue.assignee,
              created_at: selectedIssue.created_at || new Date(0).toISOString()
            }}
            onClose={() => setSelectedIssue(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
