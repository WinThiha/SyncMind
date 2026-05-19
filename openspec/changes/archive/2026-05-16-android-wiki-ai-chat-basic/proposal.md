# Android wiki AI chat

## Summary
Port the web app's wiki AI chat endpoint to Android wiki page screens.

## Motivation
The web app exposes `POST /api/projects/{project}/wiki/ai/chat` so users can ask questions against project wiki knowledge. Android wiki pages currently show content only.

## Scope
- Add Android wiki AI chat request/response models.
- Add Retrofit endpoint and repository method for wiki AI chat.
- Add wiki page view model chat state and history.
- Add wiki page UI for asking a question and displaying the answer.
- Validate with Android unit tests.

## Out of Scope
- Wiki draft generation.
- Rich markdown rendering.
- Locale selection beyond the default English locale.
