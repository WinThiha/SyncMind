# Design

## Backend Contract
The Android client will call:

`POST projects/{projectId}/transfer`

with:

```json
{
  "new_creator_id": 123
}
```

The backend only allows the current project creator to transfer ownership and requires the new owner to be an existing admin project member. Android will not duplicate full authorization logic; it will make the action available for members whose pivot role is `admin` and rely on the backend for the final decision.

## Android Data Layer
- Add `TransferProjectOwnershipRequest` with `new_creator_id`.
- Reuse the existing message response shape for transfer responses.
- Add `transferProjectOwnership` to `ProjectApiService`.
- Add `transferProjectOwnership(projectId, newCreatorId)` to `ProjectRepository`, returning `NetworkResult<String>`.

## UI
`ProjectMembersScreen` already lists members with role editing and removal. Add a `Transfer ownership` action to each admin member row. The action:
- Is disabled while another member operation is running.
- Calls the view model transfer method with the member id.
- Displays the same operation status area already used for member mutations.
- Reloads members and invitations after success so role and permission state stays current.

## Risk
The UI cannot know with certainty whether the active user is the project creator from the members endpoint alone. Showing the action to admins may still produce a 403 for non-creators; that backend message should be surfaced through the existing operation error state.
