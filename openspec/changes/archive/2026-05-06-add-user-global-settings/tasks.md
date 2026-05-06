## 1. Route and Navigation Foundation

- [x] 1.1 Add authenticated `/settings` route and page scaffold in the frontend app router.
- [x] 1.2 Update sidebar navigation behavior so the Settings entry resolves to the new page and highlights correctly.
- [x] 1.3 Add basic settings section navigation (Account, Security, Preferences, Notifications) and loading/error state shells.

## 2. Account and Security Capabilities

- [x] 2.1 Define backend API contract for reading/updating user-global settings payloads (profile, verification metadata, security capability flags).
- [x] 2.2 Implement profile update flow for allowed account fields with server-side validation and structured error responses.
- [x] 2.3 Implement verification-status display support and resend-verification action wiring in settings UI.
- [x] 2.4 Implement conditional security controls in UI based on auth method capability flags (for example, password-change availability).

## 3. Preferences and Notifications Persistence

- [x] 3.1 Implement persistence for theme and sidebar default preferences in backend storage and settings API responses.
- [x] 3.2 Integrate settings preferences with existing frontend contexts so saved values are applied on load.
- [x] 3.3 Implement notification preference toggles with persisted read/write behavior for supported channels.

## 4. Scope Guardrails, Testing, and Rollout

- [x] 4.1 Add explicit UX guardrails in settings indicating project-level administration is managed under project pages.
- [x] 4.2 Add frontend tests for authenticated access, unauthenticated redirect behavior, section rendering, and save feedback.
- [x] 4.3 Add backend tests for settings read/write authorization, validation errors, and persisted preference retrieval.
- [x] 4.4 Validate that no project-administration controls are exposed through `/settings` and document rollout notes.

## 5. Account UX Consistency Follow-up

- [x] 5.1 Ensure successful account name save in `/settings` immediately refreshes top bar identity name in-session.
- [x] 5.2 Keep account email editing disabled in settings and add explicit copy clarifying temporary unavailability.
- [x] 5.3 Add/update frontend regression coverage for immediate top bar name reflection after account save.

## 6. Password Update Security Flow

- [x] 6.1 Add dedicated authenticated password update endpoint (`PUT /api/user/settings/password`) with validation for current password, new password strength, and confirmation.
- [x] 6.2 Apply endpoint-specific rate limiting for password update attempts and return standard throttling responses.
- [x] 6.3 Implement successful password-change handling that revokes other sessions/tokens while preserving the current session login.
- [x] 6.4 Implement Security section password form UX and error/success handling; keep controls hidden/disabled when account has no password credential.
- [x] 6.5 Add backend tests for password update success, invalid current password, weak/unconfirmed new password, throttle behavior, and session/token revocation semantics.
- [x] 6.6 Add frontend regression tests for password update flow, validation feedback, and post-success state messaging.
