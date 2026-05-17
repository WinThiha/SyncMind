## Context

`MemberManagement.tsx` receives `userRole: string` from the parent page. The creator's role in the pivot is stored as `'creator'` (set by the backend observer when the project is created). The current component defines:

```ts
const isAdmin = userRole === 'admin';  // creator is excluded — BUG
```

All management-gating (add form, invitations list, remove button) uses `isAdmin`, so the owner gets no controls.

The backend `destroy()` only guards against removing the project creator; it does not block an admin from removing a peer admin.

## Goals / Non-Goals

**Goals:**
- Owner sees a remove button for every row except their own (admins + normal members).
- Admin sees a remove button only for normal-member rows.
- Backend rejects an admin's attempt to remove another admin with 403.
- Remove button position: right of the pencil/edit controls in each member row (inside the existing `flex items-center gap-2` action cluster).

**Non-Goals:**
- Transferring ownership.
- Self-remove (leaving a project).
- Changing the role dropdown logic.
- Any new migrations or API endpoints.

## Data Model

No changes. The pivot table `project_members` already carries `role` (`admin` | `normal`) and the `projects.creator_id` FK is the canonical owner reference.

## Flow Diagrams

### Remove button visibility logic (frontend)

```
currentUserRole === 'creator'?
    YES → can remove: mRole !== 'creator' (i.e., admin or normal, not self)
    NO
        currentUserRole === 'admin'?
        YES → can remove: mRole === 'normal' only
        NO  → no remove button
```

### Backend destroy() guard

```
Request hits destroy()
    │
    ▼
manageMembers policy?  NO → 403
    │ YES
    ▼
target === creator?  YES → 422
    │ NO
    ▼
actor === creator?  YES → allow detach
    │ NO (actor is admin)
    ▼
target is admin?  YES → 403 "Admins cannot remove other admins"
    │ NO
    ▼
detach → 200
```

## Decisions

### 1. `isCreator` flag instead of widening `isAdmin`
- **Rationale**: `isAdmin` is referenced in several places; changing its meaning risks unintended side-effects (e.g., the add form, invitation loading). Adding `isCreator = userRole === 'creator'` and a composed `canManageMembers = isAdmin || isCreator` is safer.
- **Approach**: Replace top-level feature gates (`isAdmin &&`) with `canManageMembers &&`. Leave the role-dropdown guard (`canManageRole`) scoped to admins only, since the owner's own row still reads as `creator` and is already excluded.

### 2. Per-row `canRemoveMember` computed inside map
- **Rationale**: Each member row needs a different answer based on both the current user's role and the target member's role.
- **Approach**: Derive `canRemoveMember` inside the `.map()` callback, alongside the existing `canManageRole`, `isCreatorMember` etc. No new function needed — a ternary expression is sufficient.

### 3. Backend 403 for peer-admin removal
- **Rationale**: Defense-in-depth — frontend already hides the button, but API must also enforce the rule.
- **Approach**: In `destroy()`, after the creator guard, query the target member's pivot role. If actor is not creator and target role is `admin`, return `response()->json(['message' => 'Admins cannot remove other admins.'], 403)`.

## Risks / Trade-offs

- **[Risk] Creator loads invitations**: The invitation fetch is currently inside `if (isAdmin)` — switching to `canManageMembers` means the creator will now also load pending invitations. This is correct behaviour (creator should see pending invitations) but is a visible change.
- **[Risk] Extra DB query in destroy()**: Querying the target member's pivot role adds one query. Given the low frequency of remove operations this is acceptable.
