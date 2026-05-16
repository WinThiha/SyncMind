import api from '../axios';

export interface DashboardSummary {
  active_projects: number;
  my_open_issues: number;
  due_soon: number;
  overdue: number;
}

export interface DashboardIssue {
  id: number;
  project_id: number;
  project_name: string | null;
  project_key: string | null;
  key: string;
  summary: string;
  status: string;
  priority: string;
  due_date: string | null;
  updated_at: string | null;
}

export interface DashboardProjectHealth {
  id: number;
  name: string;
  key: string;
  members_count: number;
  issues_count: number;
  overdue_issues_count: number;
  progress: number;
  updated_at: string | null;
}

export interface DashboardActivity {
  type: 'comment' | 'history';
  actor: string | null;
  issue_key: string | null;
  issue_summary: string | null;
  project_id: number | null;
  project_name: string | null;
  created_at: string | null;
  text: string;
  field?: string;
  old_value?: string | null;
  new_value?: string | null;
}

export interface DashboardData {
  summary: DashboardSummary;
  my_work: DashboardIssue[];
  upcoming: DashboardIssue[];
  project_health: DashboardProjectHealth[];
  recent_activity: DashboardActivity[];
}

export async function getDashboard(): Promise<DashboardData> {
  const response = await api.get('/api/dashboard');
  return response.data.data;
}
