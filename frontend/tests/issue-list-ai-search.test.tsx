import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import IssueList from '@/components/issues/IssueList'

const mockGetIssues = vi.hoisted(() => vi.fn())
const mockGetSimilarIssues = vi.hoisted(() => vi.fn())

vi.mock('@/lib/api/issues', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api/issues')>('@/lib/api/issues')

  return {
    ...actual,
    getIssues: mockGetIssues,
    getSimilarIssues: mockGetSimilarIssues,
  }
})

vi.mock('@/components/issues/IssueDetailView', () => ({
  IssueDetailView: ({ issue }: { issue: { key: string } }) => <div data-testid="issue-detail-key">{issue.key}</div>,
}))

describe('IssueList AI search key resolution', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockGetIssues.mockResolvedValue([
      {
        id: 1,
        project_id: 2,
        key: 'PRJ-1',
        key_number: 1,
        summary: 'Initial issue',
        description: 'desc',
        status: 'open',
        priority: 'normal',
        issue_type: 'Task',
        estimated_hours: null,
        actual_hours: null,
        assignee_id: null,
        milestone_id: null,
        due_date: null,
        creator_id: 1,
        created_at: '2026-01-01T00:00:00.000000Z',
        updated_at: '2026-01-01T00:00:00.000000Z',
      },
    ])

    mockGetSimilarIssues.mockResolvedValue([
      {
        id: 7,
        project_id: 2,
        key: 'PRJ-7',
        key_number: 7,
        summary: 'Fix login bug',
        status: 'open',
        priority: 'high',
        similarity: 0.93,
      },
    ])
  })

  it('opens AI result detail with a defined issue key', async () => {
    render(<IssueList projectId={2} />)

    await screen.findByText('Initial issue')

    fireEvent.click(screen.getByTitle('Switch to AI Search'))
    fireEvent.change(screen.getByPlaceholderText('Search with AI...'), {
      target: { value: 'login bug' },
    })

    await waitFor(() => expect(mockGetSimilarIssues).toHaveBeenCalledWith(2, 'login bug'), {
      timeout: 3000,
    })
    await screen.findByText('Fix login bug')

    fireEvent.click(screen.getByText('Fix login bug'))

    expect(await screen.findByTestId('issue-detail-key')).toHaveTextContent('PRJ-7')
    expect(screen.getByTestId('issue-detail-key')).not.toHaveTextContent('undefined')
  })
})
