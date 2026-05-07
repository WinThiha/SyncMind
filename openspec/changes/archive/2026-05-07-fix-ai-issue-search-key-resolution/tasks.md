## 1. Backend API Contract

- [x] 1.1 Update similar-issues backend response to include canonical route-ready issue key for each result while preserving existing fields.
- [x] 1.2 Add/adjust backend tests validating similar-issues payload includes non-empty canonical key values.

## 2. Frontend Key Resolution and Navigation

- [x] 2.1 Refactor AI search result typing/mapping in issue list to avoid unsafe casting and require canonical key before detail fetch.
- [x] 2.2 Update AI-search-driven detail open flow to call issue detail APIs with canonical key and guard against missing keys.
- [x] 2.3 Update duplicate suggestion links to use canonical key contract (with backward-compatible fallback only if needed).

## 3. Regression Coverage and Verification

- [x] 3.1 Add frontend regression test(s) covering AI search result click-through to ensure `/issues/undefined` is never requested.
- [x] 3.2 Run targeted backend and frontend test commands for modified behavior and document outcomes in change notes.
