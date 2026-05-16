import api from '../axios';

export interface UserSettings {
  profile: {
    name: string;
    email: string;
  };
  verification: {
    email_verified: boolean;
  };
  security: {
    has_password_credential: boolean;
    has_social_login: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system' | null;
    sidebar_collapsed_default: boolean;
    locale: 'en' | 'my-MM' | 'ja-JP' | 'vi-VN' | 'km-KH' | 'ko-KR';
  };
  notifications: {
    email_mentions: boolean;
    email_issue_assigned: boolean;
    email_comment_replies: boolean;
    in_app_mentions: boolean;
    in_app_issue_assigned: boolean;
    in_app_comment_replies: boolean;
  };
}

export interface UpdateUserSettingsPayload extends Omit<Partial<UserSettings>, 'preferences'> {
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    sidebar_collapsed_default?: boolean;
    locale?: 'en' | 'my-MM' | 'ja-JP' | 'vi-VN' | 'km-KH' | 'ko-KR';
  };
}

export interface UpdatePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export const getUserSettings = async (): Promise<UserSettings> => {
  const response = await api.get('/api/user/settings');
  return response.data.data;
};

export const updateUserSettings = async (payload: UpdateUserSettingsPayload): Promise<UserSettings> => {
  const response = await api.put('/api/user/settings', payload);
  return response.data.data;
};

export const resendVerification = async (): Promise<void> => {
  await api.post('/api/auth/email/verification-notification');
};

export const updatePassword = async (payload: UpdatePasswordPayload): Promise<void> => {
  await api.put('/api/user/settings/password', payload);
};
