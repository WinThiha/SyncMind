## Phase 1 — Backend: AIMilestoneService

- [x] 1.1 Create `app/Services/AIMilestoneService.php` with four public methods:
  - `summarize(Milestone $milestone, ?User $actor = null): array` — builds a prompt from milestone name, description, status, dates, progress stats, and top 20 linked issues (summary, status, priority, due_date); calls OpenAI in JSON mode; returns `{summary, generated_at}`
  - `analyzeRisk(Milestone $milestone, ?User $actor = null): array` — builds a prompt with the same data plus overdue count and high-priority open issue count; returns `{verdict, signals, recommendation, generated_at}` where verdict is `on_track | at_risk | critical`
  - `suggestDates(Milestone $milestone, string $context = ''): array` — loads all unlinked project issues (summary, priority, status, estimate); builds a prompt with the milestone intent and today's date; returns `{start_date, due_date, rationale}`
  - `suggestIssues(Milestone $milestone, int $limit = 10): array` — delegates similarity query to `AIIssueSearchService::findSimilar()` using milestone name + description as the query; filters out issues already linked to this milestone; returns top `$limit` results with score and a one-line `reason` from a lightweight LLM call
- [x] 1.2 Bind `AIMilestoneService` in `AppServiceProvider::register()` — resolve constructor-injected `AIIssueSearchService` dependency

## Phase 2 — Backend: AIMilestoneController & Routes

- [x] 2.1 Create `app/Http/Controllers/AIMilestoneController.php` with four actions:
  - `summarize(Request $request, Project $project, Milestone $milestone): JsonResponse` — auth check via `$request->user()->cannot('view', $project)`; check cache key `milestone_{id}_summary`; call `AIMilestoneService::summarize()`; cache 30 min; return `{data, cached}`
  - `riskAnalysis(Request $request, Project $project, Milestone $milestone): JsonResponse` — same cache pattern with key `milestone_{id}_risk`; call `analyzeRisk()`
  - `suggestDates(Request $request, Project $project, Milestone $milestone): JsonResponse` — validate optional `context` string (max 500 chars); call `suggestDates()`; no cache
  - `suggestIssues(Request $request, Project $project, Milestone $milestone): JsonResponse` — validate optional `limit` (int 1–20, default 10); call `suggestIssues()`; no cache
- [x] 2.2 Register four routes in `backend/routes/api.php` inside the `auth:sanctum` group:
  ```
  Route::post('projects/{project}/milestones/{milestone}/ai/summarize', [AIMilestoneController::class, 'summarize']);
  Route::post('projects/{project}/milestones/{milestone}/ai/risk-analysis', [AIMilestoneController::class, 'riskAnalysis']);
  Route::post('projects/{project}/milestones/{milestone}/ai/suggest-dates', [AIMilestoneController::class, 'suggestDates']);
  Route::post('projects/{project}/milestones/{milestone}/ai/suggest-issues', [AIMilestoneController::class, 'suggestIssues']);
  ```
- [x] 2.3 Add `use App\Http\Controllers\AIMilestoneController;` import to `api.php`

## Phase 3 — Backend: Tests

- [x] 3.1 Create `tests/Feature/AIMilestoneTest.php` with cases:
  - `POST .../ai/summarize` — unauthenticated returns 401
  - `POST .../ai/summarize` — non-member returns 403
  - `POST .../ai/summarize` — project member gets 200 with `{data.summary, data.generated_at, cached}` shape
  - `POST .../ai/summarize` with `force: false` — second call returns cached response (`cached: true`)
  - `POST .../ai/risk-analysis` — returns `{verdict, signals[], recommendation, generated_at}` shape; `verdict` is one of `on_track|at_risk|critical`
  - `POST .../ai/suggest-dates` — returns `{start_date, due_date, rationale}` shape
  - `POST .../ai/suggest-issues` — returns array; each item has `{issue_id, key, summary, score, reason}`; no item is already linked to the milestone
  - `POST .../ai/suggest-issues?limit=3` — returns at most 3 items
- [x] 3.2 Run tests:
  ```
  docker compose exec backend php artisan config:clear
  docker compose exec backend sh -lc 'APP_ENV=testing DB_CONNECTION=pgsql DB_HOST=db DB_DATABASE=syncmind_test DB_USERNAME=syncmind DB_PASSWORD=secret php artisan test --filter AIMilestoneTest'
  ```
- [x] 3.3 Run linter: `docker compose exec backend ./vendor/bin/pint`

## Phase 4 — Frontend: API Client

- [x] 4.1 Create `frontend/src/lib/api/milestones-ai.ts` with:
  - `summarizeMilestone(projectId: string, milestoneId: string, force?: boolean): Promise<{data: {summary: string; generated_at: string}; cached: boolean}>`
  - `analyzeMilestoneRisk(projectId: string, milestoneId: string, force?: boolean): Promise<{data: {verdict: 'on_track' | 'at_risk' | 'critical'; signals: string[]; recommendation: string; generated_at: string}; cached: boolean}>`
  - `suggestMilestoneDates(projectId: string, milestoneId: string, context?: string): Promise<{data: {start_date: string | null; due_date: string | null; rationale: string}}>`
  - `suggestMilestoneIssues(projectId: string, milestoneId: string, limit?: number): Promise<{data: Array<{issue_id: number; key: string; summary: string; score: number; reason: string}>}>`
  - All functions use the singleton axios instance from `src/lib/axios.ts`

