# Design

## Backend Contract
Android will call:

`POST projects/{projectId}/ai/suggest-milestone-dates`

with:

```json
{
  "name": "Release",
  "description": "Optional",
  "context": null
}
```

The response contains suggested `start_date`, `due_date`, and `rationale`.

## Android UI
The create milestone form will show a `Suggest dates` action after the name/description fields. The action requires a non-blank milestone name, applies any returned dates to the existing date inputs, and renders the rationale as supporting text.
