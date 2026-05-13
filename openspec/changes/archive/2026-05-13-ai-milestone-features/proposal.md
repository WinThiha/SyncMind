## Why

Milestones today are passive containers: they group issues, show a progress bar, and flag overdue dates — but give no intelligence about what's actually happening inside them. A project admin looking at a milestone with 40% completion, 3 overdue issues, and a due date in 5 days has to manually piece together whether it's recoverable or needs rescheduling. There is no AI assistance for milestones anywhere in the codebase, despite AI already being wired into issues (suggestion, semantic search, thread summarization) and the infrastructure (OpenAI client singleton, pgvector, `AIIssueSuggestionService`, `AIThreadSummarizationService`) being ready to reuse.

## What Changes

- **Milestone Summary**: A "Summarize" button on the milestone detail page triggers an AI-generated natural-language summary of the milestone's progress, health, and key risks — mirroring the existing thread summarization UX on issues.
- **Smart Deadline Suggestion**: When creating or editing a milestone, an AI button analyzes the linked (or project) issues' workload, priorities, and existing dates to suggest a realistic start/end date range.
- **Progress & Risk Analysis**: On the milestone detail page, an AI panel surfaces risk signals (overdue count, high-priority open issues, velocity trend) and returns a short recommended action — "on track", "at risk", or "critical".
- **Auto Issue Grouping**: On the milestone detail page, an AI button queries the project's unlinked issues, scores their semantic relevance to the milestone name/description, and returns a ranked suggestion list the user can accept or dismiss.

## Capabilities

### New Capabilities
- `ai-milestone-intelligence`: Four AI endpoints served from a new `AIMilestoneController`, each scoped under `/api/projects/{project}/milestones/{milestone}/ai/`.

### Modified Capabilities
- `milestones`: Milestone detail page gains an "AI Insights" panel (summary + risk analysis + issue suggestions). CreateMilestoneForm and EditMilestoneForm gain a "Suggest dates" AI button.

## Impact

- **Backend**: New `AIMilestoneController` with four actions; new `AIMilestoneService` containing the prompt logic; four new routes registered under `auth:sanctum`; no new migrations needed.
- **Frontend**: New `MilestoneAIPanel` component added to the milestone detail page; AI date-suggestion widget added to `CreateMilestoneForm` and `EditMilestoneForm`; new `src/lib/api/milestones-ai.ts` API client.
- **Routes**: `POST .../milestones/{milestone}/ai/summarize`, `POST .../milestones/{milestone}/ai/risk-analysis`, `POST .../milestones/{milestone}/ai/suggest-dates`, `POST .../milestones/{milestone}/ai/suggest-issues`.
- **Database**: No new migrations. Issue embeddings (already stored) are reused for the issue-grouping feature.
