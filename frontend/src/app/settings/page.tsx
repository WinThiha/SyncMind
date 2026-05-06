'use client';

import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import {
  getUserSettings,
  resendVerification,
  updatePassword,
  updateUserSettings,
  UpdateUserSettingsPayload,
  UserSettings,
} from '@/lib/api/settings';
import { useTheme } from '@/context/ThemeContext';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Lock,
  Bell,
  Sliders,
  CheckCircle,
  AlertCircle,
  Mail,
  ShieldCheck,
  ShieldOff,
  Sun,
  Moon,
  Monitor,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

const sections = ['Account', 'Security', 'Preferences', 'Notifications'] as const;
type Section = (typeof sections)[number];

const sectionIcons: Record<Section, React.ElementType> = {
  Account: User,
  Security: Lock,
  Preferences: Sliders,
  Notifications: Bell,
};

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

const notificationLabels: Record<string, string> = {
  email_mentions: 'Mentions',
  email_issue_assigned: 'Issue assigned to you',
  email_comment_replies: 'Comment replies',
  in_app_mentions: 'Mentions',
  in_app_issue_assigned: 'Issue assigned to you',
  in_app_comment_replies: 'Comment replies',
};

// ─── Small shared components ──────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2 ml-0.5">
      {children}
    </p>
  );
}

