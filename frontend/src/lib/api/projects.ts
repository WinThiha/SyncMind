import api from '../axios';

export interface Project {
  id: number;
  name: string;
  key: string;
  icon?: string;
  issue_types: string[];
  categories?: string[];
  milestones?: string[];
  versions?: string[];
  creator_id: number;
  created_at: string;
  updated_at: string;
}

export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get('/api/projects');
  return response.data.data;
};

export const getProject = async (id: number | string): Promise<Project> => {
  const response = await api.get(`/api/projects/${id}`);
  return response.data.data;
};

export const createProject = async (data: Partial<Project>): Promise<Project> => {
  const response = await api.post('/api/projects', data);
  return response.data.data;
};

export const updateProject = async (id: number | string, data: Partial<Project>): Promise<Project> => {
  const response = await api.put(`/api/projects/${id}`, data);
  return response.data.data;
};

export const deleteProject = async (id: number | string): Promise<void> => {
  await api.delete(`/api/projects/${id}`);
};

export const transferOwnership = async (id: number | string, newCreatorId: number | string): Promise<void> => {
  await api.post(`/api/projects/${id}/transfer`, { new_creator_id: newCreatorId });
};

export interface ProjectMember {
  id: number;
  name: string;
  email: string;
}

export const getProjectMembers = async (projectId: number | string): Promise<ProjectMember[]> => {
  const response = await api.get(`/api/projects/${projectId}/members`);
  return response.data.data;
};

export const addProjectMember = async (projectId: number | string, data: { email: string; role: string }) => {
  const response = await api.post(`/api/projects/${projectId}/members`, data);
  return response.data;
};

export const removeProjectMember = async (projectId: number | string, userId: number | string) => {
  const response = await api.delete(`/api/projects/${projectId}/members/${userId}`);
  return response.data;
};

export const updateProjectMemberRole = async (projectId: number | string, userId: number | string, role: string) => {
  const response = await api.put(`/api/projects/${projectId}/members/${userId}`, { role });
  return response.data;
};

export interface ProjectInvitation {
  id: number;
  email: string;
  role: string;
  expires_at: string;
  created_at: string;
  inviter?: { id: number; name: string };
}

export const getProjectInvitations = async (projectId: number | string): Promise<ProjectInvitation[]> => {
  const response = await api.get(`/api/projects/${projectId}/invitations`);
  return response.data.data;
};

export const createProjectInvitation = async (projectId: number | string, data: { email: string; role: string }) => {
  const response = await api.post(`/api/projects/${projectId}/members`, data);
  return response.data;
};

export const cancelProjectInvitation = async (projectId: number | string, invitationId: number | string) => {
  const response = await api.delete(`/api/projects/${projectId}/invitations/${invitationId}`);
  return response.data;
};
