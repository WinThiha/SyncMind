# Feature Specification: Issue Management

**Feature Branch**: `003-issue-management`  
**Created**: 2026-03-23  
**Status**: Draft  
**Input**: User description: "Inside projects, admins can manage issues. Issues are same as Backlog's issues. Issue management should be as close to Backlog's as possible."

## Clarifications

### Session 2026-03-23
- Q: What format should the issue description support? → A: Markdown
- Q: How should the numeric part of the issue key be generated and sequenced? → A: Project key + sequential per project
- Q: How should members be notified of new comments on an issue? → A: In-app by default; email if explicitly selected

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and View Issues (Priority: P1)

Admins need to be able to create new issues within a project with essential fields like summary, description, and status, so that work can be tracked. All project members should be able to view these issues.

**Why this priority**: Core functionality. Without the ability to create and see issues, no tracking can occur.

**Independent Test**: Can be fully tested by an admin creating an issue and a normal member viewing it in the project's issue list.

**Acceptance Scenarios**:

1. **Given** an admin is in a project, **When** they submit the "Create Issue" form with a summary and description, **Then** a new issue is created with a unique ID (e.g., KEY-1).
2. **Given** a project member (admin or normal), **When** they view the project's issue list, **Then** they see all issues created within that project.

---

### User Story 2 - Update Issue Status and Details (Priority: P1)

Admins need to update the status (e.g., Open, In Progress, Resolved, Closed) and other details of an issue to reflect current progress.

**Why this priority**: Essential for the lifecycle of an issue. Tracking "work in progress" is a primary goal.

**Independent Test**: Can be tested by an admin changing an issue's status and verifying the change is reflected for all members.

**Acceptance Scenarios**:

1. **Given** an existing issue, **When** an admin changes its status to "In Progress", **Then** the issue status is updated and visible to all members.
2. **Given** an existing issue, **When** an admin updates the description or assignee, **Then** the changes are persisted.

---

### User Story 3 - Categorize and Prioritize Issues (Priority: P2)

Admins can assign issues to specific types (Bug, Task, Request), priorities (Low, Normal, High), and categories/milestones to better organize the backlog.

**Why this priority**: Improves organization and filtering, though not strictly required for basic tracking.

**Independent Test**: Can be tested by creating issues with different priorities and types, then filtering the list by these attributes.

**Acceptance Scenarios**:

1. **Given** an issue, **When** an admin sets its priority to "High" and type to "Bug", **Then** these attributes are saved and can be used for sorting/filtering.

---

### Edge Cases

- **Duplicate Keys**: How does the system handle issue key generation if multiple issues are created simultaneously? (Informed guess: Database sequence/locking ensures unique incremental IDs).
- **Member Permissions**: What happens if a non-admin tries to edit an issue? (Informed guess: System MUST deny edit access and only allow viewing).
- **Deleted Project**: What happens to issues when a project is deleted? (Informed guess: Issues are cascade-deleted or archived with the project).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow project admins to create issues within their projects.
- **FR-002**: Issues MUST have at least the following fields: Summary (required), Description (Markdown supported), Status, Priority, Issue Type, Assignee, Category, Milestone, and Version.
- **FR-003**: System MUST automatically generate a unique human-readable Key for each issue (e.g., PROJ-123) by appending a project-specific sequential number to the Project Key.
- **FR-004**: System MUST allow project admins to update any field of an existing issue.
- **FR-005**: All project members (Admin, Normal) MUST be able to view the list of issues and individual issue details within their project.
- **FR-006**: Issue Status MUST include at least: Open, In Progress, Resolved, and Closed.
- **FR-007**: Issue Priority MUST include at least: Low, Normal, and High.
- **FR-008**: System MUST allow project admins to delete issues via soft-deletion (archiving), ensuring that data is hidden from active lists but preserved for historical auditing.
- **FR-009**: System MUST support a global set of core "Issue Types" (e.g., Bug, Task, Request) while allowing project admins to apply custom labels to these types for project-specific context (e.g., "Request" labeled as "Feature Request" in Project A).
- **FR-010**: System MUST allow project members to add comments to issues, providing in-app notifications by default and optional email notifications if explicitly selected via a "Notify by Email" checkbox on the comment form. The system MUST automatically track a full history of all field changes (e.g., status updates, assignee changes), recording the actor and timestamp.

### Key Entities *(include if feature involves data)*

- **Issue**: The primary entity representing a unit of work. Key attributes: Summary, Description, Key (human-readable), Status, Priority, Type.
- **Project**: Existing entity. Issues belong to a Project.
- **User**: Existing entity. Issues can be assigned to a User.
- **Comment**: Represents a discussion thread on an Issue.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can create a new issue in under 30 seconds from any project view.
- **SC-002**: 100% of issues generated have a unique, sequential ID relative to their project key.
- **SC-003**: Normal members are strictly restricted from editing or deleting issues, verified by 100% of unauthorized attempts being blocked.
- **SC-004**: Issue list loads and filters in under 1 second for projects with up to 1,000 issues.
