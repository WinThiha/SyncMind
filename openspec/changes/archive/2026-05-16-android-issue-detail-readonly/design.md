## Context

The backend `IssueController@show` loads assignee, creator, comments with users, and history with users, then returns the formatted issue payload. Android already has project detail and issue list navigation from the previous increment, so issue detail can build on the same repository, model, and Compose patterns.

## Goals / Non-Goals

**Goals:**
- Let users tap an issue in the Android project detail screen.
- Fetch the issue detail payload from the existing backend endpoint.
- Render the issue's full read-only metadata plus comments and history.
- Keep loading and error states consistent with the rest of the Android app.

**Non-Goals:**
- No issue edit/delete/status transitions.
- No new comment creation.
- No AI summarization or similar issue lookup.
- No offline persistence.

## Decisions

### 1. Keep Issue APIs in `ProjectApiService`
- **Decision**: Add `getIssue(projectId, issueKey)` to `ProjectApiService` and `ProjectRepository`.
- **Rationale**: Existing Android issue browsing already lives there and all issue endpoints are project-scoped.

### 2. Nullable Nested Models
- **Decision**: Add nullable/default nested comment and history fields to `Issue`.
- **Rationale**: List payloads do not include full nested detail, while show payloads do. Defaults let one model support both.

## Architecture Sketch

```
[IssueItem] --tap--> [IssueDetailScreen]
                         |
                         v
                 [IssueDetailViewModel]
                         |
                         v
              GET /projects/{id}/issues/{key}
```

## Risks / Trade-offs

- **[Risk]** History payload field names may expand over time.
- **Mitigation**: Retrofit JSON ignores unknown keys; Android only renders stable known fields.
