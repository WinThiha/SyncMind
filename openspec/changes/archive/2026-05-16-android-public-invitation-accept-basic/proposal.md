# Android public invitation acceptance

## Summary
Port the web app's public project invitation acceptance flow to Android by adding an invitation detail screen that can fetch invitation metadata and accept a pending invitation.

## Motivation
The backend and web app support `/invitations/{token}` links and authenticated acceptance through `POST /api/invitations/{token}/accept`. Android currently only supports managing pending invitations inside a project; it cannot open or accept an invitation token directly.

## Scope
- Add Android models for invitation preview and acceptance responses.
- Add an invitation API service for `GET invitations/{token}` and `POST invitations/{token}/accept`.
- Add repository and view model logic for loading and accepting an invitation.
- Add an Android invitation screen and navigation route.
- Add a basic app link intent filter for `/invitations/{token}` URLs.
- Validate with Android unit tests.

## Out of Scope
- Full login redirect persistence for unauthenticated invitation tokens.
- Account registration from the invitation screen.
- Changing backend invitation expiration or membership behavior.
