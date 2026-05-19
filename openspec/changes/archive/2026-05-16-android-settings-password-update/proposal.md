## Why

The backend and web settings support password changes, but Android settings currently only save profile, preferences, and notification settings. Android password-account users need the same basic account security action.

## What Changes

- Add Android API/repository support for `PUT /user/settings/password`.
- Add password fields and save action to Android settings when the account has a password credential.
- Surface validation and backend errors in the settings UI.

## Impact

- Android settings API service and repository
- Android settings ViewModel and screen
