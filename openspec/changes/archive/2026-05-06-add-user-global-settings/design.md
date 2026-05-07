## Context

The authenticated sidebar links to `/settings`, but no corresponding route exists, resulting in a 404. Current project settings functionality is implemented at the project level (`/projects/[id]`) and includes member and ownership administration; this must stay project-scoped. Existing account context provides authenticated user identity and logout, and theme context already exists for UI preferences.

## Goals / Non-Goals

**Goals:**
- Introduce a user-global settings destination reachable from sidebar navigation.
- Provide MVP settings domains: Account, Security, Preferences, Notifications.
- Keep project administration out of `/settings` and preserve existing project settings flows.
- Define a persistence model for user-level preferences and profile/security updates.
- Ensure settings are only accessible to authenticated users and provide clear success/error states.

**Non-Goals:**
- Moving or redesigning project settings and member management.
- Delivering full notification delivery infrastructure in this change.
- Implementing organization/workspace-wide administration controls.

## Decisions

1. Route and IA decision: create a single `/settings` page with in-page section navigation (tabs/left nav) for Account, Security, Preferences, and Notifications.
Rationale: avoids route sprawl for MVP, simplifies guarded access, and matches current app complexity.
Alternative considered: nested routes (`/settings/account`, etc.). Rejected for MVP to reduce implementation overhead.

2. Scope boundary decision: `/settings` remains user-global only; all project-level configuration remains under `/projects/[id]`.
Rationale: prevents duplicate controls and role confusion, aligns with current permission model.
Alternative considered: mixed page containing both user and project settings. Rejected due to unclear ownership and increased authorization complexity.

3. Data model decision: add dedicated user settings persistence (profile editable fields + preferences + notification toggles), separate from transient UI state.
Rationale: enables consistent settings across sessions/devices and clear API contract.
Alternative considered: localStorage-only preferences. Rejected because it cannot support cross-device consistency and server-driven defaults.

4. Security behavior decision: show security controls conditionally by authentication method (e.g., password change unavailable for pure social-login users).
Rationale: prevents invalid user actions and aligns UI with account capability.
Alternative considered: always show all controls and fail on submit. Rejected due to poor UX.

5. Account identity consistency decision: a successful profile name update in Settings must propagate to authenticated global UI chrome immediately (including top bar) within the same session.
Rationale: identity mismatch between Settings and top bar causes user confusion and makes save feedback feel unreliable.
Alternative considered: defer identity refresh to next navigation/reload. Rejected because it preserves visible stale state in a core UI surface.

6. Email edit availability decision: keep email field non-editable in this change and present clear explanatory copy that account email updates are temporarily unavailable.
Rationale: current scope does not include re-verification, provider-linking, and conflict handling required for safe email-change workflows.
Alternative considered: allow direct email edits via settings API now. Rejected due to incomplete security and account-linking lifecycle handling.

7. Password update API boundary decision: implement password change via a dedicated authenticated endpoint (`PUT /api/user/settings/password`) rather than overloading general settings update payloads.
Rationale: isolates sensitive credential logic, enables focused validation/rate limiting/auditing, and avoids coupling password rules to non-sensitive settings updates.
Alternative considered: include password payload under `PUT /api/user/settings`. Rejected due to mixed concerns and higher risk of accidental validation drift.

8. Password lifecycle decision: on successful password change, revoke other user sessions/tokens while preserving the current authenticated session.
Rationale: reduces account takeover persistence risk while avoiding disruptive immediate logout in the active settings flow.
Alternative considered: force full logout everywhere including current session. Rejected due to unnecessary UX friction for standard self-service password updates.

9. Password abuse-protection decision: apply dedicated endpoint-level rate limiting for password-change attempts.
Rationale: wrong-current-password retries are a brute-force vector; dedicated throttle allows tighter controls than generic API limits.
Alternative considered: rely on default API throttle only. Rejected because generic limits may be too permissive for credential operations.

10. Theme preference model decision: persist account-level preference as `light | dark | system`, and apply it during authenticated app bootstrap across browser contexts.
Rationale: ensures cross-device/session consistency, including fresh/private sessions where local storage is absent.
Alternative considered: only apply saved preference from settings page load/save events. Rejected because it leaves startup behavior inconsistent with account preference.

11. Top bar toggle persistence decision: keep a local device override (persisted across reloads) that can temporarily supersede saved account preference until explicit settings save.
Rationale: preserves user intent for immediate UI control and reload durability without silently mutating account-wide preference.
Alternative considered: make top bar toggle write server preference immediately. Rejected due to implicit cross-device side effects and missing explicit confirmation.

12. System-follow behavior decision: when saved preference is `system`, track `prefers-color-scheme` changes live and update effective theme at runtime.
Rationale: matches user expectation for system mode and keeps UI synchronized with OS changes.
Alternative considered: resolve system preference only at startup. Rejected because it drifts from OS state during long-lived sessions.

## Risks / Trade-offs

- [Risk] New backend endpoints or schema changes increase integration surface → Mitigation: keep payloads minimal and add focused request/response tests.
- [Risk] Users may expect project controls in settings → Mitigation: add explicit copy and links to manage project settings from project pages.
- [Risk] Notification settings may appear incomplete before delivery features exist → Mitigation: clearly label toggles as preference capture and gate unsupported channels.
- [Risk] Auth-method conditional UI can drift from backend truth → Mitigation: derive capability flags from authenticated user/account metadata returned by API.
- [Risk] Immediate top bar refresh may introduce duplicate user fetches after settings save → Mitigation: trigger a single post-save authenticated user refresh and cover with regression tests.
- [Risk] Session/token revocation may unintentionally invalidate device experiences users expect to keep → Mitigation: message this behavior in Security UI and preserve current session by design.
- [Risk] Tight rate limits can lock out legitimate users after typos → Mitigation: choose conservative thresholds and return clear retry guidance on throttling.
- [Risk] Preference/override precedence can become hard to reason about → Mitigation: document and test deterministic precedence (`local override` > `saved preference`, with `system` resolved from OS).
