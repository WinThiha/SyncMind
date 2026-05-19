## Context

The backend `MilestoneController@store` accepts `name`, optional `description`, optional `start_date`, optional `due_date`, and optional `status`. Android already lists milestones in project detail, so the creation flow can navigate back to project detail and refresh from backend state.

## Goals / Non-Goals

**Goals:**
- Provide a project-scoped create milestone screen.
- Submit a valid milestone creation payload.
- Navigate back to project detail after success.
- Validate with the Android unit-test build.

**Non-Goals:**
- No milestone edit/delete.
- No AI milestone suggestions.
- No issue assignment to milestones.

## Decisions

### 1. Return to Project Detail
- **Decision**: Navigate back to project detail after creation.
- **Rationale**: Android does not yet have a milestone detail screen, and the milestone list is the current milestone surface.

### 2. Plain Date Text Fields
- **Decision**: Use `YYYY-MM-DD` text fields for dates.
- **Rationale**: Matches the backend date contract and avoids introducing a date picker dependency in this increment.

## Risks / Trade-offs

- **[Risk]** Date input can fail backend validation if malformed.
- **Mitigation**: Label placeholders clearly; richer validation/date picker can be added later.
