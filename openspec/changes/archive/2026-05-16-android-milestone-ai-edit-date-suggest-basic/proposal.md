# Android edit milestone AI date suggestions

## Summary
Port the web app's AI date suggestion action for existing milestones to Android edit milestone screens.

## Motivation
Android can now suggest dates for new milestones, but the web app also supports suggesting dates while editing an existing milestone. Android edit milestone still requires manual date edits.

## Scope
- Add Android request model for existing milestone date suggestions.
- Add Retrofit endpoint and repository method for `POST projects/{project}/milestones/{milestone}/ai/suggest-dates`.
- Add edit milestone view model state/action to request and apply suggested dates.
- Add a UI action and rationale display on the edit milestone screen.
- Validate with Android unit tests.

## Out of Scope
- Milestone summary, risk analysis, and issue suggestions.
- Backend AI changes.
