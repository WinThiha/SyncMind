'use client';

import { useEffect, useState } from 'react';
import { getProjects, Project } from '@/lib/api/projects';
import Link from 'next/link';

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  if (projects.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 bg-white shadow rounded-lg mt-4">
        You are not involved in any projects yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
      {projects.map((project) => (
        <Link href={`/projects/${project.id}`} key={project.id}>
          <div className="bg-white shadow rounded-lg p-6 hover:shadow-md transition cursor-pointer border border-gray-100">
            <div className="flex items-center space-x-4 mb-4">
              {project.icon ? (
                <img src={project.icon} alt={project.name} className="w-12 h-12 rounded bg-gray-100 object-cover" />
              ) : (
                <div className="w-12 h-12 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl">
                  {project.key.substring(0, 2)}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                <span className="text-sm font-medium text-gray-500">{project.key}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
