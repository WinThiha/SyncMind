## ADDED Requirements

### Requirement: Custom AI Client Configuration
The system MUST provide a globally accessible, custom-configured OpenAI client that includes required routing and identification headers for external AI gateways.

#### Scenario: Custom client resolution
- **WHEN** the application resolves the `ai.client` binding from the service container
- **THEN** it returns an `OpenAI\Client` instance configured with the application's `HTTP-Referer` and `X-Title` headers

### Requirement: Service Integration with Custom Client
Application services that interact with AI endpoints MUST use the custom-configured named client rather than the vendor default.

#### Scenario: AI Issue Suggestion Service uses custom client
- **WHEN** the `AIIssueSuggestionService` is instantiated
- **THEN** it explicitly resolves and utilizes the `ai.client` binding to ensure all outgoing requests carry the correct custom headers
