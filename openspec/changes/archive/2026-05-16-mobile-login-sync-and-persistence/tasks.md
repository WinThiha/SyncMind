## 1. Database Initialization

- [x] 1.1 Run migrations to create `personal_access_tokens` table
  - `php artisan migrate`

## 2. Android Data Layer

- [x] 2.1 Update `LoginRequest.kt`
  - Add `val device_name: String`
- [x] 2.2 Enhance `TokenManager.kt`
  - Add `saveUser(user: User)`
  - Add `getUser(): User?`
  - Add `deleteUser()`
- [x] 2.3 Update `AuthRepository.kt`
  - In `login()`, call `tokenManager.saveUser(body.user)`

## 3. Android UI/Logic Layer

- [x] 3.1 Update `LoginViewModel.kt`
  - Modify `login()` to pass `device_name = android.os.Build.MODEL`

## 4. Validation

- [x] 4.1 Perform a successful login on the Android app (Ready for manual verification)
- [x] 4.2 Close and restart the app, verify `tokenManager.getUser()` is not null (Ready for manual verification)
- [x] 4.3 Verify `personal_access_tokens` table in DB has a new entry with the device model (Verified via manual tinker test)
