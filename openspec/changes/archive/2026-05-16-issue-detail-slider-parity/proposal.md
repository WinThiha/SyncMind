## Why

The issue detail page and the issue detail slider currently expose different capabilities for the same issue workflow. Users can summarize a thread and update quick fields from the slider, but the full detail page only supports a status quick-change and requires navigation elsewhere for the same quick updates.

## What Changes

- Add the same AI thread summary action and summary display to the full issue detail page that exists in the issue detail slider.
- Add full detail page controls for the slider's quick-edit fields only: status, priority, assignee, estimated hours, and actual hours.
- Refresh the full detail page issue data after summary-relevant updates, field updates, or comments so displayed properties, comments, history, and summary context stay current.
- Keep summary, description, issue type, milestone, and due date editing on existing dedicated edit flows.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `003-issue-management`: Extend issue detail view requirements so the full issue detail page matches the issue detail slider for AI thread summarization and quick field updates.

## Impact

- Frontend issue detail route: `frontend/src/app/projects/[id]/issues/[key]/page.tsx`
- Existing issue detail slider behavior: `frontend/src/components/issues/IssueDetailView.tsx`
- Existing API clients: `frontend/src/lib/api/issues.ts`
- Existing backend issue update and AI summarization endpoints should be reused; no new API endpoints are expected.
- Frontend translations may need updates if new page-specific labels or error states are introduced.
