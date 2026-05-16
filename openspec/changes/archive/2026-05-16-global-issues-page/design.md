## Context

The existing issue listing lives exclusively at `/projects/{id}/issues` and is project-scoped. The `IssueController::index` action returns issues for a single project only. There's no way to see all issues across all projects in one view.

The `DashboardController` provides summary counts (my_open_issues, overdue, due_soon) and a limited "my work" section (6 items) aggregated across all projects, but this lacks filtering, search, and full issue details.

Users need a dedicated "Issues" menu item in the sidebar (positioned between Dashboard and Settings) that surfaces all their issues globally with project filtering, summary cards, and keyword + AI-powered search.

## Goals / Non-Goals

**Goals:**
- Provide a cross-project Issues view accessible from the sidebar
- Show summary cards filtered by selected project (or "All projects")
- Support keyword search and AI semantic search (summary + description embeddings)
- Support filtering by status, priority, type, due date, assignee
- Allow creating a new issue directly from the global view (with appropriate project selection)
- Reuse the existing `IssueListItem`, `IssueDetailView`, and search UI patterns where possible

**Non-Goals:**
- Do not modify the existing project-scoped issue list at `/projects/{id}/issues`
- Do not change the Dashboard — it remains as-is
- Do not support AI search across "All projects" (requires a specific project to be selected)
- Do not add new issue editing capabilities — only creation and viewing

## Decisions

### 1. New `IssuesGlobalController` with three actions

```
GET /api/issues                          → index()
GET /api/issues/summary                  → summary()
GET /api/issues/ai/similar               → similar()
```

**Rationale**: Keeping all global issue operations in one controller groups related functionality. All three actions are simple read operations and share the same authorization model (user must be a member of the project). This avoids creating separate service classes before we understand if reuse is needed.

**Alternative considered**: Add a scope parameter to the existing `IssueController::index`. Rejected because the existing controller is RESTful for project-scoped resources; adding global scope would muddle its responsibility. A separate controller is cleaner.

### 2. Authorization via project membership

All three endpoints require the user to be a member of the queried project(s). For `index` and `summary` with no `project_id`, the user's project membership determines the scope. For `similar`, `project_id` is required.

**Implementation**: Use Laravel's `Policy` system. The existing `IssuePolicy` has a `viewAny` method that checks project membership. We'll use the same pattern.

### 3. API response shape for `GET /api/issues`

```json
{
  "data": [
    {
      "id": 1,
      "project_id": 1,
      "key": "SYNC-1",
      "full_key": "SYNC-1",
      "summary": "Issue title",
      "status": "open",
      "priority": "high",
      "issue_type": "Bug",
      "assignee": { "id": 1, "name": "Win Thiha" },
      "due_date": "2026-05-20",
      "updated_at": "...",
      "comments_count": 2
    }
  ]
}
```

Each issue includes a nested `project` object (or at minimum `project_id` + `project_name` + `project_key`) so the UI can display which project the issue belongs to without a separate lookup.

### 4. API response shape for `GET /api/issues/summary`

```json
{
  "data": {
    "assigned_to_me": 12,
    "overdue": 3,
    "high_priority": 5,
    "unassigned": 7,
    "project_name": "All projects"
  }
}
```

`project_name` tells the UI what scope the counts represent. When `project_id` is null, it's "All projects". When a specific project is set, it's that project's name.

### 5. AI search cross-project approach

The existing `AIIssueSearchService::findSimilar` is project-scoped. For `GET /api/issues/ai/similar`, we need to:

1. Require `project_id` — AI search is disabled when "All projects" is selected
2. Reuse the existing `AIIssueSearchService` directly (it's already project-scoped)
3. The existing service already searches both `summary` and `description` via embeddings (the embedding input is `"Summary: {$summary}\nDescription: {$description}"`)

**Rationale**: Not building a cross-project AI search endpoint. Simpler to require a specific project. If "All projects" is selected, the AI search toggle is disabled with a tooltip.

### 6. Frontend: new `/issues` page with reusable components

The `IssueList.tsx` currently requires `projectId` as a prop. The new global page will use a similar structure but with a `ProjectPicker` above it. The `IssueListItem` component already renders full issue cards and can be used as-is.

For search:
- Keyword search filters client-side from the loaded issue set (same as current `IssueList`)
- AI search calls `GET /api/issues/ai/similar?project_id=&text=` when sparkles toggle is ON
- Results are still filtered by the status/priority/type/due date pills

**Project picker**: A prominent `<select>` or custom dropdown positioned above the summary cards. Options: "All projects" (null) + one entry per project the user is a member of. When "All projects" is selected, AI search is disabled.

### 7. "New Issue" navigation

```
/issues?project_id=          → + New Issue button

If project_id is null (All projects):
  → Open a modal/picker to select project first
  → Then navigate to /projects/{id}/issues/new

If project_id is set:
  → Direct navigate to /projects/{project_id}/issues/new
```

A simple `<select>` dialog is sufficient for the project selection step. No need for a full page redirect.

### 8. Sidebar: insert "Issues" between Dashboard and Settings

```tsx
const menuItems = [
  { icon: LayoutDashboard, key: 'nav.sidebar.dashboard', href: '/dashboard' },
  { icon: LayoutList,     key: 'nav.sidebar.issues',      href: '/issues'      },  // new
  { icon: Settings,       key: 'nav.sidebar.settings',   href: '/settings'   },
  { icon: HelpCircle,    key: 'nav.sidebar.help',        href: '/help'       },
];
```

Use an icon that represents "issues list" — perhaps `ListTodo` or `ClipboardList` from lucide-react.

## Risks / Trade-offs

- **[Risk] Growing complexity in `IssuesGlobalController`** → If three actions grow in logic, extract to `IssuesGlobalService`. Start simple, refactor when needed.
- **[Risk] AI search disabled for "All projects"** → Users may be confused. Tooltip clearly explains "AI search requires a specific project to be selected." Consider building cross-project AI search as a future enhancement.
- **[Risk] Large issue sets with no pagination** → Start with a reasonable limit (e.g., 50) and add cursor-based pagination if needed. Monitor performance.
- **[Risk] Embeddings not generated for all historical issues** → AI search will only match issues that have embeddings. Newer issues after this feature ships will be indexed. Consider a bulk re-embedding job for existing issues as a follow-up.

## Migration Plan

1. **Backend**: Create `IssuesGlobalController` + routes. Add tests. Deploy.
2. **Frontend**: Create `/issues` page. Wire up API calls. Add sidebar item.
3. **No migration needed** — no schema changes, no data migration.
4. **Rollback**: Revert controller and frontend changes. Sidebar item removal is straightforward.

## Open Questions

1. **Pagination**: Should `GET /api/issues` support cursor-based pagination, or is a simple limit/offset sufficient for now?
2. **Sort order**: Default to "recently updated". Should users be able to change sort? (e.g., oldest first, due date)
3. **Bulk re-embedding**: Should we run a one-time job to generate embeddings for all existing issues, or only new ones going forward?
4. **AI search similarity threshold**: The preview uses `0.3` for general search. Should the global page use a different threshold (e.g., `0.5`) to reduce noise?