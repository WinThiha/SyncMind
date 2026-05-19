## 1. Android Data Layer

- [x] 1.1 Extend `Issue` with comment and history models.
- [x] 1.2 Add `IssueResponse` for single issue payloads.
- [x] 1.3 Extend `ProjectApiService` with `getIssue(projectId, issueKey)`.
- [x] 1.4 Extend `ProjectRepository` with `getIssue()`.

## 2. Android Navigation and UI

- [x] 2.1 Add an issue detail route with project id and issue key arguments.
- [x] 2.2 Make issue list items tappable and navigate to issue detail.
- [x] 2.3 Add `IssueDetailViewModel`.
- [x] 2.4 Add `IssueDetailScreen` with metadata, description, comments, and history sections.

## 3. Validation

- [x] 3.1 Run Android unit test build: `.\gradlew.bat testDebugUnitTest`.
- [x] 3.2 Confirm the new issue detail read path compiles against existing backend response shape.
