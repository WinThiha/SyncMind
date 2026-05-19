## Design

Milestone deletion will be added to `EditMilestoneScreen`, which is currently the Android surface for viewing and editing an individual milestone. The app bar will include a delete action, guarded by a confirmation dialog. `EditMilestoneViewModel` will expose delete state and call the repository. On success, navigation returns to project detail so the refreshed list no longer includes the deleted milestone.

The repository will treat any successful HTTP response from the backend delete endpoint as `NetworkResult.Success(Unit)`.

## Non-goals

- AI milestone actions
- Role-aware hiding of destructive actions
- Undo or restore behavior
