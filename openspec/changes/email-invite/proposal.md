## Why

Adding a project member today requires the person to already have a SyncMind account. The backend validates `exists:users,email` and returns a 422 if the email is not found — there is no way to invite someone who hasn't registered yet. This blocks team growth and forces an awkward out-of-band flow where admins have to ask new colleagues to sign up first before they can be added.

## What Changes

- **Hybrid member-add flow**: When an admin adds an email that already has an account, the user is added immediately (existing behaviour). When the email is unknown, a time-limited invitation is created and an email is sent.
- **Invitation lifecycle**: Pending invitations are shown in the Members panel. Admins can cancel them. Invitations expire after 7 days.
- **Accept flow**: The invite email contains a unique link. Authenticated users are taken directly to a join-confirmation page. Unauthenticated users are redirected to login/register and then auto-redirected back to accept.
- **Notification email**: When an existing user is added directly, they receive a "You've been added to [Project]" email.

## Capabilities

### New Capabilities
- `project-invitations`: Token-based email invitation system for adding users who do not yet have a SyncMind account.

### Modified Capabilities
- `project-members`: Member-add flow is updated to handle both existing and non-existing users; members panel gains a pending-invitations section.

## Impact

- **Backend**: New `ProjectInvitation` model + migration, `ProjectInvitationController`, `ProjectInvitationAcceptController`, two new Mailable classes (`ProjectInvitationMail`, `MemberAddedMail`), update to `ProjectMemberController::store()`.
- **Frontend**: Updated `MemberManagement.tsx` (pending invites list + cancel), new API client functions, new `/invitations/[token]` accept page, minor update to register page to carry invite token through registration.
- **Routes**: Two new route groups — `/api/projects/{project}/invitations` (CRUD) and `/api/invitations/{token}` (public accept).
- **Database**: One new migration for `project_invitations` table.
