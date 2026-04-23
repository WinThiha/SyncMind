## Context

The system currently uses Laravel Sanctum's stateful session-based authentication for its Next.js frontend. However, native mobile apps and non-browser API clients cannot easily manage CSRF cookies and persistent sessions. While `laravel/sanctum` is installed, the `personal_access_tokens` table is missing, and the controllers are hardcoded to only handle session-based flows.

## Goals / Non-Goals

**Goals:**
- Enable token-based authentication for API clients.
- Fix the missing database table error.
- Ensure `LoginController` and `LogoutController` support both session and token methods.
- Maintain backward compatibility for the existing Next.js frontend.

**Non-Goals:**
- Migrating existing session-based auth to tokens (both should coexist).
- Implementing OAuth2/OpenID Connect (Sanctum is sufficient).

## Decisions

### 1. Unified Login Endpoint
- **Decision**: Keep a single `POST /api/auth/login` endpoint but detect the client type.
- **Rationale**: Simplifies the API surface. Clients can pass a `device_name` parameter to indicate they want a token, or the system can default to tokens for requests missing stateful headers.
- **Alternative**: Separate `/api/auth/token/login` endpoint. (Rejected: Adds redundancy).

### 2. Sanctum for Token Management
- **Decision**: Use `laravel/sanctum`'s built-in token management.
- **Rationale**: Already in `composer.json`, lightweight, and supports the required "plain text token" response.
- **Alternative**: JWT via `tymon/jwt-auth`. (Rejected: Overkill for this project's current needs).

### 3. Database Schema
- **Decision**: Publish and run Sanctum migrations to create `personal_access_tokens`.
- **Rationale**: Standard Laravel practice.

## Risks / Trade-offs

- **[Risk]** Token leakage → **Mitigation**: Recommend clients store tokens securely (Keychain/EncryptedSharedPreferences) and implement token revocation on logout.
- **[Risk]** Breaking Next.js sessions → **Mitigation**: Ensure `session()->regenerate()` only runs if a session is present and doesn't interfere with token generation.
