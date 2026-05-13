## Context

The AI infrastructure already exists and is production-ready:
- `app('ai.client')` resolves an `OpenAI\Client` singleton configured for OpenRouter.
- `AIIssueSuggestionService`, `AIThreadSummarizationService`, and `AIIssueSearchService` demonstrate the established pattern: constructor-injected service, prompt built from model data, streamed or cached response returned as `['data' => [...]]`.
- Issue embeddings are stored in a `vector` column via pgvector — `AIIssueSearchService::findSimilar()` already does cosine similarity queries and can be reused for the issue-grouping feature.
- `MilestoneController` already handles full CRUD. The `Milestone` model exposes `progress` (total/completed/percentage) and `is_overdue` computed attributes.
- Milestone detail page (`frontend/src/app/projects/[id]/milestones/[milestoneId]/page.tsx`) is a client component with `milestone` state that loads issues eagerly (`load(['issues.assignee', 'issues.creator'])`).

No new database migrations are needed. All four AI features are stateless prompt → response flows, optionally cached in Laravel's cache layer (same pattern as `AIIssueController::summarize()`).

## Goals / Non-Goals

**Goals:**
- Natural-language milestone summary surfaced in one click on the detail page.
- Risk analysis returning a structured verdict (`on_track | at_risk | critical`) plus bullet-point reasoning.
- Date suggestions: start and due date recommendations with a short rationale.
- Issue grouping: ranked list of unlinked project issues relevant to this milestone.
- All four features follow the existing AI controller/service pattern — no new abstractions.

**Non-Goals:**
- Streaming responses (all four use standard JSON; streaming is not yet established in the codebase).
- Persistent AI-generated fields on the Milestone model (summaries are on-demand / cached, not stored).
- Bulk AI operations across all milestones at once.
- AI auto-applying suggestions (user must explicitly accept date or issue changes).

## Data Model

No new tables. Existing data used per feature:

| Feature | Data consumed |
|---|---|
| Summary | `milestone.{name,description,status,start_date,due_date,progress}` + linked issues `{summary, status, priority, due_date}` |
| Risk Analysis | Same as above + `is_overdue`, high-priority open count, overdue issue list |
| Date Suggestion | Project issues `{summary, priority, status, due_date, estimate}` (existing + unlinked); milestone name/description |
| Issue Grouping | Unlinked project issues with embeddings; milestone name + description used as query vector via `AIIssueSearchService` |

## API Contract

All endpoints are under `auth:sanctum`, scoped to project membership.

### POST `/api/projects/{project}/milestones/{milestone}/ai/summarize`
Request: `{}` (optional `force: true` to bust cache)
Response:
```json
{
  "data": {
    "summary": "string",
    "generated_at": "ISO8601"
  },
  "cached": false
}
```

### POST `/api/projects/{project}/milestones/{milestone}/ai/risk-analysis`
Request: `{}` (optional `force: true`)
Response:
```json
{
  "data": {
    "verdict": "on_track | at_risk | critical",
    "signals": ["string", "..."],
    "recommendation": "string",
    "generated_at": "ISO8601"
  },
  "cached": false
}
```

### POST `/api/projects/{project}/milestones/{milestone}/ai/suggest-dates`
Request: `{ "context": "optional free-text hint from user" }`
Response:
```json
{
  "data": {
    "start_date": "YYYY-MM-DD | null",
    "due_date": "YYYY-MM-DD | null",
    "rationale": "string"
  }
}
```

### POST `/api/projects/{project}/milestones/{milestone}/ai/suggest-issues`
Request: `{}` (optional `limit: 10`)
Response:
```json
{
  "data": [
    {
      "issue_id": 1,
      "key": "PROJ-12",
      "summary": "string",
      "score": 0.87,
      "reason": "string"
    }
  ]
}
```

## Flow Diagrams

### Milestone Summary & Risk Analysis (shared flow)

