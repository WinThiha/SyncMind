## MODIFIED Requirements

### Requirement: Smart Assignee Recommendation
The system SHALL recommend multiple ranked assignees for an issue based on the issue summary, the project members, and their designated `position`s, each with a reason explaining the recommendation.

#### Scenario: AI suggests assignees based on role
- **WHEN** the AI analyzes a front-end related issue summary
- **THEN** the AI returns up to 3 assignee suggestions, where the top suggestion is a project member whose position is "Frontend Developer" (if available), with a reason explaining the role match

#### Scenario: AI suggests assignees with reasons
- **WHEN** the AI returns assignee suggestions
- **THEN** each suggestion includes a `reason` string that explains why the member is recommended (e.g., role match, relevant expertise, team lead responsibility)
