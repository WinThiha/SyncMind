## Context

`ProjectMemberController::store()` currently enforces `'email' => 'required|email|exists:users,email'`. If the email isn't in the `users` table, Laravel returns a 422 validation error. There is no `Mail/` or `Notifications/` directory in the backend — email infrastructure beyond Laravel's built-in `VerifyEmail` notification does not exist yet.

The frontend `MemberManagement.tsx` shows only currently-active members. There is no concept of a pending invite state anywhere in the codebase.

## Goals / Non-Goals

**Goals:**
- Allow admins to invite people by email regardless of whether they have an account.
- Show pending invitations in the Members panel with a cancel option.
- Send a clean invitation email with a single-click accept link.
- Notify existing users by email when they are added directly.
- Keep the member-add UX identical — no extra steps for the admin.

**Non-Goals:**
- Bulk invite (CSV upload).
- Invitation approval workflows (invite is auto-accepted on click).
- Push / in-app notifications (email only).
- Magic-link login via the invite token — users must register or log in normally.

## Data Model

```
project_invitations
├── id            bigint PK
├── project_id    bigint FK → projects.id  (cascade delete)
├── email         string(255)
├── role          string  (admin | normal)
├── token         string(64)  unique  — secure random hex
├── invited_by    bigint FK → users.id  (set null on delete)
├── accepted_at   timestamp  nullable  — null = pending
├── expires_at    timestamp  — invited_at + 7 days
└── timestamps
```

Indexes: `token` (unique), `(project_id, email)` composite (for duplicate guard).

## Flow Diagrams

### Add-member flow (admin perspective)

```
Admin submits email + role
         │
         ▼
Email exists in users?
    │              │
   YES              NO
    │               │
Add to project   Already pending invite?
Send added-        │              │
notification      YES              NO
email              │               │
Return 201        Return 409      Create invitation record
"added"           "invite         Send ProjectInvitationMail
                  pending"        Return 200 "invitation sent"
```

### Accept flow (invitee perspective)

```
Invitee clicks link in email
/invitations/[token]
         │
         ▼
Token valid & not expired?
    │              │
   YES              NO
    │               │
Logged in?     Show "expired" page
    │              with "request new invite"
   YES    NO        message
    │      │
    │    Redirect to /login or /register
    │    with ?redirect=/invitations/[token]
    │      │
    └──────┘
         │
    POST /api/invitations/{token}/accept
         │
    Attach user to project
    Mark accepted_at = now()
    Redirect to /projects/{id}
```

## Decisions

### 1. Hybrid flow: direct-add vs. invitation
- **Rationale**: Most member adds will be for existing users (day-to-day team management). Adding friction for that majority case would hurt UX.
- **Approach**: Backend checks for an existing user first. Direct-add path is unchanged in speed; invitation path only activates when needed.

### 2. DB token over Laravel signed URLs
- **Rationale**: Signed URLs are stateless — they cannot be revoked. Admins need to be able to cancel a pending invite. The DB record also lets us display invite status in the UI.
- **Approach**: 64-char `bin2hex(random_bytes(32))` stored in `project_invitations.token`. Indexed for fast lookup.

### 3. 7-day expiry, resendable
- **Rationale**: Long enough to survive a busy week; short enough to limit stale links. Admins can cancel and re-invite if expired.
- **Approach**: `expires_at = now()->addDays(7)` on creation. The accept endpoint checks `expires_at > now()` and `accepted_at IS NULL`.

### 4. Duplicate invite guard
- **Rationale**: Clicking "Add Member" twice should not send two emails.
- **Approach**: On `store`, query for an existing non-expired, non-accepted invite for `(project_id, email)`. If found, return 409 with message "An invitation is already pending for this email."

### 5. Accept requires authentication
- **Rationale**: We need a `user_id` to attach to the project. Magic-link login adds complexity and security surface area.
- **Approach**: The `/invitations/[token]` frontend page checks `AuthContext`. If not logged in, it stores the token in `sessionStorage` and redirects to `/login` (or `/register` if new user). After auth, the redirect param brings them back to the accept page, which then calls the accept API.

### 6. Register page carries invite token
- **Rationale**: New users arriving via an invite link will most likely register (not log in). After registration, the existing auth redirect must not lose the token.
- **Approach**: `/register?invite=[token]` — the register page reads this query param, stores it in `sessionStorage`, and after successful registration redirects to `/invitations/[token]` instead of `/dashboard`.

### 7. Notification email for direct adds
- **Rationale**: A user silently appearing in a new project is confusing. A brief "You've been added to X by Y" email sets context.
- **Approach**: New `MemberAddedMail` Mailable fired from `ProjectMemberController::store()` after `->attach()`.

## Risks / Trade-offs

- **[Risk] Email delivery** → **Mitigation**: Use Laravel's queue for both Mailables. If the queue worker is not running in dev, mails go to the `log` driver — no blocking.
- **[Risk] Token enumeration** → **Mitigation**: 64-char cryptographically random token gives 2^256 space — brute force is not feasible.
- **[Risk] User registers then clicks old invite link** → **Mitigation**: The accept endpoint looks up the user by their authenticated session, not by the email on the token — so it works regardless of when they registered.
- **[Risk] Invite to an email that joins via Google OAuth** → **Mitigation**: After Google OAuth login, the auth redirect check and sessionStorage token approach still applies — Google OAuth returns the user to the frontend, which then auto-accepts.
