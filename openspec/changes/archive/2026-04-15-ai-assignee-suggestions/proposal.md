## Why

The current AI suggestion silently auto-fills the assignee dropdown with a single `assignee_id`, removing the user's agency in the decision. Users cannot see *why* a particular person was recommended, nor can they consider alternatives. This erodes trust in the AI and discourages users from overriding the suggestion even when they know better.

## What Changes

- Replace the single `assignee_id` field in the AI suggestion response with an `assignee_suggestions` array, where each entry contains an `assignee_id` and a human-readable `reason` string explaining why that person is a good fit.
- Update the backend prompt to instruct the AI to return up to 3 ranked assignee suggestions with justifications.
- Update the frontend `AISuggestion` TypeScript interface to reflect the new response shape.
- Add inline suggestion cards below the assignee dropdown in `CreateIssueForm.tsx`, each showing the member name, reason, and a one-click "Assign" action.
- Retain the standard `<select>` dropdown so users can still choose any team member — AI suggestions are advisory, not prescriptive.

## Capabilities

### New Capabilities

- `ai-assignee-suggestions`: Covers the new assignee suggestion data shape (array with reasons), backend prompt changes, frontend inline suggestion cards, and the interaction model where users pick from suggestions or ignore them.

### Modified Capabilities

- `ai-issue-copilot`: The "Smart Assignee Recommendation" requirement changes from returning a single `assignee_id` to returning multiple ranked suggestions with reasons.

## Impact

- **Backend**: `AIIssueSuggestionService.php` — prompt, JSON schema, and `sanitize()` method
- **Backend**: `AIIssueController.php` — response shape (no logic change needed)
- **Frontend**: `frontend/src/lib/api/issues.ts` — `AISuggestion` interface
- **Frontend**: `frontend/src/components/issues/CreateIssueForm.tsx` — new state for suggestions, inline card UI
- **API contract**: `POST /api/projects/{project}/ai/suggest-issue` response changes (`assignee_id` → `assignee_suggestions`)
