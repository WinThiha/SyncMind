import api from '../axios';

export interface MilestoneSummaryResult {
  summary: string;
  generated_at: string;
}

export interface MilestoneRiskResult {
  verdict: 'on_track' | 'at_risk' | 'critical';
  signals: string[];
  recommendation: string;
  generated_at: string;
}

export interface MilestoneDateSuggestion {
  start_date: string | null;
  due_date: string | null;
  rationale: string;
}

export interface MilestoneIssueSuggestion {
  issue_id: number;
  key: string;
  summary: string;
  score: number;
  reason: string;
}

export async function summarizeMilestone(
  projectId: string,
  milestoneId: string,
  force = false,
): Promise<{ data: MilestoneSummaryResult; cached: boolean }> {
  const response = await api.post(
    `/api/projects/${projectId}/milestones/${milestoneId}/ai/summarize`,
    { force },
  );
  return response.data;
}

export async function analyzeMilestoneRisk(
  projectId: string,
  milestoneId: string,
  force = false,
): Promise<{ data: MilestoneRiskResult; cached: boolean }> {
  const response = await api.post(
    `/api/projects/${projectId}/milestones/${milestoneId}/ai/risk-analysis`,
    { force },
  );
  return response.data;
}

export async function suggestMilestoneDates(
  projectId: string,
  milestoneId: string,
  context?: string,
): Promise<{ data: MilestoneDateSuggestion }> {
  const response = await api.post(
    `/api/projects/${projectId}/milestones/${milestoneId}/ai/suggest-dates`,
    { context },
  );
  return response.data;
}

export async function suggestMilestoneIssues(
  projectId: string,
  milestoneId: string,
  limit = 10,
): Promise<{ data: MilestoneIssueSuggestion[] }> {
  const response = await api.post(
    `/api/projects/${projectId}/milestones/${milestoneId}/ai/suggest-issues`,
    { limit },
  );
  return response.data;
}

export async function suggestMilestoneDatesForNew(
  projectId: string,
  name: string,
  description?: string,
  context?: string,
): Promise<{ data: MilestoneDateSuggestion }> {
  const response = await api.post(
    `/api/projects/${projectId}/ai/suggest-milestone-dates`,
    { name, description, context },
  );
  return response.data;
}
