# Design

## Backend Contract
Android will call:

`POST projects/{projectId}/milestones/{milestoneId}/ai/suggest-dates`

with:

```json
{
  "context": null
}
```

The response reuses the milestone date suggestion shape with `start_date`, `due_date`, and `rationale`.

## UI
Add a `Suggest dates` button near the date fields on `EditMilestoneScreen`. On success, apply any returned date values to the existing inputs and display the rationale.
