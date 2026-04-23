## ADDED Requirements

### Requirement: Issue API tokens for non-browser clients
The system SHALL provide a mechanism to issue persistent API tokens upon successful authentication for clients that do not support standard cookie-based sessions (e.g., mobile apps, CLI tools).

#### Scenario: Mobile login returns API token
- **WHEN** a client identifies as a non-browser client (via header or request parameter) and provides valid credentials to `/api/auth/login`
- **THEN** the system MUST return a plain-text API token in the JSON response

### Requirement: Authenticate requests via API token
The system SHALL allow access to protected resources when a valid API token is provided in the `Authorization` header as a Bearer token.

#### Scenario: Accessing protected route with token
- **WHEN** an unauthenticated client makes a request with a valid `Authorization: Bearer <token>` header
- **THEN** the system MUST authenticate the user and allow access to the resource

### Requirement: Revoke API tokens
The system SHALL allow users to revoke their API tokens, immediately invalidating them for future authentication.

#### Scenario: Logout revokes current token
- **WHEN** a user authenticated via an API token calls the logout endpoint
- **THEN** the system MUST delete the current token from the database
