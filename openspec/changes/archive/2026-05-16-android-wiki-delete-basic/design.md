## Context

The backend exposes wiki deletion through `WikiPageController@destroy`, returning `204`. Android already has a wiki reader screen and project detail route, so deletion can be confirmed in-place and then route back to the project detail page.

## Goals / Non-Goals

**Goals:**
- Add a project-scoped wiki delete API call.
- Confirm before deleting.
- Navigate back to project detail on success.
- Validate with the Android unit-test build.

**Non-Goals:**
- No undo/restore.
- No delete from wiki list.

## Decisions

### 1. Confirm In Reader
- **Decision**: Put the delete action on `WikiPageScreen`.
- **Rationale**: The reader has page context and already has edit actions.

## Risks / Trade-offs

- **[Risk]** Delete is destructive.
- **Mitigation**: Require confirmation before calling the API.
