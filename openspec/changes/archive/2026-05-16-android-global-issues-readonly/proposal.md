# Android global issues read-only

## Summary
Port the web app's global issues overview to Android as a read-only issue list with summary counts.

## Motivation
The web app has an `/issues` page backed by `GET /api/issues` and `GET /api/issues/summary`. Android currently only shows issues inside a project detail screen.

## Scope
- Add Android response models for global issue summary.
- Add Retrofit endpoints and repository methods for global issues and summary.
- Add global issues view model and screen.
- Add navigation from the project list to global issues.
- Validate with Android unit tests.

## Out of Scope
- Advanced filters.
- Global AI similar issue search.
- Inline issue preview/editing from the global list.
