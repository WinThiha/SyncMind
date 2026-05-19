## Why

The web/backend project API supports deleting a project, but Android currently only supports listing, viewing, creating, and editing projects. Android users need the same basic destructive project management action when they are allowed to delete a project.

## What Changes

- Add Android API/repository support for `DELETE /projects/{project}`.
- Add a delete action to the project detail screen with confirmation.
- Navigate back to the project list after successful deletion.

## Impact

- Android project detail UI
- Android project API service and repository
- Android navigation callback from project detail to project list
