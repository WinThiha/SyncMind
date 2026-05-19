# Design

## Backend Contract
Android will call:

`POST projects/{projectId}/issues/{issueKey}/ai/summarize`

with:

```json
{
  "force": false
}
```

The response contains:

```json
{
  "data": {
    "summary": "...",
    "decisions": [],
    "consensus": "...",
    "action_items": []
  },
  "cached": true
}
```

## Android Data Layer
Add `SummarizeIssueRequest`, `ThreadSummary`, and `ThreadSummaryResponse`. The repository returns `NetworkResult<ThreadSummary>` so the UI stays independent of cache metadata.

## UI
`IssueDetailScreen` will add an `AI thread summary` section before comments. The section includes:

- A button to generate or refresh the summary.
- Loading and error states.
- Summary text.
- Decision and action item lists when present.
- Consensus text when present.

The screen should not load AI summaries automatically; AI calls are explicit user actions.
