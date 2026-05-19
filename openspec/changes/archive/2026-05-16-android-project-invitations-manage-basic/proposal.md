## Why

The web member management screen shows pending project invitations and lets admins cancel them. Android member management can add/invite by email but does not yet show or cancel pending invitations.

## What Changes

- Add Android models and API/repository methods for project invitations.
- Load pending invitations on the project members screen.
- Render pending invitations and support cancelling them.

## Impact

- Android project API service and repository
- Android project member management ViewModel/screen
