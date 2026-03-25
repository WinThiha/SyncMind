import api from '../axios';

export interface Issue {
  id: number;
  project_id: number;
  key: string;
  key_number: number;
  summary: string;
  description: string | null;
  status: string;
  priority: string;
  issue_type: string;
  estimated_hours: number | null;
  actual_hours: number | null;
  assignee_id: number | null;
  creator_id: number;
  created_at: string;
  updated_at: string;
  assignee?: {
    id: number;
    name: string;
    email: string;
  };
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

export async function getIssues(projectId: number | string) {
  const response = await api.get(`/api/projects/${projectId}/issues`);
  return response.data.data;
}

export async function getIssue(projectId: number | string, key: string) {
  const response = await api.get(`/api/projects/${projectId}/issues/${key}`);
  return response.data.data;
}

export async function createIssue(projectId: number | string, data: any) {
  const response = await api.post(`/api/projects/${projectId}/issues`, data);
  return response.data.data;
}

export async function updateIssue(projectId: number | string, key: string, data: any) {
  const response = await api.patch(`/api/projects/${projectId}/issues/${key}`, data);
  return response.data.data;
}

export async function deleteIssue(projectId: number | string, key: string) {
  const response = await api.delete(`/api/projects/${projectId}/issues/${key}`);
  return response.data;
}

export async function createIssueComment(projectId: number | string, key: string, data: any) {
  // Backend route is: projects/{project}/issues/{issue_key}/comments
  const response = await api.post(`/api/projects/${projectId}/issues/${key}/comments`, data);
  return response.data.data;
}
