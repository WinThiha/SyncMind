# Design

## Backend Contract
Android will call:

- `POST projects/{projectId}/milestones/{milestoneId}/ai/summarize`
- `POST projects/{projectId}/milestones/{milestoneId}/ai/risk-analysis`

Both accept `{ "force": false }` and return `{ "data": ..., "cached": boolean }`.

## UI
Add an `AI insights` section to `EditMilestoneScreen` with explicit buttons for summary and risk analysis. Results are read-only:

- Summary text.
- Risk verdict, signals, and recommendation.
- Loading and error states.
