# Design

## Backend Contract
Android will call `GET dashboard`. The response data contains:

- `summary`
- `my_work`
- `upcoming`
- `project_health`
- `recent_activity`

## UI
Add a dashboard icon action to the project list top bar. The dashboard screen renders compact read-only sections and lets users navigate back to the project list.
