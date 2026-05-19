# Android create issue AI assist

## Summary
Port the web app's AI-assisted create issue workflow to Android.

## Motivation
The web create issue form can ask AI to suggest fields from a summary and surface similar existing issues. Android's create issue form is currently manual only.

## Scope
- Add Android models for issue AI suggestions and similar issues.
- Add Retrofit endpoints and repository methods for `suggest-issue` and `similar-issues`.
- Add create issue view model actions for requesting and applying AI suggestions.
- Render AI suggestion state and similar issue results on the create issue screen.
- Validate with Android unit tests.

## Out of Scope
- Global issue search AI.
- Assignee assignment on create, since the current Android create issue request does not expose assignee fields.
- Backend AI changes.
