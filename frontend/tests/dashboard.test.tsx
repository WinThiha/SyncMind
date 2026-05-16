import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import DashboardPage from '@/app/dashboard/page'
import { ThemeProvider } from '@/context/ThemeContext'
import { LocaleProvider } from '@/context/LocaleContext'
import { getDashboard, type DashboardData } from '@/lib/api/dashboard'

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
}))

vi.mock('@/lib/api/dashboard', () => ({
  getDashboard: vi.fn(),
}))

const populatedDashboard: DashboardData = {
  summary: {
    active_projects: 2,
    my_open_issues: 4,
    due_soon: 1,
    overdue: 1,
  },
  my_work: [
    {
      id: 1,
      project_id: 10,
      project_name: 'SyncMind Core',
      project_key: 'SYNC',
      key: 'SYNC-42',
      summary: 'Add dashboard summary API',
      status: 'in_progress',
      priority: 'high',
      due_date: '2026-05-20',
      updated_at: '2026-05-16T00:00:00.000000Z',
    },
  ],
  upcoming: [
    {
      id: 2,
      project_id: 10,
      project_name: 'SyncMind Core',
      project_key: 'SYNC',
      key: 'SYNC-43',
      summary: 'Polish dashboard panels',
      status: 'open',
      priority: 'normal',
      due_date: '2026-05-21',
      updated_at: '2026-05-16T00:00:00.000000Z',
    },
  ],
  project_health: [
    {
      id: 10,
      name: 'SyncMind Core',
      key: 'SYNC',
      members_count: 3,
      issues_count: 12,
      overdue_issues_count: 1,
      progress: 50,
      updated_at: '2026-05-16T00:00:00.000000Z',
    },
  ],
  recent_activity: [
    {
      type: 'comment',
      actor: 'Jane',
      issue_key: 'SYNC-42',
      issue_summary: 'Add dashboard summary API',
      project_id: 10,
      project_name: 'SyncMind Core',
      created_at: '2026-05-16T00:00:00.000000Z',
      text: 'Jane commented on SYNC-42',
    },
  ],
}

function renderDashboard() {
  return render(
    <ThemeProvider>
      <LocaleProvider>
        <DashboardPage />
      </LocaleProvider>
    </ThemeProvider>
  )
}

describe('Dashboard Layout', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.mocked(getDashboard).mockReset()
    vi.mocked(getDashboard).mockResolvedValue(populatedDashboard)
  })

  it('renders dashboard cockpit sections and create project action', async () => {
    renderDashboard()

    expect(screen.getByText(/Welcome back,/)).toBeInTheDocument()
    expect(screen.getByText('Create New Project')).toBeInTheDocument()
    expect(await screen.findByText('Operational cockpit')).toBeInTheDocument()
    expect(screen.getByText('My Work')).toBeInTheDocument()
    expect(screen.getByText('Project Health')).toBeInTheDocument()
    expect(screen.getByText('Upcoming')).toBeInTheDocument()
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
  })

  it('renders API-backed summary and panel data', async () => {
    renderDashboard()

    expect(await screen.findByText('Active Projects')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('Add dashboard summary API')).toBeInTheDocument()
    expect(screen.getByText('Polish dashboard panels')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /SYNC-42.*Add dashboard summary API/ })).toHaveAttribute(
      'href',
      '/projects/10/issues/SYNC-42'
    )
    expect(screen.getByRole('link', { name: /SYNC-43.*Polish dashboard panels/ })).toHaveAttribute(
      'href',
      '/projects/10/issues/SYNC-43'
    )
    expect(screen.getAllByText('SyncMind Core').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Issues')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open SyncMind Core' })).toHaveAttribute('href', '/projects/10')
    expect(screen.getByText('Jane commented on SYNC-42')).toBeInTheDocument()
  })

  it('renders empty states for empty panels', async () => {
    vi.mocked(getDashboard).mockResolvedValue({
      summary: {
        active_projects: 0,
        my_open_issues: 0,
        due_soon: 0,
        overdue: 0,
      },
      my_work: [],
      upcoming: [],
      project_health: [],
      recent_activity: [],
    })

    renderDashboard()

    expect(await screen.findByText('No assigned open issues.')).toBeInTheDocument()
    expect(screen.getByText('No projects to show yet.')).toBeInTheDocument()
    expect(screen.getByText('No assigned issues due soon.')).toBeInTheDocument()
    expect(screen.getByText('No recent activity yet.')).toBeInTheDocument()
  })

  it('renders an error state while preserving create project action', async () => {
    vi.mocked(getDashboard).mockRejectedValue(new Error('failed'))

    renderDashboard()

    expect(await screen.findByText('Dashboard data could not be loaded.')).toBeInTheDocument()
    expect(screen.getByText('Create New Project')).toBeInTheDocument()
  })
})
