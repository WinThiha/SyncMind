## Overview

The global Issues page becomes the single issue-list surface. Project-specific links route to `/issues?project_id={projectId}`, and the global page reads that query parameter to initialize its project picker. Issue cards on the global page open `IssueDetailView` as a slide-over preview. The slide-over exposes a full-detail action for users who need the existing issue detail route.

## Decisions

- Reuse `IssueDetailView` instead of building a second slider implementation.
- Add optional full-detail action props to `IssueDetailView` so project lists and global lists can share the same component without hard-coding route behavior.
- Preserve project issue detail, edit, and new routes because they contain the full detail and form experiences.
- Leave `/projects/{id}/issues` as a compatibility redirect to `/issues?project_id={id}` rather than deleting the route file.

## Risks

- Global issue payloads use `summary`, while the slider expects a `summary` field and can load full details via `project_id` and `key`; the global card must pass the right key value.
- Query-parameter initialization must wait for the projects list only for display, but the filter state can be set immediately from `project_id`.
- Existing tests may assert old `/projects/{id}/issues` list URLs and need targeted updates.

## Validation

- Add or update frontend tests covering project dashboard issue-list navigation and global issue slider behavior.
- Run frontend tests in Docker with `docker compose exec frontend npm run test`.
