# Android milestone AI issue suggestions

## Summary
Port the web app's AI milestone issue suggestions to Android as read-only recommendations.

## Motivation
The backend and web milestone AI panel can suggest issues that may belong to a milestone. Android currently exposes milestone summary, risk, and date suggestions but not issue suggestions.

## Scope
- Add Android models for milestone issue suggestion request/response.
- Add Retrofit endpoint and repository method for `POST projects/{project}/milestones/{milestone}/ai/suggest-issues`.
- Add edit milestone view model state/action.
- Render suggested issues, scores, and reasons on the edit milestone screen.
- Validate with Android unit tests.

## Out of Scope
- Adding suggested issues to the milestone from Android.
- Extending issue update forms or requests for milestone assignment.
