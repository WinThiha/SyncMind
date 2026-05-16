import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import IssueDetailPage from '@/app/projects/[id]/issues/[key]/page'
import { LocaleProvider } from '@/context/LocaleContext'
import { getIssue, updateIssue, createIssueComment, summarizeIssue } from '@/lib/api/issues'
import { getProject, getProjectMembers } from '@/lib/api/projects'
import { getMilestones } from '@/lib/api/milestones'

const mockUser = vi.hoisted(() => ({ id: 1, name: 'Admin User', email: 'admin@example.com' }))

type ProjectWithMembers = Awaited<ReturnType<typeof getProject>> & {
  members: Array<{ id: number; pivot: { role: string } }>
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')

  return {
    ...actual,
    use: (value: unknown) => {
      if (value && typeof (value as Promise<unknown>).then === 'function') {
        return { id: '2', key: 'PRJ-5' }
      }

      return actual.use(value as never)
    },
  }
})

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}))

vi.mock('@/lib/api/issues', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api/issues')>('@/lib/api/issues')

  return {
    ...actual,
    getIssue: vi.fn(),
    updateIssue: vi.fn(),
    createIssueComment: vi.fn(),
    summarizeIssue: vi.fn(),
  }
})

vi.mock('@/lib/api/projects', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api/projects')>('@/lib/api/projects')

  return {
    ...actual,
    getProject: vi.fn(),
    getProjectMembers: vi.fn(),
  }
})

vi.mock('@/lib/api/milestones', () => ({
  getMilestones: vi.fn(),
}))

vi.mock('@/components/shared/MarkdownEditor', () => ({
  default: ({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) => (
    <textarea
      aria-label={placeholder}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}))

const baseIssue = {
  id: 5,
  project_id: 2,
  key: 'PRJ-5',
  key_number: 5,
  summary: 'Fix detail page parity',
  description: 'Detail page should match slider behavior.',
  status: 'open',
  priority: 'normal',
  issue_type: 'Bug',
  estimated_hours: 2,
  actual_hours: 1,
  assignee_id: 1,
  milestone_id: null,
  due_date: null,
  creator_id: 1,
  created_at: '2026-05-01T00:00:00.000000Z',
  updated_at: '2026-05-01T00:00:00.000000Z',
  assignee: { id: 1, name: 'Admin User', email: 'admin@example.com' },
  creator: { id: 1, name: 'Admin User', email: 'admin@example.com' },
  comments: [],
  history: [],
}

function renderPage() {
  return render(
    <LocaleProvider>
      <IssueDetailPage params={Promise.resolve({ id: '2', key: 'PRJ-5' })} />
    </LocaleProvider>
  )
}

describe('Issue detail page slider parity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()

    vi.mocked(getIssue).mockResolvedValue(baseIssue)
    vi.mocked(getProject).mockResolvedValue({
      id: 2,
      name: 'Project',
      key: 'PRJ',
      issue_types: ['Task', 'Bug'],
      creator_id: 1,
      created_at: '2026-05-01T00:00:00.000000Z',
      updated_at: '2026-05-01T00:00:00.000000Z',
      members: [{ id: 1, pivot: { role: 'admin' } }],
    } as ProjectWithMembers)
    vi.mocked(getProjectMembers).mockResolvedValue([
      { id: 1, name: 'Admin User', email: 'admin@example.com' },
      { id: 3, name: 'Engineer User', email: 'engineer@example.com' },
    ])
    vi.mocked(getMilestones).mockResolvedValue([])
    vi.mocked(updateIssue).mockResolvedValue({ ...baseIssue, status: 'resolved' })
    vi.mocked(createIssueComment).mockResolvedValue({
      id: 12,
      content: 'Ready for QA',
      created_at: '2026-05-02T00:00:00.000000Z',
      user: { name: 'Admin User' },
    })
    vi.mocked(summarizeIssue).mockResolvedValue({
      summary: 'The thread is ready for QA.',
      decisions: ['Ship the parity update'],
      consensus: 'Proceed',
      action_items: ['Verify detail page behavior'],
    })
  })

  it('summarizes the issue thread from the standalone detail page', async () => {
    renderPage()

    await screen.findByText('Fix detail page parity')

    fireEvent.click(screen.getByText('SUMMARIZE THREAD'))

    await waitFor(() => expect(summarizeIssue).toHaveBeenCalledWith('2', 'PRJ-5', false))
    expect(await screen.findByText('The thread is ready for QA.')).toBeInTheDocument()
    expect(screen.getByText('Ship the parity update')).toBeInTheDocument()
    expect(screen.getByText('Verify detail page behavior')).toBeInTheDocument()
  })

  it('submits quick field updates with an optional comment', async () => {
    renderPage()

    await screen.findByText('Fix detail page parity')

    const statusSelect = screen.getAllByDisplayValue('OPEN')[0]
    fireEvent.change(statusSelect, { target: { value: 'resolved' } })
    fireEvent.change(screen.getByLabelText('Write your comment...'), {
      target: { value: 'Ready for QA' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Update & Post/i }))

    await waitFor(() => {
      expect(updateIssue).toHaveBeenCalledWith('2', 'PRJ-5', {
        status: 'resolved',
        priority: 'normal',
        assignee_id: 1,
        estimated_hours: 2,
        actual_hours: 1,
      })
    })
    expect(createIssueComment).toHaveBeenCalledWith('2', 'PRJ-5', { content: 'Ready for QA' })
    expect(getIssue).toHaveBeenCalledTimes(2)
  })
})
