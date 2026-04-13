import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DashboardPage from '@/app/dashboard/page'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'

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
  it('renders sidebar with SyncMind logo', async () => {
    render(
      <ThemeProvider>
        <DashboardPage />
      </ThemeProvider>
    )
    expect(screen.getByText('SyncMind')).toBeInTheDocument()
  })

  it('renders topbar with welcome message', async () => {
    render(
      <ThemeProvider>
        <DashboardPage />
      </ThemeProvider>
    )
    expect(screen.getByText(/Welcome back, John!/)).toBeInTheDocument()
  })

  it('renders create project button', async () => {
    render(
      <ThemeProvider>
        <DashboardPage />
      </ThemeProvider>
    )
    expect(screen.getByText('Create New Project')).toBeInTheDocument()
  })
})
