## Why

Android can display project milestones, but users cannot create them. The web app supports milestone creation, so Android needs a basic create milestone flow to continue porting project planning functionality.

## What Changes

### Android
- Add milestone creation via `POST /api/projects/{project}/milestones`.
- Add a create milestone screen for name, description, start date, due date, and status.
- Add a create milestone entry point from the project detail milestone section.
- Return to project detail after successful creation.

## Capabilities

### Modified Capabilities
- Milestone management: Add Android basic milestone creation.
- `005-android-app-setup`: Extend Android project detail with milestone creation navigation.

## Impact

- **Android UX**: Users can create milestones from Android.
- **Backend**: No backend API changes expected.
- **Scope**: Milestone editing, deletion, detail view, issue assignment, and AI milestone actions are not included.
