'use client';

import { useEffect, useState } from 'react';
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
import { useLocale } from '@/context/LocaleContext';
import { LOCALE_OPTIONS } from '@/lib/i18n/localeOptions';
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
  Eye,
  EyeOff,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

const sections = ['account', 'security', 'preferences', 'notifications'] as const;
type Section = (typeof sections)[number];

const sectionIcons: Record<Section, React.ElementType> = {
  account: User,
  security: Lock,
  preferences: Sliders,
  notifications: Bell,
};

const defaultSettings: UserSettings = {
  profile: { name: '', email: '' },
  verification: { email_verified: false },
  security: { has_password_credential: true, has_social_login: false },
  preferences: { theme: 'system', sidebar_collapsed_default: false, locale: 'en' },
  notifications: {
    email_mentions: true,
    email_issue_assigned: true,
    email_comment_replies: true,
    in_app_mentions: true,
    in_app_issue_assigned: true,
    in_app_comment_replies: true,
  },
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
  settings, nameDraft, setNameDraft, onSave, onResend, saving, fieldErrors, t,
}: {
  settings: UserSettings; nameDraft: string; setNameDraft: (v: string) => void;
  onSave: () => void; onResend: () => void; saving: boolean;
  fieldErrors: Record<string, string[]>;
  t: (key: string) => string;
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
        <FieldLabel>{t('settings.account.displayName')}</FieldLabel>
        <FieldInput value={nameDraft} onChange={setNameDraft} placeholder={t('settings.account.displayNamePlaceholder')} />
        <FieldError msg={fieldErrors['profile.name']?.[0]} />
      </div>

      {/* Email (read-only) */}
      <div>
        <FieldLabel>{t('settings.account.emailAddress')}</FieldLabel>
        <FieldInput value={settings.profile.email} readOnly />
        <p className="text-foreground/35 text-xs mt-1.5 ml-0.5">
          {t('settings.account.emailManagedByProvider')}
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
              {settings.verification.email_verified
                ? t('settings.account.emailVerified')
                : t('settings.account.emailNotVerified')}
            </p>
            {!settings.verification.email_verified && (
              <p className="text-xs text-foreground/40 mt-0.5">{t('settings.account.emailVerificationHint')}</p>
            )}
          </div>
        </div>
        {!settings.verification.email_verified && (
          <button
            onClick={onResend}
            className="flex items-center gap-1.5 text-xs font-bold text-yellow-500 hover:text-yellow-400 transition-colors"
          >
            <RefreshCw size={13} />
            {t('settings.account.resendVerification')}
          </button>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <GlassButton onClick={onSave} disabled={saving} className="px-8">
          {saving ? t('settings.actions.saving') : t('settings.actions.saveChanges')}
        </GlassButton>
      </div>
    </div>
  );
}

function SecurityPanel({
  settings, passwordDraft, setPasswordDraft, onSavePassword, saving, fieldErrors, t,
}: {
  settings: UserSettings;
  passwordDraft: { current_password: string; new_password: string; new_password_confirmation: string };
  setPasswordDraft: (v: typeof passwordDraft) => void;
  onSavePassword: () => void; saving: boolean;
  fieldErrors: Record<string, string[]>;
  t: (key: string) => string;
}) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Social login info */}
      <div className="flex items-center gap-3 p-4 rounded-xl border border-border-glow bg-foreground/3">
        <Mail size={18} className="text-foreground/40 shrink-0" />
        <div>
          <p className="text-sm font-semibold">{t('settings.security.socialLogin')}</p>
          <p className="text-xs text-foreground/40 mt-0.5">
            {settings.security.has_social_login
              ? t('settings.security.socialConnected')
              : t('settings.security.socialNotConnected')}
          </p>
        </div>
        <span className={`ml-auto text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
          settings.security.has_social_login
            ? 'bg-green-500/10 text-green-500'
            : 'bg-foreground/8 text-foreground/40'
        }`}>
          {settings.security.has_social_login ? t('settings.security.connected') : t('settings.security.none')}
        </span>
      </div>

      {/* Password change */}
      {settings.security.has_password_credential ? (
        <div className="space-y-4">
          <p className="text-xs text-foreground/40 leading-relaxed">
            {t('settings.security.passwordChangeHint')}
          </p>

          <div>
            <FieldLabel>{t('settings.security.currentPassword')}</FieldLabel>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={passwordDraft.current_password}
                onChange={(e) => setPasswordDraft({ ...passwordDraft, current_password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 pr-10 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                aria-label={t(showCurrent ? 'auth.login.hidePassword' : 'auth.login.showPassword')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <FieldError msg={fieldErrors.current_password?.[0]} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>{t('settings.security.newPassword')}</FieldLabel>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={passwordDraft.new_password}
                  onChange={(e) => setPasswordDraft({ ...passwordDraft, new_password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 pr-10 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  aria-label={t(showNew ? 'auth.login.hidePassword' : 'auth.login.showPassword')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FieldError msg={fieldErrors.new_password?.[0]} />
            </div>
            <div>
              <FieldLabel>{t('settings.security.confirmNewPassword')}</FieldLabel>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={passwordDraft.new_password_confirmation}
                  onChange={(e) => setPasswordDraft({ ...passwordDraft, new_password_confirmation: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 pr-10 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={t(showConfirm ? 'auth.login.hidePassword' : 'auth.login.showPassword')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <GlassButton onClick={onSavePassword} disabled={saving} className="px-8">
              {saving ? t('settings.actions.updating') : t('settings.actions.updatePassword')}
            </GlassButton>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-border-glow bg-foreground/3 text-sm text-foreground/50">
          {t('settings.security.noPasswordCredential')}
        </div>
      )}
    </div>
  );
}

function PreferencesPanel({
  settings, setSettings, onSave, saving, t,
}: {
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  onSave: () => void; saving: boolean;
  t: (key: string) => string;
}) {
  const themes: { value: 'light' | 'dark' | 'system'; label: string; icon: React.ElementType }[] = [
    { value: 'light', label: t('settings.preferences.theme.light'), icon: Sun },
    { value: 'dark', label: t('settings.preferences.theme.dark'), icon: Moon },
    { value: 'system', label: t('settings.preferences.theme.system'), icon: Monitor },
  ];
  return (
    <div className="space-y-8">
      {/* Theme */}
      <div>
        <FieldLabel>{t('settings.preferences.appearance')}</FieldLabel>
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
        <FieldLabel>{t('settings.preferences.sidebar')}</FieldLabel>
        <div className="flex items-center justify-between p-4 rounded-xl border border-border-glow bg-foreground/3">
          <div>
            <p className="text-sm font-semibold">{t('settings.preferences.collapseSidebarByDefault')}</p>
            <p className="text-xs text-foreground/40 mt-0.5">
              {t('settings.preferences.collapseSidebarHint')}
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

      {/* Language */}
      <div>
        <FieldLabel>{t('settings.language')}</FieldLabel>
        <div className="p-4 rounded-xl border border-border-glow bg-foreground/3 space-y-3">
          <label htmlFor="language-select" className="text-sm font-semibold">{t('settings.preferredLanguage')}</label>
          <select
            id="language-select"
            value={settings.preferences.locale}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                preferences: { ...prev.preferences, locale: e.target.value as UserSettings['preferences']['locale'] },
              }))
            }
            className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none transition-all focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30"
          >
            {LOCALE_OPTIONS.map((locale) => (
              <option key={locale.value} value={locale.value} className="bg-background text-foreground">
                {locale.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <GlassButton onClick={onSave} disabled={saving} className="px-8">
          {saving ? t('settings.actions.saving') : t('settings.actions.savePreferences')}
        </GlassButton>
      </div>
    </div>
  );
}

function NotificationsPanel({
  settings, setSettings, onSave, saving, t,
}: {
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  onSave: () => void; saving: boolean;
  t: (key: string) => string;
}) {
  const emailKeys = ['email_mentions', 'email_issue_assigned', 'email_comment_replies'] as const;
  const inAppKeys = ['in_app_mentions', 'in_app_issue_assigned', 'in_app_comment_replies'] as const;

  const NotifRow = ({ notifKey }: { notifKey: string }) => {
    const value = settings.notifications[notifKey as keyof typeof settings.notifications];
    return (
      <div className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
        <span className="text-sm font-medium text-foreground/70">
          {t(`settings.notifications.${notifKey}`)}
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
          <FieldLabel>{t('settings.notifications.emailTitle')}</FieldLabel>
        </div>
        <div className="divide-y divide-border-glow px-1">
          {emailKeys.map((k) => <NotifRow key={k} notifKey={k} />)}
        </div>
      </div>

      {/* In-app */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Bell size={14} className="text-foreground/40" />
          <FieldLabel>{t('settings.notifications.inAppTitle')}</FieldLabel>
        </div>
        <div className="divide-y divide-border-glow px-1">
          {inAppKeys.map((k) => <NotifRow key={k} notifKey={k} />)}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <GlassButton onClick={onSave} disabled={saving} className="px-8">
          {saving ? t('settings.actions.saving') : t('settings.actions.saveNotifications')}
        </GlassButton>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>('account');
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
  const { t, setLocale } = useLocale();

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getUserSettings();
        setSettings({
          ...data,
          preferences: { ...data.preferences, theme: data.preferences.theme ?? 'system', locale: data.preferences.locale ?? 'en' },
        });
        setLocale(data.preferences.locale ?? 'en');
        setNameDraft(data.profile.name);
        setCollapsed(data.preferences.sidebar_collapsed_default);
      } catch {
        setError(t('settings.errors.loadFailed'));
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [setCollapsed]);

  const clearFeedback = () => { setMessage(null); setError(null); };

  const save = async (payload: UpdateUserSettingsPayload, successMessage: string): Promise<boolean> => {
    setSaving(true);
    clearFeedback();
    setFieldErrors({});
    try {
      const updated = await updateUserSettings(payload);
      setSettings(updated);
      setLocale(updated.preferences.locale ?? 'en');
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
      setError(axiosErr.response?.data?.message || t('settings.errors.saveFailed'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const onSaveAccount = async () => {
    const saved = await save({ profile: { ...settings.profile, name: nameDraft } }, t('settings.messages.accountUpdated'));
    if (saved) await refreshUser();
  };

  const onSavePreferences = () => save({ preferences: settings.preferences }, t('settings.messages.preferencesSaved'));
  const onSaveNotifications = () => save(
    { notifications: settings.notifications },
    t('settings.messages.notificationsSaved'),
  );

  const onResendVerification = async () => {
    clearFeedback();
    try {
      await resendVerification();
      setMessage(t('settings.messages.verificationSent'));
    } catch {
      setError(t('settings.errors.verificationSendFailed'));
    }
  };

  const onSavePassword = async () => {
    setSaving(true);
    clearFeedback();
    setFieldErrors({});
    try {
      await updatePassword(passwordDraft);
      setPasswordDraft({ current_password: '', new_password: '', new_password_confirmation: '' });
      setMessage(t('settings.messages.passwordUpdated'));
    } catch (err) {
      const axiosErr = err as AxiosError<{ errors?: Record<string, string[]>; message?: string }>;
      setFieldErrors(axiosErr.response?.data?.errors || {});
      setError(axiosErr.response?.data?.message || t('settings.errors.passwordUpdateFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground/30 font-bold animate-pulse uppercase tracking-widest text-sm">
          {t('settings.loading')}
        </div>
      </div>
    );
  }

  const ActiveIcon = sectionIcons[activeSection];

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Page header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
          <Sliders size={20} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full">
        {/* Section nav */}
        <div className="w-full lg:w-[220px] lg:shrink-0 lg:self-start lg:sticky lg:top-4">
          <GlassCard className="p-2">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
              {sections.map((section) => {
                const Icon = sectionIcons[section];
                const active = section === activeSection;
                return (
                  <button
                    key={section}
                    onClick={() => { setActiveSection(section); clearFeedback(); setFieldErrors({}); }}
                    className={`shrink-0 flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors lg:w-full ${
                      active
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'text-foreground/55 hover:bg-foreground/5 hover:text-foreground'
                    }`}
                  >
                    <Icon size={17} className="shrink-0" />
                    {t(`settings.sections.${section}`)}
                    {active && (
                      <ChevronRight size={14} className="ml-auto text-brand-primary/60 hidden lg:block" />
                    )}
                  </button>
                );
              })}
            </nav>
          </GlassCard>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 w-full">
          <GlassCard className="p-5 sm:p-8 min-h-[520px] w-full">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-7 pb-6 border-b border-border-glow">
            <div className="w-9 h-9 bg-brand-primary/10 rounded-xl flex items-center justify-center">
              <ActiveIcon size={18} className="text-brand-primary" />
            </div>
            <div>
              <h2 className="font-bold text-lg">{t(`settings.sections.${activeSection}`)}</h2>
              <p className="text-xs text-foreground/40">
                {t(`settings.subtitles.${activeSection}`)}
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
              {activeSection === 'account' && (
                <AccountPanel
                  settings={settings}
                  nameDraft={nameDraft}
                  setNameDraft={setNameDraft}
                  onSave={onSaveAccount}
                  onResend={onResendVerification}
                  saving={saving}
                  fieldErrors={fieldErrors}
                  t={t}
                />
              )}
              {activeSection === 'security' && (
                <SecurityPanel
                  settings={settings}
                  passwordDraft={passwordDraft}
                  setPasswordDraft={setPasswordDraft}
                  onSavePassword={onSavePassword}
                  saving={saving}
                  fieldErrors={fieldErrors}
                  t={t}
                />
              )}
              {activeSection === 'preferences' && (
                <PreferencesPanel
                  settings={settings}
                  setSettings={setSettings}
                  onSave={onSavePreferences}
                  saving={saving}
                  t={t}
                />
              )}
              {activeSection === 'notifications' && (
                <NotificationsPanel
                  settings={settings}
                  setSettings={setSettings}
                  onSave={onSaveNotifications}
                  saving={saving}
                  t={t}
                />
              )}
            </motion.div>
          </AnimatePresence>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
