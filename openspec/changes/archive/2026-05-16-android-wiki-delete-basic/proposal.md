## Why

Android can now create, read, and edit wiki pages, but cannot delete them. The web app supports wiki deletion, so Android needs a basic delete action to complete the core wiki CRUD loop.

## What Changes

### Android
- Add wiki deletion via `DELETE /api/projects/{project}/wiki/{wikiPage}`.
- Add a delete action with confirmation on the wiki reader screen.
- Navigate back to project detail after successful deletion.

## Capabilities

### Modified Capabilities
- Project wiki: Add Android basic wiki deletion.

## Impact

- **Android UX**: Users can delete wiki pages from Android.
- **Backend**: No backend API changes expected.
- **Scope**: Trash/restore and bulk delete are not included.
