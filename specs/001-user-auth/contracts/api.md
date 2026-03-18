# API Contracts: User Authentication

This document outlines the REST API endpoints required for the user authentication feature.

## Base URL
`/api/auth` (or utilize Sanctum's default routes for SPA auth where applicable)

## 1. CSRF Cookie (Sanctum SPA Auth)
- **Method**: `GET`
- **Endpoint**: `/sanctum/csrf-cookie`
- **Description**: Initializes CSRF protection for the SPA. Must be called before any POST/PUT/DELETE requests.

## 2. Register
- **Method**: `POST`
- **Endpoint**: `/api/auth/register`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "password_confirmation": "securepassword"
  }
  ```
- **Responses**:
  - `201 Created`: User registered successfully, verification email sent.
  - `422 Unprocessable Entity`: Validation errors (e.g., email already exists).

## 3. Login
- **Method**: `POST`
- **Endpoint**: `/api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "remember": true 
  }
  ```
- **Responses**:
  - `200 OK`: Authenticated (Session cookie set).
  - `401 Unauthorized`: Invalid credentials.
  - `403 Forbidden`: Email not verified.
  - `429 Too Many Requests`: Rate limit exceeded.

## 4. Google Login / Link
- **Method**: `POST`
- **Endpoint**: `/api/auth/google/callback`
- **Request Body**:
  ```json
  {
    "token": "GOOGLE_ACCESS_TOKEN_OR_ID_TOKEN"
  }
  ```
- **Responses**:
  - `200 OK`: Authenticated via Google. Existing user logged in, or new user created and logged in. (Session cookie set).
  - `401 Unauthorized`: Invalid Google token.

## 5. Logout
- **Method**: `POST`
- **Endpoint**: `/api/auth/logout`
- **Headers**: Requires authentication.
- **Responses**:
  - `204 No Content`: Successfully logged out (Cookies invalidated).

## 6. Current User
- **Method**: `GET`
- **Endpoint**: `/api/user`
- **Headers**: Requires authentication.
- **Responses**:
  - `200 OK`: Returns current authenticated user data.
  - `401 Unauthorized`: Not logged in.