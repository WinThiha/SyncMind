## Context

The backend exposes wiki create and update endpoints through `WikiPageController`. Android already has a project detail wiki section and wiki page reader, so this increment adds simple title/content forms and navigates back to the reader after save.

## Goals / Non-Goals

**Goals:**
- Create a wiki page with title and optional content.
- Edit a wiki page title and content.
- Navigate to the saved wiki page after create/edit.
- Validate with the Android unit-test build.

**Non-Goals:**
- No delete.
- No markdown preview/editor toolbar.
- No AI wiki assistant or draft generation.

## Decisions

### 1. Plain Text Editor
- **Decision**: Use multiline text fields for content.
- **Rationale**: Keeps the first Android mutation path focused on backend parity; rich markdown UX can be added later.

### 2. Navigate To Reader After Save
- **Decision**: Open the wiki reader after create or edit.
- **Rationale**: Confirms the saved result and reuses the existing read screen.

## Risks / Trade-offs

- **[Risk]** Editing long wiki pages in a simple text field is limited.
- **Mitigation**: This is a basic parity increment; richer editing can follow.
