## MODIFIED Requirements

### Requirement: Custom AI Client Configuration
The system MUST provide a globally accessible, custom-configured OpenAI client that includes required routing and identification headers for external AI gateways. The vector search configuration MUST include an `output_dimensionality` setting that controls the dimension of embedding vectors returned by the Gemini API, ensuring they match the database column definition.

#### Scenario: Custom client resolution
- **WHEN** the application resolves the `ai.client` binding from the service container
- **THEN** it returns an `OpenAI\Client` instance configured with the application's `HTTP-Referer` and `X-Title` headers

#### Scenario: Vector dimension configuration
- **WHEN** a service reads the vector configuration from `config('openai.vector')`
- **THEN** it MUST include an `output_dimensionality` key with a value matching the `vector(N)` dimension defined in the database migration

### Requirement: Service Integration with Custom Client
Application services that interact with AI endpoints MUST use the custom-configured named client rather than the vendor default. Embedding services MUST pass `outputDimensionality` in the `embedContent` API request payload using the configured value.

#### Scenario: AI Issue Suggestion Service uses custom client
- **WHEN** the `AIIssueSuggestionService` is instantiated
- **THEN** it explicitly resolves and utilizes the `ai.client` binding to ensure all outgoing requests carry the correct custom headers

#### Scenario: GenerateIssueEmbeddingJob specifies output dimensionality
- **WHEN** `GenerateIssueEmbeddingJob` calls the Gemini `embedContent` endpoint
- **THEN** the request payload MUST include `outputDimensionality` set to `config('openai.vector.output_dimensionality')`

#### Scenario: AIIssueSearchService specifies output dimensionality
- **WHEN** `AIIssueSearchService` calls the Gemini `embedContent` endpoint
- **THEN** the request payload MUST include `outputDimensionality` set to `config('openai.vector.output_dimensionality')`

#### Scenario: Embedding dimensions match database column
- **WHEN** an embedding vector is stored in the `issues.embedding` column
- **THEN** the vector dimension MUST equal the `vector(N)` dimension defined in the migration, and no data exception SHALL occur
