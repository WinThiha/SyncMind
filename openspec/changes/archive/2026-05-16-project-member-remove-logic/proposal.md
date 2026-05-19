## Why

The Project Members card currently has two gaps:

1. **Missing remove button for the project owner (creator)**: `isAdmin` in `MemberManagement.tsx` checks `userRole === 'admin'`, so the creator/owner sees no remove controls at all — they cannot remove any member despite being the highest-privileged role.

2. **Admin can remove other admins**: The existing remove guard (`canManageRole`) only blocks removing the creator and removing yourself. It does not prevent an admin from removing a peer admin — both on the frontend (button is visible) and backend (`destroy()` has no peer-admin check).

The intended rule is: **owner removes anyone below them; admin removes only normal members**.

## What Changes

- **Remove button placement**: A `UserMinus` icon button is added (or made visible) to the right of the pencil/edit controls for each member row, subject to the role-based rules below.
- **Owner (creator) can remove**: admins and normal members. Cannot remove themselves (they are the creator).
- **Admin can remove**: normal members only. Cannot remove the owner, other admins, or themselves.
- **Backend enforcement**: `ProjectMemberController::destroy()` gains an additional guard — if the acting user is an admin (not the creator), attempts to remove another admin return 403.

## Capabilities

### Modified Capabilities
- `project-members`: Member remove button visibility and backend enforcement updated to respect owner / admin / member hierarchy.

## Impact

- **Frontend**: `MemberManagement.tsx` — introduce `isCreator` flag, replace `canManageRole` with per-row `canRemoveMember(member)` helper, expand management-feature visibility to include the creator.
- **Backend**: `ProjectMemberController::destroy()` — add peer-admin guard before detaching.
- **No new routes, models, or migrations required.**
