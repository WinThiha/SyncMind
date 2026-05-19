## Why

The Android app currently stops at authenticated project listing, while the web app already lets users open a project and inspect its issue tracker. To continue porting the current web app progress, Android needs a navigable project detail surface and read-only issue list backed by the existing Laravel API.

## What Changes

### Android
- Add project detail retrieval via `GET /api/projects/{project}`.
- Add issue list retrieval via `GET /api/projects/{project}/issues`.
- Add serializable Android models for project detail members and issues.
- Add navigation from the project list to a project detail screen.
- Add a project detail screen with a tab-like overview/issues layout.
- Add a read-only issue list that shows key, summary, status, priority, assignee, and comment count.

## Capabilities

### Modified Capabilities
- `005-android-app-setup`: Extend the mobile app beyond project list into project detail and issue browsing.
- `003-issue-management`: Expose existing project issue list capability in the Android client.

## Impact

- **Android UX**: Users can open a project and inspect its issues from Android.
- **Backend**: No backend API changes expected; Android consumes existing endpoints.
- **Scope**: This change does not add issue create/edit/delete, comments, AI summaries, milestones, wiki, or project member management.
