## Context

AI search currently returns a reduced issue shape (`id`, `project_id`, `key_number`, `summary`, `status`, `priority`, `similarity`). Frontend issue list logic casts that partial payload to a full issue type and later reads `issue.key` when opening details. Because `key` is absent, the detail request can become `/issues/undefined`.

The system already has a canonical issue key format (`<PROJECT_KEY>-<KEY_NUMBER>`) used by issue detail routes and API fetch/update endpoints. The design should align AI search payloads and UI flows to this canonical key.

## Goals / Non-Goals

**Goals:**
- Ensure every AI search result includes or can deterministically resolve a canonical issue key used for detail fetch/navigation.
- Remove unsafe frontend type coercion that assumes full issue fields from similar-issue responses.
- Keep current AI search UX (results, similarity score, duplicate suggestions) unchanged apart from correctness.
- Add regression tests that fail if key resolution regresses.

**Non-Goals:**
- Redesigning similarity scoring, ranking, or thresholds.
- Changing issue key format semantics globally.
- Reworking non-AI issue list and standard issue CRUD flows.

## Decisions

1. Return canonical `key` in similar-issue API responses.
- Decision: Extend backend similar-issues response to include a canonical full issue key string suitable for `/issues/{key}` routes.
- Rationale: Backend already owns key format derivation and project-key access; returning the canonical key avoids frontend reconstruction drift.
- Alternative considered: Frontend concatenates `projectKey` and `key_number`. Rejected because project key can be unavailable in some contexts and introduces duplicated key-format logic.

2. Treat similar-issue responses as a distinct frontend type.
- Decision: Keep `SimilarIssue` separate from full `Issue` and map explicitly when a detail view model is needed.
- Rationale: Prevents `as unknown as Issue` casts that hide missing fields.
- Alternative considered: Expand `Issue` with many optional fields. Rejected because it weakens type guarantees and encourages null/undefined runtime faults.

3. Use canonical key for all AI-search-driven navigation and detail fetches.
- Decision: In issue list and duplicate suggestion cards, use the canonical key from API response (with guarded fallback only if legacy payload lacks it).
- Rationale: One source of truth minimizes broken links and undefined fetch paths.
- Alternative considered: Keep mixed usage (`full_key || key || projectKey-key_number`). Rejected because inconsistent precedence reintroduces edge cases.

## Risks / Trade-offs

- [Risk] Backward compatibility if clients expect old response shape only. -> Mitigation: Additive response change; keep existing fields (`key_number`, etc.) while adding canonical `key`.
- [Risk] Some cached/stale frontend bundles may still perform unsafe casts. -> Mitigation: Add defensive guards for missing keys and explicit error handling in click paths.
- [Risk] Test gaps between backend payload contract and frontend consumption. -> Mitigation: Add backend feature assertion for `key` field and frontend regression tests covering AI result click-through.

## Migration Plan

1. Ship backend additive response field (`key`) in similar-issue payload.
2. Ship frontend updates to consume `key` directly and remove unsafe cast paths.
3. Run targeted backend and frontend tests for AI search result selection.
4. Rollback plan: frontend can temporarily reconstruct from `key_number` only if backend field is absent, minimizing downtime during rollback.

## Open Questions

- Should API standardize on `key` or `full_key` naming across all endpoints? (Current design uses `key` for route-ready value to match existing `getIssue` caller expectations.)
- Should the issue list detail drawer skip open action when key is missing and show a toast, or silently no-op?
