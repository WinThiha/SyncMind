## MODIFIED Requirements

### Requirement: Semantic Similarity Search
The system SHALL provide an API endpoint to search for issues that are semantically similar to a given text string.

#### Scenario: Searching for duplicates
- **WHEN** the frontend requests similar issues for a provided text string
- **THEN** the backend generates an embedding for the text using the Vector Search Service and returns issues ordered by cosine similarity from the database

#### Scenario: General-purpose semantic search
- **WHEN** the frontend requests similar issues from the issue list search bar in AI Search mode
- **THEN** the backend SHALL generate an embedding for the search query and return the top matching issues from the database
