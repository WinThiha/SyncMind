import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout'
import type { ReactNode } from 'react'

const routerPushMock = vi.hoisted(() => vi.fn())
const authState = vi.hoisted(() => ({
  value: {
    user: null as { name: string; email: string } | null,
    loading: false,
    logout: vi.fn(),
    refreshUser: vi.fn(),
  },
}))
const sidebarState = vi.hoisted(() => ({
  value: {
    collapsed: false,
    toggle: vi.fn(),
    setCollapsed: vi.fn(),
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: routerPushMock,
  }),
}))

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => authState.value,
}))

vi.mock('@/context/SidebarContext', () => ({
  SidebarProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useSidebar: () => sidebarState.value,
}))

vi.mock('@/components/layout/Sidebar', () => ({
  Sidebar: () => <aside>Sidebar</aside>,
}))

vi.mock('@/components/layout/Topbar', () => ({
  Topbar: () => <header>Topbar</header>,
}))

vi.mock('@/components/layout/TransitionWrapper', () => ({
  TransitionWrapper: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

describe('AuthenticatedLayout', () => {
  beforeEach(() => {
    routerPushMock.mockReset()
    authState.value = {
      user: null,
      loading: false,
      logout: vi.fn(),
      refreshUser: vi.fn(),
    }
    sidebarState.value = {
      collapsed: false,
      toggle: vi.fn(),
      setCollapsed: vi.fn(),
    }
  })

  it('redirects unauthenticated visitors to the login page', async () => {
    render(
      <AuthenticatedLayout>
        <div>Protected Content</div>
      </AuthenticatedLayout>
    )

    await waitFor(() => expect(routerPushMock).toHaveBeenCalledWith('/login'))
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders protected content when a user is available', () => {
    authState.value = {
      user: { name: 'Jane Doe', email: 'jane@example.com' },
      loading: false,
      logout: vi.fn(),
      refreshUser: vi.fn(),
    }

    render(
      <AuthenticatedLayout>
        <div>Protected Content</div>
      </AuthenticatedLayout>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(routerPushMock).not.toHaveBeenCalled()
  })
})
