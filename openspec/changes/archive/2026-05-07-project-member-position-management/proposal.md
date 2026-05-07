## Why

Project member position is currently stored on `users.position`, which makes it global per user instead of contextual per project. Project managers and project admins need to manage each member's position within a specific project, including invited members, without overwriting a user's profile-level information.

## What Changes

- Add project-scoped member position management as part of project membership.
- Store editable member position on `project_members` instead of relying on `users.position`.
- Extend member APIs and invitation flow to accept and return `position`.
- Update project member management UI so project admins can set and update member positions.
- Preserve existing project role behavior (`admin` / `normal`) while adding position as a separate field.

## Capabilities

### New Capabilities
- `project-member-management`: Manage per-project member metadata (position) across member listing, direct add, invitation, and membership updates.

### Modified Capabilities
- None.

## Impact

- Backend database schema: `project_members` table and related Eloquent pivot handling.
- Backend APIs: project member and invitation endpoints.
- Frontend project member management: data contracts and form UI.
- Test coverage: feature tests for member/invitation position behavior and permission boundaries.
