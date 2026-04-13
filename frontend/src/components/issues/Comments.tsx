'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import MarkdownEditor from '../shared/MarkdownEditor';
import Markdown from '../shared/Markdown';

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: {
    name: string;
  };
}

interface CommentsProps {
  projectId: number | string;
  issueKey: string;
  initialComments: Comment[];
}

export default function Comments({ projectId, issueKey, initialComments }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [notifyEmails, setNotifyEmails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await api.post(`/api/projects/${projectId}/issues/${issueKey}/comments`, {
        content: newComment,
        notify_emails: notifyEmails
      });
      
      setComments([...comments, response.data.data]);
      setNewComment('');
      setNotifyEmails(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Comments</h3>
      
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sm text-gray-900">{comment.user.name}</span>
              <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
            </div>
            <Markdown content={comment.content} className="text-sm text-gray-800" />
          </div>
        ))}
        
        {comments.length === 0 && (
          <p className="text-sm text-gray-500 italic py-4">No comments yet.</p>
        )}
      </div>

      <div className="mt-6 bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
        <MarkdownEditor 
          value={newComment} 
          onChange={setNewComment} 
          placeholder="Add a comment..."
          rows={3}
        />
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="notify_emails"
              name="notify_emails"
              type="checkbox"
              checked={notifyEmails}
              onChange={(e) => setNotifyEmails(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="notify_emails" className="ml-2 block text-sm text-gray-700">
              Notify by Email
            </label>
          </div>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !newComment.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
