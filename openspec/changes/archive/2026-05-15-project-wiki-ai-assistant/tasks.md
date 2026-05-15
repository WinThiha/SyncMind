## Phase 1 — Backend: Data Model

- [x] 1.1 Create migration `create_wiki_pages_table` — columns: `id`, `project_id` (FK cascade delete), `title` (string 255), `content` (text nullable), `author_id` (FK users set null on delete), `last_editor_id` (FK users nullable set null on delete), `embedding` (vector nullable — same dimensions as `issues.embedding`), `timestamps`; add composite index on `(project_id, title)`
- [x] 1.2 Create `App\Models\WikiPage` — fillable: `project_id`, `title`, `content`, `author_id`, `last_editor_id`; cast `embedding` to array; relationships: `belongsTo Project`, `belongsTo User` (as `author`), `belongsTo User` (as `lastEditor`); `$hidden = ['embedding']`; add `wikiPages()` HasMany to `Project` model
- [x] 1.3 Create `App\Jobs\GenerateWikiEmbeddingJob` — accepts `WikiPage $page`; follows exact same logic as `GenerateIssueEmbeddingJob`: calls embedding API, stores vector string back on `wiki_pages.embedding` via raw update
- [x] 1.4 Create `App\Observers\WikiPageObserver` — `created()` and `updated()` dispatch `GenerateWikiEmbeddingJob`; register in `AppServiceProvider::boot()` via `WikiPage::observe(WikiPageObserver::class)`

## Phase 2 — Backend: Authorization & CRUD

- [x] 2.1 Create `App\Policies\WikiPagePolicy` — `viewAny(User, Project)` and `view(User, WikiPage)`: return true if user is project member; `create(User, Project)`, `update(User, WikiPage)`, `delete(User, WikiPage)`: return true if user is project admin or owner; register in `AppServiceProvider` via `Gate::policy(WikiPage::class, WikiPagePolicy::class)`
- [x] 2.2 Create `App\Http\Controllers\WikiPageController` with:
  - `index(Project)` — authorize `viewAny`; return paginated list (id, title, author name, last_editor name, timestamps); no `content` or `embedding`
  - `store(Request, Project)` — authorize `create`; validate `title` required string max:255, `content` nullable string; create with `author_id = $request->user()->id`; return full page resource
  - `show(Project, WikiPage)` — authorize `view`; return full page including `content`
  - `update(Request, Project, WikiPage)` — authorize `update`; validate same fields; update with `last_editor_id = $request->user()->id`; return updated resource
  - `destroy(Project, WikiPage)` — authorize `delete`; delete and return 204
- [x] 2.3 Register wiki routes in `backend/routes/api.php` inside the `auth:sanctum` + `throttle:api` group:
  - `Route::apiResource('projects.wiki', WikiPageController::class)->parameters(['wiki' => 'wikiPage'])`
  - `Route::post('projects/{project}/wiki/ai/chat', [AIWikiController::class, 'chat'])`
  - `Route::post('projects/{project}/wiki/ai/draft', [AIWikiController::class, 'draft'])`

## Phase 3 — Backend: AI Services

- [x] 3.1 Create `App\Services\AIWikiService` — resolves `ChatCompletionClient` via constructor injection and embedding config; two public methods:
  - `chat(Project $project, string $message, array $history = []): string` — embeds `$message` using embedding API (same HTTP call as `AIIssueSearchService`); cosine search `wiki_pages` for top 3 pages (`whereNotNull('embedding')`, scoped to project); assembles system prompt with retrieved page content (each truncated to 2000 chars); appends last 10 turns from `$history`; calls `chatClient->complete()`; returns answer string
  - `draft(Project $project, string $prompt): string` — fetches all wiki page titles + content (truncated to 500 chars each), last 20 issues (summary + status), active milestones (name + status + progress %); assembles system prompt instructing model to write a structured markdown wiki page; calls `chatClient->complete()`; returns markdown string
