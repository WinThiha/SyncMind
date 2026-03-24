'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import IssueList from '@/components/issues/IssueList';
import CreateIssueForm from '@/components/issues/CreateIssueForm';
import { getProject, Project } from '@/lib/api/projects';
import { useAuth } from '@/context/AuthContext';

interface ProjectWithMembers extends Project {
  members?: Array<{
    id: number;
    pivot: {
      role: string;
    };
  }>;
}

export default function IssuesPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [canCreate, setCanCreate] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    async function checkPermission() {
      try {
        const project = await getProject(projectId) as ProjectWithMembers;
        const member = project.members?.find((m) => m.id === user?.id);
        const isCreator = project.creator_id === user?.id;
        const userRole = member?.pivot?.role || (isCreator ? 'admin' : 'normal');
        
        setCanCreate(userRole === 'admin' || isCreator);
      } catch (err) {
        console.error('Failed to check permissions', err);
      }
    }
    if (user) checkPermission();
  }, [projectId, user]);

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Issues</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track work for this project.</p>
        </div>
        {!showCreateForm && canCreate && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Issue
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="mb-8">
          <CreateIssueForm
            projectId={projectId}
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      <div className="mt-6">
        <IssueList projectId={projectId} key={refreshKey} />
      </div>
    </div>
  );
}
