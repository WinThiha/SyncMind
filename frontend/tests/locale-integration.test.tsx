import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import SettingsPage from '@/app/settings/page'
import { LocaleProvider } from '@/context/LocaleContext'

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

describe('Locale end-to-end integration', () => {
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

  it('loads saved locale from settings API and reflects it in the locale selector', async () => {
    mockGetUserSettings.mockResolvedValueOnce({
      profile: { name: 'Jane Doe', email: 'jane@example.com' },
      verification: { email_verified: false },
      security: { has_password_credential: true, has_social_login: true },
      preferences: { theme: 'dark', sidebar_collapsed_default: true, locale: 'ja-JP' },
      notifications: {
        email_mentions: true,
        email_issue_assigned: true,
        email_comment_replies: true,
        in_app_mentions: true,
        in_app_issue_assigned: true,
        in_app_comment_replies: true,
      },
    })

    render(
      <LocaleProvider>
        <SettingsPage />
      </LocaleProvider>
    )

    await screen.findByText('システム設定')
    fireEvent.click(screen.getByRole('button', { name: '環境設定' }))
    await screen.findByText('外観')

    expect(screen.getByLabelText('優先言語')).toHaveValue('ja-JP')
  })

  it('updates locale context when user changes and saves locale preference', async () => {
    render(
      <LocaleProvider>
        <SettingsPage />
      </LocaleProvider>
    )

    await screen.findByText('System Settings')
    fireEvent.click(screen.getByRole('button', { name: 'Preferences' }))
    await screen.findByText('Appearance')

    // Change locale from en to vi-VN
    fireEvent.change(screen.getByLabelText('Preferred language'), {
      target: { value: 'vi-VN' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Save preferences' }))

    await waitFor(() => expect(mockUpdateUserSettings).toHaveBeenCalled())
    expect(mockUpdateUserSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        preferences: expect.objectContaining({
          locale: 'vi-VN',
        }),
      })
    )
  })

  it('renders localized UI strings when selected locale has translations', async () => {
    mockGetUserSettings.mockResolvedValueOnce({
      profile: { name: 'Jane Doe', email: 'jane@example.com' },
      verification: { email_verified: false },
      security: { has_password_credential: true, has_social_login: true },
      preferences: { theme: 'dark', sidebar_collapsed_default: true, locale: 'my-MM' },
      notifications: {
        email_mentions: true,
        email_issue_assigned: true,
        email_comment_replies: true,
        in_app_mentions: true,
        in_app_issue_assigned: true,
        in_app_comment_replies: true,
      },
    })

    render(
      <LocaleProvider>
        <SettingsPage />
      </LocaleProvider>
    )

    await screen.findByText('စနစ်ဆက်တင်များ')
    fireEvent.click(screen.getByRole('button', { name: 'စိတ်ကြိုက်များ' }))
    await screen.findByText('အပြင်အဆင်')

    expect(screen.getByRole('button', { name: 'အကောင့်' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'လုံခြုံရေး' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'စိတ်ကြိုက်များ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'အသိပေးချက်များ' })).toBeInTheDocument()
    expect(screen.getByLabelText('နှစ်သက်သော ဘာသာစကား')).toHaveValue('my-MM')
  })
})
