'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '@/lib/api/projects';
import { AxiosError } from 'axios';

export default function CreateProjectForm() {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [icon, setIcon] = useState('');
  const [issueTypes, setIssueTypes] = useState('Task, Bug, Story');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const typesArray = issueTypes.split(',').map((t) => t.trim()).filter((t) => t !== '');
      const project = await createProject({
        name,
        key: key.toUpperCase(),
        icon: icon || undefined,
        issue_types: typesArray,
      });
      router.push(`/projects/${project.id}`);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string, errors?: Record<string, string[]> }>;
      if (axiosError.response?.data?.errors) {
        const firstError = Object.values(axiosError.response.data.errors)[0][0];
        setError(firstError);
      } else {
        setError(axiosError.response?.data?.message || 'Failed to create project.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <label className="block text-sm font-medium text-gray-700">Project Key (2-10 Uppercase Letters)</label>
          <input
            type="text"
            required
            minLength={2}
            maxLength={10}
            pattern="[A-Za-z]+"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border uppercase"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Icon URL (Optional)</label>
          <input
            type="url"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
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
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {loading ? 'Creating...' : 'Create Project'}
        </button>
      </form>
    </div>
  );
}
