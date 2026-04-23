## Why

The mobile login flow is currently broken because the Android app and Laravel backend are "speaking different dialects." The backend expects a `device_name` to issue an API token, but the Android app doesn't send it. Additionally, while the token is saved, the user's identity (name, email) is lost after the app closes, requiring a better persistence strategy.

## What Changes

### Backend
- Run the pending migration for `personal_access_tokens`.

### Android
- **Schema**: Add `device_name` to `LoginRequest`.
- **Persistence**: Enhance `TokenManager` to store the `User` object securely in `EncryptedSharedPreferences`.
- **Logic**: Update `AuthRepository` to save user info upon login.
- **UI**: Update `LoginViewModel` to provide the device model automatically.

## Capabilities

### Modified Capabilities
- `api-token-auth`: Extend to include user profile persistence.
- `005-android-app-setup`: Update networking models to match backend expectations.

## Impact

- **Database**: `personal_access_tokens` table created.
- **Android Storage**: `auth_prefs` will now contain both `auth_token` and `user_data` (JSON).
- **User Experience**: Users will remain "logged in" with their profile visible across app restarts.
