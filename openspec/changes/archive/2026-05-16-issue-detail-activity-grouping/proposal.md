## Why

The issue detail slider (`IssueDetailView`) displays comments and history in a unified activity feed, grouped by user and time proximity (within 2 seconds). The standalone issue detail page (`page.tsx`) renders them as two separate sections — `Comments` and `ChangeHistory` — with no grouping, creating an inconsistent user experience between the two views.

## What Changes

- Extract the `activityEntities` grouping logic from `IssueDetailView` into a reusable hook (`useActivityEntities`)
- Replace the separate `Comments` and `ChangeHistory` sections on the detail page with a unified activity feed that matches the slider's rendering
- Apply stale comments to `Comments.tsx` and `ChangeHistory.tsx` since they are no longer used on the detail page
- Keep all other sections on the detail page (description, quick update, AI summary, properties sidebar) unchanged

## Capabilities

### New Capabilities

- `issue-activity-feed`: A unified activity feed that merges comments and history entries, grouped by user and time proximity (within 2 seconds), with assignee ID history entries resolved to member names

### Modified Capabilities

- `003-issue-management`: The activity feed display behavior changes from two separate sections to a unified grouped timeline matching the slider

## Impact

- **Frontend**: New shared hook `useActivityEntities`; updated detail page activity section; stale comments on two existing components
- **No backend changes**: API contracts remain the same
- **No new dependencies**