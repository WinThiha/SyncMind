## Context

The current issue creation process is completely manual, requiring users to fill out fields like Description, Type, Priority, Estimate, and Assignee manually. We want to augment this process with an AI Copilot. To avoid vendor lock-in and keep API costs low (or free during dev/testing), the integration will use the `openai-php/laravel` package configured to connect to an OpenRouter-compatible endpoint. The backend will use OpenAI's Structured Outputs (JSON Schema) approach to ensure the AI only returns values that exist in the project's database (e.g., valid Assignee IDs, valid Issue Types).

## Goals / Non-Goals

**Goals:**
- Provide a seamless frontend UX in `CreateIssueForm.tsx` where users can click an "Auto-fill with AI" button.
- Ensure the AI only recommends valid `assignee_id`s and `issue_type`s based on the project's current state.
- Improve AI assignee recommendation accuracy by adding a `position` field to the `users` table.
- Support arbitrary OpenAI-compatible APIs via `.env` configuration (`AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`).

**Non-Goals:**
- Creating a conversational chatbot interface for issue creation.
- Completely removing the ability to manually create or edit issues.
- Modifying the core Issue data model or existing issue lifecycle logic.

## Decisions

1. **Database Schema Update (`users` table):**
   - *Decision:* Add a `position` (string) column to the `users` table.
   - *Rationale:* The AI needs context to suggest the correct assignee. A simple string field like "Senior Frontend Developer" or "Project Manager" is sufficient for the LLM to make intelligent routing decisions without building a complex "skills" relational architecture.

2. **Backend AI Integration (`openai-php/laravel`):**
   - *Decision:* Use the official `openai-php/laravel` package but configure `base_uri` to use an environment variable.
   - *Rationale:* This provides a robust, well-tested client for structured JSON generation while allowing the user to seamlessly swap to OpenRouter, Groq, or local LLMs (like LM Studio) by changing `.env` variables.

3. **Strict Structured Output (JSON Schema):**
   - *Decision:* The backend API `POST /api/projects/{project}/ai/suggest-issue` will enforce a strict JSON schema in its prompt/API call.
   - *Rationale:* This prevents hallucinated assignees or issue types. The payload sent to the LLM will explicitly list available `assignee_id`s (with their names and positions) and available `issue_type`s.

4. **Frontend UX (Shimmer State & Safe Fill):**
   - *Decision:* When the AI button is clicked, the form fields will enter a disabled "shimmer" loading state. The returned data will populate empty fields but will not overwrite fields the user has actively typed in.
   - *Rationale:* Protects user data and prevents frustration caused by race conditions (e.g., user typing while waiting 2-5 seconds for the AI response).

## Risks / Trade-offs

- **Risk: LLM Latency.** AI generation can take 2-5 seconds.
  - *Mitigation:* Clear visual feedback (shimmer effect) and disabling fields during generation to prevent race conditions.
- **Risk: Hallucinated Data / Schema Breaking.** The AI might return invalid JSON or ignore constraints.
  - *Mitigation:* Use JSON mode (`response_format: { type: "json_object" }`) or Structured Outputs if the model supports it. Validate the response against actual project arrays before returning to the frontend; fallback to `null` for fields if the AI guesses an invalid ID.
- **Risk: OpenRouter / Free Model Quality.** Smaller free models might struggle with strict reasoning.
  - *Mitigation:* Keep the prompt simple and explicit. Provide clear examples in the system prompt. Allow users to upgrade to premium models easily via `.env`.
