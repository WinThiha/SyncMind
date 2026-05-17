## Why

The login and register forms currently use `type="password"` inputs with no way for users to verify what they have typed. This causes friction — users who mistype their password must clear the field and try again, with no visibility into what they entered. Adding an eye icon toggle button to each password field is a standard UX pattern that reduces login failures and registration errors.

## What Changes

- Add a show/hide password toggle (eye icon button) to the password field in `LoginForm`.
- Add show/hide password toggles to both the password and confirm-password fields in `RegisterForm`.
- The toggle switches the input `type` between `password` and `text`.
- Use `Eye` / `EyeOff` icons from `lucide-react` (already a project dependency).
- Add i18n keys (`auth.login.showPassword`, `auth.login.hidePassword`) for the accessible button labels across all supported locales (en, my-MM, km-KH, vi-VN, ja-JP).

## Capabilities

### Modified Capabilities
- `ui/auth`: Login and register forms updated with password visibility toggle UX.

## Impact

Frontend files affected:
- `frontend/src/components/auth/LoginForm.tsx`
- `frontend/src/components/auth/RegisterForm.tsx`
- `frontend/src/lib/i18n/translations/en/auth.ts`
- `frontend/src/lib/i18n/translations/my-MM/index.ts`
- `frontend/src/lib/i18n/translations/km-KH/index.ts`
- `frontend/src/lib/i18n/translations/vi-VN/index.ts`
- `frontend/src/lib/i18n/translations/ja-JP/index.ts`
