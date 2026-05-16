## MODIFIED Requirements

### Requirement: FR-001 System MUST allow project admins to create issues within their projects
System MUST allow project admins to create issues within their projects. The system SHALL provide an optional AI Copilot feature during issue creation that suggests description, issue type, priority, estimate, and assignee based on the issue summary.

#### Scenario: Admin manually creates an issue
- **WHEN** an admin fills out the "Create Issue" form and clicks "Create Issue"
- **THEN** a new issue is created manually with a unique ID

#### Scenario: Admin uses AI to assist issue creation
- **WHEN** an admin enters a summary and clicks "Auto-fill with AI"
- **THEN** the system generates suggestions for the remaining fields and populates them into the form without overriding existing input

### Requirement: Activity Feed Display
The system SHALL display comments and history entries in a unified activity feed grouped by user and time proximity on the issue detail page and issue detail slider.

#### Scenario: Unified activity feed on issue detail page
- **WHEN** a user visits the standalone issue detail page
- **THEN** comments and history are rendered in a single unified activity feed, grouped by user and time proximity (within 2 seconds), with history entries above comments

#### Scenario: Unified activity feed matches slider
- **WHEN** a user visits both the standalone issue detail page and the issue detail slider for the same issue
- **THEN** both views show the same grouping behavior (same user + within 2 seconds)