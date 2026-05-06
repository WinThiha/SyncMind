## Why

The current authentication implementation mixes session-based browser behavior with partially implemented token-based flows, which leaves the web login, registration, and logout experience brittle and internally inconsistent. This needs to be corrected now so the browser experience is reliable end-to-end without expanding the scope into a mobile auth rewrite.

## What Changes

- Stabilize the web authentication flow for email/password login, registration, logout, and authenticated user hydration.
- Align backend auth responses and logout behavior with the web client's actual usage so browser flows succeed consistently.
- Define explicit web-focused behavior for session lifecycle, post-auth redirects, and unauthenticated handling on protected pages.
- Preserve existing mobile token-based behavior and avoid mobile-specific changes unless a minimal backend compatibility adjustment is required to keep shared endpoints correct.
- Add focused verification coverage for the browser auth path, including regression cases around logout and newly registered users.

## Capabilities

### New Capabilities
- `web-auth-flows`: Reliable browser authentication behavior covering registration, login, logout, auth hydration, and protected-route handling for the Next.js frontend backed by Laravel Sanctum sessions.

### Modified Capabilities

## Impact

- Affected code: frontend auth forms, auth context, route protection, shared axios/browser auth plumbing, and backend auth controllers that serve browser flows.
- Affected systems: Laravel Sanctum session authentication for the web app, Next.js protected navigation behavior, Google login completion flow, and auth-related automated tests.
- Dependencies: Continues using Laravel Sanctum session-based web auth and existing mobile token support; may require only minimal shared-endpoint adjustments where current behavior is unsafe or inconsistent.