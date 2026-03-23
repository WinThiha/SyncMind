# Tasks: Issue Management

**Input**: Design documents from `/specs/003-issue-management/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Organization

Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create backend directory structure for issues in `backend/app/{Services,Observers,Policies}/`
- [ ] T002 Create frontend directory structure for issues in `frontend/src/{app/projects/[id]/issues,components/issues}/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [ ] T003 [P] Create migration for `issues` table in `backend/database/migrations/`
- [ ] T004 [P] Create migration for `issue_comments` table in `backend/database/migrations/`
- [ ] T005 [P] Create migration for `issue_histories` table in `backend/database/migrations/`
- [ ] T006 [P] Create migration for `project_issue_counters` table in `backend/database/migrations/`
- [ ] T007 Run database migrations using `docker compose exec backend php artisan migrate`
- [ ] T008 [P] Create `Issue` model with `SoftDeletes` support in `backend/app/Models/Issue.php`
- [ ] T009 [P] Create `Comment` model in `backend/app/Models/Comment.php`
- [ ] T010 [P] Create `IssueHistory` model in `backend/app/Models/IssueHistory.php`
- [ ] T011 Create `IssuePolicy` for RBAC in `backend/app/Policies/IssuePolicy.php`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Create and View Issues (Priority: P1) 🎯 MVP

**Goal**: Core issue creation and listing functionality.

**Independent Test**: Can be fully tested by an admin creating an issue and a normal member viewing it in the project's issue list.

### Implementation for User Story 1

- [ ] T012 [US1] Implement `IssueService` for sequential key generation in `backend/app/Services/IssueService.php`
- [ ] T013 [US1] Create `IssueController` with `index` and `store` methods in `backend/app/Http/Controllers/IssueController.php`
- [ ] T014 [US1] Define issue API routes in `backend/routes/api.php`
- [ ] T015 [US1] Create `IssueFactory` for testing in `backend/database/factories/IssueFactory.php`
- [ ] T016 [US1] Write feature tests for issue creation and listing in `backend/tests/Feature/IssueLifecycleTest.php`
- [ ] T017 [P] [US1] Implement frontend API wrapper for issues in `frontend/src/lib/api/issues.ts`
- [ ] T018 [P] [US1] Build `IssueList` component in `frontend/src/components/issues/IssueList.tsx`
- [ ] T019 [P] [US1] Build `CreateIssueForm` component in `frontend/src/components/issues/CreateIssueForm.tsx`
- [ ] T020 [US1] Integrate issue list and creation into project layout in `frontend/src/app/projects/[id]/issues/page.tsx`

**Checkpoint**: User Story 1 functional and testable independently.

---

## Phase 4: User Story 2 - Update Issue Status and Details (Priority: P1)

**Goal**: Issue lifecycle management and history tracking.

**Independent Test**: Can be tested by an admin changing an issue's status and verifying the change is reflected for all members in the history log.

### Implementation for User Story 2

- [ ] T021 [US2] Create `IssueObserver` for change history tracking in `backend/app/Observers/IssueObserver.php`
- [ ] T022 [US2] Register `IssueObserver` in `backend/app/Providers/AppServiceProvider.php`
- [ ] T023 [US2] Implement `show` and `update` methods in `backend/app/Http/Controllers/IssueController.php`
- [ ] T024 [US2] Add soft-delete `destroy` method in `backend/app/Http/Controllers/IssueController.php`
- [ ] T025 [US2] Write tests for history log generation in `backend/tests/Feature/IssueHistoryTest.php`
- [ ] T026 [P] [US2] Build `IssueDetail` view in `frontend/src/app/projects/[id]/issues/[key]/page.tsx`
- [ ] T027 [P] [US2] Build `UpdateIssueForm` in `frontend/src/components/issues/UpdateIssueForm.tsx`
- [ ] T028 [P] [US2] Build `ChangeHistory` list component in `frontend/src/components/issues/ChangeHistory.tsx`

**Checkpoint**: User Story 2 functional with automated change logging.

---

## Phase 5: User Story 3 - Categorize, Comment and Prioritize (Priority: P2)

**Goal**: Advanced organization and collaboration via comments and metadata.

**Independent Test**: Can be tested by adding a comment to an issue and seeing it appear in the discussion thread.

### Implementation for User Story 3

- [ ] T029 [US3] Implement `CommentController` in `backend/app/Http/Controllers/CommentController.php`
- [ ] T030 [US3] Add comment routes in `backend/routes/api.php`
- [ ] T031 [US3] Implement Redis-based in-app notification logic for comments in `backend/app/Services/NotificationService.php`
- [ ] T031a [US3] Implement project-specific issue type label configuration in `backend/app/Http/Controllers/ProjectConfigController.php` (FR-009)
- [ ] T031b [US3] Implement email delivery for comments (Laravel Mail/Queue) in `backend/app/Mail/IssueCommentNotification.php` (FR-010)
- [ ] T032 [US3] Write tests for commenting, labels, and notifications in `backend/tests/Feature/IssueCommentTest.php`
- [ ] T033 [P] [US3] Build `CommentList` and `CommentForm` components in `frontend/src/components/issues/Comments.tsx`
- [ ] T034 [P] [US3] Integrate Markdown renderer (`react-markdown`) in `frontend/src/components/shared/Markdown.tsx`
- [ ] T035 [US3] Add filtering and sorting to `IssueList.tsx` (by priority, type, category)
- [ ] T035a [P] [US3] Add 'Notify by Email' checkbox to `CommentForm.tsx` and integrate with API call

**Checkpoint**: Advanced collaboration features complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation

- [ ] T036 [P] Update OpenAPI spec in `backend/public/docs/openapi.yaml`
- [ ] T037 Perform code cleanup and type safety check across all new components
- [ ] T038 Final verification against `quickstart.md`

---

## Dependencies & Execution Order

### User Story Dependencies

- Phase 1 & 2 MUST be complete before any US implementation.
- US1 (MVP) is the primary goal.
- US2 depends on US1 (requires existing issues to update).
- US3 can proceed in parallel with US2 after US1 is stable.

### Parallel Opportunities

- Migrations (T003-T006)
- Models (T008-T010)
- Frontend vs Backend development within each US phase.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify an admin can create an issue and a user can see it in the list.

### Incremental Delivery

1. Add US2: Enable status transitions and field updates with history.
2. Add US3: Enable comments and advanced filtering.
