# Android email verification link

## Summary
Port the web app's email verification link completion flow to Android.

## Motivation
Android can resend verification email from settings, but it cannot complete signed verification links. The web flow opens `/verify-email?verify_url=...` and calls the signed backend URL.

## Scope
- Add Auth API/repository support for calling a signed verification URL.
- Add a verify-email view model and screen.
- Add navigation route and app link handling for `/verify-email?verify_url=...`.
- Validate with Android unit tests.

## Out of Scope
- Resend verification from the verification screen.
- Production app link verification.
- Backend verification link generation changes.
