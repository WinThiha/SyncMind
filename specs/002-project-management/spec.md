# Feature Specification: Project Management

**Feature Branch**: `002-project-management`  
**Created**: 2026-03-23  
**Status**: Draft  
**Input**: User description: "Registered users can create projects. A project's data includes name, key, icon, issue types, categories, milestones and versions. A project can include other registered members as admin or normal user. Users can view projects they are involved in, update and delete their created projects."

## Clarifications

### Session 2026-03-23
- Q: What should be the allowed format and constraints for a project key? → A: Uppercase alphabetical (2-10 chars)
- Q: When a member is removed from a project, how should the system handle their currently assigned items? → A: Unassign active items, keep historical references
- Q: If a project creator attempts to delete their account, how should the system handle their owned projects? → A: Block the account deletion until project ownership is transferred to another member

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a Project (Priority: P1)

Registered users need to be able to create new projects with essential details like name, key, and icon, so they can start organizing their work.

**Why this priority**: Project creation is the fundamental starting point. Without projects, no other features can function.

**Independent Test**: Can be fully tested by a registered user submitting the project creation form and verifying the new project appears in their project list.

**Acceptance Scenarios**:

1. **Given** a registered user is logged in, **When** they submit a valid new project form (name, key, icon), **Then** a new project is created and the user is set as its creator.
2. **Given** a registered user is logged in, **When** they submit a project with an already existing key, **Then** the system rejects the submission with a clear validation error.

---

### User Story 2 - View Involved Projects (Priority: P1)

Users need to see a list of projects they have created or been added to as members (admin or normal).

**Why this priority**: Users must be able to navigate to their projects to interact with them and view their assignments.

**Independent Test**: Can be tested by adding a user to multiple specific projects and ensuring their dashboard only displays those projects and no others.

**Acceptance Scenarios**:

1. **Given** a user is involved in three projects, **When** they access their project list, **Then** they see exactly those three projects.
2. **Given** a user is not involved in a project, **When** they attempt to access it directly via URL, **Then** the system denies access.

---

### User Story 3 - Manage Project Members (Priority: P2)

Project creators and admins need to add other registered users to the project and assign them specific roles (admin or normal user).

**Why this priority**: Collaboration is core to the feature, enabling multiple users to work together securely.

**Independent Test**: Can be tested by having an authorized user add another user to the project, and then verifying the new user gains the appropriate level of access.

**Acceptance Scenarios**:

1. **Given** an authorized project member (creator/admin), **When** they add a registered user as a normal user, **Then** the new user can view the project in their list.
2. **Given** an authorized project member, **When** they assign another user as an admin, **Then** the new admin gains administrative privileges within the project.

---

### User Story 4 - Update and Delete Projects (Priority: P3)

Users who created a project need to be able to update its details (like categories, issue types, milestones, versions) or delete it entirely if it's no longer needed.

**Why this priority**: Maintenance and cleanup are necessary lifecycle events, but secondary to initial creation and collaboration.

**Independent Test**: Can be tested by a creator editing project fields and verifying changes, or deleting a project and ensuring it is permanently removed from the system.

**Acceptance Scenarios**:

1. **Given** a project creator, **When** they update the project's milestones and versions, **Then** the changes are saved and reflected to all members.
2. **Given** a project creator, **When** they delete their project, **Then** the project and its associations are permanently removed from the system.
3. **Given** a project admin who is not the creator, **When** they attempt to delete the project, **Then** the system denies the action based on permission rules.

---

### Edge Cases

- **Global Key Conflict:** If a user attempts to create a project with a key that is already in use by any other project in the system, the creation is rejected.
- **Member Removal:** When a user is removed from a project, they lose access. Cleanup of assigned items will be handled in a future feature focused on task assignment. Historical references to that user will be preserved for integrity.
- **Creator Departure:** If a project creator attempts to leave the project or delete their account, the system will block the action and require them to transfer ownership to another member first.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow registered users to create a project.
- **FR-002**: System MUST store project data including name, key, icon, issue types, categories, milestones, and versions.
- **FR-003**: System MUST automatically assign the user who created the project as its initial owner/creator with full access.
- **FR-004**: System MUST enforce that project keys are unique across the system, formatted as short uppercase alphabetical strings (2-10 characters, e.g., SYNC, PRJ) to allow for consistent referencing.
- **FR-005**: System MUST allow the project creator to update any of the project's data fields.
- **FR-006**: System MUST allow the project creator to permanently delete the project, and restrict this action strictly to the original creator.
- **FR-007**: System MUST allow authorized project members (creators/admins) to add other registered members to the project.
- **FR-008**: System MUST support at least two role levels for added members: "Admin" and "Normal User".
- FR-009: System MUST provide a view displaying all projects a user is involved in (as creator, admin, or normal user).
- FR-010: System MUST prevent users from viewing or accessing projects they are not members of.
- FR-011: System MUST allow a project creator to transfer ownership of the project to another existing Admin member.
- FR-012: System MUST allow authorized project members (creators/admins) to update the role of other members (except the creator).
- FR-013: System MUST allow authorized project members (creators/admins) to remove other members from the project (except the creator).
- FR-014: System MUST provide a clear visual indication (e.g., 'Owner' badge) when the current user is the project creator.
- FR-015: System MUST restrict UI access to sensitive actions (delete, transfer ownership) strictly to the project creator.

### Key Entities

- **Project**: Represents a collaborative workspace. Contains fields for Name, Key, Icon, Issue Types, Categories, Milestones, and Versions.
- **ProjectMember**: Represents the association between a User and a Project, including their specific Role (Admin, Normal User).
- **User**: The registered account holder interacting with the system.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can successfully create a new project and view it on their dashboard in under 1 minute.
- **SC-002**: Users added to a project can access it immediately without needing to log out and log back in.
- **SC-003**: Project access controls correctly prevent 100% of unauthorized direct URL access attempts to projects the user is not a member of.
- **SC-004**: 95% of project-related actions (creation, updates, deletions) reflect immediately on the UI for all involved members.