## 1. Android Data Layer

- [x] 1.1 Add comment create request/response models.
- [x] 1.2 Extend `ProjectApiService` with comment creation endpoint.
- [x] 1.3 Extend `ProjectRepository` with `createIssueComment()`.

## 2. Android UI

- [x] 2.1 Extend `IssueDetailViewModel` with comment draft and submit state.
- [x] 2.2 Add comment input and post button to `IssueDetailScreen`.
- [x] 2.3 Reload issue detail after successful comment creation.

## 3. Validation

- [x] 3.1 Run Android unit test build: `.\gradlew.bat testDebugUnitTest`.
- [x] 3.2 Confirm comment creation compiles against existing backend response shape.
