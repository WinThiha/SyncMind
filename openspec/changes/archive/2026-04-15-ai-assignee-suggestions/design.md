## Context

The issue creation form uses `AIIssueSuggestionService` to auto-fill fields from an issue summary. Currently the AI returns a single `assignee_id` which is silently applied to the assignee dropdown. The frontend (`CreateIssueForm.tsx`) respects the `touchedFields` guard — if the user hasn't manually changed the assignee field, the AI value overwrites it; if they have, it's skipped. Either way, the user gets no explanation for *why* that person was chosen.

The backend service constructs a prompt that includes team member names and positions, asks OpenAI for a single `assignee_id`, and validates it against the member list in `sanitize()`. The frontend `AISuggestion` TypeScript interface models this as `assignee_id: number | null`.

## Goals / Non-Goals

**Goals:**
- Replace single `assignee_id` with multiple ranked `assignee_suggestions`, each containing an `assignee_id` and a `reason` string
- Display suggestion cards below the assignee dropdown showing name, reason, and a one-click assign action
- Allow users to pick any team member via the existing dropdown regardless of AI suggestions
- Maintain backward compatibility by keeping the rest of the AI suggestion fields unchanged

**Non-Goals:**
- Changing how other fields (description, issue_type, priority, estimated_hours) are suggested
- Persisting suggestion history or reasons beyond the form session
- Adding real-time/streaming AI responses
- Modifying the AI model or temperature settings

## Decisions

### 1. Response shape: `assignee_suggestions` array instead of `assignee_id`

**Decision**: Replace `assignee_id` with `assignee_suggestions: [{ assignee_id: number, reason: string }]` (max 3 entries).

**Alternatives considered**:
- *Keep `assignee_id` and add a separate `assignee_reasons` map*: More complex to keep in sync; two fields referring to the same concept.
- *Return suggestions in a separate endpoint*: Adds latency (two API calls) and coordination complexity.

**Rationale**: A single array is self-contained and naturally ordered by relevance. The max of 3 keeps the UI clean and the prompt focused.

### 2. UI: Inline suggestion cards below the dropdown

**Decision**: Render clickable suggestion cards below the assignee `<select>`, each showing the member's name, the AI's reason, and a "+" button that sets the dropdown value.

**Alternatives considered**:
- *Smart dropdown with AI-pinned items*: Reason text is too long for dropdown items; poor readability.
- *Dedicated AI insights panel*: Over-engineered for this scope; adds layout complexity.

**Rationale**: Inline cards give the reason text room to breathe while keeping the standard `<select>` untouched for manual selection. Clicking a card simply updates the dropdown value — no new form state is needed.

### 3. Frontend state: separate `assigneeSuggestions` state

**Decision**: Add a new `assigneeSuggestions` state array. The existing `assignee_id` in `formData` is only set when the user explicitly clicks a suggestion card (or manually selects from the dropdown).

**Rationale**: This keeps the "suggestions" and "selection" concerns separate. The AI no longer directly writes to `formData.assignee_id`.

### 4. Backend prompt: request ranked suggestions with reasons

**Decision**: Update the system prompt to ask for `assignee_suggestions` (array of up to 3, each with `assignee_id` and `reason`) instead of a single `assignee_id`.

**Rationale**: The AI is already given team members with their positions. Asking it to justify its choices leverages the same context and produces a more useful output.

## Risks / Trade-offs

- **API breaking change** → `assignee_id` is replaced with `assignee_suggestions`. Any consumer expecting the old shape will break. Since this is an internal API consumed only by our frontend, we update both sides in the same change. No migration needed.
- **AI returns invalid IDs in suggestions** → The `sanitize()` method already validates IDs against the member list. We extend this to validate each suggestion's `assignee_id`. Invalid entries are filtered out.
- **AI returns fewer than expected suggestions** → The UI gracefully handles 0–3 suggestions. Zero suggestions means no cards appear (degraded but not broken).
- **Reason text quality** → The AI may produce overly generic reasons ("This person is suitable"). We prompt specifically for role-based justification to encourage specificity, but don't over-constrain the model.