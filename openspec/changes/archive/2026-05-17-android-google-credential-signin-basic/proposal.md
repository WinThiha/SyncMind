# Android Google Credential Sign-In

## Summary
Add a real Android Google sign-in entry point using Credential Manager and allow the backend Google callback to accept Android Google ID tokens.

## Motivation
The web app has Google sign-in, and Android now has a typed callback contract, but Android still cannot acquire a Google credential from the device. Current Android Identity guidance returns a Google ID token, while the backend callback currently only handles web OAuth access tokens or an OAuth code.

## Scope
- Add Credential Manager, Play Services auth, and Google ID dependencies to Android.
- Add a Google sign-in button to the Android login screen.
- Exchange the Google ID token through the existing auth callback repository flow.
- Route unregistered Google users into the Android registration screen with social account details prefilled.
- Update the backend Google callback to verify `id_token` with Google's tokeninfo endpoint and reuse the existing user/social-account/session behavior.
- Add backend coverage for the Android ID-token callback path.

## Out of Scope
- Registering new OAuth clients in Google Cloud.
- Replacing the existing web Google access-token flow.
