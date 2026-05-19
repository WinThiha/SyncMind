## Why

Android can list and open projects, but users still cannot create projects from mobile. The web app supports project creation with name, key, icon, and issue types, so Android needs a matching basic create flow.

## What Changes

### Android
- Add project creation via `POST /api/projects`.
- Add a create project screen for name, key, icon URL, and comma-separated issue types.
- Add a create project entry point from the project list.
- Navigate to the created project after success.

## Capabilities

### Modified Capabilities
- Project management: Add Android basic project creation.
- `005-android-app-setup`: Extend Android navigation with project creation.

## Impact

- **Android UX**: Users can create projects from Android.
- **Backend**: No backend API changes expected.
- **Scope**: Project edit/delete, ownership transfer, member management, categories, and versions are not included.
