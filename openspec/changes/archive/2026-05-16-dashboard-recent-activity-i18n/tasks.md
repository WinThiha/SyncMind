## 1. Translation Keys

- [x] 1.1 Add `dashboard.activity.commented` and `dashboard.activity.changed` keys to `frontend/src/lib/i18n/translations/en/dashboard.ts`

## 2. Locale Translations

- [x] 2.1 Add Japanese translations to `frontend/src/lib/i18n/translations/ja-JP/index.ts`
- [x] 2.2 Add Korean translations to `frontend/src/lib/i18n/translations/ko-KR/index.ts`
- [x] 2.3 Add Vietnamese translations to `frontend/src/lib/i18n/translations/vi-VN/index.ts`
- [x] 2.4 Add Burmese translations to `frontend/src/lib/i18n/translations/my-MM/index.ts`
- [x] 2.5 Add Khmer translations to `frontend/src/lib/i18n/translations/km-KH/index.ts`

## 3. Frontend Implementation

- [x] 3.1 Update `ActivityItem` component in `frontend/src/app/dashboard/page.tsx` to use `t()` with structured data instead of `activity.text`
- [x] 3.2 Fix icon container height: change `p-2` to `h-[44px] items-center` on the icon wrapper div

## 4. Verification

- [x] 4.1 Run frontend tests to verify changes: `docker compose exec frontend npm run test`