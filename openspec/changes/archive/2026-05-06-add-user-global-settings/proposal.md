## Why

The sidebar exposes a `/settings` destination, but the route does not exist, causing a 404 and leaving account-level controls scattered or unavailable. A dedicated user-global settings area is needed to provide a predictable place for personal account, security, and preference management.

## What Changes

- Add a new authenticated `/settings` experience with user-global scope only.
- Define sections for Account, Security, Preferences, and Notifications with clear MVP boundaries.
- Establish explicit scope separation so project administration remains under `/projects/[id]` and is not duplicated in `/settings`.
- Add UX and behavioral requirements for verification status visibility, personal preference persistence, and settings save feedback.
- Ensure successful account name saves in settings are reflected immediately in global authenticated UI (top bar identity).
- Keep email address updates disabled in account settings until a dedicated email-change flow is introduced.
- Add a dedicated password update endpoint (`PUT /api/user/settings/password`) with current-password verification, strong password validation, and confirmation checks.
- Preserve the current authenticated session after password change while revoking other sessions/tokens.
- Apply endpoint-level rate limiting for password change attempts.

## Capabilities

### New Capabilities
- `user-settings`: User-global settings experience for account profile, security controls, personal UI preferences, and notification preferences.

### Modified Capabilities
- `user-settings`: clarify in-session identity consistency (settings name save to top bar) and temporary email-edit disablement behavior.
- `user-settings`: add dedicated password update flow semantics (endpoint boundary, session/token revocation behavior, and throttling).

## Impact

- Frontend routing and navigation (`frontend/src/app`, `frontend/src/components/layout/Sidebar.tsx`).
- Frontend account/preferences state handling (`frontend/src/context`, settings UI components).
- Backend API surface for user profile and preference persistence (new or extended user settings endpoints).
- Backend security handling for credential updates (password validation, token/session revocation, and throttle policy).
- Test coverage for authenticated settings access, form validation, and persistence behavior.
