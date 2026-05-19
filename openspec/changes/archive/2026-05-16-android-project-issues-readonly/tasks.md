## 1. Android Data Layer

- [x] 1.1 Extend project models for detail payload counts and members.
- [x] 1.2 Add an `Issue` model matching the backend issue list payload.
- [x] 1.3 Extend `ProjectApiService` with project detail and issue list endpoints.
- [x] 1.4 Extend `ProjectRepository` with `getProject()` and `getIssues()`.

## 2. Android Navigation and UI

- [x] 2.1 Add a project detail route with a project id argument.
- [x] 2.2 Make project list items tappable and navigate to detail.
- [x] 2.3 Add `ProjectDetailViewModel` to load project detail and issues.
- [x] 2.4 Add `ProjectDetailScreen` with overview and issue list sections.
- [x] 2.5 Add reusable issue list item UI.

## 3. Validation

- [x] 3.1 Run Android unit test build: `.\gradlew.bat testDebugUnitTest`.
- [x] 3.2 Confirm the new read paths compile against existing backend response shapes.