function FieldInput({
  id, value, onChange, readOnly = false, type = 'text', placeholder,
}: {
  id?: string; value: string; onChange?: (v: string) => void;
  readOnly?: boolean; type?: string; placeholder?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      readOnly={readOnly}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      className={`w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all ${
        readOnly
          ? 'opacity-50 cursor-not-allowed'
          : 'focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30'
      }`}
    />
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-0.5 uppercase">{msg}</p>;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-brand-primary' : 'bg-foreground/15'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function StatusBanner({ type, message, onDismiss }: {
  type: 'success' | 'error'; message: string; onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className={`flex items-center justify-between gap-3 p-4 rounded-xl text-sm font-medium border ${
        type === 'success'
          ? 'bg-green-500/10 border-green-500/20 text-green-500'
          : 'bg-red-500/10 border-red-500/20 text-red-500'
      }`}
    >
      <div className="flex items-center gap-2">
        {type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
        {message}
      </div>
      <button onClick={onDismiss} className="opacity-60 hover:opacity-100 transition-opacity text-lg leading-none">
        ×
      </button>
    </motion.div>
  );
}

// ─── Section panels ───────────────────────────────────────────────────────────

function AccountPanel({
  settings, nameDraft, setNameDraft, onSave, onResend, saving, fieldErrors,
}: {
  settings: UserSettings; nameDraft: string; setNameDraft: (v: string) => void;
  onSave: () => void; onResend: () => void; saving: boolean;
  fieldErrors: Record<string, string[]>;
}) {
  const initials = settings.profile.name
    ? settings.profile.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div className="space-y-6">
      {/* Avatar row */}
      <div className="flex items-center gap-4 pb-6 border-b border-border-glow">
        <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-xl shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-bold text-lg">{settings.profile.name || '—'}</p>
          <p className="text-foreground/40 text-sm">{settings.profile.email}</p>
        </div>
      </div>

      {/* Name */}
      <div>
        <FieldLabel>Display name</FieldLabel>
        <FieldInput value={nameDraft} onChange={setNameDraft} placeholder="Your full name" />
        <FieldError msg={fieldErrors['profile.name']?.[0]} />
      </div>

      {/* Email (read-only) */}
      <div>
        <FieldLabel>Email address</FieldLabel>
        <FieldInput value={settings.profile.email} readOnly />
        <p className="text-foreground/35 text-xs mt-1.5 ml-0.5">
          Email changes are managed through your account provider.
        </p>
      </div>

      {/* Verification status */}
      <div className={`flex items-center justify-between p-4 rounded-xl border ${
        settings.verification.email_verified
          ? 'border-green-500/20 bg-green-500/5'
          : 'border-yellow-500/20 bg-yellow-500/5'
      }`}>
        <div className="flex items-center gap-3">
          {settings.verification.email_verified
            ? <ShieldCheck size={18} className="text-green-500" />
            : <ShieldOff size={18} className="text-yellow-500" />}
          <div>
            <p className={`text-sm font-bold ${settings.verification.email_verified ? 'text-green-500' : 'text-yellow-500'}`}>
              {settings.verification.email_verified ? 'Email verified' : 'Email not verified'}
            </p>
            {!settings.verification.email_verified && (
              <p className="text-xs text-foreground/40 mt-0.5">Check your inbox or request a new link.</p>
            )}
          </div>
        </div>
        {!settings.verification.email_verified && (
          <button
            onClick={onResend}
            className="flex items-center gap-1.5 text-xs font-bold text-yellow-500 hover:text-yellow-400 transition-colors"
          >
            <RefreshCw size={13} />
            Resend
          </button>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <GlassButton onClick={onSave} disabled={saving} className="px-8">
          {saving ? 'Saving...' : 'Save changes'}
        </GlassButton>
      </div>
    </div>
  );
}

function SecurityPanel({
  settings, passwordDraft, setPasswordDraft, onSavePassword, saving, fieldErrors,
}: {
  settings: UserSettings;
  passwordDraft: { current_password: string; new_password: string; new_password_confirmation: string };
  setPasswordDraft: (v: typeof passwordDraft) => void;
  onSavePassword: () => void; saving: boolean;
  fieldErrors: Record<string, string[]>;
}) {
  return (
    <div className="space-y-6">
      {/* Social login info */}
      <div className="flex items-center gap-3 p-4 rounded-xl border border-border-glow bg-foreground/3">
        <Mail size={18} className="text-foreground/40 shrink-0" />
        <div>
          <p className="text-sm font-semibold">Social login</p>
          <p className="text-xs text-foreground/40 mt-0.5">
            {settings.security.has_social_login
              ? 'Google account connected.'
              : 'No social provider connected.'}
          </p>
        </div>
        <span className={`ml-auto text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
          settings.security.has_social_login
            ? 'bg-green-500/10 text-green-500'
            : 'bg-foreground/8 text-foreground/40'
        }`}>
          {settings.security.has_social_login ? 'Connected' : 'None'}
        </span>
      </div>

      {/* Password change */}
      {settings.security.has_password_credential ? (
        <div className="space-y-4">
          <p className="text-xs text-foreground/40 leading-relaxed">
            After a successful change, other active sessions and API tokens will be signed out.
          </p>

          <div>
            <FieldLabel>Current password</FieldLabel>
            <FieldInput
              type="password"
              value={passwordDraft.current_password}
              onChange={(v) => setPasswordDraft({ ...passwordDraft, current_password: v })}
              placeholder="••••••••"
            />
            <FieldError msg={fieldErrors.current_password?.[0]} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>New password</FieldLabel>
              <FieldInput
                type="password"
                value={passwordDraft.new_password}
                onChange={(v) => setPasswordDraft({ ...passwordDraft, new_password: v })}
                placeholder="••••••••"
              />
              <FieldError msg={fieldErrors.new_password?.[0]} />
            </div>
            <div>
              <FieldLabel>Confirm new password</FieldLabel>
              <FieldInput
                type="password"
                value={passwordDraft.new_password_confirmation}
                onChange={(v) => setPasswordDraft({ ...passwordDraft, new_password_confirmation: v })}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <GlassButton onClick={onSavePassword} disabled={saving} className="px-8">
              {saving ? 'Updating...' : 'Update password'}
            </GlassButton>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-border-glow bg-foreground/3 text-sm text-foreground/50">
          This account has no password — sign in using your social provider.
        </div>
      )}
    </div>
  );
}

function PreferencesPanel({
  settings, setSettings, onSave, saving,
}: {
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  onSave: () => void; saving: boolean;
}) {
  const themes: { value: 'light' | 'dark' | 'system'; label: string; icon: React.ElementType }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="space-y-8">
      {/* Theme */}
      <div>
        <FieldLabel>Appearance</FieldLabel>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {themes.map(({ value, label, icon: Icon }) => {
            const active = (settings.preferences.theme ?? 'system') === value;
            return (
              <button
                key={value}
                onClick={() => setSettings((prev) => ({
                  ...prev,
                  preferences: { ...prev.preferences, theme: value },
                }))}
                className={`flex flex-col items-center gap-2.5 py-5 rounded-xl border transition-all ${
                  active
                    ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                    : 'border-border-glow bg-foreground/3 text-foreground/50 hover:bg-foreground/5 hover:text-foreground'
                }`}
              >
                <Icon size={22} />
                <span className={`text-xs font-bold uppercase tracking-widest ${active ? 'text-brand-primary' : ''}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar */}
      <div>
        <FieldLabel>Sidebar</FieldLabel>
        <div className="flex items-center justify-between p-4 rounded-xl border border-border-glow bg-foreground/3">
          <div>
            <p className="text-sm font-semibold">Collapse sidebar by default</p>
            <p className="text-xs text-foreground/40 mt-0.5">
              Start every session with the sidebar collapsed.
            </p>
          </div>
          <Toggle
            checked={settings.preferences.sidebar_collapsed_default}
            onChange={(v) =>
              setSettings((prev) => ({
                ...prev,
                preferences: { ...prev.preferences, sidebar_collapsed_default: v },
              }))
            }
          />
        </div>
      </div>

      <div className="flex justify-end">
        <GlassButton onClick={onSave} disabled={saving} className="px-8">
          {saving ? 'Saving...' : 'Save preferences'}
        </GlassButton>
      </div>
    </div>
  );
}

function NotificationsPanel({
  settings, setSettings, onSave, saving,
}: {
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  onSave: () => void; saving: boolean;
}) {
  const emailKeys = ['email_mentions', 'email_issue_assigned', 'email_comment_replies'] as const;
  const inAppKeys = ['in_app_mentions', 'in_app_issue_assigned', 'in_app_comment_replies'] as const;

  const NotifRow = ({ notifKey }: { notifKey: string }) => {
    const value = settings.notifications[notifKey as keyof typeof settings.notifications];
    return (
      <div className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
        <span className="text-sm font-medium text-foreground/70">
          {notificationLabels[notifKey] ?? notifKey}
        </span>
        <Toggle
          checked={value}
          onChange={(v) =>
            setSettings((prev) => ({
              ...prev,
              notifications: { ...prev.notifications, [notifKey]: v },
            }))
          }
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Email */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Mail size={14} className="text-foreground/40" />
          <FieldLabel>Email notifications</FieldLabel>
        </div>
        <div className="divide-y divide-border-glow px-1">
          {emailKeys.map((k) => <NotifRow key={k} notifKey={k} />)}
        </div>
      </div>

      {/* In-app */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Bell size={14} className="text-foreground/40" />
          <FieldLabel>In-app notifications</FieldLabel>
        </div>
        <div className="divide-y divide-border-glow px-1">
          {inAppKeys.map((k) => <NotifRow key={k} notifKey={k} />)}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <GlassButton onClick={onSave} disabled={saving} className="px-8">
          {saving ? 'Saving...' : 'Save notifications'}
        </GlassButton>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
          preferences: { ...data.preferences, theme: data.preferences.theme ?? 'system' },
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
    () => 'Project members, ownership, issue types, and milestones are managed from each project page.',
    [],
  );

  const clearFeedback = () => { setMessage(null); setError(null); };

  const save = async (payload: UpdateUserSettingsPayload, successMessage: string): Promise<boolean> => {
    setSaving(true);
    clearFeedback();
    setFieldErrors({});
    try {
      const updated = await updateUserSettings(payload);
      setSettings(updated);
      if (updated.preferences.theme) {
        applySavedThemePreference(updated.preferences.theme);
        if (updated.preferences.theme === 'system') clearThemeOverride();
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
    if (saved) await refreshUser();
  };

  const onSavePreferences = () => save({ preferences: settings.preferences }, 'Preferences saved.');
  const onSaveNotifications = () => save({ notifications: settings.notifications }, 'Notification preferences saved.');

  const onResendVerification = async () => {
    clearFeedback();
    try {
      await resendVerification();
      setMessage('Verification email sent — check your inbox.');
    } catch {
      setError('Could not send verification email. Try again later.');
    }
  };

  const onSavePassword = async () => {
    setSaving(true);
    clearFeedback();
    setFieldErrors({});
    try {
      await updatePassword(passwordDraft);
      setPasswordDraft({ current_password: '', new_password: '', new_password_confirmation: '' });
      setMessage('Password updated successfully.');
    } catch (err) {
      const axiosErr = err as AxiosError<{ errors?: Record<string, string[]>; message?: string }>;
      setFieldErrors(axiosErr.response?.data?.errors || {});
      setError(axiosErr.response?.data?.message || 'Failed to update password.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground/30 font-bold animate-pulse uppercase tracking-widest text-sm">
          Loading settings...
        </div>
      </div>
    );
  }

  const ActiveIcon = sectionIcons[activeSection];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
          <Sliders size={20} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-foreground/50 text-sm mt-0.5">{guardrailText}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 items-start">
        {/* Sidebar nav */}
        <GlassCard className="p-2">
          <nav className="space-y-0.5">
            {sections.map((section) => {
              const Icon = sectionIcons[section];
              const active = section === activeSection;
              return (
                <button
                  key={section}
                  onClick={() => { setActiveSection(section); clearFeedback(); setFieldErrors({}); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'text-foreground/55 hover:bg-foreground/5 hover:text-foreground'
                  }`}
                >
                  <Icon size={17} className="shrink-0" />
                  {section}
                  {active && (
                    <ChevronRight size={14} className="ml-auto text-brand-primary/60" />
                  )}
                </button>
              );
            })}
          </nav>
        </GlassCard>

        {/* Content */}
        <GlassCard className="p-8">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-7 pb-6 border-b border-border-glow">
            <div className="w-9 h-9 bg-brand-primary/10 rounded-xl flex items-center justify-center">
              <ActiveIcon size={18} className="text-brand-primary" />
            </div>
            <div>
              <h2 className="font-bold text-lg">{activeSection}</h2>
              <p className="text-xs text-foreground/40">
                {activeSection === 'Account' && 'Manage your display name and verification status.'}
                {activeSection === 'Security' && 'Update your password and connected providers.'}
                {activeSection === 'Preferences' && 'Customize appearance and sidebar behaviour.'}
                {activeSection === 'Notifications' && 'Choose how you receive updates.'}
              </p>
            </div>
          </div>

          {/* Feedback banners */}
          <AnimatePresence>
            {message && (
              <div className="mb-6">
                <StatusBanner type="success" message={message} onDismiss={() => setMessage(null)} />
              </div>
            )}
            {error && (
              <div className="mb-6">
                <StatusBanner type="error" message={error} onDismiss={() => setError(null)} />
              </div>
            )}
          </AnimatePresence>

          {/* Panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {activeSection === 'Account' && (
                <AccountPanel
                  settings={settings}
                  nameDraft={nameDraft}
                  setNameDraft={setNameDraft}
                  onSave={onSaveAccount}
                  onResend={onResendVerification}
                  saving={saving}
                  fieldErrors={fieldErrors}
                />
              )}
              {activeSection === 'Security' && (
                <SecurityPanel
                  settings={settings}
                  passwordDraft={passwordDraft}
                  setPasswordDraft={setPasswordDraft}
                  onSavePassword={onSavePassword}
                  saving={saving}
                  fieldErrors={fieldErrors}
                />
              )}
              {activeSection === 'Preferences' && (
                <PreferencesPanel
                  settings={settings}
                  setSettings={setSettings}
                  onSave={onSavePreferences}
                  saving={saving}
                />
              )}
              {activeSection === 'Notifications' && (
                <NotificationsPanel
                  settings={settings}
                  setSettings={setSettings}
                  onSave={onSaveNotifications}
                  saving={saving}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  );
}
