## Why

Users need a centralized view of all issues across all their projects — not just within a single project's context. The existing Issues list is tightly coupled to a project, and the Dashboard's "my work" section only shows 6 items without full filtering. A dedicated global Issues menu item with project filtering addresses this gap.

## What Changes

- **New sidebar menu item**: "Issues" positioned between Dashboard and Settings
- **New route**: `/issues` — top-level page showing all issues across projects
- **New API endpoints**:
  - `GET /api/issues` — paginated, filterable issues across all projects
  - `GET /api/issues/summary` — summary card counts (assigned, overdue, high priority, unassigned)
  - `GET /api/issues/ai/similar` — cross-project semantic search using embeddings
- **Reused UI pattern**: `syncmind_issues_preview.jsx` design language applied to the new page
- **Project picker**: prominent dedicated section above summary cards — user selects project or "All projects"
- **AI search toggle**: semantic search that checks both summary and description embeddings
- **New Issue behavior**: if "All projects" selected, prompt project picker; if specific project, navigate directly to create form

## Capabilities

### New Capabilities
- `global-issues-list`: Cross-project issue listing with dedicated project filter, summary cards, keyword + AI search, and full filter controls. Reuses the issue list UI pattern from the preview design.

## Impact

**Backend**:
- New `IssuesGlobalController` with three actions: `index`, `summary`, `similar`
- New route: `GET /api/issues` (auth required)
- Models: queries across `Issue`, `Project`, `User` with authorization via project membership

**Frontend**:
- New `/issues` page route
- Reuse of `IssueListItem`, `IssueDetailView`, and search/filter components
- New project picker component
- Sidebar: add "Issues" menu item

**API Shape**:
```
GET /api/issues?project_id=&status=&priority=&type=&due_date=&assignee=&search=
GET /api/issues/summary?project_id=
GET /api/issues/ai/similar?project_id=&text=
```