## MODIFIED Requirements

### Requirement: Issue Vector Embedding Generation
The system SHALL generate and store a vector embedding for an issue whenever it is created or updated, using the dedicated embedding provider configuration and OpenAI-compatible embedding request contract.

#### Scenario: Issue creation triggers embedding
- **WHEN** a user creates a new issue
- **THEN** a background job is dispatched to generate a vector embedding through the embedding provider lane and save it to the `issues` table.

#### Scenario: Issue update triggers embedding update
- **WHEN** a user updates the summary or description of an existing issue
- **THEN** a background job is dispatched to generate a new vector embedding through the embedding provider lane and update the `issues` table.

### Requirement: Semantic Similarity Search
The system SHALL provide an API endpoint to search for issues that are semantically similar to a given text string by generating query embeddings with the embedding provider lane and returning nearest matches by vector similarity.

#### Scenario: Searching for duplicates
- **WHEN** the frontend requests similar issues for a provided text string
- **THEN** the backend generates an embedding for the text using the embedding provider lane and returns issues ordered by cosine similarity from the database.

#### Scenario: Issue creation duplicate suggestions threshold
- **WHEN** the issue creation form receives similar issue results
- **THEN** the frontend SHALL show duplicate suggestions only for issues with similarity greater than or equal to `0.6`.

#### Scenario: General-purpose semantic search
- **WHEN** the frontend requests similar issues from the issue list search bar in AI Search mode
- **THEN** the backend SHALL generate an embedding for the search query using the embedding provider lane and return the top matching issues from the database.
