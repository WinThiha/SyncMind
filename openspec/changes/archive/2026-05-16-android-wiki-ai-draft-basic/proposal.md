# Android wiki AI draft

## Summary
Port the web app's AI wiki draft generation to Android wiki page forms.

## Motivation
The web wiki editor can generate draft content from a prompt through `POST /api/projects/{project}/wiki/ai/draft`. Android create/edit wiki forms currently require fully manual content entry.

## Scope
- Add Android wiki AI draft request/response models.
- Add Retrofit endpoint and repository method for wiki AI draft.
- Add draft prompt/state/action to create and edit wiki view models.
- Add shared form UI for generating draft content and applying it to the content field.
- Validate with Android unit tests.

## Out of Scope
- Rich markdown editing.
- Locale selection beyond default English.
- Wiki AI chat, already covered separately.
