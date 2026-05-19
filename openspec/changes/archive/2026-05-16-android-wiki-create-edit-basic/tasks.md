## 1. Android Data Layer

- [x] 1.1 Add wiki create/update request models.
- [x] 1.2 Extend `ProjectApiService` with wiki create and update endpoints.
- [x] 1.3 Extend `ProjectRepository` with `createWikiPage()` and `updateWikiPage()`.

## 2. Android Navigation and UI

- [x] 2.1 Add create and edit wiki routes.
- [x] 2.2 Add create wiki entry point in project detail.
- [x] 2.3 Add edit wiki entry point in wiki reader.
- [x] 2.4 Add `CreateWikiPageViewModel` and `CreateWikiPageScreen`.
- [x] 2.5 Add `EditWikiPageViewModel` and `EditWikiPageScreen`.
- [x] 2.6 Navigate to wiki reader after create/edit success.

## 3. Validation

- [x] 3.1 Run Android unit test build: `.\gradlew.bat testDebugUnitTest`.
- [x] 3.2 Confirm wiki create/update compiles against existing backend response shape.
