# Data Model: User Authentication and Social Login

## Entities

### 1. `users` Table
Represents a system user. Modifies the default Laravel `users` table.
- `id` (UUID or BigInt, Primary Key)
- `name` (String)
- `email` (String, Unique)
- email_verified_at (Timestamp, Nullable)
- password (String)
- remember_token (String, Nullable)

- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### 2. `social_accounts` Table (or `linked_social_accounts`)
Stores linked third-party authentication providers for users.
- `id` (BigInt, Primary Key)
- `user_id` (Foreign Key -> `users.id`, Cascade Delete)
- `provider_name` (String, e.g., 'google')
- `provider_id` (String, the unique ID from the provider)
- `provider_email` (String, to track what email was linked)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Constraints**:
- Unique constraint on `(provider_name, provider_id)`.
- Unique constraint on `(user_id, provider_name)` to prevent linking multiple accounts of the same provider to one user.

## State Transitions
1. **Registration (Standard)**: `users` record created. `email_verified_at` is `null`. State: *Pending Verification*.
2. **Verification**: Email link clicked. `email_verified_at` updated to current timestamp. State: *Active*.
3. **Registration (Google)**: `users` record created. `email_verified_at` set immediately (since Google is trusted). `password` is required. `social_accounts` record created. State: *Active*.
4. **Email Change**: If `users.email` is updated, any `social_accounts` linked to the user are automatically deleted to enforce the unlinking rule.