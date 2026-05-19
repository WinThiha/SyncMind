# Android project ownership transfer

## Summary
Port the web app's project ownership transfer action to Android by allowing a project creator to transfer ownership to an existing project admin from the project members screen.

## Motivation
The backend exposes `POST /api/projects/{project}/transfer`, but Android currently has no model, repository method, or UI action for it. This leaves Android unable to perform a project administration workflow already available in the web app.

## Scope
- Add Android request/response models for project ownership transfer.
- Add the Retrofit endpoint and repository wrapper for `POST projects/{projectId}/transfer`.
- Add a transfer action in the project members UI for admin members.
- Refresh project member state after a successful transfer and surface backend success/error messages.
- Validate with Android unit tests.

## Out of Scope
- Changing backend transfer authorization or validation rules.
- Adding a separate owner-management screen.
- Porting public invitation acceptance or AI workflows.
