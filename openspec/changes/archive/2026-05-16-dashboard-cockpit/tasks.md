## 1. Backend Dashboard API

- [x] 1.1 Add an authenticated `GET /api/dashboard` route.
- [x] 1.2 Add a dashboard controller or service that gathers projects the current user belongs to.
- [x] 1.3 Implement summary metric queries for active projects, assigned open issues, assigned issues due within seven days, and assigned overdue issues.
- [x] 1.4 Implement My Work query for assigned open issues only, including issue key, summary, project name, status, priority, due date, and project identifier.
- [x] 1.5 Implement Upcoming query from assigned open issues only, ordered by due date ascending.
- [x] 1.6 Implement Project Health query with member count, issue count, overdue issue count, and progress from resolved/closed issues.
- [x] 1.7 Implement Recent Activity aggregation from issue comments and issue history in accessible projects, normalized into one response shape.
- [x] 1.8 Add fixed conservative result limits for list panels and keep full issue descriptions out of the dashboard payload.

## 2. Backend Tests

- [x] 2.1 Add feature tests that unauthenticated requests cannot access the dashboard endpoint.
- [x] 2.2 Add feature tests that dashboard data excludes projects and activity the user cannot access.
- [x] 2.3 Add feature tests for summary metrics, including seven-day due soon and overdue boundaries.
- [x] 2.4 Add feature tests that My Work and Upcoming include assigned issues only and exclude created-only issues.
- [x] 2.5 Add feature tests for project health progress, including projects with no issues.
- [x] 2.6 Add feature tests for normalized comment and issue history activity.

## 3. Frontend Data Layer

- [x] 3.1 Add dashboard API TypeScript types matching the backend response shape.
- [x] 3.2 Add a `getDashboard` API client function.
- [x] 3.3 Add dashboard i18n keys for panel titles, metric labels, empty states, errors, and activity text.

## 4. Frontend Dashboard UI

- [x] 4.1 Replace the current dashboard page content with a cockpit layout inspired by `dashboard_tmp.tsx`.
- [x] 4.2 Render summary metric cards from the dashboard API response.
- [x] 4.3 Render My Work, Project Health, Upcoming, and Recent Activity panels from real API data.
- [x] 4.4 Add loading states sized to the final dashboard layout.
- [x] 4.5 Add empty states for each panel without using fake business data.
- [x] 4.6 Add an error state that preserves the create-project action.
- [x] 4.7 Align styling with existing `GlassCard`, `GlassButton`, brand tokens, dark mode, and responsive layout conventions.

## 5. Frontend Tests

- [x] 5.1 Update dashboard page tests for the new cockpit sections and create-project action.
- [x] 5.2 Add tests for rendering API-backed summary and panel data.
- [x] 5.3 Add tests for empty states.
- [x] 5.4 Add tests for API failure behavior.

## 6. Verification

- [x] 6.1 Clear Laravel config cache before backend tests.
- [x] 6.2 Run targeted backend dashboard tests with the Docker testing database environment.
- [ ] 6.3 Run frontend tests in the frontend Docker container.
- [x] 6.4 Run OpenSpec status/validation for `dashboard-cockpit` and resolve any artifact issues.
