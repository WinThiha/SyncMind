'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, use, useCallback } from 'react';
import { getIssue, Issue, deleteIssue } from '@/lib/api/issues';
import { getProject, Project } from '@/lib/api/projects';
import UpdateIssueForm from '@/components/issues/UpdateIssueForm';
import ChangeHistory from '@/components/issues/ChangeHistory';
import Comments from '@/components/issues/Comments';
import Markdown from '@/components/shared/Markdown';
import { useAuth } from '@/context/AuthContext';

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: {
    name: string;
  };
}

interface HistoryEntry {
  id: number;
  field: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  user: {
    name: string;
  };
}

interface IssueWithExtras extends Issue {
  comments?: Comment[];
  history?: HistoryEntry[];
}

interface ProjectWithMembers extends Project {
  members?: Array<{
    id: number;
    pivot: {
      role: string;
    };
  }>;
}

export default function IssueDetailPage({ params }: { params: Promise<{ id: string, key: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const projectId = unwrappedParams.id;
  const issueKey = unwrappedParams.key;
  const { user } = useAuth();

  const [issue, setIssue] = useState<IssueWithExtras | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  const loadIssue = useCallback(async () => {
    setLoading(true);
    try {
      const [issueData, projectData] = await Promise.all([
        getIssue(projectId, issueKey),
        getProject(projectId) as Promise<ProjectWithMembers>
      ]);
      
      setIssue(issueData as IssueWithExtras);
      
      // Check permissions
      const member = projectData.members?.find((m) => m.id === user?.id);
      const isCreator = projectData.creator_id === user?.id;
      const isAdmin = member?.pivot?.role === 'admin' || isCreator;
      
      setCanDelete(isAdmin);
      // Can edit if Admin/Creator OR if Assigned
      setCanEdit(isAdmin || issueData.assignee_id === user?.id);
      
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setError(status === 404 ? 'Issue not found' : 'Failed to load issue');
    } finally {
      setLoading(false);
    }
  }, [projectId, issueKey, user]);

  useEffect(() => {
    if (user) loadIssue();
  }, [loadIssue, user]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this issue?')) return;
    
    try {
      await deleteIssue(projectId, issueKey);
      router.push(`/projects/${projectId}/issues`);
    } catch {
      alert('Failed to delete issue');
    }
  };

  const handleUpdateSuccess = () => {
    setIsEditing(false);
    loadIssue();
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading issue details...</div>;
  if (error) return <div className="p-8 text-red-500 text-center">{error}</div>;
  if (!issue) return <div className="p-8 text-center text-gray-500">Issue not found</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
            <button 
              onClick={() => router.push(`/projects/${projectId}/issues`)}
              className="font-bold text-indigo-600 hover:text-indigo-800"
            >
              &larr; Issues
            </button>
            <span>&bull;</span>
            <span className="font-bold text-gray-900">{issue.key}</span>
            <span>&bull;</span>
            <span>{issue.issue_type}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{issue.summary}</h1>
        </div>
        <div className="flex space-x-2">
          {!isEditing && canEdit && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {isEditing ? (
            <div className="bg-white shadow rounded-lg p-6 border border-indigo-200">
              <h2 className="text-lg font-bold mb-4 text-gray-900">Edit Issue</h2>
              <UpdateIssueForm 
                projectId={projectId} 
                issue={issue} 
                onSuccess={handleUpdateSuccess} 
              />
              <button 
                onClick={() => setIsEditing(false)}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2 border-b pb-1">Description</h3>
                <div className="mt-4">
                  {issue.description ? (
                    <Markdown content={issue.description} />
                  ) : (
                    <span className="text-gray-400 italic">No description provided.</span>
                  )}
                </div>
              </div>

              <Comments 
                projectId={projectId} 
                issueKey={issueKey} 
                initialComments={issue.comments || []} 
              />
            </>
          )}
          
          <ChangeHistory history={issue.history || []} />
        </div>

        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Properties</h3>
            <div className="space-y-4">
              <div>
                <span className="block text-xs text-gray-500 uppercase">Status</span>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full mt-1
                  ${issue.status === 'open' ? 'bg-blue-100 text-blue-800' : 
                    issue.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'}`}>
                  {issue.status}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 uppercase">Priority</span>
                <span className={`font-medium mt-1 block
                  ${issue.priority === 'high' ? 'text-red-600' : 
                    issue.priority === 'normal' ? 'text-blue-600' : 'text-gray-600'}`}>
                  {issue.priority}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div>
                  <span className="block text-xs text-gray-500 uppercase text-center">Estimate</span>
                  <span className="text-sm text-gray-900 font-bold block text-center mt-1">
                    {issue.estimated_hours ? `${issue.estimated_hours}h` : '--'}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 uppercase text-center">Actual</span>
                  <span className="text-sm text-gray-900 font-bold block text-center mt-1">
                    {issue.actual_hours ? `${issue.actual_hours}h` : '--'}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <span className="block text-xs text-gray-500 uppercase">Assignee</span>
                <span className="text-sm text-gray-900 font-medium mt-1 block">
                  {issue.assignee?.name || 'Unassigned'}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 uppercase">Created By</span>
                <span className="text-sm text-gray-900 mt-1 block">
                  {issue.creator?.name}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 uppercase">Created At</span>
                <span className="text-sm text-gray-900 mt-1 block">
                  {new Date(issue.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
