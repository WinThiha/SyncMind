## ADDED Requirements

### Requirement: Browser registration establishes a consistent authenticated flow
The system MUST allow the Next.js web client to complete email/password registration through the existing browser session-based Sanctum flow and return a response shape that allows the frontend to proceed without endpoint-specific workarounds.

#### Scenario: Successful browser registration
- **WHEN** an unauthenticated browser client submits valid registration data to the registration endpoint
- **THEN** the system MUST create the user, establish the browser session expected by the web client, and return a successful JSON response that includes the authenticated user data needed by the frontend

#### Scenario: Duplicate browser registration attempt
- **WHEN** an unauthenticated browser client submits registration data with an email address that already exists
- **THEN** the system MUST reject the request with validation errors and MUST NOT create a browser session

### Requirement: Browser login and Google login use the same session contract
The system MUST ensure successful browser login through either email/password or Google authentication results in the same session lifecycle and authenticated-user hydration behavior.

#### Scenario: Successful email/password browser login
- **WHEN** a browser client submits valid email/password credentials through the login flow
- **THEN** the system MUST establish or refresh the browser session and allow the frontend to retrieve the authenticated user via the current-user endpoint

#### Scenario: Successful Google browser login for an existing account
- **WHEN** a browser client completes Google authentication for an account that already exists in the system
- **THEN** the system MUST establish or refresh the browser session and return a successful response compatible with the same frontend post-login flow used by email/password login

#### Scenario: Google login requires registration completion
- **WHEN** a browser client completes Google authentication for an email address that does not yet exist in the system
- **THEN** the system MUST return the social-registration handoff payload without creating an authenticated browser session

### Requirement: Browser logout clears authenticated state without breaking token callers
The system MUST support a shared logout endpoint that fully clears browser-authenticated state while safely revoking the current token for token-authenticated callers.

#### Scenario: Successful browser logout
- **WHEN** an authenticated browser client submits a logout request using the session-based flow
- **THEN** the system MUST invalidate the session, regenerate the CSRF token as needed, and return a successful response without server errors

#### Scenario: Successful token-based logout on shared endpoint
- **WHEN** an authenticated token-based client submits a logout request with a valid Sanctum personal access token
- **THEN** the system MUST revoke only the current access token and return a successful response

### Requirement: Protected browser routes fail closed on invalid auth state
The system MUST prevent the web client from rendering protected application content when browser-authenticated state is missing, expired, or stale.

#### Scenario: Missing browser session on protected navigation
- **WHEN** a browser client navigates to a protected route without a valid authenticated session signal
- **THEN** the system MUST redirect the user to the login flow before protected content is shown

#### Scenario: Stale browser auth detected during hydration
- **WHEN** a protected page loads with a stale cookie or other invalid browser-auth signal and the current-user request fails
- **THEN** the frontend MUST clear its authenticated user state and redirect the user to the login flow without rendering protected content

### Requirement: Browser auth regressions are covered by automated tests
The system MUST include automated test coverage for the browser authentication path and for the shared logout endpoint behavior that differs between session and token callers.

#### Scenario: Browser auth flow test coverage
- **WHEN** the authentication test suite runs
- **THEN** it MUST verify successful browser registration, login, logout, and current-user hydration behavior along with at least one failure-path assertion

#### Scenario: Shared logout safety coverage
- **WHEN** the authentication test suite runs against logout behavior
- **THEN** it MUST verify that session-authenticated requests do not fail when no revocable personal access token is attached and that token-authenticated requests revoke the active token correctly