# Data Model: Issue Management

## Entity: Issue
The primary unit of work within a project.

**Table**: `issues`

| Field | Type | Modifiers | Description |
|-------|------|-----------|-------------|
| `id` | BigInt | Primary Key | Internal unique identifier |
| `project_id` | Foreign Key | Required | References `projects.id` |
| `key_number` | Integer | Required | The sequential number for this project (e.g., 1 for PROJ-1) |
| `summary` | String | Required | Short summary of the issue |
| `description` | Text | Optional | Markdown-supported detailed description |
| `status` | Enum/String | Required | `open`, `in_progress`, `resolved`, `closed` |
| `priority` | Enum/String | Required | `low`, `normal`, `high` |
| `issue_type` | String | Required | e.g., `Bug`, `Task` (from project config) |
| `assignee_id` | Foreign Key | Optional | References `users.id` |
| `creator_id` | Foreign Key | Required | References `users.id` |
| `category` | String | Optional | |
| `milestone` | String | Optional | |
| `version` | String | Optional | |
| `created_at` | Timestamp | | |
| `updated_at` | Timestamp | | |
| `deleted_at` | Timestamp | | Soft delete support |

*Unique constraint on `project_id` + `key_number`.*

## Entity: Comment
Discussion thread entries for an issue.

**Table**: `issue_comments`

| Field | Type | Modifiers | Description |
|-------|------|-----------|-------------|
| `id` | BigInt | Primary Key | |
| `issue_id` | Foreign Key | Required | References `issues.id` |
| `user_id` | Foreign Key | Required | References `users.id` |
| `content` | Text | Required | Markdown-supported comment content |
| `created_at` | Timestamp | | |
| `updated_at` | Timestamp | | |

## Entity: Issue History
Audit log of changes to an issue.

**Table**: `issue_histories`

| Field | Type | Modifiers | Description |
|-------|------|-----------|-------------|
| `id` | BigInt | Primary Key | |
| `issue_id` | Foreign Key | Required | References `issues.id` |
| `user_id` | Foreign Key | Required | Actor who made the change |
| `field` | String | Required | Name of the field changed (e.g., `status`) |
| `old_value` | Text | Optional | |
| `new_value` | Text | Optional | |
| `created_at` | Timestamp | | |

## Entity: Project Issue Counter
Tracks the next sequential number for each project.

**Table**: `project_issue_counters`

| Field | Type | Modifiers | Description |
|-------|------|-----------|-------------|
| `project_id` | Foreign Key | Primary Key | References `projects.id` |
| `last_number` | Integer | Required, Default: 0 | Current highest issued number |

## Relationships
- **Project** `hasMany` **Issues**
- **Issue** `belongsTo` **Project**
- **Issue** `hasMany` **Comments**
- **Issue** `hasMany` **Histories**
- **Issue** `belongsTo` **User** (as Creator)
- **Issue** `belongsTo` **User** (as Assignee)
- **Comment** `belongsTo` **Issue**
- **Comment** `belongsTo` **User**
- **History** `belongsTo` **Issue**
- **History** `belongsTo` **User**
