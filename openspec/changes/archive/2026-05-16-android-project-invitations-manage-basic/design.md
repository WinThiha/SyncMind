## Design

Pending invitations will be loaded by `ProjectMembersViewModel` alongside the member list using `GET /projects/{project}/invitations`. The same operation status channel will report cancel success or errors. After add/invite and cancel operations, the screen reloads both members and invitations.

The response model keeps inviter fields optional and minimal because Android only needs email, role, position, and expiry for this parity slice.

## Non-goals

- Accepting invitation links
- Resending invitations
- Invitation detail view
- Role-aware hiding of invitation controls
