## Phase 1 — Backend: Data Model & Core Logic

- [x] 1.1 Create migration `create_project_invitations_table` — columns: `id`, `project_id` (FK cascade), `email`, `role`, `token` (unique), `invited_by` (FK set null), `accepted_at` (nullable timestamp), `expires_at`, `timestamps`
- [x] 1.2 Create `App\Models\ProjectInvitation` model — fillable fields, `belongsTo Project`, `belongsTo User` (as `inviter`), `isPending()` helper (accepted_at null AND expires_at > now)
- [x] 1.3 Update `ProjectMemberController::store()` — remove `exists:users,email` rule; look up user by email first; if found → attach + queue `MemberAddedMail`; if not found → delegate to invitation creation logic

## Phase 2 — Backend: Invitation Controller & Routes

- [x] 2.1 Create `App\Http\Controllers\ProjectInvitationController` with:
  - `index(Project)` — return pending (non-expired, non-accepted) invitations for the project
  - `store(Request, Project)` — check duplicate guard → create `ProjectInvitation` with `bin2hex(random_bytes(32))` token, `expires_at = now()->addDays(7)` → queue `ProjectInvitationMail`
  - `destroy(Project, ProjectInvitation)` — delete if still pending; 422 if already accepted
- [x] 2.2 Create `App\Http\Controllers\ProjectInvitationAcceptController` with:
  - `show(token)` — public endpoint; return invite info (project name, role, inviter name, expiry) without exposing sensitive data; 404 if token invalid, 410 if expired/accepted
  - `accept(Request, token)` — auth required; validate token is pending; attach `$request->user()` to project with the invite's role; set `accepted_at`; return project id for redirect
- [x] 2.3 Register routes in `backend/routes/api.php`:
  - Under `auth:sanctum` group: `Route::apiResource('projects.invitations', ProjectInvitationController::class)->only(['index', 'store', 'destroy'])`
  - Public (no auth middleware): `Route::get('/invitations/{token}', [ProjectInvitationAcceptController::class, 'show'])`
  - Under `auth:sanctum`: `Route::post('/invitations/{token}/accept', [ProjectInvitationAcceptController::class, 'accept'])`

## Phase 3 — Backend: Mailables

- [x] 3.1 Create `App\Mail\ProjectInvitationMail` — constructor accepts `ProjectInvitation $invitation`; builds accept URL as `config('app.frontend_url').'/invitations/'.$invitation->token`; uses `envelope()` / `content()` / `attachments()` Mailable API
- [x] 3.2 Create Blade email template `resources/views/emails/project-invitation.blade.php` — shows project name, inviter name, role, expiry date, and a prominent "Accept Invitation" button linking to the frontend accept URL
- [x] 3.3 Create `App\Mail\MemberAddedMail` — constructor accepts `User $invitee`, `Project $project`, `User $addedBy`; notifies an existing user they have been added
- [x] 3.4 Create Blade email template `resources/views/emails/member-added.blade.php` — shows project name, who added them, their role, and a "Go to Project" button

## Phase 4 — Backend: Authorization & Policy

- [x] 4.1 Update `App\Policies\ProjectPolicy` — add `manageInvitations(User $user, Project $project)` — same rule as `manageMembers` (admin or owner)
- [x] 4.2 Apply policy checks in `ProjectInvitationController` — `$request->user()->cannot('manageInvitations', $project)` → abort 403

## Phase 5 — Backend: Tests

- [x] 5.1 Create `tests/Feature/ProjectInvitationTest.php` with cases:
  - Admin can invite a non-existing email → invitation record created, 200 response
  - Admin inviting existing user → user added directly, no invitation record, 201
  - Duplicate pending invite returns 409
  - Non-admin cannot create invitation (403)
  - Admin can cancel a pending invitation
  - Cannot cancel an already-accepted invitation (422)
  - `GET /api/invitations/{token}` returns invite info for valid token
  - `GET /api/invitations/{token}` returns 410 for expired token
  - `POST /api/invitations/{token}/accept` — authenticated user is added to project
  - `POST /api/invitations/{token}/accept` — unauthenticated returns 401
  - `POST /api/invitations/{token}/accept` — expired token returns 410
