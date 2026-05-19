## Why

Android can read issue comments but cannot add new comments. The web app supports posting comments from the issue detail page, so this is a core issue collaboration workflow still missing from the Android port.

## What Changes

### Android
- Add issue comment creation via `POST /api/projects/{project}/issues/{key}/comments`.
- Add request/response models for comment creation.
- Add comment draft/submission state to issue detail.
- Render a comment input and post button below existing comments.
- Refresh issue detail after a successful comment post.

## Capabilities

### Modified Capabilities
- `003-issue-management`: Add Android support for posting issue comments.
- `005-android-app-setup`: Extend Android issue detail with mutation state.

## Impact

- **Android UX**: Users can participate in issue discussions from Android.
- **Backend**: No backend API changes expected.
- **Scope**: Email notification toggling, markdown preview, and comment editing/deleting are not included.
