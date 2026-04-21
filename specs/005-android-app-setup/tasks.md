# Tasks: Android App Setup (Jetpack Compose)

**Input**: Design documents from `/specs/005-android-app-setup/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are requested in the implementation plan (Unit tests for ViewModels/Repositories, UI tests for main flows).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Android project structure in `android/` with Kotlin 2.0+ and Compose BOM
- [x] T002 Configure `android/app/build.gradle.kts` with Hilt, Retrofit, OkHttp, and Kotlin Serialization dependencies
- [x] T003 [P] Configure project-level `android/build.gradle.kts` and `android/gradle/libs.versions.toml`
- [x] T004 [P] Setup Android manifest, theme, and basic resource files in `android/app/src/main/`
- [x] T005 [P] Create `.gitignore` for the Android project in `android/.gitignore`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Setup Hilt Dependency Injection modules in `android/app/src/main/java/com/syncmind/android/di/NetworkModule.kt`
- [x] T007 [P] Implement `AuthInterceptor` for bearer token injection in `android/app/src/main/java/com/syncmind/android/util/AuthInterceptor.kt`
- [x] T008 [P] Setup Retrofit client with OkHttp and Kotlin Serialization in `android/app/src/main/java/com/syncmind/android/di/NetworkModule.kt`
- [x] T009 [P] Implement `TokenManager` using `EncryptedSharedPreferences` in `android/app/src/main/java/com/syncmind/android/data/TokenManager.kt`
- [x] T010 Setup base navigation structure with Compose Navigation in `android/app/src/main/java/com/syncmind/android/ui/navigation/NavGraph.kt`
- [x] T011 Create base DTOs and entity models in `android/app/src/main/java/com/syncmind/android/data/model/`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Authenticate via Mobile App (Priority: P1) 🎯 MVP

**Goal**: Users can log in using email/password and receive a Sanctum token.

**Independent Test**: Enter valid credentials on the login screen, verify successful navigation to the dashboard, and check if the token is saved in encrypted storage.

### Tests for User Story 1

- [ ] T012 [P] [US1] Unit test for `LoginViewModel` in `android/app/src/test/java/com/syncmind/android/ui/auth/LoginViewModelTest.kt`
- [ ] T013 [P] [US1] Unit test for `AuthRepository` in `android/app/src/test/java/com/syncmind/android/data/repository/AuthRepositoryTest.kt`
- [ ] T014 [US1] UI test for Login flow in `android/app/src/androidTest/java/com/syncmind/android/ui/auth/LoginScreenTest.kt`

### Implementation for User Story 1

- [x] T015 [P] [US1] Create `AuthApiService` with login/logout endpoints in `android/app/src/main/java/com/syncmind/android/data/api/AuthApiService.kt`
- [x] T016 [P] [US1] Implement `AuthRepository` in `android/app/src/main/java/com/syncmind/android/data/repository/AuthRepository.kt`
- [x] T017 [US1] Create `LoginViewModel` in `android/app/src/main/java/com/syncmind/android/ui/auth/LoginViewModel.kt`
- [x] T018 [US1] Implement `LoginScreen` UI with Jetpack Compose in `android/app/src/main/java/com/syncmind/android/ui/auth/LoginScreen.kt`
- [x] T019 [US1] Add login screen to `NavGraph` and handle navigation logic
- [x] T020 [US1] Implement error handling for invalid credentials and network issues

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - View Projects on Mobile (Priority: P1)

**Goal**: Authenticated users can view a list of their projects.

**Independent Test**: Log in and navigate to the projects view, ensure the list matches backend data, and verify empty/error states.

### Tests for User Story 2

- [ ] T021 [P] [US2] Unit test for `ProjectViewModel` in `android/app/src/test/java/com/syncmind/android/ui/projects/ProjectViewModelTest.kt`
- [ ] T022 [P] [US2] Unit test for `ProjectRepository` in `android/app/src/test/java/com/syncmind/android/data/repository/ProjectRepositoryTest.kt`

### Implementation for User Story 2

- [x] T023 [P] [US2] Create `ProjectApiService` with GET /api/projects endpoint in `android/app/src/main/java/com/syncmind/android/data/api/ProjectApiService.kt`
- [x] T024 [P] [US2] Implement `ProjectRepository` in `android/app/src/main/java/com/syncmind/android/data/repository/ProjectRepository.kt`
- [x] T025 [US2] Create `ProjectViewModel` in `android/app/src/main/java/com/syncmind/android/ui/projects/ProjectViewModel.kt`
- [x] T026 [US2] Implement `ProjectListScreen` UI with Jetpack Compose in `android/app/src/main/java/com/syncmind/android/ui/projects/ProjectListScreen.kt`
- [x] T027 [US2] Implement `ProjectItem` component in `android/app/src/main/java/com/syncmind/android/ui/projects/components/ProjectItem.kt`
- [x] T028 [US2] Add projects screen to `NavGraph` as the authenticated home
- [x] T029 [US2] Implement pull-to-refresh and empty state handling

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T030 [P] Implement logout functionality in `ProjectListScreen`
- [x] T031 Implement token expiration handling (automatic redirect to login on 401)
- [x] T032 [P] Add loading indicators (Shimmer/Progress) for API calls
- [x] T033 [P] Documentation updates in `android/README.md`
- [x] T034 Run validation against `quickstart.md` setup

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Requires US1 for authentication but can be tested with mocked tokens

### Within Each User Story

- Unit tests for logic (ViewModel/Repository)
- Implementation of API services and repositories
- UI implementation with ViewModels
- Integration with navigation and error handling

---

## Parallel Example: User Story 1

```bash
# Launch models and API service for User Story 1 together:
Task: "Create AuthApiService with login/logout endpoints"
Task: "Implement AuthRepository"

# Launch ViewModel and UI tests for User Story 1 together:
Task: "Unit test for LoginViewModel"
Task: "Unit test for AuthRepository"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Login)
4. **VALIDATE**: Verify login works against local backend

### Incremental Delivery

1. Complete Setup + Foundational
2. Add User Story 1 (Login) -> MVP
3. Add User Story 2 (Project List) -> Core Value
4. Add Polish (Token handling, Logout)

---

## Notes

- [P] tasks = different files, no dependencies
- [USx] label maps task to specific user story for traceability
- Target API Level: 24 (Android 7.0)
- Ensure Hilt is correctly initialized in `SyncMindApp.kt` (Application class)
- Use Material 3 components throughout the app
