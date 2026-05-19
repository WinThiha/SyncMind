# Android Google Callback Contract

## Summary
Add the Android data-layer contract for the existing backend Google auth callback so a Google access token obtained by a future Android sign-in flow can be exchanged for the app's normal API token.

## Motivation
The web app already supports Google sign-in through `POST /api/auth/google/callback`. Android currently has email/password auth, registration, password recovery, and email verification parity, but it has no typed client method for the Google callback route.

## Scope
- Add a serializable Android request model for the backend callback payload.
- Add an `AuthApiService` method for `auth/google/callback`.
- Add an `AuthRepository` method that exchanges a Google access token, saves the returned API token/user, and reports errors consistently with normal login.

## Out of Scope
- Google Identity Services / Credential Manager UI integration.
- Android OAuth client ID or Play Services configuration.
- Backend behavior changes.
