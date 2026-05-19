## Context

The backend is configured for Laravel Sanctum but the table is missing. The Android app uses Retrofit for networking and `EncryptedSharedPreferences` for token storage. We need to bridge the gap between the two and ensure the user's profile persists.

## Goals / Non-Goals

**Goals:**
- Fix the login-to-token handshake.
- Securely persist the User profile.
- Enable the backend's API token table.

**Non-Goals:**
- Implementing a full offline database (SQLite/Room).
- Changing the existing session-based auth for the web frontend.

## Decisions

### 1. JSON-in-Prefs for User Identity
- **Decision**: Serialize the `User` data class to JSON and store it in the existing `EncryptedSharedPreferences`.
- **Rationale**: We already have a secure storage mechanism (AES-256) initialized. Serializing the small User object is more efficient than setting up a full Room database just for profile info.

### 2. Automatic Device Detection
- **Decision**: Use `android.os.Build.MODEL` as the default `device_name`.
- **Rationale**: Provides better visibility for users in the "Logged in devices" section of their account without requiring manual input.

## Architecture Sketch

```
[ LoginScreen ]
      │
      ▼
[ LoginViewModel ] ─── (Adds Build.MODEL) ───┐
                                             │
                                             ▼
                                     [ AuthRepository ]
                                             │
      ┌──────────────────────────────────────┴──────────────┐
      │                                                     │
      ▼                                                     ▼
[ TokenManager ]                                     [ AuthApiService ]
 (Saves Token + User)                                 (POST /api/auth/login)
```

## Risks / Trade-offs

- **[Risk]** Serialization errors if User model changes.
- **Mitigation**: Use `kotlinx.serialization` with default values and handle parsing exceptions in `TokenManager`.
