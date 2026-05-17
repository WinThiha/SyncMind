## Context

The create issue form currently sends only the issue summary to `POST /api/projects/{project}/ai/suggest-issue`. `AIIssueSuggestionService` uses project issue types, priorities, team members, and the user's resolved locale to generate description, type, priority, estimate, and assignee suggestions. The frontend then fills untouched form fields and leaves user-edited fields intact.

Projects now also have wiki pages with embeddings and an AI wiki chat flow that retrieves relevant wiki context. Issue generation can reuse the same contextual idea, but it should remain an issue drafting feature: the user prompt is the primary source, while wiki pages, similar issues, milestones, and team data are supporting context.

## Goals / Non-Goals

**Goals:**

- Accept a source prompt instead of requiring a title-only summary.
- Support short briefs, bug reports, chat histories, support notes, meeting excerpts, and mixed-language text.
- Provide a desktop drawer and mobile full-screen sheet/modal for prompt entry without permanently expanding the issue form.
- Let users choose an output language, defaulting to their current app locale, with an `Auto` option for dominant prompt-language output.
- Generate and autofill existing editable issue inputs while preserving touched-field protection.
- Use project context, active milestones, similar issues, and relevant wiki pages when available.
- Improve assignee suggestions with project-scoped position, current workload, assignment history, similar issue ownership, and weak wiki authorship/editorship signals.
- Keep all new user-facing UI strings covered by every supported locale catalog.

**Non-Goals:**

- Creating a conversational issue refinement chat.
- Automatically saving or creating issues without user review.
- Replacing the manual create issue form.
- Adding cross-project wiki retrieval.
- Adding first-class member skills or expertise tags.
- Adding new AI model providers or changing chat completion infrastructure.

## Decisions

### Prompt-based API contract

The existing suggestion endpoint should evolve from `summary`-only input to a prompt-based request:

```json
{
  "prompt": "Copied chat history or brief...",
  "output_locale": "my-MM",
  "current_fields": {
    "summary": "",
    "description": "",
    "issue_type": "Task",
    "priority": "normal",
    "estimated_hours": null,
    "assignee_id": null,
    "due_date": null,
    "milestone_id": null
  }
}
```

`output_locale` accepts supported locale codes or `auto`. The backend still resolves and validates locale values so clients cannot inject arbitrary language instructions.

Alternative considered: keep the old `summary` field and overload it with long prompts. That would be simpler but confusing because summary becomes both input source and generated output.

### Form-centered UI with temporary prompt drawer

The create issue page should keep the existing form as the durable editing surface. Clicking "Generate with AI" opens a right-side overlay drawer on desktop and a full-screen sheet/modal on mobile. The drawer contains the source prompt textarea, output language selector, context hint, loading/error states, and generate action. After generation, existing form fields are filled and the user continues editing before saving.

Alternative considered: embed a large source prompt textarea above the summary field. This makes long prompts easier to see, but permanently distracts from the form after generation.

### Autofill, not review cards

Generated fields should directly populate existing inputs. The current touched-field behavior remains: untouched or empty fields can be filled, while user-edited fields are preserved. Assignee suggestions remain suggestions until the user applies one.

Alternative considered: render separate generated draft review cards with per-field apply buttons. That adds control but duplicates the form and slows the existing workflow.

### Locale selection controls output, not parsing

The service must parse multilingual and mixed-language prompts regardless of selected output language. The selected output language controls generated human-readable text: summary, description, assignee reasons, and open questions. `Auto` detects the dominant prompt language and falls back to the user's current app locale when the prompt is mixed, ambiguous, or mostly code/logs.

Machine values and exact content are preserved: JSON keys, issue type values, priority enum values, IDs, member names, product names, commands, logs, URLs, and quoted UI text.

### Reusable wiki context retrieval

Issue generation should retrieve only a small number of relevant wiki pages, not send the entire wiki. A reusable service or method should embed/search the prompt against `wiki_pages.embedding`, scoped to the project, and return concise title/content excerpts. Issue generation can combine those excerpts with similar issues and milestone data in the prompt.

Alternative considered: call `AIWikiService::chat()`. That service is designed to answer questions only from wiki pages and cite sources, which is too restrictive for issue drafting.

### Assignee recommendation evidence

Assignee suggestions should be generated from explicit project-scoped evidence rather than only names and positions. Member context should include:

- Project membership position from `project_members.position`.
- Current workload: open assigned issue count, high-priority open count, overdue count, due-soon count, and open estimated hours when estimates are available.
- Assignment history: recent completed issues, common issue types, and prior ownership of semantically similar issues.
- Similar issue ownership: assignees for relevant similar issues, especially recently resolved or active related work.
- Wiki authorship/editorship as a weak signal only when retrieved wiki pages are relevant.

The model prompt should instruct the AI to balance relevance and workload: prefer members with relevant position/history, but avoid overloaded members unless their evidence is clearly strongest. Reasons must cite the provided evidence and must not infer private traits.

"Skills" should not be treated as first-class data in this change because the product does not currently store explicit member skills. If skills are added later, they can become a stronger structured signal; until then, the system should use the phrase "expertise signals" internally and derive them only from project position, assignment history, similar issue ownership, and wiki contributions.

Alternative considered: ask the model to infer member skills from names, comments, or free-form issue text. That would be opaque and risks unfair or inaccurate recommendations.

### Context budget ordering

When assembling the model prompt, prioritize:

1. User source prompt.
2. Current form fields and touched-field intent.
3. Project issue types and machine constraints.
4. Active milestones and team members.
5. Assignee recommendation signals.
6. Similar issues.
7. Relevant wiki excerpts.

This keeps user-provided context dominant and reduces risk that old wiki content overrides the prompt.

## Risks / Trade-offs

- Prompt is too long for model context -> validate maximum prompt length, summarize/truncate supporting context first, and keep raw user prompt ahead of retrieved context.
- Wiki content is stale or irrelevant -> retrieve only top matches, label it as supporting context, and instruct the model not to invent facts.
- `Auto` output language is ambiguous -> fall back to the current app locale and allow the user to explicitly choose another language.
- Existing clients send `summary` only -> support a short compatibility window by accepting `summary` as a fallback prompt if `prompt` is absent, or update all frontend callers in one change.
- More contextual retrieval increases latency -> keep wiki/similar issue limits small, use existing embeddings, and fail open when context retrieval is unavailable.
- Workload-aware recommendations can over-penalize busy subject-matter owners -> include workload as balancing context, not a hard exclusion, and require reasons to explain when an overloaded member is still recommended.
- Inferred expertise can become opaque -> use only explicit project position, issue ownership/history, and wiki authorship/editorship evidence; do not claim first-class skills until skills exist as product data.
- New UI strings miss a locale -> update all supported locale catalogs in the same implementation turn.

## Migration Plan

1. Update backend validation and service method signature for prompt-based requests.
2. Add or reuse project-scoped wiki context retrieval with small top-k limits.
3. Update frontend API client types and create issue AI drawer/sheet UI.
4. Add translations for every new string in all supported locale catalogs.
5. Add backend and frontend tests.
6. Keep manual issue creation unchanged.

Rollback is straightforward: hide the drawer entry point and restore the frontend caller to send summary-only requests. Backend can continue accepting prompt-based data without affecting normal issue creation.
