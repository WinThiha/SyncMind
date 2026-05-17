## Why

The global issues page (`/issues`) contains ~35 hardcoded English strings despite translation keys existing in the catalog under the `issues.global.*` namespace. This violates the AGENTS.md translation coverage mandate and produces poor UX for non-English users.

## What Changes

- Replace all hardcoded English strings on `/issues/page.tsx` with `t()` calls using existing `issues.global.*` and `issues.search.*` translation keys
- Add missing `issues.global.*` and `issues.search.*` translation keys to `ja-JP`, `vi-VN`, `my-MM`, and `km-KH` locale catalogs
- `en` and `ko-KR` catalogs already have full coverage — no changes needed

## Capabilities

### New Capabilities
None — this is a localization wiring fix.

### Modified Capabilities
None — spec-level behavior is unchanged; only implementation (hardcoded strings → translation lookup).

## Impact

**Files changed:**
- `frontend/src/app/issues/page.tsx` — replace ~35 hardcoded strings with `t()` calls
- `frontend/src/lib/i18n/translations/ja-JP/index.ts` — add missing keys
- `frontend/src/lib/i18n/translations/vi-VN/index.ts` — add missing keys
- `frontend/src/lib/i18n/translations/my-MM/index.ts` — add missing keys
- `frontend/src/lib/i18n/translations/km-KH/index.ts` — add missing keys

**No behavioral changes.** No API surface or data model changes.