import api from '../axios';

export interface WikiPageAuthor {
  id: number;
  name: string;
}

export interface WikiPageSummary {
  id: number;
  project_id: number;
  title: string;
  author: WikiPageAuthor | null;
  last_editor: WikiPageAuthor | null;
  created_at: string;
  updated_at: string;
}

export interface WikiPage extends WikiPageSummary {
  content: string | null;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function getWikiPages(projectId: number | string): Promise<WikiPageSummary[]> {
  const response = await api.get(`/api/projects/${projectId}/wiki`);
  return response.data.data;
}

export async function getWikiPage(projectId: number | string, wikiPageId: number | string): Promise<WikiPage> {
  const response = await api.get(`/api/projects/${projectId}/wiki/${wikiPageId}`);
  return response.data.data;
}

export async function createWikiPage(
  projectId: number | string,
  data: { title: string; content?: string }
): Promise<WikiPage> {
  const response = await api.post(`/api/projects/${projectId}/wiki`, data);
  return response.data.data;
}

export async function updateWikiPage(
  projectId: number | string,
  wikiPageId: number | string,
  data: { title?: string; content?: string }
): Promise<WikiPage> {
  const response = await api.patch(`/api/projects/${projectId}/wiki/${wikiPageId}`, data);
  return response.data.data;
}

export async function deleteWikiPage(projectId: number | string, wikiPageId: number | string): Promise<void> {
  await api.delete(`/api/projects/${projectId}/wiki/${wikiPageId}`);
}

export async function wikiAiChat(
  projectId: number | string,
  message: string,
  history: ChatMessage[],
  locale = 'en'
): Promise<string> {
  const response = await api.post(`/api/projects/${projectId}/wiki/ai/chat`, { message, history, locale });
  return response.data.answer;
}

export async function wikiAiDraft(projectId: number | string, prompt: string, locale = 'en'): Promise<string> {
  const response = await api.post(`/api/projects/${projectId}/wiki/ai/draft`, { prompt, locale });
  return response.data.content;
}
