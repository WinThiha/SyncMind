## MODIFIED Requirements

### Requirement: Protected System Access (STORY-4)
As an unauthenticated user, I should not be able to access the system so that private data and features remain secure.
**Acceptance Scenarios**:
1. **Given** an unauthenticated user, **When** they attempt to navigate to a protected system route without a valid session or API token, **Then** they are redirected to the login page or receive a 401 Unauthorized response.
2. **Given** a logged-in user, **When** their session or API token expires and they attempt to perform an action, **Then** they are prompted to log in again or receive a 401 Unauthorized response.

### Requirement: FR-009
System MUST restrict access to all internal features and data; users MUST be logged in via session cookie OR provide a valid Bearer token to enter the system.

#### Scenario: Multi-channel authentication
- **WHEN** a request is made to a protected API endpoint
- **THEN** the system MUST allow access if EITHER a valid session cookie OR a valid API Bearer token is provided
