'use client';

import { useState, useEffect } from 'react';
import { getProjectMembers, addProjectMember, removeProjectMember, updateProjectMemberRole, ProjectMember } from '@/lib/api/projects';
import { AxiosError } from 'axios';
import { useAuth } from '@/context/AuthContext';

interface MemberManagementProps {
  projectId: number;
  userRole: string;
}

export default function MemberManagement({ projectId, userRole }: MemberManagementProps) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('normal');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function loadMembers() {
      try {
        const data = await getProjectMembers(projectId);
        setMembers(data);
      } catch (err) {
        setError('Failed to load members');
      } finally {
        setLoading(false);
      }
    }
    loadMembers();
  }, [projectId]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError(null);
    try {
      await addProjectMember(projectId, { email, role });
      const data = await getProjectMembers(projectId);
      setMembers(data);
      setEmail('');
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Failed to add member');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (confirm('Are you sure you want to remove this member?')) {
      try {
        await removeProjectMember(projectId, userId);
        setMembers(members.filter(m => m.id !== userId));
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        setError(axiosError.response?.data?.message || 'Failed to remove member');
      }
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    setUpdatingId(userId);
    try {
      await updateProjectMemberRole(projectId, userId, newRole);
      setMembers(members.map(m => {
        if (m.id === userId) {
          return { ...m, pivot: { ...(m as any).pivot, role: newRole } };
        }
        return m;
      }));
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div>Loading members...</div>;

  return (
    <div className="mt-8 bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Project Members</h2>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <ul className="mb-6 divide-y divide-gray-200 border-t border-gray-200">
        {members.map(member => {
          const mRole = (member as any).pivot?.role || 'Member';
          const canManageThisMember = userRole === 'admin' && member.id !== user?.id && mRole !== 'creator';
          
          return (
            <li key={member.id} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">{member.name}</p>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
              <div className="flex items-center space-x-4">
                {canManageThisMember ? (
                  <select
                    className="text-sm border-gray-300 rounded-md p-1 bg-white focus:ring-indigo-500 focus:border-indigo-500 border"
                    value={mRole}
                    disabled={updatingId === member.id}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                  >
                    <option value="normal">Normal</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <span className="text-sm px-2 py-1 bg-gray-100 rounded text-gray-700 capitalize font-medium">
                    {mRole}
                  </span>
                )}
                
                {canManageThisMember && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {userRole === 'admin' && (
        <form onSubmit={handleAddMember} className="space-y-4 pt-4 border-t border-gray-200">
          <h3 className="font-medium">Add New Member</h3>
          <div className="flex space-x-4">
            <input
              type="email"
              placeholder="User Email"
              required
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <select
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border bg-white"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="normal">Normal User</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              disabled={adding}
              className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 disabled:opacity-50"
            >
              {adding ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
