## Context

The backend `StoreProjectRequest` requires `name`, uppercase alphabetical `key`, and at least one `issue_types` entry. The web create form sends those fields plus optional icon URL. Android already has project list and detail navigation, so created projects can navigate directly to detail.

## Goals / Non-Goals

**Goals:**
- Submit a valid project creation payload.
- Normalize project key to uppercase.
- Split comma-separated issue types.
- Navigate to the created project detail on success.

**Non-Goals:**
- No project edit/delete.
- No categories or versions UI.
- No member/invitation setup during project creation.

## Decisions

### 1. Comma-Separated Issue Types
- **Decision**: Use a text field for issue types, split on commas.
- **Rationale**: Matches the current web form and avoids building a chip editor in this increment.

### 2. Project List Top Bar Entry
- **Decision**: Add a create action to the project list top bar.
- **Rationale**: Project creation is global to the authenticated app, not tied to an existing project.

## Risks / Trade-offs

- **[Risk]** Backend validation errors are shown as generic messages.
- **Mitigation**: Local validation covers required fields; detailed validation handling can be improved later.
