## 1. Backend API Contract

- [x] 1.1 Update `AIIssueController::suggest()` validation to accept `prompt`, `output_locale`, and `current_fields`, with `summary` accepted only as a compatibility fallback if needed.
- [x] 1.2 Update frontend issue API types/client for prompt-based AI issue draft requests and expanded response fields.
- [x] 1.3 Ensure authorization remains project membership based and unchanged from the existing AI issue suggestion endpoint.

## 2. Backend Generation Context

- [x] 2.1 Update `AIIssueSuggestionService` to generate `summary`, `description`, `issue_type`, `priority`, `estimated_hours`, `due_date`, `milestone_id`, `assignee_suggestions`, and `open_questions`.
- [x] 2.2 Add output locale handling for supported locale codes plus `auto`, defaulting invalid or ambiguous values to the user's current app locale.
- [x] 2.3 Add multilingual prompt instructions for English, Burmese, Khmer, Vietnamese, Korean, Japanese, and mixed-language chat history.
- [x] 2.4 Include active milestone context and sanitize returned `milestone_id` and `due_date` values against project data.
- [x] 2.5 Include concise similar issue context when available without blocking generation when similarity lookup fails.
- [x] 2.6 Add reusable project-scoped wiki context retrieval for top relevant wiki page excerpts and include it in issue generation when available.
- [x] 2.7 Build assignee recommendation context with project-scoped position, current workload counts, open estimated hours when available, recent completed issues, common issue types, and similar issue ownership.
- [x] 2.8 Include relevant wiki authorship/editorship as weak assignee recommendation evidence when wiki context is retrieved.
- [x] 2.9 Update the AI prompt to balance assignee relevance against workload and require assignee reasons to cite provided evidence without claiming unstored skills or private traits.
- [x] 2.10 Preserve machine-constrained values during sanitization: project issue types, priority enums, IDs, member names, product names, commands, logs, URLs, and exact quoted UI text.

## 3. Frontend AI Draft UX

- [x] 3.1 Add a "Generate with AI" entry point to the create issue form that opens a desktop right drawer and mobile full-screen sheet/modal.
- [x] 3.2 Build the AI draft prompt surface with source prompt textarea, output language selector, context hint, loading state, error state, cancel action, and generate action.
- [x] 3.3 Default the output language selector to the active app locale and include `Auto` plus every supported app locale.
- [x] 3.4 Apply generated fields directly into existing create issue form inputs while preserving touched-field protection.
- [x] 3.5 Keep assignee output as selectable suggestions and support generated due date and milestone values in the existing schedule controls.
- [x] 3.6 Show a non-intrusive "AI draft applied" status with a way to reopen and view the source prompt used for generation.

## 4. Localization

- [x] 4.1 Add all AI draft drawer/sheet translation keys to English catalogs.
- [x] 4.2 Add matching translations for Burmese, Khmer, Vietnamese, Korean, and Japanese catalogs.
- [x] 4.3 Verify no new user-facing issue draft text relies on English fallback unless intentionally documented.

## 5. Tests and Verification

- [x] 5.1 Add backend tests for prompt-based validation, summary generation, touched/current field handling contract, output locale behavior, and JSON fallback.
- [x] 5.2 Add backend tests for sanitizing milestone, due date, assignee, issue type, priority, and open question output.
- [x] 5.3 Add backend tests for assignee recommendation context including workload, assignment history, similar issue ownership, project-scoped position, and weak wiki contribution evidence.
- [x] 5.4 Add backend tests or fakes proving wiki/similar issue context failures do not block generation.
- [x] 5.5 Add frontend tests for opening the AI draft surface, selecting output language, submitting a prompt, applying generated fields, preserving touched fields, and viewing the source prompt after generation.
- [x] 5.6 Run backend filtered tests with Docker after clearing config cache.
- [ ] 5.7 Run frontend tests in the Docker frontend container.
