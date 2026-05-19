## Why

Android can now create and inspect issues, but users still cannot update issue fields from mobile. The web app supports issue editing, so Android needs a basic edit flow to continue closing issue management parity.

## What Changes

### Android
- Add issue update via `PATCH /api/projects/{project}/issues/{key}`.
- Add a basic edit issue screen populated from issue detail.
- Add navigation from issue detail to edit issue.
- Return to the updated issue detail after save.

## Capabilities

### Modified Capabilities
- `003-issue-management`: Add Android basic issue editing.
- `005-android-app-setup`: Extend Android navigation with an issue edit flow.

## Impact

- **Android UX**: Users can update core issue fields from Android.
- **Backend**: No backend API changes expected.
- **Scope**: Delete, assignee, milestone, category, version, and AI-assisted editing are not included.
