## 1. Android Data Layer

- [x] 1.1 Add user settings models and update payload models.
- [x] 1.2 Add `SettingsApiService`.
- [x] 1.3 Add `SettingsRepository`.
- [x] 1.4 Register settings API dependencies in Hilt.

## 2. Android Navigation and UI

- [x] 2.1 Add a settings route reachable from project list.
- [x] 2.2 Add `SettingsViewModel` for loading, editing, and saving settings.
- [x] 2.3 Add `SettingsScreen` with account, security, preferences, and notifications sections.
- [x] 2.4 Sync saved user profile back into `TokenManager` when display name changes.

## 3. Validation

- [x] 3.1 Run Android unit test build: `.\gradlew.bat testDebugUnitTest`.
- [x] 3.2 Confirm settings read/update path compiles against existing backend response shape.
