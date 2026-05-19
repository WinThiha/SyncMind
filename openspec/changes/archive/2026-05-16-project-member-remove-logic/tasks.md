## Phase 1 — Backend: Enforce peer-admin guard in destroy()

- [x] 1.1 In `backend/app/Http/Controllers/ProjectMemberController.php`, update `destroy()`:
  - After the `creator_id == $userId` guard, add: if the acting user is NOT the creator AND the target member's pivot role is `admin`, return `response()->json(['message' => 'Admins cannot remove other admins.'], 403)`.
  - Query: `$project->members()->where('user_id', $userId)->first()` to get the target pivot.

## Phase 2 — Frontend: Role flags and remove-button logic

- [x] 2.1 In `frontend/src/components/projects/MemberManagement.tsx`, add after `const isAdmin = userRole === 'admin';`:
  ```ts
  const isCreator = userRole === 'creator';
  const canManageMembers = isAdmin || isCreator;
  ```

- [x] 2.2 Replace every top-level `isAdmin` gate that controls management features with `canManageMembers`:
  - `useEffect` invitation fetch: `if (isAdmin)` → `if (canManageMembers)`
  - Pending invitations section: `{isAdmin && invitations.length > 0 && (` → `{canManageMembers && invitations.length > 0 && (`
  - Add-member form: `{isAdmin && (` → `{canManageMembers && (`

- [x] 2.3 Inside the `members.map()` callback, add a `canRemoveMember` variable after the existing `canManageRole`:
  ```ts
  const canRemoveMember = isCreator
    ? mRole !== 'creator'                      // owner can remove admin and normal
    : isAdmin && mRole === 'normal' && member.id !== user?.id;  // admin can remove normal only
  ```

- [x] 2.4 Replace the existing remove-button guard `{canManageRole && (` (line ~270) with `{canRemoveMember && (`. Keep the button markup unchanged.

## Phase 3 — Verification

- [x] 3.1 Run `./vendor/bin/pint` in `backend/` — no lint errors in changed file (20 pre-existing issues in other files, unrelated to this change).
- [x] 3.2 Run `php artisan test` in `backend/` — all pre-existing tests still pass; no regressions.
- [x] 3.3 Run `npm run build` in `frontend/` — no type errors.
- [x] 3.4 Run `npm run lint` in `frontend/` — no new errors in changed files (75 pre-existing issues in other files, unrelated to this change).
- [x] 3.5 Manual smoke test — as owner: verify remove button visible next to admin rows and normal-member rows; confirm removal works; verify no remove button on own row.
- [x] 3.6 Manual smoke test — as admin: verify remove button visible only for normal-member rows; verify remove button absent for owner and other-admin rows; verify API rejects admin-removes-admin with 403.
- [x] 3.7 Manual smoke test — as normal member: verify no remove buttons visible anywhere.
