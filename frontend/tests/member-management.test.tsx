import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import MemberManagement from '@/components/projects/MemberManagement';

const mockGetProjectMembers = vi.hoisted(() => vi.fn());
const mockGetProjectInvitations = vi.hoisted(() => vi.fn());
const mockAddProjectMember = vi.hoisted(() => vi.fn());
const mockUpdateProjectMember = vi.hoisted(() => vi.fn());
const mockRemoveProjectMember = vi.hoisted(() => vi.fn());
const mockCancelProjectInvitation = vi.hoisted(() => vi.fn());

vi.mock('@/lib/api/projects', () => ({
  getProjectMembers: mockGetProjectMembers,
  getProjectInvitations: mockGetProjectInvitations,
  addProjectMember: mockAddProjectMember,
  updateProjectMember: mockUpdateProjectMember,
  removeProjectMember: mockRemoveProjectMember,
  cancelProjectInvitation: mockCancelProjectInvitation,
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Admin', email: 'admin@example.com' },
  }),
}));

describe('MemberManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetProjectMembers.mockResolvedValue([
      { id: 1, name: 'Admin', email: 'admin@example.com', pivot: { role: 'admin', position: 'Manager' } },
      { id: 2, name: 'Alice', email: 'alice@example.com', pivot: { role: 'normal', position: 'Developer' } },
    ]);
    mockGetProjectInvitations.mockResolvedValue([]);
    mockAddProjectMember.mockResolvedValue({ type: 'invited', data: { id: 99, email: 'new@example.com', role: 'normal' } });
    mockUpdateProjectMember.mockResolvedValue({ message: 'ok' });
  });

  it('sends position when adding/inviting a member', async () => {
    render(<MemberManagement projectId={7} creatorId={1} userRole="admin" />);

    await screen.findByText('Project Members');

    fireEvent.change(screen.getByPlaceholderText('Email address (existing user or invite new)'), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Position (optional)'), {
      target: { value: 'Designer' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ADD / INVITE' }));

    await waitFor(() =>
      expect(mockAddProjectMember).toHaveBeenCalledWith(7, {
        email: 'new@example.com',
        role: 'normal',
        position: 'Designer',
      })
    );
  });

  it('updates member position on blur for manageable members', async () => {
    render(<MemberManagement projectId={7} creatorId={1} userRole="admin" />);

    await screen.findByText('alice@example.com');

    const positionInputs = screen.getAllByPlaceholderText('Position');
    fireEvent.blur(positionInputs[1], { target: { value: 'Senior Developer' } });

    await waitFor(() =>
      expect(mockUpdateProjectMember).toHaveBeenCalledWith(7, 2, {
        role: 'normal',
        position: 'Senior Developer',
      })
    );
  });
});
