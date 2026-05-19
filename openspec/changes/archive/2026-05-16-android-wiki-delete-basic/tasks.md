## 1. Android Data Layer

- [x] 1.1 Extend `ProjectApiService` with wiki delete endpoint.
- [x] 1.2 Extend `ProjectRepository` with `deleteWikiPage()`.

## 2. Android UI

- [x] 2.1 Add delete state to `WikiPageViewModel`.
- [x] 2.2 Add delete action and confirmation dialog to `WikiPageScreen`.
- [x] 2.3 Navigate back to project detail after successful delete.

## 3. Validation

- [x] 3.1 Run Android unit test build: `.\gradlew.bat testDebugUnitTest`.
- [x] 3.2 Confirm wiki deletion compiles against existing backend response shape.
