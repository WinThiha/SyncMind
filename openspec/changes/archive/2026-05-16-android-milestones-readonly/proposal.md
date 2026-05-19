## Why

The web app includes project milestones with progress, status, dates, and overdue state. Android currently shows projects and issues but no milestone visibility, leaving another core project planning surface unported.

## What Changes

### Android
- Add milestone list retrieval via `GET /api/projects/{project}/milestones`.
- Add serializable milestone models matching the backend and web API shape.
- Load milestones alongside project detail data.
- Render a read-only milestone section in the Android project detail screen.

## Capabilities

### Modified Capabilities
- `005-android-app-setup`: Extend Android project detail with milestone visibility.
- Milestone management: Add Android read-only milestone browsing.

## Impact

- **Android UX**: Users can inspect project milestones, status, dates, overdue state, and progress.
- **Backend**: No backend API changes expected.
- **Scope**: This change does not add milestone create/edit/delete, milestone detail, or AI milestone actions.
