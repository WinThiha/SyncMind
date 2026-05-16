## MODIFIED Requirements

### Requirement: FR-001 System MUST allow project admins to create issues within their projects
System MUST allow project admins to create issues within their projects. The system SHALL provide an optional AI Copilot feature during issue creation that suggests description, issue type, priority, estimate, and assignee based on the issue summary.

#### Scenario: Admin manually creates an issue
- **WHEN** an admin fills out the "Create Issue" form and clicks "Create Issue"
- **THEN** a new issue is created manually with a unique ID

#### Scenario: Admin uses AI to assist issue creation
- **WHEN** an admin enters a summary and clicks "Auto-fill with AI"
- **THEN** the system generates suggestions for the remaining fields and populates them into the form without overriding existing input

## ADDED Requirements

### Requirement: AI Thread Summarization in Issue View
The system SHALL provide an AI-powered thread summarization feature in the issue detail view that distills discussion and history into a concise summary.

#### Scenario: User views thread summary
- **WHEN** a user visits an issue detail page with existing comments or history
- **THEN** they see an option to "Summarize Thread" which displays an overview of decisions and action items

### Requirement: Issue List Metadata Consistency After Detail Updates
The system SHALL keep issue-list metadata in sync after a user updates issue fields or posts a comment from the issue detail slider.

#### Scenario: User updates issue in detail slider
- **WHEN** a user updates status, priority, assignee, or time-tracking fields in the issue detail slider
- **THEN** the issue list refreshes that issue metadata without requiring a full page reload

#### Scenario: User posts comment in detail slider
- **WHEN** a user posts a new comment from the issue detail slider
- **THEN** the issue list refreshes comment-related metadata (including comment count) without requiring a full page reload

### Requirement: Issue Detail Slider Overlay Coverage
The system SHALL render the issue detail slider overlay as a full-viewport layer so dimming and backdrop blur coverage includes the entire screen, including the bottom edge, across scrollable app layouts.

#### Scenario: User opens issue detail slider from issue list
- **WHEN** a user opens the issue detail slider from the issue list page
- **THEN** the background dim/blur overlay covers the full viewport from top to bottom without clipped regions

### Requirement: Activity Feed Display
The system SHALL display comments and history entries in a unified activity feed grouped by user and time proximity on the issue detail page and issue detail slider.

#### Scenario: Unified activity feed on issue detail page
- **WHEN** a user visits the standalone issue detail page
- **THEN** comments and history are rendered in a single unified activity feed, grouped by user and time proximity (within 2 seconds), with history entries above comments

#### Scenario: Unified activity feed matches slider
- **WHEN** a user visits both the standalone issue detail page and the issue detail slider for the same issue
- **THEN** both views show the same grouping behavior (same user + within 2 seconds)

### Requirement: Issue Detail Page AI Thread Summary Parity
The system SHALL provide the same AI thread summarization action on the standalone issue detail page that is available in the issue detail slider.

#### Scenario: User summarizes thread from issue detail page
- **WHEN** a user visits a standalone issue detail page with existing comments or history
- **THEN** they can request an AI thread summary and view the generated summary, decisions, consensus, and action items on the page

#### Scenario: User refreshes issue detail page thread summary
- **WHEN** a user refreshes a previously generated AI thread summary from the standalone issue detail page
- **THEN** the system requests a fresh summary for the current issue thread

### Requirement: Issue Detail Page Quick Field Update Parity
The system SHALL allow users to update the same quick-edit issue fields from the standalone issue detail page as from the issue detail slider: status, priority, assignee, estimated hours, and actual hours.

#### Scenario: User updates quick fields from issue detail page
- **WHEN** a user changes status, priority, assignee, estimated hours, or actual hours from the standalone issue detail page
- **THEN** the system persists those issue field changes using the existing issue update behavior

#### Scenario: User posts comment with quick field updates from issue detail page
- **WHEN** a user submits quick field changes with a new comment from the standalone issue detail page
- **THEN** the system persists the field changes and posts the comment to the issue thread

#### Scenario: Issue detail page refreshes after mutation
- **WHEN** a user updates quick fields or posts a comment from the standalone issue detail page
- **THEN** the page refreshes the displayed issue properties, comments, and history without requiring manual navigation
