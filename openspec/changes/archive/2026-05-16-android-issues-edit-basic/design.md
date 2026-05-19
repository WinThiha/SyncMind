## Context

The backend `IssueController@update` accepts partial issue fields via PATCH. Android already has issue detail and issue creation models, so edit can reuse a similar form while loading the current issue first.

## Goals / Non-Goals

**Goals:**
- Load the issue to edit.
- Allow updating summary, description, status, priority, issue type, estimated hours, actual hours, and due date.
- Navigate back to issue detail after save.

**Non-Goals:**
- No issue delete.
- No assignee/milestone pickers.
- No AI assistance.

## Decisions

### 1. Dedicated Edit Screen
- **Decision**: Add a separate `EditIssueScreen`.
- **Rationale**: It keeps create and edit state separate and avoids prematurely abstracting a shared form.

### 2. Reuse Issue Detail Route After Save
- **Decision**: Navigate to the issue detail route with the same issue key after update.
- **Rationale**: The backend key is stable and the detail screen can refresh the latest data.

## Risks / Trade-offs

- **[Risk]** Issue types may drift from project configuration.
- **Mitigation**: Use the current issue type plus common fallback types for this first edit flow.
