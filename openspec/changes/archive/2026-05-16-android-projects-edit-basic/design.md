## Context

The backend `UpdateProjectRequest` accepts partial project fields including `name`, `icon`, and `issue_types`. The web settings form edits name and issue types. Android already has project detail and create project patterns, so edit can reuse similar field handling.

## Goals / Non-Goals

**Goals:**
- Load project details before editing.
- Save name, icon, and issue type changes.
- Navigate back to project detail after successful save.

**Non-Goals:**
- No delete/transfer/member management.
- No categories/versions editor.

## Decisions

### 1. Dedicated Project Edit Screen
- **Decision**: Add `EditProjectScreen` rather than inline editing.
- **Rationale**: Keeps project detail readable and matches existing create/edit issue navigation patterns.

## Risks / Trade-offs

- **[Risk]** User may not be authorized to update project.
- **Mitigation**: Surface backend error through the save state.
