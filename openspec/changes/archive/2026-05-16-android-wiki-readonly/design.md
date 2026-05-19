## Context

The frontend consumes wiki endpoints in `frontend/src/lib/api/wiki.ts`, and the backend exposes standard project-scoped wiki routes through `WikiPageController`. Android already uses a project detail screen with sections for issues and milestones, making a read-only wiki section a natural next increment.

## Goals / Non-Goals

**Goals:**
- Fetch wiki page summaries for a project.
- Show wiki pages in Android project detail.
- Open a wiki page detail screen and display title, author/editor metadata, and content.

**Non-Goals:**
- No wiki create/edit/delete.
- No markdown editing controls.
- No AI wiki assistant.

## Decisions

### 1. Project Detail Entry Point
- **Decision**: Add wiki pages as another section in `ProjectDetailScreen`.
- **Rationale**: Keeps project-scoped read surfaces discoverable in one place.

### 2. Plain Text Rendering
- **Decision**: Render wiki content as text for this increment.
- **Rationale**: Markdown rendering can be improved later; this keeps the API and navigation port focused.

## Risks / Trade-offs

- **[Risk]** Long wiki pages may be dense as plain text.
- **Mitigation**: Use a scrollable detail screen and defer rich markdown rendering to a later UI-focused change.
