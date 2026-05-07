# project-member-management Specification

## Purpose
TBD - created by archiving change project-member-position-management. Update Purpose after archive.
## Requirements
### Requirement: Project Membership Stores Position
The system SHALL store member position as project-scoped membership data on the project membership record, independent of global user profile attributes.

#### Scenario: Membership record persists position
- **WHEN** a project member is created with a position value
- **THEN** the system stores that value on the membership record for that project-member pair

#### Scenario: Position is optional
- **WHEN** a project member is created without a position value
- **THEN** the system stores a null/empty project membership position without failing member creation

### Requirement: Member Management APIs Expose and Update Position
The system SHALL allow authorized project admins to set and update project member position through existing member management APIs and SHALL include membership position in member listing responses.

#### Scenario: Add member with position
- **WHEN** an authorized project admin adds an existing user as a project member and provides a position
- **THEN** the system creates the membership with the provided role and position

#### Scenario: Update member position
- **WHEN** an authorized project admin updates a project member and provides a new position
- **THEN** the system updates the membership position for that project-member pair

#### Scenario: List members includes position
- **WHEN** any authorized user retrieves project members
- **THEN** each member entry includes the membership role and membership position values

#### Scenario: Unauthorized member cannot update position
- **WHEN** a non-admin member attempts to update another member's position
- **THEN** the system rejects the request with an authorization error

### Requirement: Invitation Flow Supports Project Position
The system SHALL support project position in invitation lifecycle so invited members can be onboarded with a predefined project-scoped position.

#### Scenario: Create invitation with position
- **WHEN** an authorized project admin creates an invitation and provides a position
- **THEN** the invitation stores the provided position along with role and recipient email

#### Scenario: Accept invitation applies position to membership
- **WHEN** a user accepts a valid invitation that contains a position
- **THEN** the system creates project membership with both invitation role and invitation position

#### Scenario: Accept invitation without position remains valid
- **WHEN** a user accepts a valid invitation that has no position
- **THEN** the system creates project membership successfully with a null/empty position

