# Design

## Android
Android will use the Credential Manager Sign in with Google button flow:
- `GetSignInWithGoogleOption` requests a Google ID token for `BuildConfig.GOOGLE_WEB_CLIENT_ID`.
- The login screen parses a `GoogleIdTokenCredential` from Credential Manager's custom credential response.
- `LoginViewModel` sends the ID token to `AuthRepository.loginWithGoogleIdToken`.
- The repository posts `id_token` and `device_name` to `auth/google/callback`, then persists the returned API token and user.
- If the backend returns a `404` with `social_user`, the login view model emits that profile to navigation. The register route accepts optional social query arguments and pre-fills the registration form, then includes `social_id` and `social_provider` in the normal registration request so the backend links the social account.

The web client ID is a public OAuth identifier. The debug build reads it from a Gradle property/environment value when available and falls back to the current backend web client ID so the emulator can exercise the flow without extra local wiring.

## Backend
The Laravel callback will support a new `id_token` field. It will call Google's tokeninfo endpoint, validate that the returned audience matches `services.google.client_id` when configured, then normalize the Google user into the existing callback path. Existing `token` and OAuth-code behavior stays unchanged.

## Verification
- Android unit tests: `.\gradlew.bat testDebugUnitTest`
- Backend filtered test: clear config cache, then run `GoogleLoginTest`
- Emulator screenshot after installing and launching the app
