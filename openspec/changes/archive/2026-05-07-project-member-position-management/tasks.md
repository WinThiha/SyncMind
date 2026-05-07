## 1. Database and Domain Model

- [x] 1.1 Add nullable `position` column to `project_members` with migration and rollback support.
- [x] 1.2 Update project membership relation/pivot model to include `position` in mass assignment and serialized pivot data.
- [x] 1.3 Decide and document transitional behavior for `users.position` vs `project_members.position` in project contexts.

## 2. Backend API and Invitation Flow

- [x] 2.1 Extend project member list endpoint to return membership `position` alongside membership `role`.
- [x] 2.2 Extend add-member endpoint to validate and persist optional `position` when attaching membership.
- [x] 2.3 Extend update-member endpoint to validate and update optional `position` (while preserving existing role constraints).
- [x] 2.4 Extend project invitation schema/controller/model to accept and store optional `position`.
- [x] 2.5 Update invitation acceptance flow so accepted invitations create membership with invitation `position`.

## 3. Frontend Member Management

- [x] 3.1 Update project member and invitation API types to include optional `position`.
- [x] 3.2 Add position input to add/invite form and send it in member/invitation requests.
- [x] 3.3 Display member position in member list and provide admin edit flow for position updates.
- [x] 3.4 Ensure invitation UI surfaces invited position where relevant.

## 4. Validation and Regression Coverage

- [x] 4.1 Add/adjust backend feature tests for add/update/list member position authorization and persistence.
- [x] 4.2 Add/adjust backend invitation tests for position propagation on acceptance.
- [x] 4.3 Add/adjust frontend tests for member management position entry/edit behavior.
- [x] 4.4 Run backend and frontend test suites with project-required test safety commands.
