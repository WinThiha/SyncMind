'use client';

import { useState, useEffect } from 'react';
import { createIssue } from '@/lib/api/issues';
import { getProject, getProjectMembers, ProjectMember } from '@/lib/api/projects';
import MarkdownEditor from '../shared/MarkdownEditor';

interface CreateIssueFormProps {
  projectId: number | string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateIssueForm({ projectId, onSuccess, onCancel }: CreateIssueFormProps) {
  const [formData, setFormData] = useState({
    summary: '',
    description: '',
    issue_type: 'Task',
    priority: 'normal',
    assignee_id: '',
    estimated_hours: '',
    status: 'open',
  });
  
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [projectData, membersData] = await Promise.all([
          getProject(projectId),
          getProjectMembers(projectId)
        ]);
        setProject(projectData);
        setMembers(membersData);
        if (projectData.issue_types?.length > 0) {
          setFormData(prev => ({ ...prev, issue_type: projectData.issue_types[0] }));
        }
      } catch (err) {
        console.error('Failed to load project data', err);
      }
    }
    loadData();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createIssue(projectId, {
        ...formData,
        assignee_id: formData.assignee_id ? parseInt(formData.assignee_id) : undefined,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : undefined
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create issue');
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
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow rounded-lg border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Issue</h2>
      
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
          placeholder="What needs to be done?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <MarkdownEditor 
          value={formData.description} 
          onChange={handleDescriptionChange}
          placeholder="Provide more details..."
          rows={6}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="issue_type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            name="issue_type"
            id="issue_type"
            value={formData.issue_type}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {project?.issue_types?.map((type: string) => (
              <option key={type} value={type}>{type}</option>
            )) || (
              <>
                <option value="Task">Task</option>
                <option value="Bug">Bug</option>
                <option value="Request">Request</option>
              </>
            )}
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

        <div>
          <label htmlFor="estimated_hours" className="block text-sm font-medium text-gray-700 mb-1">Estimate (hrs)</label>
          <input
            type="number"
            step="0.5"
            name="estimated_hours"
            id="estimated_hours"
            value={formData.estimated_hours}
            onChange={handleChange}
            placeholder="e.g. 8"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

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

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Issue'}
        </button>
      </div>
    </form>
  );
}
