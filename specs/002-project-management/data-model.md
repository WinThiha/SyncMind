# Data Model: Project Management

## Entity: Project
Represents a collaborative workspace.

**Table**: `projects`

| Field | Type | Modifiers | Description |
|-------|------|-----------|-------------|
| `id` | UUID / BigInt | Primary Key | Unique identifier |
| `name` | String | Required | Display name of the project |
| `key` | String(10) | Required, Unique | Short uppercase alphabetical string (2-10 chars) used for ticket prefixing |
| `icon` | String | Optional | URL or reference to the project icon |
| `issue_types` | JSON | Required | Configured issue types (e.g., Bug, Task, Story) |
| `categories` | JSON | Optional | Configured categories |
| `milestones` | JSON | Optional | Configured milestones |
| `versions` | JSON | Optional | Configured versions |
| `creator_id` | Foreign Key | Required | References `users.id` |
| `created_at` | Timestamp | | Record creation |
| `updated_at` | Timestamp | | Record update |

## Entity: Project Member
Represents the association between a User and a Project with specific role permissions.

**Table**: `project_members` (Pivot Table)

| Field | Type | Modifiers | Description |
|-------|------|-----------|-------------|
| `id` | UUID / BigInt | Primary Key | Unique identifier |
| `project_id` | Foreign Key | Required | References `projects.id` on delete cascade |
| `user_id` | Foreign Key | Required | References `users.id` on delete cascade |
| `role` | Enum/String | Required | `admin` or `normal` |
| `created_at` | Timestamp | | Date the member was added |
| `updated_at` | Timestamp | | Date role was updated |

*Unique constraint on `project_id` + `user_id`.*

## Relationships
- **User** `hasMany` **Projects** (as creator)
- **User** `belongsToMany` **Projects** (as member)
- **Project** `belongsTo` **User** (as creator)
- **Project** `hasMany` **ProjectMembers**
- **Project** `belongsToMany` **Users** (through project_members)