- [x] 5.2 Run `php artisan test` — all tests pass (11/11 invitation tests pass; 14 pre-existing failures unrelated to this change)
- [x] 5.3 Run `./vendor/bin/pint` — no linting errors

## Phase 6 — Frontend: API Client

- [x] 6.1 Add to `frontend/src/lib/api/projects.ts`:
  - `getProjectInvitations(projectId)` → `GET /api/projects/{id}/invitations`
  - `createProjectInvitation(projectId, data: { email, role })` → `POST /api/projects/{id}/invitations`
  - `cancelProjectInvitation(projectId, invitationId)` → `DELETE /api/projects/{id}/invitations/{invId}`
- [x] 6.2 Create `frontend/src/lib/api/invitations.ts`:
  - `getInvitation(token)` → `GET /api/invitations/{token}`
  - `acceptInvitation(token)` → `POST /api/invitations/{token}/accept`

## Phase 7 — Frontend: MemberManagement Component

- [x] 7.1 Add `pendingInvitations` state to `MemberManagement.tsx`; fetch from `getProjectInvitations` alongside existing members fetch
- [x] 7.2 Add pending invitations list section below the active members list — show email, role badge, expiry date, and a cancel (×) button per invite; section only visible to admins
- [x] 7.3 Update `handleAddMember` — catch the new 200 "invitation sent" response shape (distinct from 201 "added") and show a success banner "Invitation sent to [email]" instead of reloading the member list
- [x] 7.4 Implement `handleCancelInvitation(invitationId)` — calls `cancelProjectInvitation`, removes from `pendingInvitations` state on success

## Phase 8 — Frontend: Accept Invite Page

- [x] 8.1 Create `frontend/src/app/invitations/[token]/page.tsx` — on mount: call `getInvitation(token)` to fetch invite details; display project name, inviter, role, and expiry
- [x] 8.2 If user is authenticated (check `AuthContext`): show "Join [Project]" confirm button → on click call `acceptInvitation(token)` → on success redirect to `/projects/{projectId}`
- [x] 8.3 If user is not authenticated: show "Log in to accept" and "Create account to accept" buttons; store token in `sessionStorage('pendingInviteToken')` before redirecting to `/login?redirect=/invitations/[token]` or `/register?invite=[token]`
- [x] 8.4 Handle error states: expired token (410) → "This invitation has expired" message; already-accepted (422) → "You are already a member"; invalid token (404) → "Invalid invitation link"

## Phase 9 — Frontend: Register Page & Login Redirect

- [x] 9.1 Update `frontend/src/app/(auth)/register/page.tsx` — on mount read `?invite` query param; store in `sessionStorage('pendingInviteToken')` if present
- [x] 9.2 After successful registration, if `sessionStorage('pendingInviteToken')` exists → redirect to `/invitations/[token]` instead of `/dashboard`
- [x] 9.3 Update `frontend/src/app/(auth)/login/page.tsx` — after successful login, if `sessionStorage('pendingInviteToken')` exists → redirect to `/invitations/[token]` instead of `/dashboard`

## Phase 10 — Verification

- [x] 10.1 Run `npm run build` in `frontend/` — no type errors, `/invitations/[token]` route visible in build output
- [x] 10.2 Run `npm run lint` in `frontend/` — no new errors in changed/created files; pre-existing errors untouched
- [ ] 10.3 Manual smoke test — invite flow for non-existing user: send invite → receive email → click link → register → auto-redirect to accept page → join project → land on project page
- [ ] 10.4 Manual smoke test — invite flow for existing user: add by email → added immediately → receive notification email → project appears in their dashboard
- [ ] 10.5 Manual smoke test — cancel invite: pending invite appears in Members panel → admin cancels → invite removed; old link returns 410
- [ ] 10.6 Dark mode audit — pending invitations section and accept page match existing glass UI aesthetic
