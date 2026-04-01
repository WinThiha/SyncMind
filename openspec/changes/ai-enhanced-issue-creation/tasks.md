## 1. Database & Model Updates

- [x] 1.1 Create migration to add `position` (string, nullable) to `users` table
- [x] 1.2 Update `User` model to include `position` in `$fillable` array
- [x] 1.3 Update database seeders/factories to populate `position` for testing

## 2. Backend API Integration

- [x] 2.1 Install `openai-php/laravel` package via Composer
- [x] 2.2 Publish OpenAI configuration and set up `.env` mapping for OpenRouter (`AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`)
- [x] 2.3 Create `AIIssueSuggestionService` to handle prompt construction, project context gathering, and LLM API calls with structured JSON output
- [x] 2.4 Create `AIIssueController` with `suggest` method
- [x] 2.5 Add `POST /api/projects/{project}/ai/suggest-issue` route to `api.php`

## 3. Frontend Integration

- [x] 3.1 Create API client function `suggestIssueFields` in `frontend/src/lib/api/issues.ts` (or similar)
- [x] 3.2 Update `CreateIssueForm.tsx` to include "✨ Auto-fill with AI" button next to the Summary input
- [x] 3.3 Implement shimmer/loading state in `CreateIssueForm.tsx` while awaiting AI response
- [x] 3.4 Implement logic to safely patch form state with AI suggestions (avoiding overwriting user-modified fields)

## 4. Testing & Validation

- [x] 4.1 Write feature tests for `AIIssueController` to verify correct JSON structure handling and authentication
- [ ] 4.2 Manually verify end-to-end flow using OpenRouter (e.g., Llama 3 or GPT-4o-mini)
- [ ] 4.3 Verify that invalid `assignee_id`s or `issue_type`s are not returned/applied
