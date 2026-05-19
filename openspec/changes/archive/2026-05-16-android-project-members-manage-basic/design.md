## Design

Member management will use a new `ProjectMembersScreen` backed by `ProjectMembersViewModel`. The ViewModel owns member list, add form state, per-member draft role/position maps, and operation status.

The screen will call:

- `GET /projects/{project}/members`
- `POST /projects/{project}/members`
- `PUT /projects/{project}/members/{user}`
- `DELETE /projects/{project}/members/{user}`

The backend delegates add-by-unknown-email to the invitation flow, so Android can use the same add form for existing users and invitees. Pending invitation list/cancel is left for a later change.

## Non-goals

- Pending invitation listing/cancel
- Ownership transfer
- Role-aware hiding of controls
- Creator-specific UI rules beyond surfacing backend errors
