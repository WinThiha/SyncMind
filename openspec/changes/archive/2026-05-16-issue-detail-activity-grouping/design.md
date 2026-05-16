## Context

The issue detail slider (`IssueDetailView`) and the standalone issue detail page (`page.tsx`) both display issue activity — comments and history. The slider combines them into a unified timeline with user+time grouping. The detail page currently renders them as two separate GlassCard sections (`Comments` and `ChangeHistory`) with no grouping.

This inconsistency was identified during exploration of the `issue-detail-slider-parity` change. The decision was made to bring the detail page activity feed to parity with the slider by adopting the slider's grouping logic.

### Current State

**Slider (`IssueDetailView:173-192`):**
- `activityEntities` useMemo merges `comments` + `history`
- Groups: same `user.id` + within 2000ms
- Each entity: `{ id, user, created_at, comments: [], history: [] }`
- Renders history above comments in a single card
- Assignee ID history resolves to member names via `members.find()`

**Detail page (`page.tsx:603-613`):**
- `<Comments>` and `<ChangeHistory>` as separate sections
- `ChangeHistory` groups by user + hour:minute (looser than slider's 2s)
- No assignee ID resolution in `ChangeHistory`
- `Comments` has its own comment form

## Goals / Non-Goals

**Goals:**

- Extract `activityEntities` grouping logic into a reusable hook (`useActivityEntities`)
- Update the detail page activity section to use a unified grouped feed matching the slider
- Preserve the detail page's existing layout: description, quick update form, AI summary, properties sidebar
- Resolve assignee ID history entries to member names using the `members` array (same as slider)

**Non-Goals:**

- Do not modify the slider (`IssueDetailView`) — it is already correct
- Do not change the `Comments` and `ChangeHistory` components beyond adding stale comments
- Do not add new API endpoints or modify backend behavior
- Do not merge the AI summary into the activity feed (keep it as a separate card)

## Decisions

- Create `useActivityEntities` hook as a shared utility in `frontend/src/components/issues/hooks/useActivityEntities.ts`
  - Rationale: Both components already load the raw data; the hook centralizes grouping logic so both views stay in sync.
  - Signature: `useActivityEntities(comments, history, members, t) → activityEntities[]`
  - The hook wraps the existing `activityEntities` useMemo from `IssueDetailView`

- The detail page renders its own activity section using the hook output with the page's existing GlassCard styling
  - Rationale: The page has a distinct two-column layout. Reusing the slider's component wholesale would require layout adaptation.
  - Alternative considered: Import and use `IssueDetailView`'s activity rendering. Rejected because the slider renders as a portal overlay, not suited for inline page layout.

- Keep `Comments` and `ChangeHistory` components with stale comments
  - Rationale: The components may be used elsewhere or kept for fallback. Adding stale comments signals they should not be reused on the detail page.

## Risks / Trade-offs

- Grouping threshold (2 seconds) vs `ChangeHistory`'s minute-level — if both components are used in other contexts, behavior differs depending on which component renders the data. → Accept: this change brings detail page in line with slider; other usages are out of scope.
- Activity section will be replaced but the page still has a separate quick-update form → The form stays separate from the activity feed (not merged), matching the page's current layout structure.
- Assignee ID resolution requires `members` array → The hook signature includes `members` as a required parameter; callers must provide it. Both `IssueDetailView` and `page.tsx` already load members independently.