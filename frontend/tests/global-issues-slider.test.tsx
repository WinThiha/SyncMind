import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import IssuesPage from '@/app/issues/page'
import { LocaleProvider } from '@/context/LocaleContext'

const routerPushMock = vi.hoisted(() => vi.fn())
const searchParamState = vi.hoisted(() => ({
  value: new URLSearchParams(),
}))
const mockGetGlobalIssues = vi.hoisted(() => vi.fn())
const mockGetIssuesSummary = vi.hoisted(() => vi.fn())
const mockGetGlobalSimilarIssues = vi.hoisted(() => vi.fn())
const mockGetProjects = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: routerPushMock,
  }),
  useSearchParams: () => searchParamState.value,
}))

vi.mock('@/lib/api/issues', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api/issues')>('@/lib/api/issues')

  return {
    ...actual,
    getGlobalIssues: mockGetGlobalIssues,
    getIssuesSummary: mockGetIssuesSummary,
    getGlobalSimilarIssues: mockGetGlobalSimilarIssues,
  }
})

vi.mock('@/lib/api/projects', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api/projects')>('@/lib/api/projects')

  return {
    ...actual,
    getProjects: mockGetProjects,
  }
})

vi.mock('@/components/issues/IssueDetailView', () => ({
  IssueDetailView: ({
    issue,
    detailsHref,
  }: {
    issue: { key: string }
    detailsHref?: string
  }) => (
    <div data-testid="issue-slider">
      <span>{issue.key}</span>
      <a href={detailsHref}>Open details</a>
    </div>
  ),
}))

describe('Global issues list slider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    routerPushMock.mockReset()
    searchParamState.value = new URLSearchParams('project_id=10')
    mockGetProjects.mockResolvedValue([
      { id: 10, name: 'SyncMind Core', key: 'SYNC' },
      { id: 11, name: 'Other', key: 'OTH' },
    ])
    mockGetIssuesSummary.mockResolvedValue({
      assigned_to_me: 1,
      overdue: 0,
      high_priority: 1,
      unassigned: 0,
      project_name: 'SyncMind Core',
    })
    mockGetGlobalSimilarIssues.mockResolvedValue([])
    mockGetGlobalIssues.mockResolvedValue([
      {
        id: 42,
        project_id: 10,
        key: 'SYNC-42',
        full_key: 'SYNC-42',
        summary: 'Add global issue slider',
        description: 'Preview details',
        status: 'open',
        priority: 'high',
        issue_type: 'Task',
        due_date: null,
        updated_at: '2026-05-16T00:00:00.000000Z',
        comments_count: 2,
        project_name: 'SyncMind Core',
        project_key: 'SYNC',
      },
    ])
  })

  it('preselects project from query string and opens a clicked issue in the slider', async () => {
    render(
      <LocaleProvider>
        <IssuesPage />
      </LocaleProvider>
    )

    await waitFor(() => expect(mockGetGlobalIssues).toHaveBeenCalledWith(expect.objectContaining({ project_id: 10 })))
    expect(screen.getByLabelText('Project')).toHaveValue('10')

    fireEvent.click(await screen.findByText('Add global issue slider'))

    expect(await screen.findByTestId('issue-slider')).toHaveTextContent('SYNC-42')
    expect(screen.getByRole('link', { name: 'Open details' })).toHaveAttribute(
      'href',
      '/projects/10/issues/SYNC-42'
    )
  })
})
