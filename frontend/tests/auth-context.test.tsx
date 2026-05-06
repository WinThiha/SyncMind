import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import api from '@/lib/axios'

const routerPushMock = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: routerPushMock,
  }),
}))

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

function AuthProbe() {
  const { user, loading, logout } = useAuth()

  return (
    <div>
      <div>{loading ? 'loading' : 'ready'}</div>
      <div>{user ? user.email : 'anon'}</div>
      <button type="button" onClick={logout}>
        logout
      </button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    routerPushMock.mockReset()
    vi.mocked(api.get).mockReset()
    vi.mocked(api.post).mockReset()
  })

  it('hydrates the current user from the API and clears state on logout', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        id: 1,
        name: 'Jane Doe',
        email: 'jane@example.com',
        email_verified_at: null,
      },
    })
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} })

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    )

    await waitFor(() => expect(screen.getByText('ready')).toBeInTheDocument())
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'logout' }))

    await waitFor(() => expect(routerPushMock).toHaveBeenCalledWith('/'))
    expect(screen.getByText('anon')).toBeInTheDocument()
  })

  it('falls back to an unauthenticated state when user hydration fails', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('unauthorized'))

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    )

    await waitFor(() => expect(screen.getByText('ready')).toBeInTheDocument())
    expect(screen.getByText('anon')).toBeInTheDocument()
  })
})
