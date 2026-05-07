## Context

Project member role is currently stored per project in `project_members.role`, but member position is stored globally in `users.position`. This makes position semantically inconsistent with project-level membership data and prevents project admins from managing each member's position within a project. Invitation and member management flows already centralize membership administration and are the natural integration points for project-scoped position.

## Goals / Non-Goals

**Goals:**
- Move source of truth for project member position to project membership context.
- Allow project admins to set/update member position in add-member, invitation, and member-update flows.
- Ensure membership list APIs return position so frontend can render and edit it.
- Preserve existing role behavior and permission boundaries.

**Non-Goals:**
- Replacing or redefining global user profile fields unrelated to project membership.
- Introducing custom role taxonomy beyond existing `admin` / `normal` role.
- Bulk import/export tooling for member data.

## Decisions

1. Store position on `project_members`.
- Rationale: Position is contextual to a project and should coexist with other membership attributes.
- Alternative considered: Keep `users.position` as source of truth and expose profile editing to admins. Rejected because it is global and violates project-local ownership.

2. Extend existing member and invitation endpoints rather than introducing new endpoints.
- Rationale: Current membership lifecycle is already centralized in `ProjectMemberController` and `ProjectInvitationController`; extending payloads minimizes API sprawl.
- Alternative considered: Add dedicated position endpoint. Rejected due to extra client complexity and fragmented update flows.

3. Treat invitation position as optional and persist to membership on accept.
- Rationale: Invitations should support preconfigured onboarding while remaining backward-compatible with existing invitations that have no position.
- Alternative considered: Require position for invitations. Rejected to avoid unnecessary friction and migration burden.

4. Keep `users.position` for profile compatibility during transition.
- Rationale: Existing code or data may still read profile position; migration should be additive-first and avoid abrupt removals.
- Alternative considered: Drop `users.position` immediately. Rejected due to compatibility and rollback risk.

## Risks / Trade-offs

- [Data divergence between `users.position` and `project_members.position`] → Treat project membership as authoritative for project screens and document separation of concerns.
- [Existing tests or consumers assume member payload shape without position] → Update API contracts and add/adjust feature tests and frontend typing.
- [Legacy invitations without position] → Accept null position and default safely during membership creation.
- [UI clutter in member management] → Use concise inline field/edit interaction and preserve current role controls.

## Migration Plan

1. Add nullable `position` column to `project_members`.
2. Update backend relation and controllers to read/write `position` in member and invitation flows.
3. Update invitation acceptance flow to apply invited position to `project_members`.
4. Update frontend member management types/forms to display and edit position.
5. Add/adjust backend and frontend tests for position behavior and permissions.
6. Rollback path: ignore/drop new field and revert payload handling; no destructive migration required in first phase.

## Open Questions

- Should project creator/admin be allowed to edit their own position, or only other members?
- Should position have validation constraints beyond length (for example, controlled vocabulary)?
- Should accepted invitation responses include the resolved member position for immediate UI hydration?
