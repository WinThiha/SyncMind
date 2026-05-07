## ADDED Requirements

### Requirement: AI Issue Field Suggestion
The system SHALL provide an AI-driven mechanism to suggest issue fields (Description, Type, Priority, Estimate) based on a provided issue summary and project context.

#### Scenario: User requests AI suggestion for a new issue
- **WHEN** a user enters an issue summary and clicks the "Auto-fill with AI" button
- **THEN** the system requests AI suggestions and populates the empty fields in the form without overwriting existing user input

### Requirement: Smart Assignee Recommendation
The system SHALL recommend multiple ranked assignees for an issue based on the issue summary, the project members, and their designated `position`s, each with a reason explaining the recommendation.

#### Scenario: AI suggests assignees based on role
- **WHEN** the AI analyzes a front-end related issue summary
- **THEN** the AI returns up to 3 assignee suggestions, where the top suggestion is a project member whose position is "Frontend Developer" (if available), with a reason explaining the role match

#### Scenario: AI suggests assignees with reasons
- **WHEN** the AI returns assignee suggestions
- **THEN** each suggestion includes a `reason` string that explains why the member is recommended (e.g., role match, relevant expertise, team lead responsibility)

### Requirement: User Position Context
The system SHALL store and provide user positions (e.g., "Product Manager", "Backend Engineer") to the AI to facilitate role-based logic.

#### Scenario: Admin views user profile
- **WHEN** an admin views a user profile
- **THEN** they can see and update the user's string-based `position` field
