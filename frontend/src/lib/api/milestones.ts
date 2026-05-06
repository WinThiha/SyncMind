import api from '../axios';

export interface MilestoneProgress {
  total: number;
  completed: number;
  percentage: number;
}

export interface Milestone {
  id: number;
  project_id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  due_date: string | null;
  status: 'open' | 'in_progress' | 'closed';
  is_overdue: boolean;
  progress: MilestoneProgress;
  created_at: string;
  updated_at: string;
}

export interface MilestoneWithIssues extends Milestone {
  issues: any[];
}

export interface CreateMilestoneData {
  name: string;
  description?: string;
  start_date?: string;
  due_date?: string;
  status?: 'open' | 'in_progress' | 'closed';
}

export async function getMilestones(projectId: number | string): Promise<Milestone[]> {
  const response = await api.get(`/api/projects/${projectId}/milestones`);
  return response.data.data;
}

export async function getMilestone(projectId: number | string, milestoneId: number | string): Promise<MilestoneWithIssues> {
  const response = await api.get(`/api/projects/${projectId}/milestones/${milestoneId}`);
  return response.data.data;
}

export async function createMilestone(projectId: number | string, data: CreateMilestoneData): Promise<Milestone> {
  const response = await api.post(`/api/projects/${projectId}/milestones`, data);
  return response.data.data;
}

export async function updateMilestone(projectId: number | string, milestoneId: number | string, data: Partial<CreateMilestoneData>): Promise<Milestone> {
  const response = await api.patch(`/api/projects/${projectId}/milestones/${milestoneId}`, data);
  return response.data.data;
}

export async function deleteMilestone(projectId: number | string, milestoneId: number | string): Promise<void> {
  await api.delete(`/api/projects/${projectId}/milestones/${milestoneId}`);
}
