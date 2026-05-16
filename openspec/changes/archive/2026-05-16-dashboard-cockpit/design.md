## Context

The current dashboard is a thin frontend page that renders a greeting, a create-project action, and the existing project grid. The desired dashboard is closer to `dashboard_tmp.tsx`: a cross-project cockpit with summary metrics, assigned work, upcoming deadlines, project health, and recent activity.

Most required data already exists in the backend through projects, issues, comments, and issue histories. The missing piece is an authenticated aggregate API designed for the dashboard. The frontend must not fabricate business data to fill panels; every panel needs loading, empty, error, or real data.

## Goals / Non-Goals

**Goals:**
- Provide one authenticated dashboard payload for the current user.
- Scope work-oriented metrics to issues assigned to the current user.
- Keep active project and project health data scoped to projects the user belongs to.
- Render a dashboard layout close to `dashboard_tmp.tsx` while using the current SyncMind glass UI primitives, brand colors, spacing, and dark-mode tokens.
- Keep dashboard data derived from existing tables without adding persistence.

**Non-Goals:**
- Do not introduce milestone data into the dashboard's upcoming panel.
- Do not create a separate activity feed table.
- Do not add fake, seeded, or static frontend dashboard data.
- Do not implement global command search as part of this change; any search-like UI should be non-functional or omitted unless backed by existing behavior.
- Do not redesign the authenticated app shell or sidebar beyond what the dashboard page requires.

## Decisions

### Add a single `GET /api/dashboard` aggregate endpoint

The dashboard crosses project boundaries, so the frontend should not fan out into per-project issue and milestone endpoints. A dedicated endpoint can authorize once against the current user's project memberships and return a stable UI-shaped payload.

Alternatives considered:
- Multiple existing API calls from the frontend: simpler backend work, but inefficient and harder to keep consistent.
- Extend `/api/projects`: useful for project cards, but it would mix project listing concerns with personal workload and activity concerns.

### Derive dashboard data from existing models

The endpoint should aggregate from `Project`, `Issue`, `Comment`, and `IssueHistory`. No schema migration is expected.

Derived values:
- Active projects: count of projects where the current user is a member.
- My open issues: count of issues assigned to the current user where status is not `resolved` or `closed`.
- Due soon: assigned open issues due from today through seven days from today.
- Overdue: assigned open issues with a due date before today.
- Project progress: closed/resolved issue count divided by total issue count, with `0` for projects with no issues.
- Recent activity: newest comment and history events in projects the user belongs to.

Alternatives considered:
- Store project health snapshots: unnecessary for the current data volume and adds cache invalidation complexity.
- Use milestone progress for project health: already available, but the user explicitly excluded milestones from the dashboard's upcoming area and project-level issue progress is easier to explain.

### Keep personal workload separate from portfolio context

Summary cards combine portfolio and personal views intentionally: active projects reflects all accessible projects, while issue metrics reflect the current user's assigned issues only. This avoids overstating the user's workload with team-wide issues.

### Frontend uses real payload states for every panel

Each panel must render one of loading, empty, error, or real data. Empty panels should explain the absence of data without implying missing product functionality.

The design should adapt the visual composition from `dashboard_tmp.tsx`:
- Header with cockpit label and create-project action.
- Summary metric cards.
- Main two-column cockpit layout on desktop.
- My Work and Project Health in the primary column.
- Upcoming and Recent Activity in the secondary column.

But styling should align with existing components:
- Use `GlassCard` and `GlassButton` where appropriate.
- Prefer `rounded-xl` or the existing `glass-card` radius over large custom radii.
- Use `brand-primary`, `foreground`, `background`, and `border-glow` tokens instead of the sample's hard-coded slate palette.
- Preserve dark-mode compatibility.

## Risks / Trade-offs

- Aggregate endpoint query cost grows with membership size → Limit panel result counts, use eager loading and grouped counts, and avoid loading full issue bodies.
- Status values are string-based and may vary → Treat `resolved` and `closed` as completed; all other statuses are open for dashboard purposes.
- Recent activity combines two sources with different shapes → Normalize to a small shared activity item shape in the response.
- Project progress may be misleading for projects that do not use closed/resolved statuses consistently → Document and test the calculation so behavior is predictable.
- Dashboard UI can become dense on small screens → Stack panels vertically on mobile and keep card metrics compact with stable dimensions.

## Migration Plan

1. Add backend dashboard route, controller/service, response shaping, and tests.
2. Add frontend dashboard API types and client call.
3. Replace the current dashboard content with the cockpit layout backed by the new endpoint.
4. Add or update i18n strings and frontend tests.
5. Verify with Docker backend tests after clearing Laravel config cache, and run frontend tests in the frontend container.

Rollback is straightforward: remove or stop using the new dashboard endpoint and restore the previous dashboard page. No data migration is involved.

## Open Questions

- Should the dashboard result limits be configurable later, or fixed initially? Initial implementation should use fixed conservative limits.
- Should recent activity include only activity on assigned issues, or all activity in accessible projects? Initial implementation should use all accessible project activity so the panel reflects team movement.
