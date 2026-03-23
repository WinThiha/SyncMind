'use client';

import React, { useEffect, useState } from 'react';
import { getProject, Project } from '@/lib/api/projects';
import { useRouter } from 'next/navigation';
import MemberManagement from '@/components/projects/MemberManagement';
import ProjectSettings from '@/components/projects/ProjectSettings';
import { useAuth } from '@/context/AuthContext';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    async function loadProject() {
      try {
        const data = await getProject(unwrappedParams.id);
        setProject(data);
      } catch (err) {
        setError('Failed to load project details or you do not have permission.');
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [unwrappedParams.id]);

  if (loading) return <div className="p-8 text-center">Loading project...</div>;
  
  if (error || !project) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{error}</p>
        <button onClick={() => router.push('/dashboard')} className="mt-4 text-indigo-600 underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Find current user's role from the project members
  const member = (project as any).members?.find((m: any) => m.id === user?.id);
  const isCreator = project.creator_id === user?.id;
  const userRole = member?.pivot?.role || (isCreator ? 'creator' : 'normal');
  const canManageSettings = userRole === 'creator' || userRole === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-gray-700">
                &larr; Back
              </button>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">{project.name} ({project.key})</h1>
                {isCreator && (
                  <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                    Owner
                  </span>
                )}
              </div>
            </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Project Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">Issue Types</p>
              <div className="flex space-x-2 mt-1">
                {project.issue_types.map((type) => (
                  <span key={type} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                    {type}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Role</p>
              <p className="mt-1 font-medium text-gray-900 capitalize">
                {userRole}
              </p>
            </div>
          </div>
        </div>
        
        <MemberManagement projectId={project.id} userRole={userRole === 'creator' ? 'admin' : userRole} />

        {canManageSettings && (
          <ProjectSettings project={project} onUpdate={setProject} isOwner={isCreator} />
        )}
      </main>
    </div>
  );
}
