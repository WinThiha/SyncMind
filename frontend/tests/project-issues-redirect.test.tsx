import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import ProjectIssuesPage from '@/app/projects/[id]/issues/page'

const routerPushMock = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: routerPushMock,
  }),
}))

describe('Project issues list route', () => {
  beforeEach(() => {
    routerPushMock.mockReset()
  })

  it('redirects to the global issues list with the project preselected', async () => {
    render(<ProjectIssuesPage params={Promise.resolve({ id: '10' })} />)

    await waitFor(() => expect(routerPushMock).toHaveBeenCalledWith('/issues?project_id=10'))
  })
})