- [x] 3.2 Bind `AIWikiService` in `AppServiceProvider::register()` — `$this->app->singleton(AIWikiService::class)`
- [x] 3.3 Create `App\Http\Controllers\AIWikiController` with:
  - `chat(Request $request, Project $project)` — authorize via `WikiPagePolicy::viewAny`; validate `message` required string max:1000, `history` array max:20 (each item: `role` in [user,assistant], `content` string); call `AIWikiService::chat()`; return `{ answer: string }`
  - `draft(Request $request, Project $project)` — authorize that user is project admin or owner (reuse WikiPagePolicy or inline check); validate `prompt` required string max:500; call `AIWikiService::draft()`; return `{ content: string }`

## Phase 4 — Backend: Tests

- [x] 4.1 Create `tests/Feature/WikiPageTest.php` — test cases:
  - Any member can list wiki pages (`GET /api/projects/{project}/wiki` returns 200)
  - Any member can view a wiki page (`GET /api/projects/{project}/wiki/{wikiPage}` returns 200 with content)
  - Admin can create a wiki page (201, record in DB, author_id set)
  - Normal member cannot create a wiki page (403)
  - Admin can update a wiki page (200, last_editor_id updated)
  - Normal member cannot update (403)
  - Admin can delete a wiki page (204, record removed)
  - Non-member cannot access any wiki route (403 / 404)
- [x] 4.2 Create `tests/Feature/AIWikiTest.php` — test cases:
  - Any member can call `/wiki/ai/chat` (mock `AIWikiService::chat`, assert 200)
  - Normal member cannot call `/wiki/ai/draft` (403)
  - Admin can call `/wiki/ai/draft` (mock `AIWikiService::draft`, assert 200)
  - `chat` validates message max:1000 (422 on violation)
  - `draft` validates prompt max:500 (422 on violation)
- [x] 4.3 Run `docker compose exec backend php artisan config:clear && docker compose exec backend sh -lc 'APP_ENV=testing DB_CONNECTION=pgsql DB_HOST=db DB_DATABASE=syncmind_test DB_USERNAME=syncmind DB_PASSWORD=secret php artisan test tests/Feature/WikiPageTest.php tests/Feature/AIWikiTest.php'` — all tests pass
- [x] 4.4 Run `docker compose exec backend sh -lc './vendor/bin/pint'` — no linting errors

## Phase 5 — Frontend: API Client

- [x] 5.1 Create `frontend/src/lib/api/wiki.ts` with functions (all use the singleton axios instance from `src/lib/axios.ts`):
  - `getWikiPages(projectId: number)` → `GET /api/projects/{id}/wiki`
  - `getWikiPage(projectId: number, wikiPageId: number)` → `GET /api/projects/{id}/wiki/{wikiPageId}`
  - `createWikiPage(projectId: number, data: { title: string; content?: string })` → `POST`
  - `updateWikiPage(projectId: number, wikiPageId: number, data: { title?: string; content?: string })` → `PATCH`
  - `deleteWikiPage(projectId: number, wikiPageId: number)` → `DELETE`
  - `wikiAiChat(projectId: number, message: string, history: {role: string; content: string}[])` → `POST /api/projects/{id}/wiki/ai/chat`
  - `wikiAiDraft(projectId: number, prompt: string)` → `POST /api/projects/{id}/wiki/ai/draft`

## Phase 6 — Frontend: Wiki Pages & Components

