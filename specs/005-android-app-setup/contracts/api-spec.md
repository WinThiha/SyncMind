# API Contract: Android App Setup (Jetpack Compose)

**Feature**: `005-android-app-setup`  
**Date**: 2026-04-08

## Endpoints

### 1. POST /api/auth/login (Public)
Authenticates a user and returns a Sanctum auth token.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response (Success 200 OK)**:
```json
{
  "token": "1|abc123token...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z"
  }
}
```

**Response (Error 422 Unprocessable Entity)**:
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["These credentials do not match our records."]
  }
}
```

---

### 2. POST /api/auth/logout (Protected)
Revokes the current user's token.

**Headers**:
- `Authorization: Bearer {token}`

**Response (Success 204 No Content)**:
(Empty body)

---

### 3. GET /api/projects (Protected)
Retrieves a list of the authenticated user's projects.

**Headers**:
- `Authorization: Bearer {token}`

**Response (Success 200 OK)**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "My First Project",
      "description": "Initial setup project",
      "status": "active",
      "user_id": 1,
      "created_at": "2026-03-01T10:00:00Z",
      "updated_at": "2026-03-01T10:00:00Z"
    }
  ],
  "links": {
    "first": "...",
    "last": "...",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "path": "...",
    "per_page": 15,
    "to": 1,
    "total": 1
  }
}
```

---

### 4. GET /api/user (Protected)
Retrieves the authenticated user's profile.

**Headers**:
- `Authorization: Bearer {token}`

**Response (Success 200 OK)**:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```
