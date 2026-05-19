# Design

## Backend Contract
Android will call:

`GET issues/ai/similar?project_id={id}&text={query}`

The endpoint requires a project id and query text. The existing project repository can load the user's projects for the picker.

## UI
Add an `AI similar search` section to the global issues screen:

- Project selector using existing project names/keys.
- Text input for the query.
- Search button with loading/error states.
- Read-only result list with issue key, similarity score, summary, project, status, and priority.
