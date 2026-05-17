## MODIFIED Requirements

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
