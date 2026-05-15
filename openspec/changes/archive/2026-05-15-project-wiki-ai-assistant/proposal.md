## Why

SyncMind tracks work — issues, milestones, comments — but has no place for team knowledge. Architecture decisions, onboarding guides, API conventions, and process documentation currently live outside the tool (Notion, Confluence, scattered docs), forcing teams to context-switch constantly and leaving new members with no single source of truth tied to the project they're working in.

Additionally, the existing AI features (issue suggestions, semantic search, thread summarization) are each scoped to individual records. There is no AI that understands the project as a whole and can answer questions across all its documentation.

## What Changes

- **Project wiki**: Each project gains a wiki — a collection of markdown pages where the team documents architecture, conventions, process, and decisions. All project members can view pages. Only project admins and owners can create, edit, and delete pages.
- **AI chat panel**: A persistent chat panel appears on all wiki pages. Any project member can ask questions in natural language. The AI answers by searching the wiki semantically (RAG over page embeddings) and synthesizing an answer from the most relevant pages.
- **AI page drafting**: When an admin creates or edits a page, an "Ask AI to draft" button lets them describe what the page should cover. The AI generates a markdown draft using existing project context (wiki pages, issues, milestones) that the admin can review and save.
- **Markdown editor**: Admins get a split-pane editor — raw markdown on the left, rendered preview on the right — built on the already-installed `react-markdown` library with a formatting toolbar.

## Capabilities

### New Capabilities
- `project-wiki`: Per-project markdown wiki with CRUD, access control, and full-text + semantic page search.
- `wiki-ai-assistant`: RAG-based Q&A chat panel and AI page drafting integrated into the wiki.

## Impact

- **Backend**: New `wiki_pages` table + `WikiPage` model, `WikiPageObserver` (auto-embeds on save), `GenerateWikiEmbeddingJob`, `WikiPagePolicy`, `WikiPageController` (CRUD), `AIWikiController` (chat + draft), `AIWikiService` (RAG + draft logic), routes.
- **Frontend**: New wiki route group under `dashboard/projects/[id]/wiki/`, `WikiPageList`, `WikiPageView`, `WikiPageEditor`, `WikiChatPanel`, `WikiChatMessage` components, API client wrappers.
- **Database**: One new migration for `wiki_pages` table with a `vector` embedding column.
- **No new npm packages**: Editor uses a custom split-pane built on `react-markdown` (already installed) and `textarea`.
