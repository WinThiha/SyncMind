## Why

Android can browse and comment on issues, but users still cannot create a new issue from mobile. The web app has a full create issue workflow; adding a basic Android create flow closes the first major issue mutation gap.

## What Changes

### Android
- Add issue creation via `POST /api/projects/{project}/issues`.
- Add a basic create issue screen for summary, description, issue type, priority, estimate, and due date.
- Add navigation from project detail to create issue.
- Navigate to the created issue after successful creation.

## Capabilities

### Modified Capabilities
- `003-issue-management`: Add Android basic issue creation.
- `005-android-app-setup`: Extend Android navigation with an issue creation flow.

## Impact

- **Android UX**: Users can create issues from Android.
- **Backend**: No backend API changes expected.
- **Scope**: Assignee, milestone selection, AI suggestions, duplicate search, and rich markdown editing are not included.
