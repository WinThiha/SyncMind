## Why

Mobile login fails with a database error because Laravel Sanctum's `personal_access_tokens` table is missing. The current implementation uses session-based authentication which is incompatible with native mobile apps, and the required API token infrastructure hasn't been initialized.

## What Changes

- Initialize Laravel Sanctum database schema to support API tokens.
- Update `LoginController` to provide plain-text API tokens for mobile/API clients.
- Add `LogoutController` (or update existing) to handle token revocation.

## Capabilities

### New Capabilities
- `api-token-auth`: Support for issuing and validating persistent API tokens for non-browser clients.

### Modified Capabilities
- `001-user-auth`: Update requirements to include token-based authentication alongside session-based auth.

## Impact

- **Database**: New `personal_access_tokens` table.
- **API**: `POST /api/auth/login` will now return a `token` field for mobile clients.
- **Dependencies**: `laravel/sanctum` will be fully configured.
