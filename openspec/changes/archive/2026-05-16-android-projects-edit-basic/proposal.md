## Why

Android can create and open projects, but users cannot update project settings. The web app supports editing project name and issue types, so Android needs a basic project edit flow.

## What Changes

### Android
- Add project update via `PUT /api/projects/{project}`.
- Add a project edit screen for name, icon URL, and comma-separated issue types.
- Add an edit action from project detail.
- Navigate back to project detail after save.

## Capabilities

### Modified Capabilities
- Project management: Add Android basic project editing.
- `005-android-app-setup`: Extend Android project navigation with editing.

## Impact

- **Android UX**: Users can edit core project settings from Android.
- **Backend**: No backend API changes expected.
- **Scope**: Project delete, ownership transfer, categories, versions, members, and invitations are not included.
