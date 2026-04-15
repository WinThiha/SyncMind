## ADDED Requirements

### Requirement: Assignee suggestion with reasons
The system SHALL return multiple ranked assignee suggestions (up to 3) from the AI issue suggestion endpoint, each containing an `assignee_id` and a human-readable `reason` string explaining why that person is recommended.

#### Scenario: AI returns multiple assignee suggestions
- **WHEN** a user requests AI suggestions for an issue summary
- **THEN** the response includes an `assignee_suggestions` array with up to 3 entries, each containing `assignee_id` (integer or null) and `reason` (string)

#### Scenario: AI returns no suitable assignee
- **WHEN** the AI cannot determine a suitable assignee from the team members
- **THEN** the `assignee_suggestions` array is empty

#### Scenario: AI returns an invalid assignee ID
- **WHEN** the AI suggests an `assignee_id` that does not match any project member
- **THEN** that suggestion entry is filtered out and not included in the response

### Requirement: Inline assignee suggestion cards
The system SHALL display AI assignee suggestions as clickable cards below the assignee dropdown in the issue creation form, each showing the member name, the reason for suggestion, and an action to apply the suggestion.

#### Scenario: User clicks an assignee suggestion card
- **WHEN** a user clicks the assign action on a suggestion card
- **THEN** the assignee dropdown value is set to the suggested member

#### Scenario: User ignores assignee suggestions
- **WHEN** assignee suggestions are displayed but the user selects a different member from the dropdown
- **THEN** the selected member is used and the suggestion cards remain visible but non-intrusive

#### Scenario: No assignee suggestions available
- **WHEN** the AI returns an empty `assignee_suggestions` array
- **THEN** no suggestion cards are displayed and the assignee dropdown functions normally
