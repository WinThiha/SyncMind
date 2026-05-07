## MODIFIED Requirements

### Requirement: AI Issue Field Suggestion
The system SHALL provide an AI-driven mechanism to suggest issue fields (Description, Type, Priority, Estimate) based on a provided issue summary and project context, using the configured chat completion abstraction that supports OpenRouter direct HTTP calls.

#### Scenario: User requests AI suggestion for a new issue
- **WHEN** a user enters an issue summary and clicks the "Auto-fill with AI" button
- **THEN** the system requests AI suggestions through the chat completion abstraction and populates empty fields in the form without overwriting existing user input.

#### Scenario: JSON-mode fallback for unsupported models
- **WHEN** the first suggestion request using strict JSON response mode fails due to model capability limits
- **THEN** the system SHALL retry via the same chat completion abstraction without strict JSON mode and continue parsing content-based JSON output.
