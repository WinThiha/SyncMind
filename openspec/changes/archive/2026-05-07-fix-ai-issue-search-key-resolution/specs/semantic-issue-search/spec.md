## MODIFIED Requirements

### Requirement: Semantic Similarity Search
The system SHALL provide an API endpoint to search for issues that are semantically similar to a given text string and SHALL return a canonical issue key for each match that is valid for issue detail routes and issue-key-based API operations.

#### Scenario: Searching for duplicates
- **WHEN** the frontend requests similar issues for a provided text string
- **THEN** the backend generates an embedding for the text using the Vector Search Service and returns issues ordered by cosine similarity from the database
- **AND** each returned issue includes a canonical key string that can be used directly as `/projects/{project_id}/issues/{key}`

#### Scenario: General-purpose semantic search
- **WHEN** the frontend requests similar issues from the issue list search bar in AI Search mode
- **THEN** the backend SHALL generate an embedding for the search query and return the top matching issues from the database
- **AND** each match SHALL include both similarity metadata and a canonical issue key for downstream detail fetch/navigation
