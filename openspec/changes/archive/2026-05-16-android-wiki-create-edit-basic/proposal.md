## Why

Android can browse and read project wiki pages, but users cannot create or edit documentation from mobile. The web app supports wiki creation and editing, so Android needs basic wiki mutation support.

## What Changes

### Android
- Add wiki page creation via `POST /api/projects/{project}/wiki`.
- Add wiki page update via `PATCH /api/projects/{project}/wiki/{wikiPage}`.
- Add create wiki and edit wiki routes/screens.
- Add a create wiki entry point from project detail.
- Add an edit action from wiki page reader.

## Capabilities

### Modified Capabilities
- Project wiki: Add Android basic wiki create/edit support.
- `005-android-app-setup`: Extend Android wiki navigation with mutation flows.

## Impact

- **Android UX**: Users can create and edit project wiki pages from Android.
- **Backend**: No backend API changes expected.
- **Scope**: Wiki delete, markdown preview, and AI wiki chat/draft are not included.
