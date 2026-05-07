## MODIFIED Requirements

### Requirement: Vector Search Service Integration
The system MUST provide a globally accessible, custom-configured integration for vector search embeddings that is distinct from the primary suggestion/summarization service configuration. The embedding integration MUST use a dedicated embedding provider configuration contract with independent `base_uri`, `api_key`, and `model`, and it MUST support an explicit `dimensions` (or equivalent output dimensionality) setting to ensure vectors match database constraints.

#### Scenario: OpenAI-compatible embedding API resolution
- **WHEN** the application generates vector embeddings
- **THEN** it MUST call an OpenAI-compatible embeddings endpoint using bearer-token authentication from embedding-specific configuration keys, rather than using non-embedding AI credentials.

#### Scenario: Vector dimension configuration
- **WHEN** a service reads embedding configuration
- **THEN** it MUST include dimension-related configuration that matches the `vector(N)` dimension defined in the database migration.

#### Scenario: GenerateIssueEmbeddingJob applies configured dimensions
- **WHEN** `GenerateIssueEmbeddingJob` calls the embedding provider
- **THEN** the request payload MUST include configured dimensions only when the provider contract supports it, and generated vectors MUST remain compatible with stored vector dimensions.

#### Scenario: AIIssueSearchService applies configured dimensions
- **WHEN** `AIIssueSearchService` calls the embedding provider
- **THEN** the request payload MUST include configured dimensions only when the provider contract supports it, and generated vectors MUST remain compatible with stored vector dimensions.

#### Scenario: Embedding dimensions match database column
- **WHEN** an embedding vector is stored in the `issues.embedding` column
- **THEN** the vector dimension MUST equal the `vector(N)` dimension defined in the migration, and no data exception SHALL occur.
