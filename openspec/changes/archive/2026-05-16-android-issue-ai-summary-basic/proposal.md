# Android issue AI thread summary

## Summary
Port the web app's AI issue thread summary action to Android issue detail screens.

## Motivation
The web issue detail view can call `POST /api/projects/{project}/issues/{issue_key}/ai/summarize` and render an AI-generated thread summary. Android issue detail currently shows comments and history but has no AI summary action.

## Scope
- Add Android models for AI thread summary responses.
- Add a Retrofit endpoint and repository method for issue AI summarization.
- Add view model state/action for loading an issue summary.
- Render the summary, decisions, consensus, and action items on the issue detail screen.
- Validate with Android unit tests.

## Out of Scope
- AI issue field suggestions.
- Similar issue search.
- Milestone and wiki AI helpers.
- Backend AI prompt or cache changes.
