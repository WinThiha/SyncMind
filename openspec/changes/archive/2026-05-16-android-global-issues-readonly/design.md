# Design

## Backend Contract
Android will call:

- `GET issues`
- `GET issues/summary`

The global issue objects mostly match existing `Issue` fields and include project metadata. Android will extend the existing issue model with optional project display fields.

## UI
Add an action from the project list top bar to a global issues screen. The screen renders summary counts and the latest global issues read-only.
