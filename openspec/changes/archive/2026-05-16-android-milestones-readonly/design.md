## Context

The backend exposes milestone listing at `/api/projects/{project}/milestones`, and the frontend consumes it through `frontend/src/lib/api/milestones.ts`. The Android project detail screen already loads project detail and issues through `ProjectDetailViewModel`, so milestones can be added as a third state in the same screen.

## Goals / Non-Goals

**Goals:**
- Fetch project milestones in Android.
- Show milestone name, status, progress, due date, and overdue state.
- Preserve existing project/issue behavior.
- Keep validation through the Android unit-test build.

**Non-Goals:**
- No milestone mutations.
- No milestone issue drilldown.
- No AI milestone panels.
- No offline caching.

## Decisions

### 1. Add Milestones to Project Detail
- **Decision**: Render milestones in the project detail screen below issues.
- **Rationale**: The current Android app has a compact navigation model; adding a section keeps the first milestone port easy to reach without creating a larger tab framework.

### 2. Reuse Project Repository
- **Decision**: Add `getMilestones(projectId)` to `ProjectRepository`.
- **Rationale**: Milestones are project-scoped and match the existing project detail read model.

## Risks / Trade-offs

- **[Risk]** Project detail could become long for large projects.
- **Mitigation**: Use a `LazyColumn`; later increments can add tabs or filters when mutation/detail flows are added.
