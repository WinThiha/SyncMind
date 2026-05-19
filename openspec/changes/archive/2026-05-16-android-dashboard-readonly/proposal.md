# Android dashboard read-only

## Summary
Port the web app's dashboard overview to Android as a read-only screen.

## Motivation
The web app uses `/dashboard` as the authenticated landing page with summary metrics, assigned work, upcoming work, project health, and recent activity. Android currently starts at the project list and has no equivalent overview.

## Scope
- Add Android dashboard response models.
- Add a Retrofit endpoint and repository method for `GET dashboard`.
- Add dashboard view model and screen.
- Add navigation from the project list to the dashboard.
- Validate with Android unit tests.

## Out of Scope
- Global issue filtering page.
- Dashboard charting or advanced visual treatment.
- Changing Android start destination.
