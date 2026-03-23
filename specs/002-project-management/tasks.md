# Implementation Tasks: Project Management

**Feature**: 002-project-management
**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)

## Strategy

The implementation will follow a story-by-story approach, starting with the foundational backend models and API routes, then building out the frontend components. We will deliver User Story 1 (Create Project) as the MVP, followed by User Story 2 (View Projects), User Story 3 (Manage Members), and finally User Story 4 (Update and Delete Projects).

**MVP Scope**: User Story 1 (Create Project) - allowing users to create workspaces.

## Dependencies

- Phase 1 & 2 must be completed before any User Story phase.
- US1 (Create Project) is a prerequisite for US2, US3, and US4.
- US2 (View Projects) should be completed before US3 and US4 to provide a UI path to those features.
- US3 and US4 can be executed in parallel after US2.

## Phase 1: Setup

- [x] T001 Generate Laravel migration and model for `Project` in `backend/`
- [x] T002 Generate Laravel migration and model for `ProjectMember` in `backend/`
- [x] T003 Update `User` model to define `hasMany` (creator) and `belongsToMany` (member) relationships with `Project` in `backend/app/Models/User.php`
- [x] T004 Run database migrations in `backend/`

## Phase 2: Foundational

- [x] T005 [P] Generate `ProjectPolicy` in `backend/app/Policies/ProjectPolicy.php` to handle access control logic
- [x] T006 [P] Create base API Resource Controller for Projects in `backend/app/Http/Controllers/ProjectController.php`
- [x] T007 [P] Set up API routes for Projects in `backend/routes/api.php`
- [x] T008 Update frontend API client (`frontend/src/lib/api/projects.ts` or similar) to prepare for project endpoints

## Phase 3: User Story 1 - Create a Project

**Goal**: Registered users can create new projects with essential details.
**Independent Test**: Can be fully tested by a registered user submitting the project creation form and verifying the new project appears in their project list.

- [x] T009 [US1] Create FormRequest for storing projects (`StoreProjectRequest`) validating unique key (2-10 uppercase chars)
- [x] T010 [US1] Implement `store` method in `ProjectController` to create project, attach creator as admin, and return data
- [x] T011 [US1] Write backend tests for project creation and key uniqueness constraint
- [x] T012 [P] [US1] Create frontend React hook/API call for creating a project
- [x] T013 [P] [US1] Build "Create Project" form component with validation in `frontend/src/components/projects/CreateProjectForm.tsx`
- [x] T014 [US1] Integrate "Create Project" form into the frontend dashboard/project page

## Phase 4: User Story 2 - View Involved Projects

**Goal**: Users see a list of projects they have created or been added to.
**Independent Test**: Can be tested by adding a user to multiple specific projects and ensuring their dashboard only displays those projects and no others.

- [x] T015 [US2] Implement `index` method in `ProjectController` to return only projects the user is involved in
- [x] T016 [US2] Implement `show` method in `ProjectController` with Policy authorization check
- [x] T017 [US2] Write backend tests for project listing and access control (deny access to non-members)
- [x] T018 [P] [US2] Create frontend React hook/API call for fetching projects
- [x] T019 [P] [US2] Build "Project List" component in `frontend/src/components/projects/ProjectList.tsx`
- [x] T020 [US2] Build "Project Detail" view page in `frontend/src/app/projects/[id]/page.tsx`
- [x] T021 [US2] Integrate project list into the main user dashboard

## Phase 5: User Story 3 - Manage Project Members

**Goal**: Project creators and admins can add/manage other registered users.
**Independent Test**: Can be tested by having an authorized user add another user to the project, and verifying the new user gains access.

- [x] T022 [US3] Create `ProjectMemberController` in `backend/app/Http/Controllers/ProjectMemberController.php`
- [x] T023 [US3] Add API routes for project members in `backend/routes/api.php`
- [x] T024 [US3] Implement `store` (add member) and `index` (list members) methods in `ProjectMemberController`
- [x] T025 [US3] Write backend tests for member management and role-based authorization
- [x] T026 [P] [US3] Create frontend API calls for managing members
- [x] T027 [P] [US3] Build "Member Management" UI component in `frontend/src/components/projects/MemberManagement.tsx`
- [x] T028 [US3] Integrate member management UI into the project detail settings view

## Phase 6: User Story 4 - Update and Delete Projects

**Goal**: Project creators can update details, delete projects, or transfer ownership.
**Independent Test**: Can be tested by a creator editing project fields, transferring ownership, or deleting a project.

- [x] T029 [US4] Create FormRequest for updating projects (`UpdateProjectRequest`)
- [x] T030 [US4] Implement `update` method in `ProjectController` (restricted to creator/admin)
- [x] T031 [US4] Implement `destroy` method in `ProjectController` (strictly restricted to creator)
- [x] T032 [US4] Update `destroy` logic in `ProjectMemberController` to handle creator departure block (assignment cleanup deferred to future feature)
- [x] T033 [US4] Implement `transferOwnership` method in `ProjectController` (restricted to creator, target must be Admin)
- [x] T034 [US4] Write backend tests for update/delete authorization, creator departure blocks, and ownership transfer
- [x] T035 [P] [US4] Create frontend API calls for updating, deleting projects, and transferring ownership
- [x] T036 [P] [US4] Build "Project Settings" form component for updates
- [x] T037 [US4] Add "Delete Project" functionality with confirmation dialogue for creators
- [x] T038 [US4] Add "Transfer Ownership" UI functionality for creators

## Phase 7: Polish

- [x] T039 Polish frontend UI for loading states and error handling during project operations
- [x] T040 Review and verify all backend responses conform to the defined API contracts
- [x] T041 Generate and publish API documentation for the new Project endpoints (e.g., using Scribe/Swagger) to satisfy Constitution Principle III
- [x] T042 Execute all frontend and backend tests to ensure full feature integrity
- [x] T043 [US4] Update `ProjectController@index` to fix project ID collision in the user's project list
- [x] T044 [US3] Update `ProjectMemberController@index` to include pivot role in the member list
- [x] T045 [P] [US3] Implement member role update (Admin only) and member removal in `MemberManagement.tsx`
- [x] T046 [P] [US4] Implement editable `issue_types` in `ProjectSettings.tsx`
- [x] T047 [P] [US2] Add 'Owner' badge and conditional UI for project ownership in `ProjectDetailPage`
- [x] T048 [P] [US2] Fix Next.js 15+ `params` unwrap using `React.use()` in dynamic routes