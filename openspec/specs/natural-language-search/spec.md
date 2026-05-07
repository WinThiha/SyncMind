## ADDED Requirements

### Requirement: AI Search Toggle
The issue list interface SHALL provide a toggle mechanism to switch between traditional keyword search and AI-powered semantic search.

#### Scenario: User toggles AI search
- **WHEN** the user clicks the ✨ (Sparkles) button in the search bar
- **THEN** the search mode switches to AI Search and the input placeholder updates to "Search with AI..."

### Requirement: Semantic Issue Search Execution
When AI Search mode is active, the system SHALL perform a semantic similarity search using the entire search query and SHALL render results with identifiers that resolve to valid issue detail keys.

#### Scenario: User types in AI search mode
- **WHEN** the user types a query in the search bar with AI Search enabled and pauses for 1000ms
- **THEN** the frontend SHALL call the `getSimilarIssues` API with the query and update the list with the results
- **AND** each result SHALL retain or derive a canonical issue key before any click action can open issue details

#### Scenario: User opens an AI search result
- **WHEN** the user clicks an item returned from AI search in the issue list
- **THEN** the frontend SHALL request issue details using a non-empty canonical issue key
- **AND** the request path SHALL NOT contain `undefined` as the issue key segment

### Requirement: Similarity Score Display
Issues returned via AI Search SHALL display their semantic similarity score to provide context on the match quality.

#### Scenario: Displaying search results
- **WHEN** AI search results are displayed in the list
- **THEN** each item SHALL show a similarity percentage (e.g., "85% match") based on the similarity score returned by the API
