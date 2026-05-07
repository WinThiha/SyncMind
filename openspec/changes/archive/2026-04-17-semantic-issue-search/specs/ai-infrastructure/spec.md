## MODIFIED Requirements

### Requirement: Custom AI Client Configuration
The system MUST provide configured clients for distinct AI services: a Suggestion Service for text generation and a Vector Search Service for embeddings, each with their own base URL and model configuration.

#### Scenario: Suggestion Service client resolution
- **WHEN** the application requests the Suggestion Service AI client
- **THEN** it returns an `OpenAI\Client` instance configured with the Suggestion Service base URL, model, and required routing headers

#### Scenario: Vector Search Service client resolution
- **WHEN** the application requests the Vector Search Service AI client
- **THEN** it returns an `OpenAI\Client` instance configured with the Vector Search Service base URL (Gemini API) and model (`text-embedding-004`)