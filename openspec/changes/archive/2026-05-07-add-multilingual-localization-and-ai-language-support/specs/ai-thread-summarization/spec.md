## MODIFIED Requirements

### Requirement: Structured AI Summarization
The system SHALL utilize an AI model to analyze the aggregated timeline and return a structured summary containing a summary, decisions, consensus, and action items via the configured chat completion abstraction compatible with OpenRouter direct HTTP calls. The system SHALL instruct generated human-readable values to follow the authenticated user’s saved locale while preserving stable JSON schema keys.

#### Scenario: Successful summary generation
- **WHEN** a user requests a thread summary for an issue with activity
- **THEN** the system returns a JSON response with non-empty strings for summary, decisions, consensus, and action items using content extracted from `choices[0].message.content`
- **AND** the returned values are in the user’s saved locale when supported

#### Scenario: JSON-mode fallback for summarization
- **WHEN** strict JSON response mode fails for the selected model
- **THEN** the system SHALL retry summarization without strict JSON mode and parse JSON from the returned content

#### Scenario: Schema keys remain stable across locales
- **WHEN** a non-English locale is used for summarization output
- **THEN** JSON object keys remain `summary`, `decisions`, `consensus`, and `action_items`
- **AND** only value text is localized
