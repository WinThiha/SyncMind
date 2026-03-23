# Phase 0: Research & Technical Decisions

## API Architecture
- **Decision**: Laravel API Resource Controllers using standard REST conventions (`/api/projects`, `/api/projects/{id}/members`).
- **Rationale**: Best practice for Laravel + Next.js decouple architectures. Follows the existing API setup with Sanctum authentication.

## Access Control
- **Decision**: Laravel Policies (`ProjectPolicy`) for authorization.
- **Rationale**: Keeps authorization logic centralized. The policy will check the user's role in the `project_members` pivot table before allowing view/update/delete/member-management actions.

## Unique Key Constraints
- **Decision**: Enforce uppercase formatting (2-10 characters) at both the Frontend (Form Validation) and Backend (FormRequest Validation + Database Unique Constraint).
- **Rationale**: Ensures data integrity at the database level while providing immediate feedback on the frontend.

## Creator Departure / Member Removal
- **Decision**: Implement logical checks in the `destroy` method of `ProjectMemberController` to prevent a creator from removing themselves or deleting their account unless another user is made owner. If a member is removed, their foreign keys (like assigned tasks) will be set to `null` using `onDelete('set null')` or application logic.
- **Rationale**: Prevents orphaned projects and ensures historical references aren't broken by hard deletions of users.