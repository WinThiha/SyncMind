# Android email registration

## Summary
Port the web app's email registration flow to Android.

## Motivation
The backend exposes `POST /api/auth/register` and the web app supports account creation, but Android currently only supports login/logout. Users cannot create accounts from the Android app.

## Scope
- Add Android registration request/response models and API method.
- Add repository registration flow that logs in after successful registration, because the backend register response does not return a mobile token.
- Add a registration view model and screen.
- Link login and registration screens through navigation.
- Validate with Android unit tests.

## Out of Scope
- Google/social registration.
- Email verification screen.
- Password reset.
