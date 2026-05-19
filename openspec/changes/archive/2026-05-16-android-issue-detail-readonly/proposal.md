## Why

Android can now browse project issues, but the web app also lets users open an issue to inspect its full details, comments, and change history. To continue porting the current web app progress, Android needs read-only issue detail navigation backed by the existing issue show endpoint.

## What Changes

### Android
- Add issue detail retrieval via `GET /api/projects/{project}/issues/{key}`.
- Extend issue models for comments and history returned by the backend show payload.
- Add navigation from issue list items to an issue detail screen.
- Add a read-only issue detail screen showing summary, status, priority, type, description, people, dates, comments, and history.

## Capabilities

### Modified Capabilities
- `003-issue-management`: Add Android read-only issue detail inspection.
- `005-android-app-setup`: Extend Android navigation and Compose screens for issue detail.

## Impact

- **Android UX**: Users can open an issue from a project and inspect the same core issue data visible on the web.
- **Backend**: No backend API changes expected.
- **Scope**: This change does not add editing, deleting, commenting, AI summaries, or similar issue search.
