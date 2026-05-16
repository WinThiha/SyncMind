## 1. i18n — Add translation keys

- [x] 1.1 Add `auth.login.showPassword` and `auth.login.hidePassword` keys to `frontend/src/lib/i18n/translations/en/auth.ts`.
- [x] 1.2 Add the same two keys to `frontend/src/lib/i18n/translations/my-MM/index.ts` (Myanmar).
- [x] 1.3 Add the same two keys to `frontend/src/lib/i18n/translations/km-KH/index.ts` (Khmer).
- [x] 1.4 Add the same two keys to `frontend/src/lib/i18n/translations/vi-VN/index.ts` (Vietnamese).
- [x] 1.5 Add the same two keys to `frontend/src/lib/i18n/translations/ja-JP/index.ts` (Japanese).

## 2. LoginForm — password visibility toggle

- [x] 2.1 Add `Eye` and `EyeOff` to the `lucide-react` import in `LoginForm.tsx`.
- [x] 2.2 Add `showPassword` boolean state (`useState(false)`).
- [x] 2.3 Wrap the password `<input>` in a `<div className="relative">`. Add `pr-10` to the input's className. Add the toggle `<button>` inside the wrapper, positioned `absolute right-3 top-1/2 -translate-y-1/2`, with `type="button"` and `aria-label` using the appropriate i18n key. Toggle `type` between `"password"` and `"text"` based on `showPassword`. Show `Eye` icon when hidden, `EyeOff` when visible.

## 3. RegisterForm — password visibility toggles

- [x] 3.1 Add `Eye` and `EyeOff` to the `lucide-react` import in `RegisterForm.tsx`.
- [x] 3.2 Add `showPassword` and `showConfirmPassword` boolean states (`useState(false)`).
- [x] 3.3 Apply the same toggle wrapper pattern (from task 2.3) to the `password` field in `RegisterForm`.
- [x] 3.4 Apply the same toggle wrapper pattern to the `password_confirmation` field in `RegisterForm`.
