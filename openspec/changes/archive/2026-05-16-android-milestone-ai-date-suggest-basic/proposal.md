# Android milestone AI date suggestions

## Summary
Port the web app's AI date suggestion action for new milestones to Android.

## Motivation
The web create milestone form can call `POST /api/projects/{project}/ai/suggest-milestone-dates` to fill start and due dates from milestone context. Android create milestone currently requires manual date entry.

## Scope
- Add Android models for milestone date suggestion requests and responses.
- Add the Retrofit endpoint and repository method for new milestone date suggestions.
- Add create milestone view model state/action to request and apply suggested dates.
- Add a UI action and status/rationale display to the create milestone screen.
- Validate with Android unit tests.

## Out of Scope
- AI suggestions for existing milestone dates.
- Milestone summary, risk analysis, and issue suggestions.
- Backend AI changes.
