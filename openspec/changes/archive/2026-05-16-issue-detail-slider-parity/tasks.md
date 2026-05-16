## 1. Detail Page Data and State

- [x] 1.1 Load project members on the standalone issue detail page for assignee quick editing.
- [x] 1.2 Add local quick-edit state for status, priority, assignee, estimated hours, and actual hours initialized from the loaded issue.
- [x] 1.3 Add AI summary state, loading state, error state, and refresh handling using the existing `summarizeIssue` API client.

## 2. Detail Page UI Parity

- [x] 2.1 Add the AI "Summarize Thread" action and `SummaryCard` display to the standalone issue detail page activity area.
- [x] 2.2 Add quick-edit controls for status, priority, assignee, estimated hours, and actual hours to the standalone issue detail page.
- [x] 2.3 Allow quick field updates to be submitted with or without a new comment, matching the slider's current fields only.
- [x] 2.4 Keep summary, description, issue type, milestone, and due date editing routed through the existing edit page.

## 3. Mutation Refresh and Error Handling

- [x] 3.1 Persist quick field changes through the existing `updateIssue` API client with the same null/number conversions used by the slider.
- [x] 3.2 Persist optional comments through the existing comment creation behavior.
- [x] 3.3 Refresh issue data after quick updates or comments so properties, comments, and history update without manual navigation.
- [x] 3.4 Clear or refresh stale AI summary state after mutations that change thread context.

## 4. Localization and Verification

- [x] 4.1 Update all supported locale catalogs for any new user-facing labels, placeholders, or errors.
- [x] 4.2 Add or update frontend coverage for detail-page AI summary and quick field update behavior.
- [x] 4.3 Run the relevant frontend test command in Docker: `docker compose exec frontend npm run test`.
