## Context

The frontend i18n system currently stores all translation strings in a single file: `frontend/src/lib/i18n/catalog.ts` (491 lines). This file contains:
- 5 locales (`en`, `my-MM`, `ja-JP`, `vi-VN`, `km-KH`)
- 11 logical domains (nav, auth, settings, dashboard, projects, issues, milestones, invitations, help, landing, common)
- ~470 English strings, with other locales as `{ ...en }` placeholders

Components access translations via `useLocale()` context, which exposes `t('dot.key')`. There are 156 call sites across ~40 components. The `catalog.ts` exports `getTranslation(locale, key, params)` which performs simple string interpolation.

## Goals / Non-Goals

**Goals:**
- Split the monolithic `catalog.ts` into per-locale, per-domain files
- Maintain the existing `t('dot.key')` API with zero call-site changes
- Keep `catalog.ts` as a lightweight merger that assembles locale dictionaries
- Fix duplicate keys discovered during the split
- Preserve TypeScript type safety for translation keys

**Non-Goals:**
- Changing the translation API or call-site patterns
- Implementing lazy-loading (enabled by this refactor but out of scope)
- Adding new translations or locales
- Nested object API (e.g., `t.nav.sidebar.dashboard`)

## Decisions

### File structure: locale × domain

Chosen: `translations/<locale>/<domain>.ts`

```
src/lib/i18n/
├── locales.ts
├── catalog.ts              (merger + getTranslation)
└── translations/
    ├── en/
    │   ├── nav.ts
    │   ├── auth.ts
    │   ├── settings.ts
    │   ├── dashboard.ts
    │   ├── projects.ts
    │   ├── issues.ts
    │   ├── milestones.ts
    │   ├── invitations.ts
    │   ├── help.ts
    │   ├── landing.ts
    │   └── common.ts
    ├── my-MM/    (same 11 files)
    ├── ja-JP/    (same 11 files)
    ├── vi-VN/    (same 11 files)
    └── km-KH/    (same 11 files)
```

**Rationale**: This serves both developers (edit one domain file) and translators (one folder per language). Alternative "by locale only" would still leave large files; "by domain only" would scatter a single language across many files.

### Keep flat key namespace internally

Each domain file exports a flat `Dictionary`:

```typescript
export const nav: Dictionary = {
  'nav.sidebar.dashboard': 'Dashboard',
  // ...
};
```

**Rationale**: Converting to nested objects would require updating `getTranslation` to walk dot-paths, but keeps the `t('dot.key')` API unchanged. The benefit is minimal since TypeScript doesn't provide autocomplete for string keys anyway. Flat keys are simpler and zero-risk.

### catalog.ts remains the single import point

`LocaleContext` imports `getTranslation` from `catalog.ts`. `catalog.ts` imports all domain files and assembles the `catalogs` record. No changes to `LocaleContext.tsx` or any component.

**Rationale**: Minimizes the blast radius. Only `catalog.ts` needs to change; everything else stays untouched.

### Duplicate key handling

The current `catalog.ts` has several duplicate assignments (e.g., `auth.register.submitting` appears on lines 49 and 104). The split will naturally surface these — the last assignment in the monolith wins today, and we'll preserve that behavior while removing the duplication.

**Rationale**: Fixing duplicates is a cleanup that should ride along with the structural change rather than being a separate PR.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| **Merge conflicts during split** | Do the split in a single focused PR; avoid landing other i18n changes simultaneously |
| **Missing keys during file move** | Verify by comparing the merged `en` dictionary against the original — they should be identical (minus duplicates) |
| **Import path errors** | TypeScript will catch missing imports at build time; run `npm run build` after the split |
| **Increased file count (55 files)** | Acceptable tradeoff for clarity; IDEs handle many small files better than one giant file |

## Migration Plan

1. Create `translations/en/<domain>.ts` files by extracting sections from `catalog.ts`
2. Create placeholder `translations/<locale>/<domain>.ts` files for other locales
3. Update `catalog.ts` to import and merge all domain files per locale
4. Remove the inline dictionaries from `catalog.ts`
5. Run TypeScript check (`npm run build` or `tsc --noEmit`) to verify imports
6. Run frontend tests (`docker compose exec frontend npm run test`)
7. Manual smoke test: verify a few translated strings render correctly

**Rollback**: Revert the single PR. No data migration or API changes means rollback is trivial.

## Open Questions

- Should we add a CI check to prevent `catalog.ts` from growing beyond a certain size? (Nice-to-have, not blocking)
