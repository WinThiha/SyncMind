## Context

The backend exposes issue deletion through `IssueController@destroy`, returning `204`. Android already has issue detail and project detail navigation, so deletion can be confirmed in-place and return to project detail.

## Goals / Non-Goals

**Goals:**
- Add issue delete API support.
- Confirm before deleting.
- Navigate back to project detail after successful delete.
- Validate with the Android unit-test build.

**Non-Goals:**
- No restore/undo.
- No bulk delete.

## Decisions

### 1. Delete From Issue Detail
- **Decision**: Place the delete action on `IssueDetailScreen`.
- **Rationale**: The issue detail screen has full issue context and already exposes edit.

## Risks / Trade-offs

- **[Risk]** Delete is destructive.
- **Mitigation**: Require confirmation before calling the API.
