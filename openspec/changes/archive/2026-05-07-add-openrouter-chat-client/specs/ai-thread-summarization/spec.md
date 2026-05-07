## MODIFIED Requirements

### Requirement: Structured AI Summarization
The system SHALL utilize an AI model to analyze the aggregated timeline and return a structured summary containing an Overview, Decisions, Consensus, and Action Items via the configured chat completion abstraction compatible with OpenRouter direct HTTP calls.

#### Scenario: Successful summary generation
- **WHEN** a user requests a thread summary for an issue with activity
- **THEN** the system returns a JSON response with non-empty strings for overview, decisions, consensus, and action items using content extracted from `choices[0].message.content`.

#### Scenario: JSON-mode fallback for summarization
- **WHEN** strict JSON response mode fails for the selected model
- **THEN** the system SHALL retry summarization without strict JSON mode and parse JSON from the returned content.
