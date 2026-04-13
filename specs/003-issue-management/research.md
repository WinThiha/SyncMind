# Phase 0: Research & Technical Decisions

## Sequential Key Generation
- **Decision**: Use a database-level transaction and a `project_issue_counters` table (or similar) to track the current sequence per project.
- **Rationale**: Direct `MAX(key) + 1` is prone to race conditions. A dedicated counter table with row-level locking (`FOR UPDATE`) ensures unique sequential IDs even with concurrent creations.
- **Alternatives considered**: 
    - Database sequences (PostgreSQL supports this, but managing one per project is complex).
    - UUIDs (rejected per requirement for "Backlog-style" human-readable keys).

## Change History Tracking
- **Decision**: Use Laravel Eloquent Observers combined with a dedicated `IssueHistory` model.
- **Rationale**: Observers provide a clean, centralized way to hook into the `updated` event. Comparing `getOriginal()` and `getDirty()` allows for automatic logging of specific field changes without cluttering controller logic.
- **Alternatives considered**: 
    - Manual logging in controllers (messy and prone to omissions).
    - Spatie Activity Log package (powerful, but a custom lightweight solution is preferred for this specific "Backlog-style" requirement).

## Markdown Support
- **Decision**: Store raw Markdown in the database. Use `react-markdown` on the frontend for rendering and `react-simplemde-editor` or `monaco-editor` for the input.
- **Rationale**: Keeping the source format in the DB allows for editing. Frontend rendering is standard practice for modern web apps.
- **Alternatives considered**: 
    - Server-side rendering to HTML (rejected to keep the API purely JSON-based).

## Soft Deletion
- **Decision**: Use Laravel's built-in `SoftDeletes` trait.
- **Rationale**: Industry standard for Laravel. Easy to implement and supports "Restore" functionality if needed in the future.
- **Alternatives considered**: 
    - Custom `is_archived` flag (redundant with `SoftDeletes`).
