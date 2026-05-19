# Design

## Backend Contract
The Android client will use:

- `GET invitations/{token}` to load invitation metadata.
- `POST invitations/{token}/accept` to accept the invitation as the authenticated user.

The preview response shape is:

```json
{
  "data": {
    "project_id": 1,
    "project_name": "Example",
    "role": "admin",
    "position": "Lead",
    "inviter_name": "Alex",
    "expires_at": "2026-05-30T00:00:00Z"
  }
}
```

The accept response shape includes `message` and `project_id`.

## Android Data Layer
Create a separate `InvitationApiService` because these endpoints are not project-scoped resources. The existing authenticated OkHttp client can be reused; unauthenticated preview requests will be sent without an `Authorization` header when no token is stored.

## UI and Navigation
Add `Screen.Invitation` at `invitations/{token}` and support a URI pattern for browser/app links. The screen should:

- Fetch invitation details on entry.
- Display project, role, optional position, inviter, and expiry.
- Provide an accept action.
- Navigate to the accepted project detail when the backend returns `project_id`.
- Offer a login action for unauthenticated/expired auth states, but not persist redirect state in this slice.

## Risk
If an app link opens while logged out, the accept action may receive a 401 and clear any stale token. The screen should surface that as an error and offer navigation to login.
