## Context

SyncMind currently uses Laravel Sanctum in two modes through the same auth endpoints: browser sessions for the Next.js frontend and personal access tokens for mobile or other API clients. The web client is built around session behavior, including CSRF bootstrapping, authenticated user hydration, and cookie-based route protection, but the backend auth controllers and frontend flows are not consistently shaped around that assumption. Registration, login, Google auth completion, and logout do not all follow the same browser contract, which creates avoidable failures and regressions in the core web authentication journey.

The user explicitly wants this change to make browser authentication work properly without broadening scope into a mobile rewrite. That means the design should preserve existing mobile token issuance semantics wherever possible and limit shared-endpoint changes to compatibility fixes that keep web and mobile behavior coherent.

## Goals / Non-Goals

**Goals:**
- Make browser registration, login, logout, and authenticated session hydration reliable end-to-end.
- Keep the web app on Sanctum session authentication rather than introducing a token-first browser model in this change.
- Normalize shared auth endpoint behavior so the frontend can depend on stable response and session semantics.
- Ensure logout safely handles both session-authenticated requests and token-authenticated requests that hit the same endpoint.
- Add regression coverage for the browser auth path and preserve existing mobile token behavior.

**Non-Goals:**
- Migrating the web app to bearer-token authentication.
- Redesigning the mobile authentication contract or storage model.
- Introducing password reset, account recovery, or broader account management features beyond the existing auth flows.
- Reworking Google OAuth architecture beyond what is required for browser login consistency.

## Decisions

### 1. Keep browser authentication session-based
- **Decision**: Continue using Sanctum's stateful session flow for the Next.js web client.
- **Rationale**: The existing frontend already depends on CSRF cookies, authenticated hydration via `/api/user`, and cookie-aware protected navigation. Keeping the browser on sessions fixes the immediate reliability problem without introducing new browser token storage risks or rewriting route protection.
- **Alternative considered**: Move web auth to bearer tokens. Rejected for this change because it would require a broader architectural shift in client storage, middleware strategy, and security posture.

### 2. Treat mobile token support as a compatibility constraint, not the driver
- **Decision**: Preserve the current `device_name` token issuance path on shared auth endpoints and avoid mobile-specific behavior changes unless they are necessary to make shared controller logic safe.
- **Rationale**: The user asked to avoid touching mobile code unless absolutely necessary. Shared backend endpoints still need to remain correct for token-based callers, especially around logout and optional token issuance.
- **Alternative considered**: Split browser and mobile into separate auth endpoints now. Rejected because it increases surface area without being required to stabilize the current web flow.

### 3. Standardize browser auth lifecycle across register, login, Google auth, and logout
- **Decision**: Define a single browser contract: session is created or refreshed on successful auth, the frontend can hydrate the current user through `/api/user`, and logout fully clears browser-auth state.
- **Rationale**: The current mismatch between endpoints is the main source of fragility. The web client should not need endpoint-specific workarounds to know whether the user is authenticated.
- **Alternative considered**: Patch each form or screen independently. Rejected because it would preserve inconsistent semantics and make future regressions more likely.

### 4. Keep route protection layered
- **Decision**: Retain lightweight edge protection where cookie presence is sufficient, but make client-side authenticated layout checks authoritative for rendering protected content.
- **Rationale**: Cookie presence alone is a coarse signal. The authenticated layout and auth context already perform user-based gating, which should remain the final guard against stale or invalid browser state.
- **Alternative considered**: Rely solely on middleware. Rejected because it cannot validate user hydration or protect against stale cookies by itself.

### 5. Add regression tests around shared auth controllers and browser flows
- **Decision**: Cover browser login, registration, logout, and user hydration behavior with automated tests, and add explicit protection against logout failures when `currentAccessToken()` is transient or absent.
- **Rationale**: Auth regressions are easy to reintroduce because behavior spans frontend and backend boundaries. The shared logout endpoint is an especially sharp edge.
- **Alternative considered**: Rely on manual testing. Rejected because auth is a critical path and already demonstrates fragile integration points.

## Risks / Trade-offs

- **[Risk]** Shared auth endpoints remain harder to reason about because they serve both session and token callers. → **Mitigation**: Document the browser contract clearly and constrain code changes to explicit branching points such as optional token issuance and token revocation.
- **[Risk]** Web auth fixes could accidentally regress mobile login or logout. → **Mitigation**: Treat `device_name` token issuance as a preserved path and add controller-level assertions for token callers where behavior differs.
- **[Risk]** Cookie-based middleware may still allow coarse false positives when a stale cookie exists. → **Mitigation**: Keep client-side authenticated layout and `/api/user` hydration as the final source of truth for rendering protected content.
- **[Risk]** Google login remains a hybrid path with extra branching for account linking and registration completion. → **Mitigation**: Apply the same browser session contract to successful Google auth and preserve the existing not-found handoff into registration completion.

## Migration Plan

1. Update shared auth controller behavior so successful browser registration, login, Google auth completion, and logout follow the same session lifecycle.
2. Adjust frontend auth plumbing only where necessary to align with the standardized browser contract.
3. Add or update backend and frontend tests that cover successful browser auth flows and common regressions.
4. Validate that mobile token issuance and token-based logout continue to work without requiring app-side changes.

Rollback is low-risk because the change is behavioral rather than schema-driven. If needed, the frontend and controller changes can be reverted together without a database rollback.

## Open Questions

- Should browser registration immediately establish an authenticated session before email verification, or should the user be redirected into a verify-first state while still authenticated but restricted?
- How much route protection should remain in Next middleware versus relying on the authenticated layout once stale-cookie behavior is tightened?