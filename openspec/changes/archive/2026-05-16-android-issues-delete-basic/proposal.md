## Why

Android can create, read, edit, and comment on issues, but cannot delete them. The web app supports issue deletion, so Android needs a basic delete action to complete the core issue CRUD loop.

## What Changes

### Android
- Add issue deletion via `DELETE /api/projects/{project}/issues/{key}`.
- Add delete state to issue detail.
- Add a delete action with confirmation on issue detail.
- Navigate back to project detail after successful deletion.

## Capabilities

### Modified Capabilities
- `003-issue-management`: Add Android basic issue deletion.

## Impact

- **Android UX**: Users can delete issues from Android.
- **Backend**: No backend API changes expected.
- **Scope**: Restore/undo and bulk deletion are not included.
