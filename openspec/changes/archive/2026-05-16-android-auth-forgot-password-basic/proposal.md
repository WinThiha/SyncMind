# Android forgot password request

## Summary
Port the web app's forgot-password email request flow to Android.

## Motivation
The backend exposes `POST /api/auth/forgot-password` and the web app lets users request a reset email. Android currently has login and registration, but no way to start password recovery.

## Scope
- Add Android forgot-password request/response models and API method.
- Add repository method for requesting a password reset link.
- Add forgot-password view model and screen.
- Link the login screen to the forgot-password screen.
- Validate with Android unit tests.

## Out of Scope
- Completing password reset from a tokenized link.
- Deep-link handling for reset-password URLs.
- Backend password broker changes.
