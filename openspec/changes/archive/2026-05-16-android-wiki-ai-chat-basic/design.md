# Design

## Backend Contract
Android will call:

`POST projects/{projectId}/wiki/ai/chat`

with `message`, `history`, and `locale`. The backend returns `{ "answer": "..." }`.

## UI
Add an `Ask wiki AI` section below wiki page content. Users can type a question, submit it, and see the latest answer. The view model stores lightweight user/assistant history and sends it on subsequent requests.
