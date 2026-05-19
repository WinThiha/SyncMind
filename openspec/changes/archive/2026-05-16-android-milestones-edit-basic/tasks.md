## 1. Android Data Layer

- [x] 1.1 Add milestone update request model.
- [x] 1.2 Extend `ProjectApiService` with milestone detail and update endpoints.
- [x] 1.3 Extend `ProjectRepository` with `getMilestone()` and `updateMilestone()`.

## 2. Android Navigation and UI

- [x] 2.1 Add edit milestone route with project id and milestone id arguments.
- [x] 2.2 Make milestone items navigate to edit.
- [x] 2.3 Add `EditMilestoneViewModel`.
- [x] 2.4 Add `EditMilestoneScreen` with basic fields and save handling.
- [x] 2.5 Navigate back to project detail after save.

## 3. Validation

- [x] 3.1 Run Android unit test build: `.\gradlew.bat testDebugUnitTest`.
- [x] 3.2 Confirm milestone update compiles against existing backend response shape.
