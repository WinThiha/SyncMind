'use client';

import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { getUserSettings, resendVerification, updatePassword, updateUserSettings, UpdateUserSettingsPayload, UserSettings } from '@/lib/api/settings';
import { useTheme } from '@/context/ThemeContext';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/context/AuthContext';

const sections = ['Account', 'Security', 'Preferences', 'Notifications'] as const;
type Section = (typeof sections)[number];

const defaultSettings: UserSettings = {
  profile: { name: '', email: '' },
  verification: { email_verified: false },
  security: { has_password_credential: true, has_social_login: false },
  preferences: { theme: 'system', sidebar_collapsed_default: false },
  notifications: {
    email_mentions: true,
    email_issue_assigned: true,
    email_comment_replies: true,
    in_app_mentions: true,
    in_app_issue_assigned: true,
    in_app_comment_replies: true,
  },
};

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>('Account');
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [nameDraft, setNameDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [passwordDraft, setPasswordDraft] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const { applySavedThemePreference, clearThemeOverride } = useTheme();
  const { setCollapsed } = useSidebar();
  const { refreshUser } = useAuth();

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getUserSettings();
        setSettings({
          ...data,
          preferences: {
            ...data.preferences,
            theme: data.preferences.theme ?? 'system',
          },
        });
        setNameDraft(data.profile.name);
        setCollapsed(data.preferences.sidebar_collapsed_default);
      } catch {
        setError('Failed to load settings.');
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [setCollapsed]);

  const guardrailText = useMemo(
    () => 'Project administration (members, ownership, deletion, issue types) is managed in each project page, not in user settings.',
    []
  );

  const save = async (payload: UpdateUserSettingsPayload, successMessage: string): Promise<boolean> => {
    setSaving(true);
    setError(null);
    setFieldErrors({});
    setMessage(null);

    try {
      const updated = await updateUserSettings(payload);
      setSettings(updated);
      if (updated.preferences.theme) {
        applySavedThemePreference(updated.preferences.theme);
        if (updated.preferences.theme === 'system') {
          clearThemeOverride();
        }
      }
      setCollapsed(updated.preferences.sidebar_collapsed_default);
      setMessage(successMessage);
      return true;
    } catch (err) {
      const axiosErr = err as AxiosError<{ errors?: Record<string, string[]>; message?: string }>;
      setFieldErrors(axiosErr.response?.data?.errors || {});
      setError(axiosErr.response?.data?.message || 'Failed to save settings.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const onSaveAccount = async () => {
    const saved = await save({ profile: { ...settings.profile, name: nameDraft } }, 'Account updated.');
    if (saved) {
      await refreshUser();
    }
  };

  const onSavePreferences = async () => {
    await save({ preferences: settings.preferences }, 'Preferences updated.');
  };

  const onSaveNotifications = async () => {
    await save({ notifications: settings.notifications }, 'Notification preferences updated.');
  };

  const onResendVerification = async () => {
    try {
      await resendVerification();
      setMessage('Verification email sent.');
      setError(null);
    } catch {
      setError('Could not send verification email.');
    }
  };

  const onSavePassword = async () => {
    setSaving(true);
    setError(null);
    setFieldErrors({});
    setMessage(null);

    try {
      await updatePassword(passwordDraft);
      setPasswordDraft({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
      setMessage('Password updated.');
    } catch (err) {
      const axiosErr = err as AxiosError<{ errors?: Record<string, string[]>; message?: string }>;
      setFieldErrors(axiosErr.response?.data?.errors || {});
      setError(axiosErr.response?.data?.message || 'Failed to update password.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-foreground/60">Loading settings...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
      <aside className="rounded-xl border border-border-glow p-3 h-fit">
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                section === activeSection ? 'bg-brand-primary/10 text-brand-primary' : 'hover:bg-foreground/5 text-foreground/70'
              }`}
            >
              {section}
            </button>
          ))}
        </nav>
      </aside>

      <section className="rounded-xl border border-border-glow p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-foreground/60 mt-1">User-global preferences and account controls.</p>
        </header>

        {message && <div className="text-green-600 text-sm">{message}</div>}
        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-foreground/80">
          {guardrailText}
        </div>

        {activeSection === 'Account' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="settings-name" className="text-xs font-bold uppercase tracking-wider text-foreground/50">Name</label>
              <input
                id="settings-name"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border-glow bg-background px-3 py-2"
              />
              {fieldErrors['profile.name'] && <p className="text-xs text-red-500 mt-1">{fieldErrors['profile.name'][0]}</p>}
            </div>
            <div>
              <label htmlFor="settings-email" className="text-xs font-bold uppercase tracking-wider text-foreground/50">Email</label>
              <input id="settings-email" value={settings.profile.email} readOnly className="mt-1 w-full rounded-lg border border-border-glow bg-foreground/5 px-3 py-2" />
              <p className="text-xs text-foreground/60 mt-1">Email updates are temporarily disabled.</p>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border-glow p-3">
              <p className="text-sm">Email verification: {settings.verification.email_verified ? 'Verified' : 'Unverified'}</p>
              {!settings.verification.email_verified && (
                <button onClick={onResendVerification} className="text-sm font-semibold text-brand-primary">Resend verification</button>
              )}
            </div>
            <button onClick={onSaveAccount} disabled={saving} className="px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-semibold">
              {saving ? 'Saving...' : 'Save Account'}
            </button>
          </div>
        )}

        {activeSection === 'Security' && (
          <div className="space-y-4 text-sm">
            <div className="rounded-lg border border-border-glow p-4">
              <p className="font-semibold">Password credentials</p>
              <p className="text-foreground/60 mt-1">
                {settings.security.has_password_credential
                  ? 'Update your password below. Other active sessions and tokens will be signed out after a successful change.'
                  : 'This account does not have password credentials. Use your social login provider.'}
              </p>
            </div>
            {settings.security.has_password_credential && (
              <div className="space-y-3 rounded-lg border border-border-glow p-4">
                <div>
                  <label htmlFor="current-password" className="text-xs font-bold uppercase tracking-wider text-foreground/50">Current password</label>
                  <input
                    id="current-password"
                    type="password"
                    value={passwordDraft.current_password}
                    onChange={(e) => setPasswordDraft((prev) => ({ ...prev, current_password: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-border-glow bg-background px-3 py-2"
                  />
                  {fieldErrors.current_password && <p className="text-xs text-red-500 mt-1">{fieldErrors.current_password[0]}</p>}
                </div>
                <div>
                  <label htmlFor="new-password" className="text-xs font-bold uppercase tracking-wider text-foreground/50">New password</label>
                  <input
                    id="new-password"
                    type="password"
                    value={passwordDraft.new_password}
                    onChange={(e) => setPasswordDraft((prev) => ({ ...prev, new_password: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-border-glow bg-background px-3 py-2"
                  />
                  {fieldErrors.new_password && <p className="text-xs text-red-500 mt-1">{fieldErrors.new_password[0]}</p>}
                </div>
                <div>
                  <label htmlFor="new-password-confirmation" className="text-xs font-bold uppercase tracking-wider text-foreground/50">Confirm new password</label>
                  <input
                    id="new-password-confirmation"
                    type="password"
                    value={passwordDraft.new_password_confirmation}
                    onChange={(e) => setPasswordDraft((prev) => ({ ...prev, new_password_confirmation: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-border-glow bg-background px-3 py-2"
                  />
                </div>
                <button onClick={onSavePassword} disabled={saving} className="px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-semibold">
                  {saving ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            )}
            <div className="rounded-lg border border-border-glow p-4">
              <p className="font-semibold">Social login</p>
              <p className="text-foreground/60 mt-1">{settings.security.has_social_login ? 'Connected' : 'Not connected'}.</p>
            </div>
          </div>
        )}

        {activeSection === 'Preferences' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="settings-theme" className="text-xs font-bold uppercase tracking-wider text-foreground/50">Theme</label>
              <select
                id="settings-theme"
                value={settings.preferences.theme ?? 'system'}
                onChange={(e) => setSettings((prev) => ({
                  ...prev,
                  preferences: { ...prev.preferences, theme: e.target.value as 'light' | 'dark' | 'system' },
                }))}
                className="mt-1 w-full rounded-lg border border-border-glow bg-background px-3 py-2"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={settings.preferences.sidebar_collapsed_default}
                onChange={(e) => setSettings((prev) => ({
                  ...prev,
                  preferences: { ...prev.preferences, sidebar_collapsed_default: e.target.checked },
                }))}
              />
              Collapse sidebar by default
            </label>
            <button onClick={onSavePreferences} disabled={saving} className="px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-semibold">
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        )}

        {activeSection === 'Notifications' && (
          <div className="space-y-3 text-sm">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between rounded-lg border border-border-glow p-3">
                <span>{key.replaceAll('_', ' ')}</span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setSettings((prev) => ({
                    ...prev,
                    notifications: { ...prev.notifications, [key]: e.target.checked },
                  }))}
                />
              </label>
            ))}
            <button onClick={onSaveNotifications} disabled={saving} className="px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-semibold">
              {saving ? 'Saving...' : 'Save Notifications'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
