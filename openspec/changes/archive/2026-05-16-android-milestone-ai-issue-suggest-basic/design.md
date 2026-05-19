# Design

## Backend Contract
Android will call:

`POST projects/{projectId}/milestones/{milestoneId}/ai/suggest-issues`

with `{ "limit": 10 }`. The backend returns issue suggestions with id, key, summary, score, and reason.

## UI
Add an `Issue suggestions` action under the existing AI insights section on `EditMilestoneScreen`. The output is read-only and lists the suggested issue key, score, summary, and reason.
