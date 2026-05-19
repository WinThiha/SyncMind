## Context

The web comment component posts `{ content }` to `/api/projects/{project}/issues/{issueKey}/comments` and appends the returned comment. The backend also accepts `notify_emails`, defaulting false when omitted. Android can use the same endpoint from the existing project-scoped API service.

## Goals / Non-Goals

**Goals:**
- Let users enter and submit a non-empty comment from issue detail.
- Show loading/error state for comment submission.
- Refresh issue detail after posting so comments/history are consistent with backend state.

**Non-Goals:**
- No markdown editor or preview.
- No email notification toggle.
- No comment edit/delete.

## Decisions

### 1. Refresh After Post
- **Decision**: Reload the issue detail after a successful comment post.
- **Rationale**: This keeps comments and any server-side side effects consistent without hand-merging nested issue state.

### 2. Keep Comment API in Project Repository
- **Decision**: Add comment creation to `ProjectApiService`/`ProjectRepository`.
- **Rationale**: Comments are issue/project scoped and the current Android project repository already owns issue detail.

## Risks / Trade-offs

- **[Risk]** Refresh after post adds one extra API call.
- **Mitigation**: It is acceptable for this simple first mutation; optimize later if needed.
