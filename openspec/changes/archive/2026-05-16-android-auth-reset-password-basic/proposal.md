# Android reset password completion

## Summary
Port the web app's reset-password token flow to Android.

## Motivation
Android can now request a reset email, but it cannot complete password resets from tokenized reset links. The web app supports `/reset-password?token=...&email=...` and posts to the backend reset endpoint.

## Scope
- Add Android reset-password request model and API method.
- Add repository method for completing password reset.
- Add reset-password view model and screen.
- Add navigation route with token/email query arguments.
- Add basic Android app link handling for `/reset-password` URLs.
- Validate with Android unit tests.

## Out of Scope
- Backend reset broker changes.
- Automatic login after reset.
- Production domain app link verification.
