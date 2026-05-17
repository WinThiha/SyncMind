## Why

Global and project-scoped issue lists currently behave differently: project issue lists open an inline detail slider, while the global issue list jumps straight to the detail route. This makes the global list less efficient and leaves `/projects/{id}/issues` as a duplicate list experience.

## What Changes

- Make issue clicks on the global `/issues` page open the same issue detail slider used by project issue lists.
- Add an action inside the slider that opens the full issue detail route.
- Replace project issue-list navigation with `/issues?project_id={id}` so the global project picker auto-selects the project.
- Keep issue creation, edit, and detail routes intact while routing list-return actions back to the global filtered list.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `global-issues-list`: Global issues becomes the canonical issue list and supports slider preview plus project preselection.

## Impact

- Frontend routes and components under `frontend/src/app/issues`, `frontend/src/app/projects/[id]`, and `frontend/src/components/issues`.
- Frontend localization catalogs for newly added slider action text.
- OpenSpec global issues list requirements.
