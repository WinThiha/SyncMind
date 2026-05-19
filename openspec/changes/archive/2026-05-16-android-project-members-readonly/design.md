## Design

The existing `Project` model already includes `members: List<ProjectMember>` and `ProjectDetailViewModel` already loads the project detail response. This change only adds UI rendering in `ProjectDetailScreen`.

The member list will appear below the project overview and before issue/milestone/wiki sections. Empty member lists will show a short empty state. Management actions such as invite, remove, role update, and ownership transfer remain out of scope.

## Non-goals

- Adding or inviting members
- Updating member roles
- Removing members
- Ownership transfer
