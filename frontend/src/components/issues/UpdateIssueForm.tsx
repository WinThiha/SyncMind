'use client';

import { useState, useEffect } from 'react';
import { updateIssue, Issue } from '@/lib/api/issues';
import { getProjectMembers, ProjectMember } from '@/lib/api/projects';
import MarkdownEditor from '../shared/MarkdownEditor';

interface UpdateIssueFormProps {
  projectId: number | string;
  issue: Issue;
  onSuccess: () => void;
}

export default function UpdateIssueForm({ projectId, issue, onSuccess }: UpdateIssueFormProps) {
  const [formData, setFormData] = useState({
    summary: issue.summary,
    description: issue.description || '',
    status: issue.status,
    priority: issue.priority,
    issue_type: issue.issue_type,
    estimated_hours: issue.estimated_hours?.toString() || '',
    actual_hours: issue.actual_hours?.toString() || '',
    assignee_id: issue.assignee_id?.toString() || '',
  });

  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMembers() {
      try {
        const data = await getProjectMembers(projectId);
        setMembers(data);
      } catch (err) {
        console.error('Failed to load project members', err);
      }
    }
    loadMembers();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateIssue(projectId, issue.key, {
        ...formData,
        assignee_id: formData.assignee_id ? parseInt(formData.assignee_id) : undefined,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        actual_hours: formData.actual_hours ? parseFloat(formData.actual_hours) : null,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update issue');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

      <div>
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
        <input
          type="text"
          name="summary"
          id="summary"
          required
          value={formData.summary}
          onChange={handleChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            id="status"
            value={formData.status}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            name="priority"
            id="priority"
            value={formData.priority}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="assignee_id" className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
          <select
            name="assignee_id"
            id="assignee_id"
            value={formData.assignee_id}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Unassigned</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="estimated_hours" className="block text-sm font-medium text-gray-700 mb-1">Estimate (hrs)</label>
          <input
            type="number"
            step="0.5"
            name="estimated_hours"
            id="estimated_hours"
            value={formData.estimated_hours}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="actual_hours" className="block text-sm font-medium text-gray-700 mb-1">Actual (hrs)</label>
          <input
            type="number"
            step="0.5"
            name="actual_hours"
            id="actual_hours"
            value={formData.actual_hours}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <MarkdownEditor 
          value={formData.description} 
          onChange={handleDescriptionChange}
          rows={8}
        />
      </div>

      <div className="flex justify-end pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Update Issue'}
        </button>
      </div>
    </form>
  );
}
