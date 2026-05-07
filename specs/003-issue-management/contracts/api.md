# API Contracts: Issue Management

## Base URL
`/api/projects/{project_id}/issues`

---

### `GET /api/projects/{project_id}/issues`
List all issues for a project. Supports filtering by status, priority, and type.

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": 1,
      "key": "PROJ-1",
      "summary": "Implement login",
      "status": "open",
      "priority": "normal",
      "issue_type": "Task",
      "assignee": { "id": 5, "name": "John Doe" },
      "created_at": "2026-03-23T10:00:00Z"
    }
  ]
}
```

---

### `POST /api/projects/{project_id}/issues`
Create a new issue.

**Request**:
```json
{
  "summary": "Fix header bug",
  "description": "# The bug\nIt happens on mobile.",
  "status": "open",
  "priority": "high",
  "issue_type": "Bug",
  "assignee_id": 5,
  "category": "UI",
  "milestone": "v1.0"
}
```

---

### `GET /api/projects/{project_id}/issues/{issue_key}`
Get full issue details, including comments and history.

**Response (200 OK)**:
```json
{
  "data": {
    "id": 1,
    "key": "PROJ-1",
    "summary": "Implement login",
    "description": "...",
    "status": "open",
    "comments": [
      { "id": 10, "user": { "name": "Jane" }, "content": "Done!" }
    ],
    "history": [
      { "user": "Jane", "field": "status", "old": "open", "new": "resolved" }
    ]
  }
}
```

---

### `PUT /api/projects/{project_id}/issues/{issue_key}`
Update an issue. Automatically creates history records.

---

### `DELETE /api/projects/{project_id}/issues/{issue_key}`
Soft-delete an issue.

---

### `POST /api/projects/{project_id}/issues/{issue_key}/comments`
Add a comment to an issue.

**Request**:
```json
{
  "content": "I am working on this now.",
  "notify_emails": true
}
```
