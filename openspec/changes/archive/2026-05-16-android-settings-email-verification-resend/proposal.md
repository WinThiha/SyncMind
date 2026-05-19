## Why

Web settings lets unverified users request another verification email. Android settings currently displays verification status but has no resend action.

## What Changes

- Add Android API/repository support for `POST /auth/email/verification-notification`.
- Add a resend verification action for unverified accounts in Android settings.
- Show resend progress, success, and error feedback.

## Impact

- Android settings API service and repository
- Android settings ViewModel and screen
