import api from '../axios';

export interface InvitationInfo {
  project_id: number;
  project_name: string;
  role: string;
  inviter_name: string | null;
  expires_at: string;
}

export const getInvitation = async (token: string): Promise<InvitationInfo> => {
  const response = await api.get(`/api/invitations/${token}`);
  return response.data.data;
};

export const acceptInvitation = async (token: string): Promise<{ message: string; project_id: number }> => {
  const response = await api.post(`/api/invitations/${token}/accept`);
  return response.data;
};
