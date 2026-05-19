# Design

## Backend Contract
The verification link ultimately calls the signed backend route:

`GET auth/verify-email/{id}/{hash}?expires=...&signature=...`

Android receives the frontend-style `verify_url` query parameter and calls it via Retrofit `@Url`, preserving the signature query string.

## UI
The screen starts verification on entry, then shows loading, success, or error state. It provides a navigation action back to login/dashboard depending on the current app flow.
