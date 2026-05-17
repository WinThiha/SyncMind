## 1. Backend — API Endpoints

- [x] 1.1 Create `IssuesGlobalController` with `index()`, `summary()`, and `similar()` actions
- [x] 1.2 Add route `GET /api/issues` in `routes/api.php` under auth middleware
- [x] 1.3 Add route `GET /api/issues/summary` with optional `project_id` query param
- [x] 1.4 Add route `GET /api/issues/ai/similar` with required `project_id` and `text` query params
- [x] 1.5 Implement `index()`: query issues across all user's projects, support `project_id`, `status`, `priority`, `type`, `due_date`, `assignee`, and `search` filters
- [x] 1.6 Implement `summary()`: return counts for assigned_to_me, overdue, high_priority, unassigned filtered by `project_id` (or all projects)
- [x] 1.7 Implement `similar()`: reuse `AIIssueSearchService::findSimilar()` with the provided `project_id` (AI search is always project-scoped)
- [x] 1.8 Add authorization: user must be a member of the project (use existing `IssuePolicy` or project membership check)
- [x] 1.9 Write feature tests for `IssuesGlobalController` covering all three endpoints and filter combinations

## 2. Frontend — API Layer

- [x] 2.1 Add `getIssues(params)` to `frontend/src/lib/api/issues.ts` — `GET /api/issues` with query params
- [x] 2.2 Add `getIssuesSummary(projectId?)` to `frontend/src/lib/api/issues.ts` — `GET /api/issues/summary`
- [x] 2.3 Add `getGlobalSimilarIssues(projectId, text)` — `GET /api/issues/ai/similar`

## 3. Frontend — Page & Components

- [x] 3.1 Create `frontend/src/app/issues/page.tsx` — new Issues page at `/issues`
- [x] 3.2 Create `frontend/src/components/issues/GlobalIssueList.tsx` — reusable issue list component (refactored from `IssueList.tsx` to support both project-scoped and global modes)
- [x] 3.3 Create `frontend/src/components/issues/ProjectPicker.tsx` — prominent project selector dropdown above summary cards
- [x] 3.4 Implement project picker with "All projects" option and per-project entries from user's project list
- [x] 3.5 Wire summary cards to call `getIssuesSummary(projectId)` on mount and on project change

> **Updated (2026-05-16):** All quick filters now call the backend API (`assignee=me|unassigned`, `high_priority=true`, `due_date=overdue`) instead of filtering client-side

> **Temporarily disabled (2026-05-16):** Summary cards hidden while UX is refined — backend endpoints remain functional

- [x] 3.6 Implement keyword search: filter loaded issues by summary/key containing query
- [x] 3.7 Implement AI search toggle: when ON and specific project selected, call `getGlobalSimilarIssues()`; when "All projects", disable toggle with tooltip
- [x] 3.8 Apply status/priority/type/due date filters to AI search results (backend supports `status`, `priority`, `type`, `due_date_start`, `due_date_end` params on `/similar` endpoint)
- [x] 3.9 Show "no results, try keyword search" message when AI search returns empty
- [x] 3.10 Implement "New Issue" button: if specific project, navigate to `/projects/{id}/issues/new`; if "All projects", show project picker dialog then navigate
- [x] 3.11 Dropdown filters (Status, Priority, Type, Due Date range) require Search button click to apply — no auto-trigger on change
- [x] 3.12 Due date filter changed from presets to date range inputs (start date / end date)
- [x] 3.13 Enter key in search bar triggers search (AI or keyword based on toggle state)
- [x] 3.14 AI toggle button placed inside search bar; Search button placed outside on same row

## 4. Frontend — Sidebar

- [x] 4.1 Add translation keys for `nav.sidebar.issues` in all locale files
- [x] 4.2 Add "Issues" menu item to `menuItems` array in `Sidebar.tsx` between Dashboard and Settings
- [x] 4.3 Use appropriate icon (e.g., `ListTodo` or `ClipboardList` from lucide-react)
- [x] 4.4 Ensure active state highlights correctly when on `/issues` route

## 5. Translation / Localization

- [x] 5.1 Add translation keys for global Issues page: title, subtitle, new issue button, project picker label, summary card labels, AI search tooltips, empty state messages, filter labels
- [x] 5.2 Add keys to `en`, `vi-VN`, `km-KH`, `my-MM`, `ja-JP` locale files

## 6. Testing

- [x] 6.1 Backend: run `php artisan test --filter=IssuesGlobal` to verify all three endpoints
- [x] 6.2 Frontend: run `npm run test` to verify no regressions (pre-existing failures unrelated to this change)
- [x] 6.3 Manual: verify sidebar shows "Issues", project picker works, search works, AI toggle works, new issue navigation works