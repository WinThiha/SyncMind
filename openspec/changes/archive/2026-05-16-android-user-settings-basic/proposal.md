## Why

The web app has a user settings area for profile, preferences, and notifications. Android currently persists user identity but has no settings screen, so users cannot inspect account state or adjust app preferences from mobile.

## What Changes

### Android
- Add settings retrieval via `GET /api/user/settings`.
- Add settings update via `PUT /api/user/settings`.
- Add serializable settings models for profile, verification, security, preferences, and notifications.
- Add a settings route reachable from the project list top bar.
- Add a basic settings screen for display name, email/verification/security status, theme/locale/sidebar preferences, and notification toggles.

## Capabilities

### Modified Capabilities
- `user-settings`: Add Android support for core settings read/update.
- `005-android-app-setup`: Add settings navigation and data layer.

## Impact

- **Android UX**: Users can view and update common account settings from Android.
- **Backend**: No backend API changes expected.
- **Scope**: Password update and email verification resend are not included in this increment.
