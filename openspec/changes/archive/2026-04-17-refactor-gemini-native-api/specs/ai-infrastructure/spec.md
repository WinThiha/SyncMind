## MODIFIED Requirements

### Requirement: Vector Search Service Integration
The system MUST provide a globally accessible, custom-configured client or HTTP integration for the Vector Search Service (Gemini API) that is distinct from the primary Suggestion Service.

#### Scenario: Native Gemini REST API resolution
- **WHEN** the application generates vector embeddings
- **THEN** it MUST use the native Gemini REST API endpoint (`/v1beta/models/{model}:embedContent`) with the correct payload structure and `x-goog-api-key` header, rather than relying on the OpenAI compatibility layer.