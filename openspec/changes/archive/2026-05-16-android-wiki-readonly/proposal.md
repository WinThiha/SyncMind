## Why

The web app includes project wiki pages with list and detail views. Android currently has no wiki surface, so mobile users cannot inspect project documentation.

## What Changes

### Android
- Add wiki page list retrieval via `GET /api/projects/{project}/wiki`.
- Add wiki page detail retrieval via `GET /api/projects/{project}/wiki/{wikiPage}`.
- Add serializable wiki models.
- Render a read-only wiki section in project detail.
- Add navigation to a wiki page reader screen.

## Capabilities

### Modified Capabilities
- Project wiki: Add Android read-only wiki browsing.
- `005-android-app-setup`: Extend Android project detail with wiki navigation.

## Impact

- **Android UX**: Users can browse and read project wiki pages.
- **Backend**: No backend API changes expected.
- **Scope**: This change does not add wiki create/edit/delete or AI wiki chat/draft.