## Phase 5 — Frontend: MilestoneAIPanel Component

- [x] 5.1 Create `frontend/src/components/milestones/MilestoneAIPanel.tsx`:
  - Props: `projectId: string`, `milestoneId: string`
  - Renders a collapsible GlassCard panel titled "AI Insights" with a sparkle/brain icon
  - Contains three independently loadable sub-sections:
    - **Summary**: "Summarize" button → calls `summarizeMilestone()` → shows loading state → renders summary text with timestamp and a "Regenerate" button
    - **Risk Analysis**: "Analyse Risk" button → calls `analyzeMilestoneRisk()` → shows verdict badge (green/amber/red for on_track/at_risk/critical) + signal bullet list + recommendation text
    - **Issue Suggestions**: "Suggest Issues" button → calls `suggestMilestoneIssues()` → shows ranked list with issue key, summary, relevance score bar, reason text, and an "Add to Milestone" button per item
  - Each sub-section shows a spinner while loading and an error message on failure
  - "Add to Milestone" calls the existing `updateIssue(projectId, key, { milestone_id: milestoneId })` from `src/lib/api/issues.ts` (or equivalent) and removes the item from the suggestion list on success

- [x] 5.2 Add `<MilestoneAIPanel>` to `frontend/src/app/projects/[id]/milestones/[milestoneId]/page.tsx`:
  - Insert between the summary GlassCard and the Issues list
  - Pass `projectId` and `milestoneId` as props

## Phase 6 — Frontend: AI Date Suggestion in Forms

- [x] 6.1 Update `frontend/src/components/milestones/CreateMilestoneForm.tsx`:
  - Add a "Suggest dates" button beside the start/due date fields
  - On click: call `suggestMilestoneDates(projectId, milestoneId??'new', nameField.value)` — for creation, pass the milestone name as context since no ID exists yet; the backend route for creation doesn't have a milestone ID, so use a dedicated helper or pass the milestone name as context to the date endpoint on an existing temporary milestone OR implement the create-form suggestion as a project-level endpoint
  - **Implementation note**: For create form, since no milestone ID exists, the suggest-dates call should pass the name + description as context string to a project-level endpoint `POST /api/projects/{project}/ai/suggest-milestone-dates` (add this 5th route and a `suggestDatesForNew` method to `AIMilestoneController`)
  - On response: pre-fill start_date and due_date inputs; show rationale in a tooltip or small text below fields
  - Show loading spinner on the button while request is in-flight

- [x] 6.2 Update `frontend/src/components/milestones/EditMilestoneForm.tsx`:
  - Add the same "Suggest dates" button
  - On click: call `suggestMilestoneDates(projectId, milestone.id.toString())` (uses existing milestone ID)
  - Pre-fill date fields with suggestions; user must hit Save to persist

- [x] 6.3 Add `POST /api/projects/{project}/ai/suggest-milestone-dates` route and `suggestDatesForNew` method to `AIMilestoneController`:
  - Request: `{ name: string, description?: string, context?: string }`
  - Same response shape as `suggestDates`
  - No milestone model binding; loads all project issues for workload analysis

## Phase 7 — Frontend: i18n Strings

- [x] 7.1 Add translation keys to `frontend/src/lib/i18n/translations/en/milestones.ts`:
  ```ts
  ai: {
    panelTitle: 'AI Insights',
    summarize: 'Summarize',
    regenerate: 'Regenerate',
    analyzeRisk: 'Analyse Risk',
    suggestIssues: 'Suggest Issues',
    suggestDates: 'Suggest dates',
    addToMilestone: 'Add to Milestone',
    verdictOnTrack: 'On Track',
    verdictAtRisk: 'At Risk',
    verdictCritical: 'Critical',
    loading: 'Thinking…',
    cached: 'Cached result',
    noSuggestions: 'No relevant issues found outside this milestone.',
    errorGeneric: 'AI request failed. Please try again.',
  }
  ```
- [x] 7.2 Mirror all new keys to every other locale file that exists in `frontend/src/lib/i18n/translations/`

## Phase 8 — Verification

- [x] 8.1 Run frontend tests: `docker compose exec frontend npm run test`
- [x] 8.2 Run frontend linter: `docker compose exec frontend npm run lint`
- [x] 8.3 Manually test golden path in browser:
  - Open a milestone with several linked issues
  - Click "Summarize" → summary appears
  - Click "Analyse Risk" → verdict badge + signals appear
  - Click "Suggest Issues" → ranked list appears; click "Add to Milestone" on one → issue is added and disappears from list
  - Open EditMilestoneForm → click "Suggest dates" → date fields pre-fill with AI suggestion
  - Open CreateMilestoneForm → enter a name → click "Suggest dates" → date fields pre-fill
