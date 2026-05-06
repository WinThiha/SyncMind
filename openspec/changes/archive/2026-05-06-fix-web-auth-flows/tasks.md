## 1. Backend auth contract hardening

- [x] 1.1 Audit shared auth controller behavior for browser versus token callers and document the concrete gaps against the `web-auth-flows` spec.
- [x] 1.2 Update browser registration behavior so successful web registration establishes the expected session contract and returns the authenticated user payload required by the frontend.
- [x] 1.3 Normalize browser login and Google login success behavior so both flows establish the same session lifecycle and compatible response shape.
- [x] 1.4 Fix shared logout handling so session-authenticated requests succeed without transient-token errors while token-authenticated requests revoke only the active personal access token.

## 2. Frontend web auth alignment

- [x] 2.1 Update the Next.js auth context and shared auth plumbing to rely on the standardized browser session contract for user hydration and logout cleanup.
- [x] 2.2 Adjust login, registration, and Google-auth completion flows so successful browser authentication follows the same redirect and state-refresh path without endpoint-specific workarounds.
- [x] 2.3 Tighten protected-route handling so stale or missing browser auth state redirects to login before protected content is rendered.

## 3. Regression coverage

- [x] 3.1 Add or update backend tests for browser registration, browser login, Google login success and handoff behavior, and shared logout safety for both session and token callers.
- [x] 3.2 Add or update frontend tests for authenticated user hydration and protected-route behavior when browser auth state is valid, missing, or stale.

## 4. Verification

- [x] 4.1 Run the relevant backend auth test suite and confirm all new browser auth scenarios pass.
- [x] 4.2 Run the relevant frontend test suite and verify the protected web auth flow behaves correctly after login, registration, logout, and failed hydration.
- [x] 4.3 Perform an end-to-end manual browser check for register, login, logout, and Google handoff behavior while confirming no mobile-specific client changes are required.
