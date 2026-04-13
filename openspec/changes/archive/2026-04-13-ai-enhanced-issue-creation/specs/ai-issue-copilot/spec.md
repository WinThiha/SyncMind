## ADDED Requirements

### Requirement: AI Issue Field Suggestion
The system SHALL provide an AI-driven mechanism to suggest issue fields (Description, Type, Priority, Estimate) based on a provided issue summary and project context.

#### Scenario: User requests AI suggestion for a new issue
- **WHEN** a user enters an issue summary and clicks the "Auto-fill with AI" button
- **THEN** the system requests AI suggestions and populates the empty fields in the form without overwriting existing user input

### Requirement: Smart Assignee Recommendation
The system SHALL recommend an appropriate assignee for an issue based on the issue summary, the project members, and their designated `position`s.

#### Scenario: AI suggests an assignee based on role
- **WHEN** the AI analyzes a front-end related issue summary
- **THEN** the AI suggests a project member whose position is "Frontend Developer" (if available)

### Requirement: User Position Context
The system SHALL store and provide user positions (e.g., "Product Manager", "Backend Engineer") to the AI to facilitate role-based logic.

#### Scenario: Admin views user profile
- **WHEN** an admin views a user profile
- **THEN** they can see and update the user's string-based `position` field
