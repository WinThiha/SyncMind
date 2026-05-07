## ADDED Requirements

### Requirement: Issue Vector Embedding Generation
The system SHALL generate and store a vector embedding for an issue whenever it is created or updated.

#### Scenario: Issue creation triggers embedding
- **WHEN** a user creates a new issue
- **THEN** a background job is dispatched to generate a vector embedding using the Vector Search Service and save it to the `issues` table

#### Scenario: Issue update triggers embedding update
- **WHEN** a user updates the summary or description of an existing issue
- **THEN** a background job is dispatched to generate a new vector embedding and update the `issues` table

### Requirement: Semantic Similarity Search
The system SHALL provide an API endpoint to search for issues that are semantically similar to a given text string.

#### Scenario: Searching for duplicates
- **WHEN** the frontend requests similar issues for a provided text string
- **THEN** the backend generates an embedding for the text using the Vector Search Service and returns issues ordered by cosine similarity from the database

### Requirement: Inline Duplicate Suggestions
The frontend SHALL display a "Possible Duplicates" card in the issue creation form based on semantic similarity of the typed summary.

#### Scenario: User types summary
- **WHEN** a user types a summary and pauses for at least 1000ms
- **THEN** the frontend fetches semantically similar issues and displays them in a card if matches exceed a similarity threshold