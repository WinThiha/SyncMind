# Schedule Tracker — Software Design Document

## 1. Overview

The Schedule Tracker feature upgrades SyncMind's existing milestone system from plain string labels into fully-structured milestone objects with date ranges, status, and live progress tracking. It also adds `due_date` to individual issues so work can be anchored in time.

**Problem today:**
- `projects.milestones` is a JSON array of plain strings (e.g. `["v1.0", "Beta"]`).
- `issues.milestone` is a free-text string that references one of those names — no FK, no validation, no dates.
- There is no concept of "when does this milestone end?" or "how much of it is done?".

**After this change:**
- Milestones are first-class records in a dedicated `milestones` table with `start_date`, `due_date`, and `status`.
- Issues link to a milestone via a proper FK (`milestone_id`) and carry their own optional `due_date`.
- A Milestone Overview page shows all milestones on a timeline with real-time progress derived from linked issues.

---

## 2. Goals

| ID | Goal |
|----|------|
| G1 | Milestones have a `due_date` (and optional `start_date`) |
| G2 | Progress toward a milestone is automatically derived from linked issues' statuses |
| G3 | Individual issues can carry their own `due_date` |
| G4 | A milestone overview page visualises all milestones with progress and overdue indicators |
| G5 | Existing milestone string data is migrated without data loss |

## 2.1 Non-Goals

- Sprint planning / backlog drag-and-drop (separate feature)
- Time-sheet / time-logging UI (actual_hours already exists)
- Email or push notifications for deadlines
- Gantt chart view

---

## 3. Data Model

### 3.1 New table: `milestones`

```
milestones
├── id                bigint PK
├── project_id        bigint FK → projects.id  (cascade delete)
├── name              string(255)   required
├── description       text          nullable
├── start_date        date          nullable
├── due_date          date          nullable
├── status            string        enum: open | in_progress | closed  default: open
├── created_at        timestamp
└── updated_at        timestamp
```

Progress (`total`, `completed`, `percentage`) and `is_overdue` are **computed at query time** — not stored.

### 3.2 Changes to `issues`

| Column | Action | Notes |
|--------|--------|-------|
| `due_date` | ADD | `date`, nullable |
| `milestone_id` | ADD | `bigint FK → milestones.id`, nullable, set null on delete |
| `milestone` | DROP | replaced by `milestone_id` |

### 3.3 Changes to `projects`

| Column | Action | Notes |
|--------|--------|-------|
| `milestones` | DROP | data migrated to the `milestones` table; column removed |

### 3.4 Migration strategy (data preservation)

The migrations run in this order:

```
Step 1  Create milestones table
Step 2  For every project, loop over projects.milestones JSON array
        → INSERT one row into milestones per name string
Step 3  Add milestone_id + due_date to issues
Step 4  For each issue where milestone (string) IS NOT NULL
        → find the matching milestones row by (project_id, name)
        → SET issue.milestone_id = that row's id
Step 5  DROP issues.milestone (string)
Step 6  DROP projects.milestones (JSON)
```

All steps run inside a single transaction so the migration is atomic.

---

## 4. API Design

### 4.1 Milestone endpoints

All milestone routes are nested under a project and protected by `auth:sanctum` + `throttle:api`.

```
GET    /api/projects/{project}/milestones              List milestones (with progress)
POST   /api/projects/{project}/milestones              Create milestone
GET    /api/projects/{project}/milestones/{milestone}  Show milestone + linked issues
PATCH  /api/projects/{project}/milestones/{milestone}  Update milestone
DELETE /api/projects/{project}/milestones/{milestone}  Delete milestone
```

### 4.2 Request shapes

**POST / PATCH**
```json
{
  "name":        "v1.0 Launch",       // required on POST
  "description": "First public release",
  "start_date":  "2026-05-10",        // nullable, ISO date
  "due_date":    "2026-06-01",        // nullable, ISO date
  "status":      "in_progress"        // open | in_progress | closed
}
```

### 4.3 Response shape (list + show)

