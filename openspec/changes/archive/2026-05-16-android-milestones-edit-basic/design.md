## Context

The backend exposes milestone show and update endpoints through `MilestoneController`. Android currently renders milestones inside project detail and has a create milestone flow, so editing can reuse the same fields and route back to project detail.

## Goals / Non-Goals

**Goals:**
- Load a milestone before editing.
- Save name, description, dates, and status.
- Surface backend errors through save state.
- Validate with the Android unit-test build.

**Non-Goals:**
- No delete.
- No AI milestone panels.
- No milestone detail page beyond edit form.

## Decisions

### 1. Tap Milestone to Edit
- **Decision**: Make milestone cards tappable and route directly to edit.
- **Rationale**: Android has no separate milestone detail screen yet, and edit is the primary missing interaction.

### 2. Reuse Plain Date Fields
- **Decision**: Keep `YYYY-MM-DD` text fields.
- **Rationale**: Matches the existing create milestone increment and backend contract.

## Risks / Trade-offs

- **[Risk]** Users may expect tap to open a read-only detail page.
- **Mitigation**: This is acceptable until a richer milestone detail surface is added.
