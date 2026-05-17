## ADDED Requirements

### Requirement: Global Issues List Access
The system SHALL provide the canonical Issues list at `/issues`, displaying all issues across all projects the user is a member of with the ability to filter by project. Project-scoped issue-list entry points SHALL route to the canonical Issues list with a project query parameter that preselects that project.

#### Scenario: User navigates to global Issues page
- **WHEN** user clicks "Issues" in the sidebar
- **THEN** the system displays the Issues page at `/issues` showing all issues across the user's projects, with a project picker set to "All projects" by default

#### Scenario: User opens a project-scoped issue list
- **WHEN** user clicks an issue-list action from a project dashboard or visits `/projects/{project_id}/issues`
- **THEN** the system opens `/issues?project_id={project_id}`
- **AND** the project picker auto-selects that project
- **AND** the issue list and summary data are filtered to that project

### Requirement: Global Issues List Issue Preview
The system SHALL open an issue detail slider when a user clicks an issue in the global Issues list. The slider SHALL provide an action to open the same issue in the full detail view.

#### Scenario: User clicks a global issue card
- **WHEN** user clicks an issue card on `/issues`
- **THEN** the system opens the issue detail slider without leaving `/issues`

#### Scenario: User opens full details from the slider
- **WHEN** user clicks the full-detail action in the issue detail slider
- **THEN** the system navigates to `/projects/{project_id}/issues/{issue_key}`

### Requirement: Global Issues List Summary Cards
The system SHALL display four summary cards on the global Issues page: Assigned to Me, Overdue, High Priority, and Unassigned. Each card shows a count and updates dynamically based on the selected project filter.

> **Temporary Removal (2026-05-16):** Summary cards are temporarily disabled/hidden while the global Issues page UX is refined. Backend endpoints remain functional for future reactivation.

#### Scenario: Summary cards update with "All projects"
- **WHEN** user has "All projects" selected
- **THEN** summary cards display counts of issues across all projects where the current user is a member

#### Scenario: Summary cards update with specific project selected
- **WHEN** user selects a specific project
- **THEN** summary cards display counts filtered to only that project's issues

### Requirement: Global Issues List Search
The system SHALL provide keyword search and AI semantic search on the global Issues page. Search respects all active filters (status, priority, type, due date). AI search is only available when a specific project is selected.

#### Scenario: Keyword search
- **WHEN** user types in the search bar with AI search OFF
- **THEN** the system filters issues by checking if the search query appears in the issue's summary or key

#### Scenario: AI semantic search with specific project
- **WHEN** user types in the search bar with AI search ON and a specific project is selected
- **THEN** the system generates a query embedding via the embedding provider lane and returns issues from that project whose summary or description is semantically similar, ordered by cosine similarity

#### Scenario: AI semantic search disabled when "All projects" selected
- **WHEN** user clicks the AI search toggle with "All projects" selected
- **THEN** the toggle remains OFF and a tooltip displays "AI semantic search requires a specific project to be selected"

#### Scenario: AI search results respect filters
- **WHEN** AI search returns results with a specific project selected
- **THEN** results are filtered by the active status, priority, type, and due date range filters (applied at `AIIssueSearchService` level)

#### Scenario: User clicks Search button while AI toggle is ON
- **WHEN** user clicks the Search button while AI toggle is ON
- **THEN** the system immediately triggers AI semantic search with current filters applied

#### Scenario: AI search shows no results
- **WHEN** AI search returns zero results
- **THEN** the UI displays a message suggesting the user switch to keyword search

### Requirement: Global Issues List Filters
The system SHALL provide filter controls for status, priority, type, and due date range on the global Issues page. Filter dropdowns do NOT trigger API calls automatically — a dedicated "Search" button must be clicked to apply the selected filters. In contrast, quick filter tabs (Assigned to Me, Overdue, High Priority, Unassigned) call the API immediately upon selection.

> **Updated (2026-05-17):** Due date filter now uses date range inputs (start date / end date) instead of preset options (overdue, today, week). Filters are applied both at the backend API level for regular search and at the `AIIssueSearchService` level for AI semantic search.

#### Scenario: User applies dropdown filters via Search button
- **WHEN** user selects values from Status, Priority, Type, and/or Due Date range inputs and clicks the Search button
- **THEN** the system sends all selected filter criteria to the backend API and displays issues matching ALL active filter criteria

#### Scenario: User presses Enter in search bar
- **WHEN** user focuses the search bar and presses Enter
- **THEN** the system triggers search (keyword search if AI toggle is OFF, AI semantic search if AI toggle is ON)

#### Scenario: User filters by "Assigned to Me" (instant)
- **WHEN** user clicks the "Assigned to Me" quick filter tab
- **THEN** the system immediately calls the API with `assignee=me` and displays only issues assigned to the current user

#### Scenario: User filters by "High Priority" (instant)
- **WHEN** user clicks the "High Priority" quick filter tab
- **THEN** the system immediately calls the API with `high_priority=true` and displays only issues with priority "high" or "critical"

#### Scenario: User filters by "Overdue" (instant)
- **WHEN** user clicks the "Overdue" quick filter tab
- **THEN** the system immediately calls the API with `due_date=overdue` and displays only issues with past due dates (excluding resolved/closed)

#### Scenario: User filters by "Unassigned" (instant)
- **WHEN** user clicks the "Unassigned" quick filter tab
- **THEN** the system immediately calls the API with `assignee=unassigned` and displays only issues with no assignee

#### Scenario: User resets all filters
- **WHEN** user clicks the reset (rotate) button
- **THEN** all filters are cleared and the issue list returns to showing all issues for the selected project scope (API called with only project_id)

### Requirement: Global Issues List Issue Metadata Visibility
The system SHALL render issue metadata badges for issue type, status, priority, AI match score, and due date with sufficient contrast against issue cards in both light and dark themes.

#### Scenario: User views issue metadata in light theme
- **WHEN** user views issue cards on the global Issues page in light theme
- **THEN** issue type, status, priority, and due date badges remain visually distinct from the card surface and readable without relying on dark theme styling

### Requirement: Global Issues List "New Issue" Action
The system SHALL provide a "New Issue" button on the global Issues page. Clicking it navigates to the issue creation form, with project selection handled appropriately based on the current project filter.

#### Scenario: "New Issue" with specific project selected
- **WHEN** user clicks "New Issue" with a specific project selected
- **THEN** the system navigates directly to `/projects/{project_id}/issues/new`

#### Scenario: "New Issue" with "All projects" selected
- **WHEN** user clicks "New Issue" with "All projects" selected
- **THEN** the system displays a project picker dialog/modal asking the user to select a project before navigating to the create form

### Requirement: Global Issues List Sidebar Integration
The system SHALL add an "Issues" menu item to the sidebar, positioned between Dashboard and Settings. The menu item links to `/issues` and highlights when the user is on that page.

#### Scenario: Sidebar shows Issues menu item
- **WHEN** user is authenticated and on any page
- **THEN** the sidebar displays "Issues" between "Dashboard" and "Settings"

#### Scenario: Issues menu item shows active state
- **WHEN** user is on the `/issues` page
- **THEN** the "Issues" sidebar item is highlighted as the active navigation item