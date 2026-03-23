'use client';

import { useState } from 'react';
import { Project, updateProject, deleteProject, transferOwnership, getProjectMembers, ProjectMember } from '@/lib/api/projects';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';

interface ProjectSettingsProps {
  project: Project;
  onUpdate: (project: Project) => void;
  isOwner: boolean;
}

export default function ProjectSettings({ project, onUpdate, isOwner }: ProjectSettingsProps) {
  const [name, setName] = useState(project.name);
  const [issueTypes, setIssueTypes] = useState(project.issue_types.join(', '));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [transferUserId, setTransferUserId] = useState('');
  const [transferError, setTransferError] = useState<string | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const typesArray = issueTypes.split(',').map((t) => t.trim()).filter((t) => t !== '');
      const updated = await updateProject(project.id, { 
        name,
        issue_types: typesArray,
      });
      onUpdate(updated);
      setError(null);
    } catch (err) {
      setError('Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to completely delete this project? This action cannot be undone.')) {
      try {
        await deleteProject(project.id);
        router.push('/dashboard');
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        setError(axiosError.response?.data?.message || 'Failed to delete project');
      }
    }
  };

  const loadMembers = async () => {
    if (members.length === 0) {
      try {
        const data = await getProjectMembers(project.id);
        setMembers(data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleTransfer = async () => {
    if (!transferUserId) return;
    if (confirm('Are you sure you want to transfer ownership? You will lose creator privileges.')) {
      try {
        await transferOwnership(project.id, transferUserId);
        router.push('/dashboard');
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        setTransferError(axiosError.response?.data?.message || 'Failed to transfer ownership');
      }
    }
  };

  return (
    <div className="mt-8 space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Project Settings</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project Name</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Issue Types (Comma Separated)</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              value={issueTypes}
              onChange={(e) => setIssueTypes(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {isOwner && (
        <div className="bg-white shadow rounded-lg p-6 border border-red-200">
          <h2 className="text-xl font-bold mb-4 text-red-600">Danger Zone</h2>
          
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="font-medium mb-2">Transfer Ownership</h3>
            <p className="text-sm text-gray-500 mb-4">Transfer this project to another admin member.</p>
            {transferError && <div className="text-red-500 mb-2 text-sm">{transferError}</div>}
            <div className="flex space-x-4">
              <select
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border flex-1 bg-white"
                value={transferUserId}
                onFocus={loadMembers}
                onChange={(e) => setTransferUserId(e.target.value)}
              >
                <option value="">Select a member...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                ))}
              </select>
              <button
                onClick={handleTransfer}
                disabled={!transferUserId}
                className="bg-orange-600 text-white px-4 py-2 rounded shadow hover:bg-orange-700 disabled:opacity-50"
              >
                Transfer
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Delete Project</h3>
            <p className="text-sm text-gray-500 mb-4">Permanently remove this project and all its data.</p>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
            >
              Delete Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
