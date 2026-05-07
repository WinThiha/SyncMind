import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Topbar } from '@/components/layout/Topbar'
import type { ReactNode } from 'react'

const mockSetMobileOpen = vi.hoisted(() => vi.fn())
const mockToggleTheme = vi.hoisted(() => vi.fn())

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

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Jane Doe', email: 'jane@example.com', position: 'Product' },
    logout: vi.fn(),
  }),
}))

vi.mock('@/context/SidebarContext', () => ({
  useSidebar: () => ({
    collapsed: false,
    mobileOpen: false,
    setMobileOpen: mockSetMobileOpen,
  }),
}))

vi.mock('@/hooks/useModifierKey', () => ({
  useModifierKey: () => ({
    modKey: 'Ctrl',
    isMac: false,
  }),
}))

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    locale: 'en',
    setLocale: vi.fn(),
    t: (key: string) => ({
      'nav.topbar.search': 'Search...',
      'nav.topbar.settings': 'Settings',
      'nav.topbar.signOut': 'Sign out',
      'nav.topbar.openNav': 'Open navigation',
      'nav.toolbar.locale': 'Language',
      'nav.topbar.themeLight': 'Switch to light mode',
      'nav.topbar.themeDark': 'Switch to dark mode',
      'common.user': 'User',
    }[key] ?? key),
  }),
}))

vi.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    isDarkMode: false,
    toggleTheme: mockToggleTheme,
  }),
}))

describe('Topbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders locale and theme controls in the authenticated topbar', () => {
    render(<Topbar />)

    expect(screen.getByLabelText('Language')).toHaveValue('en')
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeInTheDocument()
  })
})
