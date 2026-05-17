## Why

AI issue generation currently depends on a short issue summary, which limits its usefulness when users start from a natural-language brief, copied chat history, support note, or meeting excerpt. Updating the feature to accept a richer source prompt lets SyncMind extract complete editable issue fields while still keeping the user in control before saving.

## What Changes

- Replace title-only AI issue suggestion input with a source prompt that can contain a brief description, bug report, copied chat history, support note, or meeting excerpt.
- Add an AI draft drawer on desktop and a full-screen sheet/modal on mobile so long prompts can be pasted and verified without permanently expanding the create issue form.
- Add an output language selector to the generation UI, defaulting to the current app locale and including an `Auto` option that generates in the dominant prompt language when clear.
- Generate and auto-fill the existing create issue form inputs, including summary, description, type, priority, estimate, assignee suggestions, due date, and milestone when available.
- Preserve the existing user-control behavior: AI fills untouched or empty fields and does not overwrite fields the user has already edited.
- Use project context when available, including project issue types, team members, active milestones, similar issues, and relevant wiki pages.
- Support multilingual and mixed-language source prompts while keeping machine values, member names, product names, commands, logs, URLs, IDs, and exact quoted text unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `ai-issue-copilot`: AI issue field suggestion becomes prompt-based, supports multilingual chat-history parsing, output language selection, project/wiki context retrieval, and direct autofill into existing editable issue fields.
- `frontend-localization-coverage`: New AI draft drawer/sheet labels, helper text, output language labels, status messages, and errors must be translated for every supported locale catalog.

## Impact

- Backend API: `POST /api/projects/{project}/ai/suggest-issue` request validation and service input contract change from `summary`-only to prompt-based generation with current form fields and output locale.
- Backend services: `AIIssueSuggestionService` prompt construction, sanitization, optional wiki-context retrieval, similar issue context, milestone context, and locale handling.
- Frontend: `CreateIssueForm`, issue API client types, AI generation drawer/sheet UI, output language selector, source prompt state, touched-field autofill handling, and AI draft source status.
- Localization: all supported locale catalogs require new user-facing strings.
- Tests: backend feature/unit coverage for prompt validation, locale behavior, sanitization, context inclusion, and frontend behavior/tests for drawer interaction and autofill rules.
