## Why

The frontend i18n catalog (`frontend/src/lib/i18n/catalog.ts`) has grown to 491 lines with all locales and domains crammed into a single file. This creates merge conflicts when multiple developers work on different features, makes navigation difficult, and complicates the translation workflow. Splitting translations into per-locale, per-domain files improves maintainability and enables future lazy-loading optimizations.

## What Changes

- **Split `catalog.ts` into per-locale, per-domain files** under `frontend/src/lib/i18n/translations/`
- **Preserve the existing `t('dot.key')` API** — all 156 call sites in components remain untouched
- **Keep `catalog.ts` as a merger** that imports and assembles domain dictionaries per locale
- **Fix duplicate keys** discovered in the current catalog (e.g., `auth.register.submitting`, `auth.register.namePlaceholder` appear twice)
- **No functional changes** to the application behavior or translation system

## Capabilities

### New Capabilities
<!-- No new capabilities — this is a structural refactor -->

### Modified Capabilities
<!-- No spec-level requirement changes — implementation detail only -->

## Impact

- **Affected**: `frontend/src/lib/i18n/catalog.ts` (refactored into merger)
- **New files**: `frontend/src/lib/i18n/translations/en/*.ts` and `frontend/src/lib/i18n/translations/<locale>/*.ts` for 5 locales
- **No impact** on component code, API contracts, or user-facing behavior
- **Enables future work**: Lazy-loading locales to reduce initial bundle size
