# API Contracts: Project Management

## Base URL
`/api/projects`

## Authentication
All endpoints require Laravel Sanctum Authentication (`Bearer` token or stateful session cookie).

---

### `GET /api/projects`
List all projects the authenticated user is involved in.

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Frontend Overhaul",
      "key": "SYNC",
      "icon": "https://example.com/icon.png",
      "role": "admin"
    }
  ]
}
```

---

### `POST /api/projects`
Create a new project. Automatically adds the creator to `project_members` as `admin` and sets them as `creator_id`.

**Request**:
```json
{
  "name": "Frontend Overhaul",
  "key": "SYNC",
  "icon": "https://example.com/icon.png",
  "issue_types": ["Task", "Bug", "Story"]
}
```

**Response (201 Created)**:
```json
{
  "message": "Project created successfully.",
  "data": { "id": 1, "key": "SYNC", "name": "Frontend Overhaul" }
}
```

---

### `GET /api/projects/{id}`
Get project details. Requires membership.

**Response (200 OK)**: Full project object.

---

### `PUT /api/projects/{id}`
Update project settings. Requires `creator_id` or `admin` role (depending on business rule, spec says "allow project creator to update").

---

### `DELETE /api/projects/{id}`
Delete a project. Strictly requires authenticated user to be the `creator_id`.

---

### `GET /api/projects/{id}/members`
List all members in the project.

---

### `POST /api/projects/{id}/members`
Add a member to the project. Requires authenticated user to be an `admin` or the creator.

**Request**:
```json
{
  "email": "user@example.com",
  "role": "normal"
}
```

---

### `PUT /api/projects/{id}/members/{user_id}`
Update member role.

---

### `DELETE /api/projects/{id}/members/{user_id}`
Remove a member from the project. Cannot remove the creator. If removing a member, assignments must be gracefully handled (backend logic sets assigned issues to null).