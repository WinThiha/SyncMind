## Context

SyncMind has no wiki or documentation feature today. The backend has a mature AI infrastructure: an `OpenAI\Client` singleton bound as `app('ai.client')`, a `ChatCompletionClient` contract, pgvector embeddings on `issues.embedding`, a `GenerateIssueEmbeddingJob` pattern, and `AIIssueSearchService` for cosine-distance vector search. All of this can be reused directly for wiki page embeddings and RAG.

Access control follows the `ProjectMember.role` field (`admin` / `normal`). Existing policies (`IssuePolicy`, `MilestonePolicy`) check membership and role via `ProjectMember::where(...)->first()`. The wiki policy will follow the identical pattern.

The frontend has `react-markdown ^10` installed. No rich-text editor library exists yet.

## Goals / Non-Goals

**Goals:**
- Per-project wiki with flat page structure (no nesting).
- All project members can view pages; only admins/owners can create, edit, delete.
- AI chat panel (RAG) available to all members on every wiki page.
- AI page drafting available to admins in the editor.
- Markdown editor with split preview, no new npm dependencies.
- Wiki pages are auto-embedded on save for semantic search.

**Non-Goals:**
- Page versioning / revision history.
- Nested pages or hierarchical structure.
- Real-time collaborative editing.
- Global (cross-project) wiki.
- Full-text keyword search (semantic search covers this sufficiently).
- Persistent server-side chat history (conversations are stateless; history is client-managed).

## Data Model

```
wiki_pages
├── id                bigint PK
├── project_id        bigint FK → projects.id  (cascade delete)
├── title             string(255)   required
├── content           text          (markdown, nullable — empty draft allowed)
├── author_id         bigint FK → users.id  (set null on delete)
├── last_editor_id    bigint FK → users.id  nullable  (set null on delete)
├── embedding         vector        nullable  — auto-populated by job after save
├── created_at        timestamp
└── updated_at        timestamp
```

Index: `(project_id, title)` composite for listing and duplicate-title guard.

The `embedding` vector dimension matches `config('openai.embedding.dimensions')`, identical to `issues.embedding`.

## Flow Diagrams

### RAG Chat Flow

```
Member types a question in the chat panel
              │
              ▼
POST /api/projects/{project}/wiki/ai/chat
  { message: "...", history: [{role, content}, ...] }
              │
              ▼
AIWikiService::chat()
  1. Embed message  →  embedding API (same as issue search)
  2. Cosine search  →  wiki_pages.embedding, top 3 pages
  3. Build context  →  concatenate retrieved page titles + content
  4. Chat completion:
       system: "You are a project assistant. Answer using only the
                provided wiki pages. Cite page titles."
       context pages (injected as system or user turn)
       history: last N turns from client
       user: the question
              │
              ▼
Return { answer: "..." }  →  appended to chat panel
```

### AI Draft Flow

```
Admin opens editor (new or existing page)
  → clicks "Ask AI to draft"
  → types prompt: "Write a page about our API auth conventions"
              │
              ▼
POST /api/projects/{project}/wiki/ai/draft
  { prompt: "...", page_id?: number }
              │
              ▼
AIWikiService::draft()
  1. Fetch project context:
       - All wiki page titles + content (truncated)
       - Last 20 open issues (summary + status)
       - Active milestones (name + progress)
  2. Chat completion:
       system: "You are a technical writer. Draft a clear,
                structured markdown wiki page for a software team.
                Use the project context to make it accurate."
       context: assembled project data
       user: admin's prompt
              │
              ▼
Return { content: "<markdown string>" }
  → fills the editor textarea
  → admin reviews + edits + saves
```

## API Design

All routes are nested under `auth:sanctum` + `throttle:api`.

```
GET    /api/projects/{project}/wiki                        index   — list pages (id, title, author, timestamps)
POST   /api/projects/{project}/wiki                        store   — create page        [admin/owner]
GET    /api/projects/{project}/wiki/{wikiPage}             show    — full page content  [all members]
PATCH  /api/projects/{project}/wiki/{wikiPage}             update  — edit page          [admin/owner]
DELETE /api/projects/{project}/wiki/{wikiPage}             destroy — delete page        [admin/owner]

POST   /api/projects/{project}/wiki/ai/chat                chat    — RAG Q&A            [all members]
POST   /api/projects/{project}/wiki/ai/draft               draft   — AI page draft      [admin/owner]
```

### Request / Response shapes

**POST /wiki** and **PATCH /wiki/{wikiPage}**
```json
{ "title": "API Conventions", "content": "## Overview\n..." }
```

**GET /wiki (index)**
```json
{
  "data": [
    {
      "id": 1,
      "title": "API Conventions",
      "author": { "id": 2, "name": "Alice" },
      "last_editor": { "id": 3, "name": "Bob" },
      "created_at": "2026-05-15T10:00:00Z",
      "updated_at": "2026-05-15T12:00:00Z"
    }
  ]
}
```

**GET /wiki/{wikiPage} (show)**
Same shape as index item, plus `"content": "<markdown string>"`.

**POST /wiki/ai/chat**
```json
{
  "message": "How do we handle auth?",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```
Response: `{ "answer": "<string>" }`

**POST /wiki/ai/draft**
```json
{ "prompt": "Write a page about our database migration process" }
```
Response: `{ "content": "<markdown string>" }`

## Frontend Architecture

