## ADDED Requirements

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
