## Why

The issue creation page currently has unreadable text when dark mode is enabled. Specifically, the description field (Markdown Editor) and the Assignee dropdown list use hardcoded light-mode colors, resulting in dark text on dark backgrounds or light text on light backgrounds. This creates a significant usability issue for users preferring dark mode.

## What Changes

- Update `MarkdownEditor.tsx` to use semantic CSS variables (e.g., `text-foreground`, `bg-transparent`, `border-border-glow`) instead of hardcoded light-mode Tailwind classes.
- Ensure the native `<select>` dropdown options for "Assignee" (and potentially other select fields) have proper background contrast in dark mode, possibly by explicitly applying `bg-background` to the `<option>` elements.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- None

## Impact

- `frontend/src/components/shared/MarkdownEditor.tsx`
- `frontend/src/components/issues/CreateIssueForm.tsx` (and potentially other forms using native `<select>` elements like `UpdateIssueForm.tsx` and `CreateProjectForm.tsx`)
- Improved accessibility and usability for dark mode users.
