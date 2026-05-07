## Context

The SyncMind platform handles complex issue threads where critical decisions and progress are often buried in dozens of comments and field updates (status changes, reassignments). Currently, users must manually read the entire history to understand the state of an issue.

## Goals / Non-Goals

**Goals:**
- Provide a chronological "Timeline of Events" merging comments and history.
- Generate structured AI summaries (Overview, Decisions, Consensus, Action Items).
- Implement a cost-effective caching strategy with automatic invalidation.
- Deliver a seamless, interactive UI for triggering and viewing summaries.

**Non-Goals:**
- Real-time "auto-summarization" (summaries only update on user request or cache miss).
- Support for summarizing multiple issues or entire projects in a single view.
- Persistent database storage for summaries (caching is sufficient).

## Decisions

### 1. Unified Narrative Aggregation
- **Rationale**: A comment like "Fixed!" is meaningless without the corresponding status change to `resolved`.
- **Approach**: Fetch both `Comment` and `IssueHistory` models, mapping them to a shared `Event` interface, and sort by timestamp.

### 2. Caching Strategy
- **Rationale**: Summaries are transient and can be re-generated. Storing them in the database adds schema complexity.
- **Approach**: Use the existing Redis/Cache layer with keys formatted as `issue_{id}_summary`.
- **Invalidation**: Invalidate the cache whenever a new comment is posted or an issue is updated (via `CommentObserver` or `IssueObserver`).

### 3. AI Model & Prompting
- **Rationale**: `gpt-4o-mini` provides the best balance of cost, performance, and large context window (128k) for long threads.
- **Prompting**: Use "Chain of Thought" instructions to force the AI to distinguish between "proposed ideas" and "final decisions".

### 4. UI/UX: Integrated Summary Card
- **Rationale**: Placing the summary at the top of the comment thread provides immediate value to newcomers.
- **Approach**: A new `SummaryCard.tsx` component using TailwindCSS v4 and Framer Motion for a "slide-down" entrance effect.

## Risks / Trade-offs

- **[Risk] Token Overload** → **Mitigation**: Implement a truncation strategy for threads exceeding 50+ events, keeping the most recent events which carry the most weight.
- **[Risk] Hallucinations** → **Mitigation**: Clearly label the UI as "AI-Generated Summary" and provide a "Regenerate" button to force a fresh analysis.
- **[Risk] Stale Summaries** → **Mitigation**: Automatic cache invalidation on any new issue activity (comments or field updates).
