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
