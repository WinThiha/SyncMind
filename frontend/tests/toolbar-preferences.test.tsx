import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ToolbarPreferences } from '@/components/toolbar/ToolbarPreferences'

const mockUpdateUserSettings = vi.hoisted(() => vi.fn())
const mockSetLocale = vi.hoisted(() => vi.fn())
const mockToggleTheme = vi.hoisted(() => vi.fn())

vi.mock('@/lib/api/settings', () => ({
  updateUserSettings: mockUpdateUserSettings,
}))

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Jane Doe', email: 'jane@example.com' },
  }),
}))

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    locale: 'en',
    setLocale: mockSetLocale,
    t: (key: string) => ({
      'nav.toolbar.locale': 'Language',
      'nav.topbar.themeLight': 'Switch to light mode',
      'nav.topbar.themeDark': 'Switch to dark mode',
    }[key] ?? key),
  }),
}))

vi.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    isDarkMode: false,
    toggleTheme: mockToggleTheme,
  }),
}))

describe('ToolbarPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdateUserSettings.mockResolvedValue(undefined)
  })

  it('renders compact locale and theme controls', () => {
    render(<ToolbarPreferences />)

    expect(screen.getByLabelText('Language')).toHaveValue('en')
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument()
  })

  it('updates locale immediately and persists the saved preference', async () => {
    render(<ToolbarPreferences />)

    fireEvent.change(screen.getByLabelText('Language'), {
      target: { value: 'ja-JP' },
    })

    expect(mockSetLocale).toHaveBeenCalledWith('ja-JP')
    await waitFor(() => expect(mockUpdateUserSettings).toHaveBeenCalledWith({
      preferences: { locale: 'ja-JP' },
    }))
  })

  it('toggles theme from the toolbar button', () => {
    render(<ToolbarPreferences />)

    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))

    expect(mockToggleTheme).toHaveBeenCalled()
  })
})
