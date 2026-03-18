# Research: User Authentication and Social Login

## Technical Context Unknowns & Best Practices

### 1. Integrating Laravel Socialite with a Next.js SPA
- **Decision**: Use Next.js for the Google Login button to retrieve the Google Access Token (or ID Token) directly on the client, then send this token to a Laravel API endpoint. Laravel will use `Socialite::driver('google')->stateless()->userFromToken($token)` to verify the token and retrieve user details.
- **Rationale**: Standard Laravel Socialite redirect flows rely on session state and redirects that are difficult to manage seamlessly between separate frontend and backend domains. Verifying the token received from the client directly on the backend via stateless Socialite avoids cross-origin redirect issues and aligns perfectly with a Sanctum SPA architecture.
- **Alternatives considered**: 
  - Using Socialite's redirect flow and appending a generated temporary token to the frontend callback URL. (Rejected due to security risks of exposing tokens in URLs and complexity of the flow).

### 2. Laravel Sanctum Authentication for Next.js
- **Decision**: Use Sanctum's cookie-based SPA authentication if both frontend and backend share the same top-level domain (e.g., `app.domain.com` and `api.domain.com`). If they are on completely different domains, use API token authentication. We will default to SPA Cookie authentication as it is more secure against XSS.
- **Rationale**: SPA authentication utilizes HTTP-only cookies, eliminating the need to store sensitive tokens in LocalStorage where they are vulnerable to XSS attacks.
- **Alternatives considered**: 
  - JWTs (JSON Web Tokens). (Rejected because Sanctum provides a simpler, built-in solution for Laravel without the overhead of managing JWT signing keys and revocation).

### 3. Package Management & Tooling 
- **Decision**: Utilize `nvs` for Node.js version management and `scoop` for PHP environment management. Configure NPM and Composer to use Asian mirrors if default registries timeout.
- **Rationale**: Meets user constraints and ensures reliable developer onboarding in restricted network environments.
- **Alternatives considered**: 
  - NVM/NVM-Windows (Rejected in favor of requested `nvs`).

## Actionable Takeaways for Design
1. Backend needs an API endpoint to receive the Google token (`/api/auth/google/callback`).
2. Frontend needs `@react-oauth/google` or similar to handle the client-side Google prompt.
3. Database requires a `social_accounts` or `linked_accounts` table to map Google IDs to local users.