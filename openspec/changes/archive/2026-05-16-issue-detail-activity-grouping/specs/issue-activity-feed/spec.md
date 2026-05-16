## ADDED Requirements

### Requirement: Unified Activity Feed Grouping
The system SHALL merge comments and history entries into a unified activity feed grouped by user and time proximity.

#### Scenario: Activity entities are grouped correctly
- **WHEN** an activity feed receives a list of comments and history entries
- **THEN** entries are sorted by `created_at` descending and grouped by `user.id` with a 2000ms time window
- **AND** entries with the same user where the time difference is less than 2000ms are combined into a single entity with `comments[]` and `history[]` arrays

#### Scenario: Single user with mixed entries within window
- **WHEN** the same user posts a comment and triggers a history entry within 2 seconds
- **THEN** the grouped entity contains both entries: the comment in `comments[]` and the history entry in `history[]`

#### Scenario: Entries from different users remain separate
- **WHEN** two entries have different `user.id` values
- **THEN** they are rendered as separate grouped entities even if within 2000ms

#### Scenario: Entries from same user outside window remain separate
- **WHEN** the same user has entries separated by more than 2000ms
- **THEN** they are rendered as separate grouped entities

### Requirement: Assignee ID History Resolution
The system SHALL resolve `assignee_id` field changes in history entries to member names when a `members` array is available.

#### Scenario: Assignee ID shows member name
- **WHEN** a history entry with `field: "assignee_id"` is rendered
- **AND** a member with matching ID exists in the `members` array
- **THEN** the old and new values display the member names instead of raw IDs

#### Scenario: Assignee ID with no matching member
- **WHEN** a history entry with `field: "assignee_id"` is rendered
- **AND** no member with matching ID exists in the `members` array
- **THEN** the raw ID or null is displayed with the "none" label

### Requirement: Activity Feed Rendering Order
The system SHALL render history entries above comment entries within each grouped entity.

#### Scenario: History rendered above comments
- **WHEN** a grouped entity contains both `history[]` and `comments[]` entries
- **THEN** the history entries section appears above the comments section in the rendered output