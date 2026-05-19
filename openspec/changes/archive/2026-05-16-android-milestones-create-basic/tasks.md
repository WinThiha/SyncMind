## 1. Android Data Layer

- [x] 1.1 Add milestone create request and single milestone response models.
- [x] 1.2 Extend `ProjectApiService` with milestone creation endpoint.
- [x] 1.3 Extend `ProjectRepository` with `createMilestone()`.

## 2. Android Navigation and UI

- [x] 2.1 Add create milestone route with project id argument.
- [x] 2.2 Add create milestone entry point in project detail.
- [x] 2.3 Add `CreateMilestoneViewModel`.
- [x] 2.4 Add `CreateMilestoneScreen` with basic milestone fields and submit handling.
- [x] 2.5 Navigate back to project detail after success.

## 3. Validation

- [x] 3.1 Run Android unit test build: `.\gradlew.bat testDebugUnitTest`.
- [x] 3.2 Confirm milestone creation compiles against existing backend response shape.
