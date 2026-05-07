## ADDED Requirements

### Requirement: Authenticated users can access a user-global settings destination
The system SHALL provide an authenticated `/settings` destination in the main application shell, and unauthenticated users MUST NOT be able to access settings content.

#### Scenario: Authenticated user opens settings
- **WHEN** an authenticated user navigates to `/settings`
- **THEN** the system renders the settings page without a 404
- **AND** the page is shown within the authenticated layout

#### Scenario: Unauthenticated visitor requests settings
- **WHEN** an unauthenticated visitor navigates to `/settings`
- **THEN** the system redirects the visitor to the login flow

### Requirement: Settings information architecture remains user-global only
The system SHALL scope `/settings` to user-level controls only and MUST NOT include project-level administrative controls in this destination.

#### Scenario: User views settings sections
- **WHEN** a user views `/settings`
- **THEN** the system shows only user-global sections (Account, Security, Preferences, Notifications)
- **AND** project settings controls such as project deletion, member role management, or ownership transfer are not present

#### Scenario: User needs project administration
- **WHEN** a user from `/settings` needs project-level configuration
- **THEN** the system provides guidance or links to project pages for those actions

### Requirement: Users can view and update account profile settings
The system SHALL allow users to view core account identity details and update allowed profile fields from settings.

#### Scenario: User updates display name
- **WHEN** a user changes the allowed profile name field and saves
- **THEN** the system persists the new value
- **AND** a success confirmation is displayed

#### Scenario: Updated display name is reflected immediately in global authenticated chrome
- **WHEN** a user successfully saves a new profile name from `/settings`
- **THEN** the top bar identity name in the same authenticated session updates without requiring a full page refresh or re-login

#### Scenario: Profile update validation fails
- **WHEN** a user submits invalid account profile input
- **THEN** the system rejects the update
- **AND** the page shows field-level or form-level validation errors

#### Scenario: Email address editing is temporarily unavailable
- **WHEN** a user views account profile controls in `/settings`
- **THEN** the email field is not editable
- **AND** the UI communicates that email updates are currently disabled

### Requirement: Users can manage settings for verification and security controls
The system SHALL expose email verification status and applicable security controls based on the user’s authentication method.

#### Scenario: User has unverified email
- **WHEN** a user with an unverified email views Account settings
- **THEN** the system shows the unverified status
- **AND** provides an action to resend verification email

#### Scenario: User without password credential views security section
- **WHEN** a user authenticated only through social login opens Security settings
- **THEN** password-change controls are hidden or disabled with clear explanation

#### Scenario: User changes password with current credential check
- **WHEN** a user with password credentials submits current password and a valid new password in Security settings
- **THEN** the system updates the password through a dedicated password endpoint
- **AND** returns a success response without requiring re-login of the current session

#### Scenario: Password change rejects invalid current password
- **WHEN** a user submits an incorrect current password
- **THEN** the system rejects the request with validation errors
- **AND** does not change the stored password

#### Scenario: Password change requires strong password confirmation
- **WHEN** a user submits a weak or unconfirmed new password
- **THEN** the system rejects the request with field-level validation errors for password requirements

#### Scenario: Password change revokes other sessions and API tokens
- **WHEN** a password change succeeds
- **THEN** the system revokes other active sessions/tokens for that user
- **AND** preserves the current authenticated session so the user remains logged in

#### Scenario: Password endpoint enforces abuse protection
- **WHEN** repeated password-change attempts are made in a short window
- **THEN** the dedicated password endpoint applies rate limiting and returns throttling responses when limits are exceeded

### Requirement: Users can persist personal preferences and notification preferences
The system SHALL allow users to configure personal UI preferences and notification preferences, and saved preferences MUST persist across sessions.

#### Scenario: User updates theme preference
- **WHEN** a user selects a theme preference and saves
- **THEN** the system applies and persists the selected theme preference
- **AND** the same preference is used after the next login session

#### Scenario: Supported saved theme preference values include system mode
- **WHEN** a user saves a theme preference from `/settings`
- **THEN** the persisted value supports `light`, `dark`, or `system`

#### Scenario: Top bar theme toggle persists local override across reloads
- **WHEN** a user toggles theme from the top bar without saving a different preference in `/settings`
- **THEN** the app persists a local device override that survives page reloads
- **AND** the override does not rewrite the saved account preference until an explicit `/settings` save

#### Scenario: Saved account preference is applied at authenticated app start
- **WHEN** an authenticated session starts in a fresh browser context (for example, private mode)
- **THEN** the app fetches user settings and applies the saved account preference after auth hydration

#### Scenario: System preference mode follows OS changes live
- **GIVEN** the saved theme preference is `system`
- **WHEN** the operating system color scheme changes while the app is open
- **THEN** the effective app theme updates to follow the new OS scheme

#### Scenario: User updates notification toggles
- **WHEN** a user enables or disables supported notification preference toggles and saves
- **THEN** the system persists the toggle values
- **AND** subsequent settings page loads reflect the saved values