- [x] 6.1 Create `frontend/src/app/projects/[id]/wiki/page.tsx` — fetch wiki pages on mount via `getWikiPages`; render `WikiPageList` in a left sidebar (240px); if no pages exist show a centred empty state ("No pages yet. Create the first one.") with a "New Page" button (admin only); wiki card on project detail page enabled and links to `/projects/{id}/wiki`
- [x] 6.2 Create `frontend/src/components/wiki/WikiPageList.tsx` — accepts `pages[]`, `projectId`, `isAdmin` props; renders a scrollable list of page titles; highlights the active page; "New Page" button at top visible only when `isAdmin`; clicking a title navigates to `/projects/[id]/wiki/[wikiPageId]`
- [x] 6.3 Create `frontend/src/app/projects/[id]/wiki/[wikiPageId]/page.tsx` — fetch the single page via `getWikiPage`; render `WikiPageView` for the content; show "Edit" button (admin only) linking to `.../edit`; render `WikiChatPanel` toggle button (bottom-right floating button); show page metadata (author, last edited, timestamps) in a header strip
- [x] 6.4 Create `frontend/src/components/wiki/WikiPageView.tsx` — renders `content` via `Markdown` shared component (which uses `react-markdown`); applies consistent prose typography classes matching the existing dark/light theme
- [x] 6.5 Create `frontend/src/app/projects/[id]/wiki/[wikiPageId]/edit/page.tsx` — redirect non-admins to the view page; fetch existing page on mount; render `WikiPageEditor`; on save call `updateWikiPage` then navigate back to view
- [x] 6.6 Create `frontend/src/app/projects/[id]/wiki/new/page.tsx` — admin-only; render `WikiPageEditor` with empty state; on save call `createWikiPage` then navigate to the new page's view URL
- [x] 6.7 Create `frontend/src/components/wiki/WikiPageEditor.tsx` — reuses existing `MarkdownEditor` shared component; title input field above; "Ask AI to draft" button opens a modal with a `<textarea>` for the prompt and a "Generate" button; on generate call `wikiAiDraft`, show a confirmation modal "Replace current content with this draft?" before overwriting; "Save" button calls the provided `onSave(title, content)` callback; dark mode compatible via existing Tailwind classes

## Phase 7 — Frontend: AI Chat Panel

- [x] 7.1 Create `frontend/src/components/wiki/WikiChatPanel.tsx` — slide-in panel from the right (fixed position, `w-96`, full viewport height); internal state: `messages: {role, content}[]`, `input: string`, `loading: boolean`; on submit call `wikiAiChat(projectId, input, messages)`, append user message immediately, append assistant response on resolve, clear input; show a loading indicator (spinner or "..." bubble) while `loading`; "✕" button closes the panel; panel is scrolled to bottom after each new message
- [x] 7.2 Create `frontend/src/components/wiki/WikiChatMessage.tsx` — accepts `role` ("user" | "assistant") and `content` (string); user messages right-aligned with project accent color; assistant messages left-aligned with a subtle background; assistant message content rendered via `react-markdown` (supports markdown in AI responses including citation links)
- [x] 7.3 Add floating "Chat" toggle button to `wiki/[wikiPageId]/page.tsx` — fixed bottom-right corner, chat bubble icon from `lucide-react`; toggles `WikiChatPanel` open/closed; passes `projectId` to the panel; animated slide-in via framer-motion

## Phase 8 — Verification

- [x] 8.1 Run `docker compose exec frontend npm run build` — no TypeScript errors; wiki routes visible in build output
- [x] 8.2 Run `docker compose exec frontend npm run lint` — no new errors in created/modified files
- [x] 8.3 Manual smoke test — admin creates a wiki page, writes markdown content, saves; verifies rendered output matches preview; page appears in the sidebar list
- [x] 8.4 Manual smoke test — normal member visits wiki, can view pages, cannot see "New Page" or "Edit" buttons
- [x] 8.5 Manual smoke test — admin uses "Ask AI to draft", receives markdown, confirms replacement, saves; verifies embedding job eventually populates (check DB or queue log)
- [x] 8.6 Manual smoke test — member opens chat panel, asks a question about a saved wiki page, receives an AI answer that cites the page title
- [x] 8.7 Dark mode audit — all wiki components (list, view, editor, chat panel) render correctly in both light and dark themes
