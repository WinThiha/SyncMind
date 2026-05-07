import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import SettingsPage from '@/app/settings/page'

const mockGetUserSettings = vi.hoisted(() => vi.fn())
const mockUpdateUserSettings = vi.hoisted(() => vi.fn())
const mockUpdatePassword = vi.hoisted(() => vi.fn())
const mockResendVerification = vi.hoisted(() => vi.fn())
const mockApplySavedThemePreference = vi.hoisted(() => vi.fn())
const mockClearThemeOverride = vi.hoisted(() => vi.fn())
const mockSetCollapsed = vi.hoisted(() => vi.fn())
const mockRefreshUser = vi.hoisted(() => vi.fn())
const mockSetLocale = vi.hoisted(() => vi.fn())

vi.mock('@/lib/api/settings', () => ({
  getUserSettings: mockGetUserSettings,
  updateUserSettings: mockUpdateUserSettings,
  updatePassword: mockUpdatePassword,
  resendVerification: mockResendVerification,
}))

vi.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    applySavedThemePreference: mockApplySavedThemePreference,
    clearThemeOverride: mockClearThemeOverride,
  }),
}))

vi.mock('@/context/SidebarContext', () => ({
  useSidebar: () => ({
    setCollapsed: mockSetCollapsed,
  }),
}))

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    refreshUser: mockRefreshUser,
  }),
}))

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (key: string) => ({
      'settings.loading': 'Loading settings...',
      'settings.title': 'System Settings',
      'settings.guardrail': 'Project members, ownership, issue types, and milestones are managed from each project page.',
      'settings.sections.account': 'Account',
      'settings.sections.security': 'Security',
      'settings.sections.preferences': 'Preferences',
      'settings.sections.notifications': 'Notifications',
      'settings.subtitles.account': 'Manage your display name and verification status.',
      'settings.subtitles.security': 'Update your password and connected providers.',
      'settings.subtitles.preferences': 'Customize appearance and sidebar behaviour.',
      'settings.subtitles.notifications': 'Choose how you receive updates.',
      'settings.account.displayName': 'Display name',
      'settings.account.displayNamePlaceholder': 'Your full name',
      'settings.account.emailAddress': 'Email address',
      'settings.account.emailManagedByProvider': 'Email changes are managed through your account provider.',
      'settings.account.emailVerified': 'Email verified',
      'settings.account.emailNotVerified': 'Email not verified',
      'settings.account.emailVerificationHint': 'Check your inbox or request a new link.',
      'settings.account.resendVerification': 'Resend',
      'settings.security.socialLogin': 'Social login',
      'settings.security.socialConnected': 'Google account connected.',
      'settings.security.socialNotConnected': 'No social provider connected.',
      'settings.security.connected': 'Connected',
      'settings.security.none': 'None',
      'settings.security.passwordChangeHint': 'After a successful change, other active sessions and API tokens will be signed out.',
      'settings.security.currentPassword': 'Current password',
      'settings.security.newPassword': 'New password',
      'settings.security.confirmNewPassword': 'Confirm new password',
      'settings.security.noPasswordCredential': 'This account has no password — sign in using your social provider.',
      'settings.preferences.appearance': 'Appearance',
      'settings.preferences.sidebar': 'Sidebar',
      'settings.preferences.collapseSidebarByDefault': 'Collapse sidebar by default',
      'settings.preferences.collapseSidebarHint': 'Start every session with the sidebar collapsed.',
      'settings.preferences.theme.light': 'Light',
      'settings.preferences.theme.dark': 'Dark',
      'settings.preferences.theme.system': 'System',
      'settings.notifications.emailTitle': 'Email notifications',
      'settings.notifications.inAppTitle': 'In-app notifications',
      'settings.notifications.email_mentions': 'Mentions',
      'settings.notifications.email_issue_assigned': 'Issue assigned to you',
      'settings.notifications.email_comment_replies': 'Comment replies',
      'settings.notifications.in_app_mentions': 'Mentions',
      'settings.notifications.in_app_issue_assigned': 'Issue assigned to you',
      'settings.notifications.in_app_comment_replies': 'Comment replies',
      'settings.language': 'Language',
      'settings.preferredLanguage': 'Preferred language',
      'settings.actions.saving': 'Saving...',
      'settings.actions.updating': 'Updating...',
      'settings.actions.saveChanges': 'Save changes',
      'settings.actions.savePreferences': 'Save preferences',
      'settings.actions.saveNotifications': 'Save notifications',
      'settings.actions.updatePassword': 'Update password',
      'settings.messages.accountUpdated': 'Account updated.',
      'settings.messages.preferencesSaved': 'Preferences saved.',
      'settings.messages.notificationsSaved': 'Notification preferences saved.',
      'settings.messages.verificationSent': 'Verification email sent — check your inbox.',
      'settings.messages.passwordUpdated': 'Password updated successfully.',
      'settings.errors.loadFailed': 'Failed to load settings.',
      'settings.errors.saveFailed': 'Failed to save settings.',
      'settings.errors.verificationSendFailed': 'Could not send verification email. Try again later.',
      'settings.errors.passwordUpdateFailed': 'Failed to update password.',
    }[key] ?? key),
    setLocale: mockSetLocale,
  }),
}))

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockGetUserSettings.mockResolvedValue({
      profile: { name: 'Jane Doe', email: 'jane@example.com' },
      verification: { email_verified: false },
      security: { has_password_credential: true, has_social_login: true },
      preferences: { theme: 'dark', sidebar_collapsed_default: true, locale: 'en' },
      notifications: {
        email_mentions: true,
        email_issue_assigned: true,
        email_comment_replies: true,
        in_app_mentions: true,
        in_app_issue_assigned: true,
        in_app_comment_replies: true,
      },
    })

    mockUpdateUserSettings.mockImplementation(async (payload) => ({
      profile: { name: payload?.profile?.name ?? 'Jane Doe', email: 'jane@example.com' },
      verification: { email_verified: false },
      security: { has_password_credential: true, has_social_login: true },
      preferences: payload?.preferences ?? { theme: 'dark', sidebar_collapsed_default: true, locale: 'en' },
      notifications: payload?.notifications ?? {
        email_mentions: true,
        email_issue_assigned: true,
        email_comment_replies: true,
        in_app_mentions: true,
        in_app_issue_assigned: true,
        in_app_comment_replies: true,
      },
    }))

    mockUpdatePassword.mockResolvedValue(undefined)
  })

  it('renders settings sections and user-global guardrail copy', async () => {
    render(<SettingsPage />)

    expect(await screen.findByText('System Settings')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Account' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Security' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Preferences' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument()
    expect(screen.getByText('Email changes are managed through your account provider.')).toBeInTheDocument()
    expect(mockApplySavedThemePreference).not.toHaveBeenCalled()
  })

  it('shows saved theme and locale in preferences without applying theme on mount', async () => {
    mockGetUserSettings.mockResolvedValueOnce({
      profile: { name: 'Jane Doe', email: 'jane@example.com' },
      verification: { email_verified: false },
      security: { has_password_credential: true, has_social_login: true },
      preferences: { theme: 'light', sidebar_collapsed_default: true, locale: 'en' },
      notifications: {
        email_mentions: true,
        email_issue_assigned: true,
        email_comment_replies: true,
        in_app_mentions: true,
        in_app_issue_assigned: true,
        in_app_comment_replies: true,
      },
    })

    render(<SettingsPage />)
    await screen.findByText('System Settings')
    fireEvent.click(screen.getByRole('button', { name: 'Preferences' }))
    await screen.findByText('Appearance')

    expect(screen.getByText('Appearance')).toBeInTheDocument()
    expect(screen.getByLabelText('Preferred language')).toHaveValue('en')
    expect(mockApplySavedThemePreference).not.toHaveBeenCalled()
  })

  it('clears local override when saving system theme preference', async () => {
    render(<SettingsPage />)

    await screen.findByText('System Settings')
    fireEvent.click(screen.getByRole('button', { name: 'Preferences' }))
    await screen.findByText('Appearance')
    fireEvent.click(screen.getByText('System'))
    fireEvent.click(screen.getByRole('button', { name: 'Save preferences' }))

    await waitFor(() => expect(mockUpdateUserSettings).toHaveBeenCalled())
    await waitFor(() => expect(mockApplySavedThemePreference).toHaveBeenCalledWith('system'))
    expect(mockClearThemeOverride).toHaveBeenCalled()
  })

  it('saves account updates, refreshes auth user, and shows save feedback', async () => {
    render(<SettingsPage />)

    await screen.findByText('System Settings')
    fireEvent.change(screen.getByDisplayValue('Jane Doe'), { target: { value: 'Jane Updated' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(mockUpdateUserSettings).toHaveBeenCalled())
    await waitFor(() => expect(mockRefreshUser).toHaveBeenCalled())
    expect(await screen.findByText('Account updated.')).toBeInTheDocument()
  })

  it('updates password from security section and shows success feedback', async () => {
    render(<SettingsPage />)

    await screen.findByText('System Settings')
    fireEvent.click(screen.getByRole('button', { name: 'Security' }))
    await waitFor(() => expect(document.querySelectorAll('input[type="password"]').length).toBe(3))
    const passwordInputs = document.querySelectorAll('input[type="password"]')
    fireEvent.change(passwordInputs[0], { target: { value: 'password' } })
    fireEvent.change(passwordInputs[1], { target: { value: 'new-password-123' } })
    fireEvent.change(passwordInputs[2], { target: { value: 'new-password-123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }))

    await waitFor(() => expect(mockUpdatePassword).toHaveBeenCalledWith({
      current_password: 'password',
      new_password: 'new-password-123',
      new_password_confirmation: 'new-password-123',
    }))
    expect(await screen.findByText('Password updated successfully.')).toBeInTheDocument()
  })

  it('renders password validation feedback when update fails', async () => {
    mockUpdatePassword.mockRejectedValueOnce({
      response: {
        data: {
          message: 'The given data was invalid.',
          errors: {
            current_password: ['Current password is incorrect.'],
          },
        },
      },
    })

    render(<SettingsPage />)

    await screen.findByText('System Settings')
    fireEvent.click(screen.getByRole('button', { name: 'Security' }))
    await waitFor(() => expect(document.querySelectorAll('input[type="password"]').length).toBe(3))
    const passwordInputs = document.querySelectorAll('input[type="password"]')
    fireEvent.change(passwordInputs[0], { target: { value: 'wrong' } })
    fireEvent.change(passwordInputs[1], { target: { value: 'new-password-123' } })
    fireEvent.change(passwordInputs[2], { target: { value: 'new-password-123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }))

    expect(await screen.findByText('Current password is incorrect.')).toBeInTheDocument()
  })
})
