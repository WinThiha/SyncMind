import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DashboardPage from '@/app/dashboard/page'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { LocaleProvider } from '@/context/LocaleContext'

// Mock the hooks
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/dashboard',
}))

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'John Doe', email: 'john@example.com' },
    loading: false,
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/lib/api/projects', () => ({
  getProjects: vi.fn().mockResolvedValue([
    { id: 1, name: 'Project Alpha', description: 'Alpha project description', key: 'AL' },
  ]),
}))

describe('Dashboard Layout', () => {
  it('renders dashboard project section', async () => {
    render(
      <ThemeProvider>
        <LocaleProvider>
          <DashboardPage />
        </LocaleProvider>
      </ThemeProvider>
    )
    expect(screen.getByText('Your Projects')).toBeInTheDocument()
  })

  it('renders topbar with welcome message', async () => {
    render(
      <ThemeProvider>
        <LocaleProvider>
          <DashboardPage />
        </LocaleProvider>
      </ThemeProvider>
    )
    expect(screen.getByText(/Welcome back,/)).toBeInTheDocument()
  })

  it('renders create project button', async () => {
    render(
      <ThemeProvider>
        <LocaleProvider>
          <DashboardPage />
        </LocaleProvider>
      </ThemeProvider>
    )
    expect(screen.getByText('Create New Project')).toBeInTheDocument()
  })
})
