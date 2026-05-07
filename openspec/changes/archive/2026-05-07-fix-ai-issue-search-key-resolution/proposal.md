## Why

Clicking an issue from AI-powered natural-language search can trigger requests like `/api/projects/{id}/issues/undefined`, which breaks issue detail viewing and undermines trust in search results. This should be fixed now because AI search is a core discovery path in issue management.

## What Changes

- Define a stable identifier contract for semantic search results so each result can be resolved to a valid issue key when opening details.
- Update frontend AI search result mapping and click behavior to use the stable issue key contract instead of assuming `key` exists.
- Ensure duplicate suggestion links in issue creation always target a valid issue detail route.
- Add regression coverage for AI search result selection and navigation key resolution.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `semantic-issue-search`: Similar-issue API responses must include an issue identifier suitable for detail fetch/navigation.
- `natural-language-search`: AI search result rendering and selection must resolve to valid issue detail keys for navigation and detail loading.

## Impact

- Backend: AI similar-issues response payload and related API resource/transform logic.
- Frontend: issue list AI-search mapping, issue detail open flow, and duplicate-link generation.
- Tests: backend feature coverage for response shape and frontend/unit/integration checks for click-through behavior.
