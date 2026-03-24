'use client';

import React, { useEffect, useState } from 'react';
import { getProject, Project } from '@/lib/api/projects';
import { useRouter } from 'next/navigation';
import MemberManagement from '@/components/projects/MemberManagement';
import ProjectSettings from '@/components/projects/ProjectSettings';
import { useAuth } from '@/context/AuthContext';

interface ProjectWithMembers extends Project {
  members?: Array<{
    id: number;
    pivot: {
      role: string;
    };
  }>;
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const [project, setProject] = useState<ProjectWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    async function loadProject() {
      try {
        const data = await getProject(unwrappedParams.id);
        setProject(data as ProjectWithMembers);
      } catch {
        setError('Failed to load project details or you do not have permission.');
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [unwrappedParams.id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading project...</div>;
  
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
  const member = project.members?.find((m) => m.id === user?.id);
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => router.push(`/projects/${unwrappedParams.id}/issues`)}
            className="bg-white p-6 shadow rounded-lg border border-gray-200 hover:border-indigo-500 hover:shadow-md transition text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <span className="text-gray-400 group-hover:text-indigo-600">&rarr;</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Issues</h3>
            <p className="text-sm text-gray-500 mt-1">Create, track, and manage project tasks and bugs.</p>
          </button>

          <div className="bg-white p-6 shadow rounded-lg border border-gray-200 opacity-50 cursor-not-allowed">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg text-green-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase">Soon</span>
            </div>
            <h3 className="text-lg font-bold text-gray-400">Wiki</h3>
            <p className="text-sm text-gray-400 mt-1">Documentation and knowledge base for your team.</p>
          </div>

          <div className="bg-white p-6 shadow rounded-lg border border-gray-200 opacity-50 cursor-not-allowed">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg text-yellow-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase">Soon</span>
            </div>
            <h3 className="text-lg font-bold text-gray-400">Timeline</h3>
            <p className="text-sm text-gray-400 mt-1">Visualize project progress over time.</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Project Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">Issue Types</p>
              <div className="flex space-x-2 mt-1">
                {project.issue_types?.map((type) => (
                  <span key={type} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                    {type}
                  </span>
                )) || <span className="text-gray-400 italic">None</span>}
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
