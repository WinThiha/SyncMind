## Why

Dashboard recent activity items display hardcoded English text ("John commented on SYNMIND-42", "Jane changed status on SYNMIND-43") instead of using the translation system. This blocks non-English users from seeing activity descriptions in their language. Additionally, the icon container uses `p-2` padding which expands with content, causing misalignment when text wraps to multiple lines.

## What Changes

- Replace `activity.text` rendering in `ActivityItem` component with structured translation keys
- Add `dashboard.activity.commented` and `dashboard.activity.changed` translation keys with interpolated params
- Fix icon container height to use fixed `h-[44px] items-center` instead of `p-2`
- Add translations for all 6 locales: en, my-MM, ja-JP, vi-VN, km-KH, ko-KR

## Capabilities

### New Capabilities
- `dashboard-recent-activity-i18n`: Translation wiring for dashboard recent activity items, including icon height fix

### Modified Capabilities
- (none - this is a wiring-only change, no new specs needed)

## Impact

**Frontend:**
- `frontend/src/app/dashboard/page.tsx` - `ActivityItem` component (lines 393-408)
- `frontend/src/lib/i18n/translations/en/dashboard.ts` - Add new keys
- `frontend/src/lib/i18n/translations/{my-MM,ja-JP,vi-VN,km-KH,ko-KR}/index.ts` - Add translations

**Backend:** None (API already sends structured `type`, `actor`, `issue_key`, `field` fields)