## Design

Project deletion will be implemented as a basic Android parity action using the existing project detail screen. The screen will expose a delete icon in the app bar next to edit/refresh, open a confirmation dialog, call the repository through `ProjectDetailViewModel`, and navigate to the project list after success.

The repository will treat any successful HTTP response from `DELETE /projects/{project}` as success and return `NetworkResult.Success(Unit)`, matching existing wiki and issue deletion patterns.

## Non-goals

- Ownership transfer
- Member and invitation management
- Role-aware hiding of the delete action
- Undo or restore support
