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

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockGetUserSettings.mockResolvedValue({
      profile: { name: 'Jane Doe', email: 'jane@example.com' },
      verification: { email_verified: false },
      security: { has_password_credential: true, has_social_login: true },
      preferences: { theme: 'dark', sidebar_collapsed_default: true },
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
      preferences: payload?.preferences ?? { theme: 'dark', sidebar_collapsed_default: true },
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

    expect(await screen.findByText('Settings')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Account' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Security' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Preferences' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument()
    expect(screen.getByText(/Project administration/)).toBeInTheDocument()
    expect(screen.getByText('Email updates are temporarily disabled.')).toBeInTheDocument()
    expect(mockApplySavedThemePreference).not.toHaveBeenCalled()
  })

  it('shows saved theme in preferences without applying theme on mount', async () => {
    mockGetUserSettings.mockResolvedValueOnce({
      profile: { name: 'Jane Doe', email: 'jane@example.com' },
      verification: { email_verified: false },
      security: { has_password_credential: true, has_social_login: true },
      preferences: { theme: 'light', sidebar_collapsed_default: true },
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
    await screen.findByText('Settings')
    fireEvent.click(screen.getByRole('button', { name: 'Preferences' }))

    expect(screen.getByLabelText('Theme')).toHaveValue('light')
    expect(mockApplySavedThemePreference).not.toHaveBeenCalled()
  })

  it('clears local override when saving system theme preference', async () => {
    render(<SettingsPage />)

    await screen.findByText('Settings')
    fireEvent.click(screen.getByRole('button', { name: 'Preferences' }))
    fireEvent.change(screen.getByLabelText('Theme'), { target: { value: 'system' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Preferences' }))

    await waitFor(() => expect(mockUpdateUserSettings).toHaveBeenCalled())
    await waitFor(() => expect(mockApplySavedThemePreference).toHaveBeenCalledWith('system'))
    expect(mockClearThemeOverride).toHaveBeenCalled()
  })

  it('saves account updates, refreshes auth user, and shows save feedback', async () => {
    render(<SettingsPage />)

    await screen.findByText('Settings')
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Updated' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Account' }))

    await waitFor(() => expect(mockUpdateUserSettings).toHaveBeenCalled())
    await waitFor(() => expect(mockRefreshUser).toHaveBeenCalled())
    expect(await screen.findByText('Account updated.')).toBeInTheDocument()
  })

  it('updates password from security section and shows success feedback', async () => {
    render(<SettingsPage />)

    await screen.findByText('Settings')
    fireEvent.click(screen.getByRole('button', { name: 'Security' }))
    fireEvent.change(screen.getByLabelText('Current password'), { target: { value: 'password' } })
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'new-password-123' } })
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'new-password-123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Update Password' }))

    await waitFor(() => expect(mockUpdatePassword).toHaveBeenCalledWith({
      current_password: 'password',
      new_password: 'new-password-123',
      new_password_confirmation: 'new-password-123',
    }))
    expect(await screen.findByText('Password updated.')).toBeInTheDocument()
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

    await screen.findByText('Settings')
    fireEvent.click(screen.getByRole('button', { name: 'Security' }))
    fireEvent.change(screen.getByLabelText('Current password'), { target: { value: 'wrong' } })
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'new-password-123' } })
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'new-password-123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Update Password' }))

    expect(await screen.findByText('Current password is incorrect.')).toBeInTheDocument()
  })
})
