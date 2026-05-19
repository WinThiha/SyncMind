## Context

The backend `UserSettingsController` returns a nested settings payload and accepts partial updates. The web settings page includes account, security, preferences, notifications, password update, and verification resend. Android can cover the core read/update settings with simple Compose controls and defer the security-sensitive password and verification actions.

## Goals / Non-Goals

**Goals:**
- Fetch and display user settings on Android.
- Allow display name updates.
- Allow theme, locale, sidebar default, and notification updates.
- Keep the local persisted user name in sync after profile updates.

**Non-Goals:**
- No password update in this increment.
- No email verification resend in this increment.
- No local application of Android theme/locale beyond persisting the backend preference.

## Decisions

### 1. Separate Settings API Service
- **Decision**: Add `SettingsApiService` and `SettingsRepository`.
- **Rationale**: Settings are user-scoped rather than project-scoped, and keeping them separate avoids overloading `ProjectApiService`.

### 2. One Save Action
- **Decision**: Use a single save action for all editable settings currently on screen.
- **Rationale**: This is simpler for the first Android settings port and maps well to the backend partial update endpoint.

## Risks / Trade-offs

- **[Risk]** Locale/theme changes do not immediately restyle the Android app.
- **Mitigation**: This increment stores the preference server-side; app-wide local application can be handled by a dedicated Android preferences theming change.
