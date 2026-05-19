# Design

## Backend Contract
The Laravel route `POST /api/auth/google/callback` accepts a Google access token through `token`. When `device_name` is included, the backend returns a Sanctum API token alongside the user, matching the existing Android `LoginResponse` shape.

## Android Implementation
The Android auth data layer will add:
- `GoogleCallbackRequest(token, device_name)` in the auth request model file.
- `AuthApiService.googleCallback(...)` mapped to `auth/google/callback`.
- `AuthRepository.loginWithGoogleToken(accessToken)` that sets `device_name` from `android.os.Build.MODEL`, delegates to the API service, and persists the returned token/user through `TokenManager`.

This keeps the change at the same layer as the existing email/password login and avoids adding Google SDK dependencies without an Android OAuth client configuration.

## Verification
Run Android unit tests with `.\gradlew.bat testDebugUnitTest`.
