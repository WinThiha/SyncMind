import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CreateIssueForm from '@/components/issues/CreateIssueForm';
import { LocaleProvider } from '@/context/LocaleContext';
import { suggestIssueFields } from '@/lib/api/issues';

vi.mock('@/components/shared/MarkdownEditor', () => ({
  default: ({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) => (
    <textarea aria-label="Description editor" placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
  ),
}));

vi.mock('@/lib/api/projects', () => ({
  getProject: vi.fn().mockResolvedValue({ id: 2, key: 'SM', name: 'SyncMind', issue_types: ['Task', 'Bug', 'Story'] }),
  getProjectMembers: vi.fn().mockResolvedValue([{ id: 7, name: 'Nandar', email: 'nandar@example.com' }]),
}));

vi.mock('@/lib/api/milestones', () => ({
  getMilestones: vi.fn().mockResolvedValue([
    {
      id: 3,
      project_id: 2,
      name: 'May Release',
      description: null,
      start_date: null,
      due_date: '2026-05-24',
      status: 'open',
      is_overdue: false,
      progress: { total: 0, completed: 0, percentage: 0 },
      created_at: '',
      updated_at: '',
    },
  ]),
}));

vi.mock('@/lib/api/issues', () => ({
  createIssue: vi.fn(),
  getSimilarIssues: vi.fn().mockResolvedValue([]),
  suggestIssueFields: vi.fn(),
}));

describe('CreateIssueForm AI draft', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('opens the AI draft drawer, sends selected locale, and fills untouched fields', async () => {
    vi.mocked(suggestIssueFields).mockResolvedValue({
      summary: 'Fix checkout failure',
      description: 'Generated markdown description',
      issue_type: 'Bug',
      priority: 'high',
      estimated_hours: 4,
      due_date: '2026-05-24',
      milestone_id: 3,
      assignee_suggestions: [{ assignee_id: 7, reason: 'Handled similar checkout bugs with low current workload.' }],
      open_questions: [],
    });

    render(
      <LocaleProvider>
        <CreateIssueForm projectId={2} onSuccess={vi.fn()} onCancel={vi.fn()} />
      </LocaleProvider>
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Generate with AI' }));
    fireEvent.change(screen.getByLabelText('Source prompt'), {
      target: { value: 'Customer chat says checkout fails after payment.' },
    });
    fireEvent.change(screen.getByLabelText('Output language'), { target: { value: 'vi-VN' } });
    fireEvent.click(screen.getByRole('button', { name: 'Generate draft' }));

    await waitFor(() => {
      expect(suggestIssueFields).toHaveBeenCalledWith(2, expect.objectContaining({
        prompt: 'Customer chat says checkout fails after payment.',
        output_locale: 'vi-VN',
      }));
    });

    expect(await screen.findByDisplayValue('Fix checkout failure')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Generated markdown description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('4')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-05-24')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /AI draft applied/ })).toBeInTheDocument();
    expect(screen.getAllByText('Nandar').length).toBeGreaterThan(0);
  });

  it('preserves user-touched summary when applying an AI draft', async () => {
    vi.mocked(suggestIssueFields).mockResolvedValue({
      summary: 'AI replacement summary',
      description: 'Generated description',
      issue_type: 'Task',
      priority: 'normal',
      estimated_hours: null,
      due_date: null,
      milestone_id: null,
      assignee_suggestions: [],
      open_questions: [],
    });

    render(
      <LocaleProvider>
        <CreateIssueForm projectId={2} onSuccess={vi.fn()} onCancel={vi.fn()} />
      </LocaleProvider>
    );

    const summaryInput = await screen.findByPlaceholderText('What needs to be done?');
    fireEvent.change(summaryInput, { target: { value: 'Manual summary' } });
    fireEvent.click(screen.getByRole('button', { name: 'Generate with AI' }));
    fireEvent.change(screen.getByLabelText('Source prompt'), { target: { value: 'Draft this issue.' } });
    fireEvent.click(within(screen.getByRole('complementary')).getByRole('button', { name: 'Generate draft' }));

    await waitFor(() => expect(suggestIssueFields).toHaveBeenCalled());
    expect(screen.getByDisplayValue('Manual summary')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('AI replacement summary')).not.toBeInTheDocument();
  });

  it('fills a user-touched field when the current value is blank', async () => {
    vi.mocked(suggestIssueFields).mockResolvedValue({
      summary: 'AI replacement summary',
      description: 'Generated description',
      issue_type: 'Bug',
      priority: 'high',
      estimated_hours: 5,
      due_date: null,
      milestone_id: null,
      assignee_suggestions: [],
      open_questions: [],
    });

    render(
      <LocaleProvider>
        <CreateIssueForm projectId={2} onSuccess={vi.fn()} onCancel={vi.fn()} />
      </LocaleProvider>
    );

    const summaryInput = await screen.findByPlaceholderText('What needs to be done?');
    fireEvent.change(summaryInput, { target: { value: 'Manual summary' } });
    fireEvent.change(summaryInput, { target: { value: '' } });
    const estimateInput = screen.getByPlaceholderText('e.g. 8');
    fireEvent.change(estimateInput, { target: { value: '8' } });
    fireEvent.change(estimateInput, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Generate with AI' }));
    fireEvent.change(screen.getByLabelText('Source prompt'), { target: { value: 'Draft this issue.' } });
    fireEvent.click(within(screen.getByRole('complementary')).getByRole('button', { name: 'Generate draft' }));

    await waitFor(() => expect(suggestIssueFields).toHaveBeenCalled());
    expect(await screen.findByDisplayValue('AI replacement summary')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
  });
});
