## Why

The backend exposes milestone deletion, but Android currently only supports milestone listing, creation, and editing. Users need basic parity for removing milestones from Android.

## What Changes

- Add Android API/repository support for `DELETE /projects/{project}/milestones/{milestone}`.
- Add a delete action with confirmation to the milestone edit screen.
- Navigate back to the project detail screen after successful deletion.

## Impact

- Android project API service and repository
- Android milestone edit ViewModel/screen
- Android navigation callback from milestone edit to project detail
