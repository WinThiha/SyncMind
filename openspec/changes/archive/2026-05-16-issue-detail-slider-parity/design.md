## Context

The issue list page opens `IssueDetailView` as a slider. That slider can request an AI thread summary, display `SummaryCard`, and submit quick updates for status, priority, assignee, estimated hours, and actual hours alongside an optional comment.

The standalone issue detail page is a separate route and component implementation. It displays issue metadata, comments, and history, but only supports quick status changes and does not expose the AI thread summary control. This creates two issue detail experiences with different capabilities.

## Goals / Non-Goals

**Goals:**

- Bring the standalone issue detail page to parity with the slider for AI thread summarization.
- Bring the standalone issue detail page to parity with the slider for quick updates to status, priority, assignee, estimated hours, and actual hours.
- Reuse existing issue update, comment creation, project member, and AI summarization API clients.
- Reload issue data after mutations so comments, history, and properties remain accurate.

**Non-Goals:**

- Do not add inline editing for summary, description, issue type, milestone, or due date.
- Do not change backend routes, validation, authorization, or AI summarization behavior.
- Do not redesign the issue slider.

## Decisions

- Add detail-page behavior locally rather than replacing the page with the slider component.
  - Rationale: The full page has a distinct two-column layout, delete controls, milestone links, comments, and history composition that should remain intact.
  - Alternative considered: Reuse `IssueDetailView` directly on the page. Rejected because the slider is portal/overlay-oriented and would require layout surgery unrelated to parity.

- Reuse existing `summarizeIssue`, `updateIssue`, and `createIssueComment` clients.
  - Rationale: The backend already supports the required behavior, so the change should stay frontend-focused.
  - Alternative considered: Add a combined update-and-comment endpoint. Rejected because the slider already sequences existing endpoints successfully.

- Keep quick field parity limited to the slider's current fields.
  - Rationale: The user explicitly scoped the change to match the slider, and the dedicated edit page already handles broader issue edits.
  - Alternative considered: Add all edit-form fields inline. Rejected as broader than requested.

- Load project members on the detail page when quick assignee editing is available.
  - Rationale: The assignee dropdown needs the same member context as the slider.
  - Alternative considered: Only display current assignee and rely on the edit page for assignment. Rejected because it would not match slider functionality.

- Unify comment and history into a single grouped activity feed on the detail page, matching the slider's `activityEntities` pattern.
  - Rationale: The slider merges comments and history into a unified timeline with grouping by same user + within 2 seconds. The standalone page should match this behavior.
  - Grouping threshold: 2000ms window (same user must be within 2 seconds to be grouped together).
  - Each grouped entity: `{ id, user, created_at, comments: [], history: [] }`.
  - Assignee ID history entries resolve to member names using the `members` array (matching slider behavior).
  - `Comments` and `ChangeHistory` components remain but are marked stale.

## Risks / Trade-offs

- Duplicate quick-edit UI may drift between slider and page -> Keep field names, payload conversion, and labels aligned with the slider during implementation, and cover the page with focused frontend tests.
- Refreshing the whole issue after each quick update is simpler but less granular -> Accept this for correctness because the detail page needs fresh history/comment context after mutations.
- AI summary can become stale after new comments or field updates -> Clear or refresh summary state after mutations, matching user expectations that summary reflects current activity.
