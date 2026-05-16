## ADDED Requirements

### Requirement: Dashboard aggregate API
The system SHALL provide an authenticated dashboard API that returns all cockpit data needed by the dashboard in one response.

#### Scenario: Authenticated user requests dashboard data
- **WHEN** an authenticated user requests the dashboard aggregate endpoint
- **THEN** the system returns summary metrics, assigned work, upcoming issues, project health, and recent activity scoped to data the user is allowed to access

#### Scenario: Unauthenticated user requests dashboard data
- **WHEN** an unauthenticated request is made to the dashboard aggregate endpoint
- **THEN** the system rejects the request using the existing authenticated API behavior

### Requirement: Summary metrics
The dashboard API SHALL return summary metrics for active projects, assigned open issues, assigned issues due soon, and assigned overdue issues.

#### Scenario: Active projects are counted
- **WHEN** the dashboard summary is generated
- **THEN** active projects equals the number of projects where the current user is a member

#### Scenario: Assigned open issues are counted
- **WHEN** the dashboard summary is generated
- **THEN** my open issues equals the number of issues assigned to the current user with a status other than `resolved` or `closed`

#### Scenario: Due soon issues are counted
- **WHEN** the dashboard summary is generated
- **THEN** due soon equals the number of issues assigned to the current user with a status other than `resolved` or `closed` and a due date from today through seven days from today

#### Scenario: Overdue issues are counted
- **WHEN** the dashboard summary is generated
- **THEN** overdue equals the number of issues assigned to the current user with a status other than `resolved` or `closed` and a due date before today

### Requirement: My Work panel data
The dashboard API SHALL return a limited list of issues assigned to the current user for the My Work panel.

#### Scenario: Assigned work excludes created-only issues
- **WHEN** an issue was created by the current user but is not assigned to the current user
- **THEN** the issue is not included in My Work

#### Scenario: Assigned work includes issue context
- **WHEN** an assigned open issue is included in My Work
- **THEN** the item includes its issue key, summary, project name, status, priority, due date, and project identifier

### Requirement: Upcoming issue panel data
The dashboard API SHALL return upcoming items from issues only.

#### Scenario: Upcoming excludes milestones
- **WHEN** milestones have due dates
- **THEN** milestones are not included in the Upcoming panel data

#### Scenario: Upcoming issues are ordered by due date
- **WHEN** multiple assigned open issues have upcoming due dates
- **THEN** the Upcoming panel data is ordered by due date ascending

### Requirement: Project health data
The dashboard API SHALL return project health entries for projects the current user belongs to.

#### Scenario: Project health includes real project metrics
- **WHEN** project health data is generated
- **THEN** each project health item includes project id, project name, project key, member count, issue count, overdue issue count, and progress percentage

#### Scenario: Project health labels issue count accurately
- **WHEN** a project health item displays the project's issue count
- **THEN** the UI labels the value as issues rather than open issues

#### Scenario: Project progress is calculated from issues
- **WHEN** a project has issues
- **THEN** progress percentage equals resolved or closed issues divided by total issues, rounded to a whole number

#### Scenario: Project with no issues has zero progress
- **WHEN** a project has no issues
- **THEN** progress percentage is zero

#### Scenario: Project health links to project dashboard
- **WHEN** a user activates the open-project affordance for a project health item
- **THEN** the system navigates to that project's dashboard page

### Requirement: Recent activity data
The dashboard API SHALL return recent activity based on real comments and issue history in projects the current user belongs to.

#### Scenario: Comment activity is included
- **WHEN** a user comments on an issue in a project the current user belongs to
- **THEN** recent activity can include a normalized comment activity item with actor, issue key, project name, timestamp, and activity text

#### Scenario: Issue history activity is included
- **WHEN** an issue field changes in a project the current user belongs to
- **THEN** recent activity can include a normalized history activity item with actor, issue key, project name, timestamp, changed field, old value, and new value

#### Scenario: Inaccessible project activity is excluded
- **WHEN** activity exists in a project where the current user is not a member
- **THEN** that activity is not included in recent activity

### Requirement: Real-data dashboard UI
The dashboard page SHALL render the cockpit using real dashboard API data and existing SyncMind design conventions.

#### Scenario: Dashboard renders real panels
- **WHEN** dashboard API data loads successfully
- **THEN** the dashboard displays summary cards, My Work, Project Health, Upcoming, and Recent Activity using values from the API response

#### Scenario: Dashboard issue rows link to issue detail
- **WHEN** a user activates an issue row in either the My Work panel or the Upcoming panel
- **THEN** the system navigates to that issue's detail page within its project

#### Scenario: Dashboard panel has no data
- **WHEN** a dashboard panel has an empty data set
- **THEN** the panel displays an empty state instead of fake or static business data

#### Scenario: Dashboard data is loading
- **WHEN** dashboard data is loading
- **THEN** the dashboard displays loading states sized to the final layout

#### Scenario: Dashboard data fails to load
- **WHEN** the dashboard API request fails
- **THEN** the dashboard displays an error state that does not remove the user's ability to create a project

#### Scenario: Dashboard follows current design system
- **WHEN** the dashboard is rendered in light or dark mode
- **THEN** it uses current SyncMind glass components, brand tokens, foreground/background tokens, and responsive layout behavior

#### Scenario: Dashboard text remains readable in light mode
- **WHEN** the dashboard is rendered in light mode
- **THEN** supporting labels, metadata, empty states, and activity text have sufficient contrast against dashboard glass surfaces