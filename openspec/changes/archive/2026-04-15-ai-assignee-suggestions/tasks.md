## 1. Backend — Update AI Suggestion Service

- [x] 1.1 Update the system prompt in `AIIssueSuggestionService::suggest()` to request `assignee_suggestions` (array of up to 3 objects with `assignee_id` and `reason`) instead of a single `assignee_id`
- [x] 1.2 Update the JSON schema in the prompt to reflect the new `assignee_suggestions` shape
- [x] 1.3 Update `sanitize()` to validate each entry in `assignee_suggestions` — filter out entries with invalid `assignee_id` values, ensure `reason` is a non-empty string, cap at 3 entries
- [x] 1.4 Remove the old `assignee_id` key from the `sanitize()` return and `compact()` call

## 2. Backend — Update Tests

- [x] 2.1 Update existing feature tests for `POST /api/projects/{project}/ai/suggest-issue` to assert the new `assignee_suggestions` array structure instead of `assignee_id`
- [x] 2.2 Add test case: response contains empty `assignee_suggestions` when AI returns no suitable assignees
- [x] 2.3 Add test case: invalid `assignee_id` values in suggestions are filtered out by `sanitize()`
- [x] 2.4 Add test case: suggestions are capped at 3 entries even if AI returns more

## 3. Frontend — Update API Types and Client

- [x] 3.1 Update the `AISuggestion` interface in `frontend/src/lib/api/issues.ts`: replace `assignee_id: number | null` with `assignee_suggestions: Array<{ assignee_id: number; reason: string }>`

## 4. Frontend — Update CreateIssueForm

- [x] 4.1 Add `assigneeSuggestions` state to `CreateIssueForm.tsx` to store the AI assignee suggestions
- [x] 4.2 Update `handleAISuggest` to store `assignee_suggestions` in the new state and stop auto-setting `formData.assignee_id` from AI results
- [x] 4.3 Add inline suggestion cards below the assignee dropdown — each card shows member name, reason text, and an "Assign" action button
- [x] 4.4 Implement the assign action on each card: clicking it sets `formData.assignee_id` to the suggestion's `assignee_id`
- [x] 4.5 Clear `assigneeSuggestions` when the user types a new summary or manually changes the assignee dropdown
- [x] 4.6 Handle the case where `assignee_suggestions` is empty — no cards rendered

## 5. Verification

- [x] 5.1 Run backend test suite (`php artisan test`) and ensure all tests pass
- [x] 5.2 Run backend linter (`./vendor/bin/pint --test`) and fix any issues
- [x] 5.3 Run frontend build (`npm run build`) and ensure no type errors (pre-existing TS errors in unrelated files)
- [x] 5.4 Run frontend lint (`npm run lint`) and fix any issues (pre-existing lint errors in unrelated files)
- [x] 5.5 Manual smoke test: create an issue with AI suggestions and verify suggestion cards appear, are clickable, and the dropdown still allows any member selection