```
User clicks "Summarize" or "Analyse Risk"
         │
         ▼
POST .../ai/summarize (or ai/risk-analysis)
         │
         ▼
AIMilestoneController checks project membership (403)
         │
         ▼
Cache hit? (key: milestone_{id}_{feature})
    YES ──→ return cached JSON + "cached: true"
    NO
         │
         ▼
AIMilestoneService builds prompt from Milestone + issues
         │
         ▼
OpenAI chat completion (JSON mode)
         │
         ▼
Parse response → validate shape → store in cache (TTL 30 min)
         │
         ▼
Return 200 JSON
```

### Date Suggestion

```
User clicks "Suggest Dates" in Create/Edit form
         │
         ▼
POST .../ai/suggest-dates  (optional context string)
         │
         ▼
AIMilestoneService loads all project issues (not just linked)
Builds prompt: milestone intent + issue list + today's date
         │
         ▼
OpenAI chat completion → parse {start_date, due_date, rationale}
         │
         ▼
Return to frontend — user accepts (populates date fields) or ignores
```

### Issue Grouping

```
User clicks "Suggest Issues" on milestone detail
         │
         ▼
POST .../ai/suggest-issues
         │
         ▼
AIMilestoneController calls AIIssueSearchService::findSimilar()
using milestone name + description as query text
         │
         ▼
Filter out issues already linked to this milestone
Rank by cosine similarity score
Return top N with {issue_id, key, summary, score, reason}
         │
         ▼
Frontend shows ranked list; user can click "Add to Milestone"
which calls existing PUT /api/projects/{project}/issues/{key}
with { milestone_id: <id> }
```

## Decisions

### 1. New `AIMilestoneService` instead of adding to `AIIssueSuggestionService`
- **Rationale**: Milestone intelligence is semantically distinct from issue-level AI. Keeping it separate follows the existing naming convention and avoids bloating the suggestion service.
- **Approach**: `app/Services/AIMilestoneService.php` — four public methods, one per feature, all using `app('ai.client')`.

### 2. Cache TTL of 30 minutes for summary and risk analysis
- **Rationale**: These are read-heavy, non-real-time features. Milestone state changes slowly. 30 min balances freshness with cost. `force: true` param allows manual bust.
- **Approach**: `Cache::put("milestone_{id}_summary", ...)` / `Cache::put("milestone_{id}_risk", ...)` — same pattern as issue summarization.

### 3. Issue grouping reuses `AIIssueSearchService` (pgvector)
- **Rationale**: Avoids a second LLM call for relevance scoring. Cosine similarity over existing embeddings is fast, cheap, and already battle-tested for semantic search.
- **Approach**: Call `AIIssueSearchService::findSimilar($project, "$milestone->name. $milestone->description")`, then filter out already-linked issues, add a short AI-generated `reason` label via a single lightweight LLM call on the top N results.

### 4. Date suggestions are never auto-applied
- **Rationale**: Dates have real scheduling implications. Auto-applying them would violate user trust and cause accidental overwrites.
- **Approach**: Frontend receives `{start_date, due_date}` from the API and pre-fills the date picker fields; the user must hit Save to persist.

### 5. Frontend AI panel as a collapsible section, not a modal
- **Rationale**: Modals interrupt flow. An inline collapsible panel on the detail page lets users keep context (see issues below the panel) while reviewing AI output.
- **Approach**: `MilestoneAIPanel` component renders below the summary card. Starts collapsed. Each sub-section (Summary, Risk, Issue Suggestions) loads independently.

## Risks / Trade-offs

- **[Risk] LLM latency** → **Mitigation**: Cache summary and risk analysis aggressively (30 min). Suggestion calls are not cached but are triggered explicitly by the user, so latency is expected.
- **[Risk] Issue grouping quality depends on embedding coverage** → **Mitigation**: Issues without embeddings (not yet processed by `GenerateIssueEmbeddingJob`) are excluded from the similarity query. A note is shown if fewer than expected issues appear.
- **[Risk] Date suggestions ignore calendar/team capacity** → **Mitigation**: The rationale field explains the basis for the suggestion. The UI clearly labels these as AI suggestions, not commitments.
- **[Risk] Cost creep from risk analysis being called frequently** → **Mitigation**: 30-min cache + the `force` flag only accessible via explicit user action. No auto-polling.
