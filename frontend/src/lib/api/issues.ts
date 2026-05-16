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
  milestone_id: number | null;
  due_date: string | null;
  creator_id: number;
  created_at: string;
  updated_at: string;
  comments_count?: number;
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

export interface AISuggestion {
  description: string | null;
  issue_type: string | null;
  priority: string | null;
  estimated_hours: number | null;
  assignee_suggestions: Array<{ assignee_id: number; reason: string }>;
}

export async function suggestIssueFields(projectId: number | string, summary: string): Promise<AISuggestion> {
  const response = await api.post(`/api/projects/${projectId}/ai/suggest-issue`, { summary });
  return response.data.data;
}

export interface SimilarIssue {
  id: number;
  project_id: number;
  key?: string;
  key_number: number;
  summary: string;
  status: string;
  priority: string;
  similarity: number;
}

export async function getSimilarIssues(projectId: number | string, text: string): Promise<SimilarIssue[]> {
  const response = await api.get(`/api/projects/${projectId}/ai/similar-issues`, {
    params: { text }
  });
  return response.data.data;
}

export interface ThreadSummary {
  summary: string;
  decisions: string[];
  consensus: string;
  action_items: string[];
}

export async function summarizeIssue(projectId: number | string, key: string, force = false): Promise<ThreadSummary> {
  const response = await api.post(`/api/projects/${projectId}/issues/${key}/ai/summarize`, { force });
  return response.data.data;
}

export interface GlobalIssue {
  id: number;
  project_id: number;
  key: string;
  full_key: string;
  summary: string;
  description: string | null;
  status: string;
  priority: string;
  issue_type: string;
  due_date: string | null;
  updated_at: string;
  comments_count: number;
  project_name?: string;
  project_key?: string;
  assignee?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface IssuesSummary {
  assigned_to_me: number;
  overdue: number;
  high_priority: number;
  unassigned: number;
  project_name: string;
}

export interface GetIssuesParams {
  project_id?: number | string;
  status?: string;
  priority?: string;
  type?: string;
  due_date_start?: string;
  due_date_end?: string;
  assignee?: string;
  high_priority?: boolean;
  search?: string;
}

export async function getGlobalIssues(params: GetIssuesParams = {}): Promise<GlobalIssue[]> {
  const response = await api.get('/api/issues', { params });
  return response.data.data;
}

export async function getIssuesSummary(projectId?: number | string): Promise<IssuesSummary> {
  const response = await api.get('/api/issues/summary', {
    params: projectId ? { project_id: projectId } : {},
  });
  return response.data.data;
}

export interface GlobalSimilarIssue {
  id: number;
  project_id: number;
  key: string;
  full_key: string;
  summary: string;
  description: string | null;
  status: string;
  priority: string;
  issue_type: string;
  due_date: string | null;
  updated_at: string;
  comments_count: number;
  similarity: number;
  project_name?: string;
  project_key?: string;
  assignee_id?: number;
  assignee?: {
    id: number;
    name: string;
    email: string;
  };
}

export async function getGlobalSimilarIssues(
  projectId: number | string,
  text: string,
  filters: Record<string, string> = {}
): Promise<GlobalSimilarIssue[]> {
  const response = await api.get('/api/issues/ai/similar', {
    params: { project_id: projectId, text, ...filters },
  });
  return response.data.data;
}
