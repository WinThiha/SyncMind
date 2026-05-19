# Design

## Backend Contract
Android will call:

`POST projects/{projectId}/wiki/ai/draft`

with `{ "prompt": "...", "locale": "en" }`. The backend returns `{ "content": "..." }`.

## UI
Add an AI draft prompt field and generate button to the shared wiki form. A successful draft replaces the current content field, matching the web editor's apply behavior.
