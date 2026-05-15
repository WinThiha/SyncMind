# Data Model: Android App Setup (Jetpack Compose)

**Feature**: `005-android-app-setup`  
**Date**: 2026-04-08

## Entities

### User
- **id**: Integer (primary key from backend)
- **name**: String
- **email**: String (unique)
- **email_verified_at**: Timestamp (optional)
- **created_at**: Timestamp
- **updated_at**: Timestamp

### Project
- **id**: Integer (primary key from backend)
- **name**: String
- **description**: String (optional)
- **status**: String (e.g., "active", "completed", "archived")
- **user_id**: Integer (foreign key to User)
- **created_at**: Timestamp
- **updated_at**: Timestamp

### AuthToken
- **token**: String (plain text Sanctum token)
- **type**: String (e.g., "Bearer")
- **expires_at**: Timestamp (optional)

## DTOs (Data Transfer Objects)

These objects will represent the JSON structures expected from/sent to the backend.

### LoginRequest
- **email**: String
- **password**: String

### LoginResponse
- **token**: String
- **user**: User (object)

### ProjectsResponse
- **data**: List<Project>
- **links**: PaginationLinks (optional)
- **meta**: PaginationMeta (optional)

## Relationships

- **User** has many **Projects**.
- **Project** belongs to one **User**.
- **AuthToken** is associated with one **User** session on the device.

## Validation Rules (Mobile-side)

- **Login**:
  - Email MUST be a valid email format.
  - Password MUST NOT be empty.
- **Projects**:
  - Fetch results MUST be stored/cached temporarily for offline view if desired (future phase).
