## MODIFIED Requirements

### Requirement: Service Integration with Custom Client
Application services that interact with AI endpoints MUST resolve provider-appropriate client abstractions from the service container instead of depending directly on strict vendor response hydration for OpenRouter chat paths.

#### Scenario: AI Issue Suggestion Service uses provider-appropriate client
- **WHEN** the `AIIssueSuggestionService` is instantiated
- **THEN** it MUST resolve and use the configured chat completion abstraction so OpenRouter chat calls are executed via Laravel HTTP with normalized content extraction.

### Requirement: Custom AI Client Configuration
The system MUST provide globally accessible AI client bindings that include required routing and identification headers for external AI gateways, including an OpenRouter chat client path using `Authorization`, `HTTP-Referer`, and `X-Title`.

#### Scenario: OpenRouter client resolution
- **WHEN** the application resolves the OpenRouter chat client binding from the service container
- **THEN** it MUST be configured with chat provider base URI, API key, and required gateway headers from application configuration.
