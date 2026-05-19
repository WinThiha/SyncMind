# Android global issues AI similar search

## Summary
Port the web app's global AI similar issue search to Android.

## Motivation
The backend exposes `GET /api/issues/ai/similar` and the web global issues page can use AI-assisted similarity search across project issues. Android now has a global issues screen, but it only shows the standard issue list and summary counts.

## Scope
- Extend Android similar issue models with global issue metadata.
- Add Retrofit endpoint and repository method for `GET issues/ai/similar`.
- Add global issues view model state/actions for project selection and AI search.
- Add UI for selecting a project, entering search text, and rendering similar issue results.
- Validate with Android unit tests.

## Out of Scope
- Advanced status/priority/type/date filters for global AI search.
- Opening a similar result directly in issue detail.
- Backend AI search changes.
