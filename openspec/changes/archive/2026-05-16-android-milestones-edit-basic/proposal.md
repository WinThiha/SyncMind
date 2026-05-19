## Why

Android can list and create milestones, but users cannot update milestone details. The web app supports milestone editing, so Android needs a basic edit flow for project planning parity.

## What Changes

### Android
- Add milestone detail retrieval via `GET /api/projects/{project}/milestones/{milestone}`.
- Add milestone update via `PATCH /api/projects/{project}/milestones/{milestone}`.
- Make milestone items open an edit screen.
- Add an edit milestone screen for name, description, start date, due date, and status.
- Return to project detail after successful save.

## Capabilities

### Modified Capabilities
- Milestone management: Add Android basic milestone editing.
- `005-android-app-setup`: Extend Android milestone navigation and mutation support.

## Impact

- **Android UX**: Users can edit milestones from Android.
- **Backend**: No backend API changes expected.
- **Scope**: Milestone deletion, AI actions, and milestone issue drilldown are not included.
