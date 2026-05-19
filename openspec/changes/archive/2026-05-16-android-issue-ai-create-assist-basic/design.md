# Design

## Backend Contract
Android will call:

- `POST projects/{projectId}/ai/suggest-issue` with `{ "summary": "..." }`.
- `GET projects/{projectId}/ai/similar-issues?text=...`.

The suggestion response can include description, issue type, priority, estimated hours, and assignee suggestions. Android will apply the supported create form fields and display assignee suggestions as advisory text only.

## UI
The create issue screen will add an AI assist action beside the summary workflow:

- Require a non-blank summary before calling AI.
- Show loading and error states.
- Apply supported suggestion fields into the existing form controls.
- Show similar issue summaries with key/status/priority/similarity so the user can avoid duplicates.

The create form still submits through the existing create issue endpoint.
