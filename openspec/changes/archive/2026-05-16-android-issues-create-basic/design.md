## Context

The backend `IssueController@store` requires `summary` and `issue_type`, with defaults for status and priority. The web create form includes advanced AI suggestions, assignee suggestions, milestone selection, and duplicate search. Android can first implement the core create payload and reuse project detail data to populate issue type choices.

## Goals / Non-Goals

**Goals:**
- Provide a project-scoped create issue screen.
- Submit a valid issue creation payload.
- Navigate to the created issue detail on success.
- Validate through the Android unit-test build.

**Non-Goals:**
- No AI field suggestions.
- No similar issue search.
- No assignee or milestone selector in this increment.
- No rich markdown editor.

## Decisions

### 1. Basic Required Flow First
- **Decision**: Implement summary, description, issue type, priority, estimated hours, and due date.
- **Rationale**: These cover useful issue creation while avoiding multi-endpoint dependencies.

### 2. Navigate to Created Issue
- **Decision**: Use the returned issue key to navigate directly to issue detail.
- **Rationale**: It confirms creation and matches the existing Android issue detail path.

## Risks / Trade-offs

- **[Risk]** Project-specific issue types may not be loaded.
- **Mitigation**: Load project detail on screen entry and fall back to Task/Bug/Request.