```
src/app/dashboard/projects/[id]/wiki/
├── page.tsx                    Wiki home — page list sidebar + empty/welcome state
└── [wikiPageId]/
    ├── page.tsx                Page view — rendered markdown + chat panel
    └── edit/
        └── page.tsx            Page editor — split-pane markdown editor (admin only)

src/components/wiki/
├── WikiPageList.tsx             Sidebar list of pages with "New Page" button (admin)
├── WikiPageView.tsx             Rendered markdown via react-markdown + remark-gfm
├── WikiPageEditor.tsx           Split-pane: textarea (left) | preview (right) + toolbar + AI draft button
├── WikiChatPanel.tsx            Slide-in panel (right): message list + input + send button
└── WikiChatMessage.tsx          Individual message bubble (user vs. assistant styling)

src/lib/api/wiki.ts              CRUD wrappers: getWikiPages, getWikiPage, createWikiPage,
                                 updateWikiPage, deleteWikiPage, wikiAiChat, wikiAiDraft
```

### Editor layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [B] [I] [H] [```] [Link]          [Ask AI to draft]  [Save]   │  ← toolbar
├────────────────────────────┬────────────────────────────────────┤
│                            │                                    │
│   # API Conventions        │   API Conventions                  │
│                            │                                    │
│   ## Overview              │   Overview                         │
│   Auth uses Sanctum...     │   Auth uses Sanctum...             │
│                            │                                    │
│   (textarea)               │   (react-markdown preview)         │
└────────────────────────────┴────────────────────────────────────┘
```

### Chat panel layout

```
┌──────────────────────────────────┐
│  Project AI Assistant          ✕ │
├──────────────────────────────────┤
│                                  │
│  You: How do we handle auth?     │
│                                  │
│  AI: According to "API           │
│  Conventions", auth uses         │
│  Sanctum cookie sessions...      │
│                                  │
│  Sources: API Conventions        │
│                                  │
├──────────────────────────────────┤
│  [Ask anything about this   ] [▶]│
└──────────────────────────────────┘
```

The panel slides in from the right edge of the wiki page. A floating "Chat" button (bottom-right) toggles it. Panel state (open/closed, message history) is local to the page — not persisted.

## Authorization

`WikiPagePolicy` follows the exact pattern of `MilestonePolicy`:

| Action | Who |
|--------|-----|
| `viewAny` / `view` | Any project member |
| `create` / `update` / `delete` | Project admin or owner |
| `chat` (AI Q&A) | Any project member |
| `draft` (AI draft) | Project admin or owner |

Registered in `AppServiceProvider` via `Gate::policy(WikiPage::class, WikiPagePolicy::class)`.

## Decisions

### 1. Flat page structure (no hierarchy)
- **Rationale**: Nested pages add significant complexity (parent_id, ordering, breadcrumbs, move operations). A flat list with good titles is sufficient for the typical project wiki size. Hierarchy can be added later if demand emerges.

### 2. Stateless chat — history managed client-side
- **Rationale**: Storing conversation threads server-side requires a new table and complicates the API. Chat sessions are ephemeral (per page visit). Sending the last N turns with each request keeps the backend stateless and deployment simple.
- **Approach**: Client maintains `messages[]` state. Each request sends the full history (capped at last 10 turns to control token usage).

### 3. No new npm packages for the editor
- **Rationale**: `react-markdown` is already installed and handles rendering. A custom split-pane with a `textarea` and toolbar buttons avoids adding a heavy editor library (~200 kB) and keeps React Compiler compatibility guaranteed.

### 4. Auto-embed on save via observer + job
- **Rationale**: Consistent with the existing `IssueObserver` → `GenerateIssueEmbeddingJob` pattern. Embedding happens asynchronously so page saves are not blocked by the embedding API call.
- **Approach**: `WikiPageObserver::created()` and `::updated()` dispatch `GenerateWikiEmbeddingJob`. If queue is not running, the embedding simply stays null until the next save — chat RAG degrades gracefully (fewer context hits) rather than failing.

### 5. RAG cites source pages in the answer
- **Rationale**: Members need to trust and verify AI answers. Citing the wiki page that the answer came from lets them navigate to the source directly.
- **Approach**: The system prompt instructs the model to cite page titles. The response is returned as a single string (markdown); citation links are rendered in the chat bubble.

### 6. AI draft uses truncated project context
- **Rationale**: Sending all issue and milestone content would exceed context limits for large projects. Truncation keeps cost and latency reasonable.
- **Approach**: Wiki pages: full content up to 500 chars each. Issues: last 20, summary only. Milestones: name + status + progress only.

## Risks / Trade-offs

- **[Risk] Embedding not ready when page is first saved** → **Mitigation**: The chat RAG query filters `whereNotNull('embedding')` — a brand-new page simply won't appear as a context source until the job runs. No error.
- **[Risk] Large wiki pages hit token limits in RAG context** → **Mitigation**: Each retrieved page is truncated to 2000 chars when injected as context. The full page is still stored and rendered normally.
- **[Risk] Admin-only edit gate blocks normal members from contributing** → **Mitigation**: This is intentional per the product decision. A comment or suggestion mechanism on wiki pages is a natural future addition.
- **[Risk] AI draft replaces editor content on click** → **Mitigation**: AI draft inserts into the editor but only after a confirmation modal ("Replace current content with AI draft?"). Existing content is not silently overwritten.
