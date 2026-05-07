import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LandingNav } from '@/components/landing/LandingNav'
import type { ReactNode } from 'react'

const mockToggleTheme = vi.hoisted(() => vi.fn())
const mockSetLocale = vi.hoisted(() => vi.fn())

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  },
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (key: string, params?: Record<string, string | number>) => ({
      'landing.nav.capabilities': 'Capabilities',
      'landing.nav.start': 'Start',
      'landing.nav.signIn': 'Sign in',
      'landing.nav.getStarted': 'Get started',
      'landing.nav.dashboard': 'Dashboard',
      'landing.nav.greeting': `Hello ${params?.name ?? ''}`,
      'landing.nav.signedIn': 'Signed in',
      'landing.nav.closeMenu': 'Close menu',
      'landing.nav.openMenu': 'Open menu',
      'landing.nav.goToDashboard': 'Go to dashboard',
      'nav.toolbar.locale': 'Language',
      'nav.topbar.themeLight': 'Switch to light mode',
      'nav.topbar.themeDark': 'Switch to dark mode',
    }[key] ?? key),
    locale: 'en',
    setLocale: mockSetLocale,
  }),
}))

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Jane Doe', email: 'jane@example.com' },
  }),
}))

vi.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    isDarkMode: false,
    toggleTheme: mockToggleTheme,
  }),
}))

describe('LandingNav', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders locale and theme controls in the landing header', () => {
    render(<LandingNav isAuthenticated={false} />)

    expect(screen.getByLabelText('Language')).toHaveValue('en')
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Get started' })).toBeInTheDocument()
  })
})
