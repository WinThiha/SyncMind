## Why

The dashboard currently only greets the user and lists projects, which does not surface the cross-project work that needs attention. Users need a real operational cockpit that shows assigned work, upcoming deadlines, overdue issues, recent movement, and project health without relying on placeholder data.

## What Changes

- Add a real-data dashboard cockpit for authenticated users, visually inspired by `dashboard_tmp.tsx` while staying consistent with the current SyncMind glass UI, brand tokens, and dark-mode behavior.
- Add a single dashboard API endpoint that aggregates the user's dashboard data across projects they can access.
- Show summary metrics for active projects, assigned open issues, assigned issues due within the next 7 days, and assigned overdue issues.
- Show a "My Work" panel with issues assigned to the current user only.
- Show an "Upcoming" panel with assigned issues due soon, ordered by due date.
- Show a "Project Health" panel based on real project, member, issue, and status data.
- Show a "Recent Activity" panel from real issue comments and issue history scoped to projects the user belongs to.
- Add loading, empty, and error states for every dashboard panel so no panel displays fake or static business data.

## Capabilities

### New Capabilities
- `dashboard-cockpit`: Authenticated users can view a real-data operational dashboard across their accessible projects.

### Modified Capabilities

## Impact

- Backend: new authenticated dashboard API route/controller or equivalent service, aggregate queries across projects, issues, comments, and issue history.
- Frontend: dashboard API client/types, dashboard page layout, reusable cockpit panel/card components as needed, i18n strings, and dashboard tests.
- Data behavior: no new persistent tables are expected; the endpoint should derive dashboard data from existing project, issue, comment, and history records.
- Tests: backend feature tests for authorization and aggregate payloads; frontend tests for real-data rendering, empty states, and current dashboard expectations.