```json
{
  "data": [
    {
      "id": 1,
      "project_id": 3,
      "name": "v1.0 Launch",
      "description": "First public release",
      "start_date": "2026-05-10",
      "due_date": "2026-06-01",
      "status": "in_progress",
      "is_overdue": false,
      "progress": {
        "total": 12,
        "completed": 4,
        "percentage": 33
      },
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

The `show` endpoint also includes a `"issues"` array of the milestone's linked issues (same shape as the issue list endpoint).

### 4.4 Issue endpoint changes

`POST /api/projects/{project}/issues` and `PATCH .../issues/{key}` accept two new fields:

```json
{
  "due_date":    "2026-05-20",   // nullable date
  "milestone_id": 1              // nullable integer, must belong to same project
}
```

The `milestone` string field is removed from both request validation and response payloads.

---

## 5. Frontend Architecture

### 5.1 New pages

```
src/app/projects/[id]/
├── milestones/
│   ├── page.tsx              Milestone overview (timeline + cards)
│   └── [milestoneId]/
│       └── page.tsx          Milestone detail (linked issues list)
```

### 5.2 New components

```
src/components/milestones/
├── MilestoneCard.tsx          Card: name, dates, progress bar, overdue badge
├── MilestoneTimeline.tsx      Horizontal timeline of all milestones
├── MilestoneProgress.tsx      Reusable animated progress bar
├── CreateMilestoneForm.tsx    Create form (name, dates, description, status)
└── EditMilestoneForm.tsx      Edit form (same fields)
```

**Modified components:**
- `components/issues/CreateIssueForm.tsx` — add `due_date` date picker + `milestone_id` dropdown
- `components/issues/EditIssueForm.tsx` / `UpdateIssueForm.tsx` — same additions
- `components/issues/IssueListItem.tsx` — show due date badge when present
- `components/layout/Sidebar.tsx` — add Milestones nav link per project

### 5.3 API client + hooks

```
src/lib/api/milestones.ts       CRUD wrappers (getMilestones, createMilestone, …)
src/hooks/milestones/
└── useMilestones.ts            Data-fetching hook for milestone list
```

All calls go through the singleton axios instance at `src/lib/axios.ts`.

---

## 6. Authorization

Milestone operations follow the same project-membership model as issues:

| Action | Who |
|--------|-----|
| view / list | any project member |
| create / update / delete | project admin or owner |

A `MilestonePolicy` will be created and registered in `AppServiceProvider`.

---

## 7. Implementation Plan

### Phase 1 — Backend

| # | Task |
|---|------|
| 1.1 | Migration: create `milestones` table |
| 1.2 | Migration: add `due_date` + `milestone_id` to issues; data migration; drop old columns |
| 1.3 | `Milestone` model with `progress` computed property and `project` / `issues` relationships |
| 1.4 | `MilestonePolicy` — registered in `AppServiceProvider` |
| 1.5 | `MilestoneController` — index, store, show, update, destroy |
| 1.6 | Routes: `projects.milestones` apiResource in `api.php` |
| 1.7 | Update `IssueController` — accept `due_date`, `milestone_id`; remove `milestone` string |
| 1.8 | Feature tests — `MilestoneTest.php` and updated `IssueLifecycleTest.php` |

### Phase 2 — Frontend

| # | Task |
|---|------|
| 2.1 | `src/lib/api/milestones.ts` — API client wrappers |
| 2.2 | `MilestoneCard` + `MilestoneProgress` components |
| 2.3 | `CreateMilestoneForm` / `EditMilestoneForm` |
| 2.4 | Milestones list page (`/projects/[id]/milestones`) |
| 2.5 | Milestone detail page (`/projects/[id]/milestones/[milestoneId]`) |
| 2.6 | `MilestoneTimeline` component |
| 2.7 | Update `CreateIssueForm` / `EditIssueForm` — add due_date + milestone_id |
| 2.8 | Update `IssueListItem` — show due date badge |
| 2.9 | Add Milestones link to project Sidebar |

### Phase 3 — Polish

| # | Task |
|---|------|
| 3.1 | Overdue styling (red date, warning badge) |
| 3.2 | Progress bar animation (Framer Motion, consistent with existing UI) |
| 3.3 | Empty states for no milestones / no issues in milestone |
| 3.4 | Dark mode compatibility audit |

---

## 8. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Separate `milestones` table (not JSON) | Enables FK integrity, progress queries, and future expansion without schema changes |
| Progress computed at query time | Avoids stale counters; no need for triggers or observers |
| `milestone_id` nullable FK with `SET NULL` on delete | Unlinking a milestone does not delete its issues |
| Reuse project-member auth model | Consistent with existing `IssuePolicy` / `ProjectPolicy` pattern — no new auth concepts |
| Drop `projects.milestones` JSON column | Old column is redundant once the table exists; clean schema is preferable |
