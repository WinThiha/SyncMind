## Context

The web app has mature project and issue read paths in `frontend/src/lib/api/projects.ts` and `frontend/src/lib/api/issues.ts`. The Android app already has Retrofit, kotlinx.serialization, Hilt, token auth, a project repository, and Compose navigation. This change extends those existing Android pieces rather than introducing a new data layer.

## Goals / Non-Goals

**Goals:**
- Let users tap a project from the Android project list.
- Show project metadata returned by `GET /api/projects/{project}`.
- Show issues returned by `GET /api/projects/{project}/issues`.
- Keep loading, empty, retry, and error states consistent with the current project list.

**Non-Goals:**
- No offline database.
- No project or issue mutation flows.
- No AI issue assistance, comments, wiki, milestones, invitations, or settings in this increment.

## Decisions

### 1. Read-Only Increment
- **Decision**: Implement project detail and issue list as read-only.
- **Rationale**: This gives Android parity for the first meaningful project workflow while keeping implementation and verification focused.

### 2. Reuse `ProjectApiService`
- **Decision**: Add project detail and issue endpoints to the existing project API service/repository.
- **Rationale**: The current app already treats project-backed resources through `ProjectApiService`; a separate issue service can wait until issue mutations or AI flows require more separation.

### 3. Simple In-Memory Screen State
- **Decision**: Use ViewModel state for detail and issues, loaded on screen entry.
- **Rationale**: Matches the existing Android app and avoids adding Room or paging before the app has larger datasets and mutation flows.

## Architecture Sketch

```
[ProjectListScreen] --tap--> [ProjectDetailScreen]
                                 |
                                 v
                         [ProjectDetailViewModel]
                                 |
               +-----------------+-----------------+
               v                                   v
       [ProjectRepository.getProject]      [ProjectRepository.getIssues]
               |                                   |
               v                                   v
          GET /projects/{id}           GET /projects/{id}/issues
```

## Risks / Trade-offs

- **[Risk]** Backend issue payload can include nested nullable fields.
- **Mitigation**: Android models use nullable/default values and Retrofit JSON ignores unknown keys.
- **[Risk]** A large issue list may become slow later.
- **Mitigation**: Keep this increment simple; add pagination when the backend/API contract supports it.
