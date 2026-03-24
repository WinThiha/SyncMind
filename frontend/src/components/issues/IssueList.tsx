'use client';

import { useEffect, useState } from 'react';
import { getIssues, Issue } from '@/lib/api/issues';
import { IssueListItem } from './IssueListItem';
import { IssueDetailView } from './IssueDetailView';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatePresence, motion } from 'framer-motion';
import { Filter, RotateCcw, Search } from 'lucide-react';

interface IssueListProps {
  projectId: number | string;
}

export default function IssueList({ projectId }: IssueListProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
    let filtered = issues;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.status === statusFilter);
    }
    
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(i => i.priority === priorityFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(i => 
        i.summary.toLowerCase().includes(query) || 
        i.key.toLowerCase().includes(query)
      );
    }
    
    setFilteredIssues(filtered);
  }, [statusFilter, priorityFilter, searchQuery, issues]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <GlassCard key={i} className="h-20 animate-pulse bg-foreground/5" children={null} />
        ))}
      </div>
    );
  }

  if (error) return <GlassCard className="p-4 text-red-500">{error}</GlassCard>;

  return (
    <div className="space-y-8">
      <GlassCard className="p-6 flex flex-wrap items-center gap-8">
        <div className="flex items-center gap-3 bg-foreground/5 px-6 py-3 rounded-2xl flex-1 min-w-[250px]">
          <Search size={18} className="text-foreground/40" />
          <input 
            type="text" 
            placeholder="Search issues by key or summary..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-foreground/40"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-foreground/40" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm font-bold outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-sm font-bold outline-none cursor-pointer"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <button 
            onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); setSearchQuery(''); }}
            className="p-2 hover:bg-foreground/5 rounded-lg transition-colors text-foreground/40 hover:text-brand-primary"
            title="Reset Filters"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </GlassCard>

      <div className="space-y-1">
        {filteredIssues.length === 0 ? (
          <GlassCard className="text-center py-16 text-foreground/40 border-dashed">
            No issues found matching your filters.
          </GlassCard>
        ) : (
          filteredIssues.map((issue) => (
            <IssueListItem 
              key={issue.id} 
              issue={{
                id: issue.id,
                title: issue.summary,
                status: issue.status,
                priority: issue.priority,
                comments_count: 0
              }} 
              onClick={() => setSelectedIssue(issue)}
            />
          ))
        )}
      </div>

      <AnimatePresence>
        {selectedIssue && (
          <IssueDetailView 
            issue={{
              id: selectedIssue.id,
              title: selectedIssue.summary,
              description: selectedIssue.description || '',
              status: selectedIssue.status,
              priority: selectedIssue.priority,
              assigned_to: selectedIssue.assignee,
              created_at: selectedIssue.created_at
            }}
            onClose={() => setSelectedIssue(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
