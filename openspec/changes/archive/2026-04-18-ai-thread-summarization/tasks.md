## 1. Backend Service Layer

- [x] 1.1 Create `App\Services\AIThreadSummarizationService`
- [x] 1.2 Implement `aggregateTimeline(Issue $issue)` to merge and sort comments and history
- [x] 1.3 Implement `summarize(Issue $issue)` with AI prompt logic and structured JSON parsing

## 2. API Layer

- [x] 2.1 Add `summarize` method to `App\Http\Controllers\AIIssueController`
- [x] 2.2 Register the `POST /api/projects/{project}/issues/{issue_key}/ai/summarize` route in `routes/api.php`

## 3. Caching & Invalidation

- [x] 3.1 Implement Redis caching for summaries in the controller/service
- [x] 3.2 Create `App\Observers\CommentObserver` to invalidate cache on new comments
- [x] 3.3 Create `App\Observers\IssueObserver` to invalidate cache on field updates (history changes)
- [x] 3.4 Register observers in `App\Providers\EventServiceProvider` (Actually AppServiceProvider)

## 4. Frontend API & Components

- [x] 4.1 Add `summarizeIssue(projectId, key)` to `frontend/src/lib/api/issues.ts`
- [x] 4.2 Create `frontend/src/components/issues/SummaryCard.tsx` for displaying results
- [x] 4.3 Add loading states and error handling for the summary fetch process

## 5. UI Integration & Polish

- [x] 5.1 Integrate "Summarize Thread" button into `frontend/src/components/issues/Comments.tsx`
- [x] 5.2 Add transition animations using Framer Motion for the summary card
- [x] 5.3 Ensure Markdown rendering for the AI-generated summary content
- [x] 5.4 Migrate summarization trigger and card to `frontend/src/components/issues/IssueDetailView.tsx`
- [x] 5.5 Match "Glass UI" aesthetic for the summary button in `IssueDetailView.tsx`
- [x] 5.6 Remove redundant summarization logic from `Comments.tsx` and deep-link page

## 6. Testing & Validation

- [x] 6.1 Create a feature test for the summarization API endpoint
- [x] 6.2 Verify cache invalidation triggers on both comments and history updates
- [x] 6.3 Manually verify the UI flow and AI summary quality
