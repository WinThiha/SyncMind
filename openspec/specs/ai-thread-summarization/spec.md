## ADDED Requirements

### Requirement: Issue Activity Timeline Aggregation
The system SHALL aggregate all `Comments` and `IssueHistory` entries for a specific issue into a single chronological timeline for AI context.

#### Scenario: Aggregation of mixed events
- **WHEN** an issue has 2 comments and 1 status change in its history
- **THEN** the system returns a combined list of 3 events sorted by their creation timestamp

### Requirement: Structured AI Summarization
The system SHALL utilize an AI model to analyze the aggregated timeline and return a structured summary containing an Overview, Decisions, Consensus, and Action Items.

#### Scenario: Successful summary generation
- **WHEN** a user requests a thread summary for an issue with activity
- **THEN** the system returns a JSON response with non-empty strings for overview, decisions, consensus, and action items

### Requirement: Summary Caching and Auto-Invalidation
The system SHALL cache the AI-generated summary and automatically invalidate it whenever new comments are added or issue fields are updated.

#### Scenario: Cache hit for unchanged thread
- **WHEN** a summary is requested twice and no new activity has occurred between requests
- **THEN** the system returns the cached summary without calling the AI API

#### Scenario: Cache invalidation on new activity
- **WHEN** a new comment is added to an issue with a cached summary
- **THEN** the cached summary is deleted, and the next request triggers a new AI analysis

### Requirement: Interactive Summarization UI
The system SHALL provide a "Summarize Thread" trigger and a dedicated summary display card within the issue detail view.

#### Scenario: Triggering summarization
- **WHEN** a user clicks the "Summarize Thread" button
- **THEN** the system displays a loading state and then renders the `SummaryCard` with the AI results
