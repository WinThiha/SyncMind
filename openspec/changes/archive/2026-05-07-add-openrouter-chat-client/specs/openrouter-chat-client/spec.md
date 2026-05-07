## ADDED Requirements

### Requirement: OpenRouter Chat Completion Client
The system MUST provide a dedicated OpenRouter chat completion client abstraction built on Laravel HTTP APIs for provider-specific chat requests.

#### Scenario: Client sends OpenRouter-compatible request
- **WHEN** an application service requests a chat completion
- **THEN** the client MUST send a `POST` request to `{base_uri}/chat/completions` with bearer authentication and configured provider headers

#### Scenario: Client returns message content only
- **WHEN** OpenRouter returns a successful chat completion response
- **THEN** the client MUST extract and return `choices[0].message.content` as the canonical text output for downstream parsing

### Requirement: Defensive Response Handling
The OpenRouter chat client MUST fail with a clear application-level exception when chat response content is missing or malformed.

#### Scenario: Missing content in response
- **WHEN** OpenRouter response does not contain `choices[0].message.content`
- **THEN** the client MUST throw a deterministic exception indicating invalid chat response structure
