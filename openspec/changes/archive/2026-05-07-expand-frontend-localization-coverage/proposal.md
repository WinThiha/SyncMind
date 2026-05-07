## Why

The V1 localization change built robust infrastructure—locale persistence, email localization, AI prompt localization, and a lightweight i18n framework—but only wired translation keys for the Settings page. The rest of the authenticated app (auth forms, dashboard, issues, projects, milestones, help) and the public landing page remain entirely hardcoded in English. Users who select a non-English locale see only the Settings page localized, creating a jarring mixed-language experience that undermines trust in the feature.

## What Changes

- Extend the lightweight frontend i18n catalog with namespaced keys covering all authenticated app surfaces and the landing page.
- Add interpolation support to the `t()` function so dynamic values (names, counts, search terms) can be localized.
- Wire `useLocale()` and `t()` calls into all hardcoded frontend components, replacing English string literals with translation keys.
- Localize Next.js metadata (`<title>`, `<meta name="description">`) per locale.
- Update the root `<html lang>` attribute to reflect the active locale.
- Generate AI translations for `my-MM`, `ja-JP`, `vi-VN`, and `km-KH` catalogs from the expanded English key inventory.
- Add rendering validation tests for Burmese, Khmer, Japanese, and Vietnamese script in newly localized components.
- Add integration tests verifying end-to-end locale selection propagates across all major UI surfaces.

## Capabilities

### New Capabilities
- `frontend-localization-coverage`: Expanded translation catalog structure, interpolation support, metadata localization, and key inventory for all authenticated surfaces and landing page.

### Modified Capabilities
- `ui`: Require all V1-priority UI surfaces (auth, dashboard, issues, projects, milestones, help, landing, app shell) to render via the locale-aware translation catalog with English fallback.
- `user-settings`: The settings API already includes locale preference; no contract change, but the settings page must continue to work as the entry point for locale selection.
- `landing-page`: Require landing page marketing copy, navigation labels, and CTA text to render via the locale-aware catalog.
- `web-auth-flows`: Require auth form labels, error messages, and button text to render via the locale-aware catalog.

## Impact

- Frontend: All TSX components under `src/components/` and `src/app/` that contain hardcoded English strings.
- i18n infrastructure: `catalog.ts`, `LocaleContext.tsx`, root `layout.tsx`.
- Testing: New frontend tests for catalog completeness, interpolation, and script rendering.
- AI translation workflow: Bulk generation of ~250 keys × 4 languages.
- No backend changes; locale source of truth remains `user.settings.preferences.locale`.
