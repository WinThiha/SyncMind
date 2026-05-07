## 1. Prepare Structure

- [x] 1.1 Create `frontend/src/lib/i18n/translations/` directory tree with locale subdirectories (`en`, `my-MM`, `ja-JP`, `vi-VN`, `km-KH`)
- [x] 1.2 Create `frontend/src/lib/i18n/translations/en/index.ts` to re-export all English domain dictionaries

## 2. Extract English Domains

- [x] 2.1 Extract `nav` section from `catalog.ts` into `translations/en/nav.ts`
- [x] 2.2 Extract `auth` section from `catalog.ts` into `translations/en/auth.ts` (remove duplicates)
- [x] 2.3 Extract `settings` section from `catalog.ts` into `translations/en/settings.ts`
- [x] 2.4 Extract `dashboard` section from `catalog.ts` into `translations/en/dashboard.ts`
- [x] 2.5 Extract `projects` section from `catalog.ts` into `translations/en/projects.ts`
- [x] 2.6 Extract `issues` section from `catalog.ts` into `translations/en/issues.ts`
- [x] 2.7 Extract `milestones` section from `catalog.ts` into `translations/en/milestones.ts`
- [x] 2.8 Extract `invitations` section from `catalog.ts` into `translations/en/invitations.ts`
- [x] 2.9 Extract `help` section from `catalog.ts` into `translations/en/help.ts`
- [x] 2.10 Extract `landing` section from `catalog.ts` into `translations/en/landing.ts`
- [x] 2.11 Extract `common` section from `catalog.ts` into `translations/en/common.ts`

## 3. Create Placeholder Locales

- [x] 3.1 Create `translations/my-MM/index.ts` re-exporting all domains with `{ ...enDomain }` spread
- [x] 3.2 Create `translations/ja-JP/index.ts` re-exporting all domains with `{ ...enDomain }` spread
- [x] 3.3 Create `translations/vi-VN/index.ts` re-exporting all domains with `{ ...enDomain }` spread
- [x] 3.4 Create `translations/km-KH/index.ts` re-exporting all domains with `{ ...enDomain }` spread

## 4. Refactor catalog.ts

- [x] 4.1 Update `catalog.ts` to import domain dictionaries from `translations/<locale>/index.ts`
- [x] 4.2 Assemble `catalogs` record by merging domain dictionaries per locale
- [x] 4.3 Remove all inline dictionary definitions from `catalog.ts`
- [x] 4.4 Verify `getTranslation` function signature and implementation remain unchanged

## 5. Verify & Test

- [x] 5.1 Run TypeScript check: `docker compose exec frontend npx tsc --noEmit`
- [x] 5.2 Run frontend build: `docker compose exec frontend npm run build`
- [x] 5.3 Run frontend tests: `docker compose exec frontend npm run test`
- [x] 5.4 Smoke test: verify translated strings render correctly in browser (nav, auth, settings pages)
- [x] 5.5 Compare merged `en` dictionary against original to ensure no keys were lost

## 6. Cleanup

- [x] 6.1 Remove any empty or unused files created during extraction
- [x] 6.2 Verify no duplicate keys remain in any domain file
- [x] 6.3 Final review of `catalog.ts` to ensure it only contains imports and `getTranslation`

## Collateral Fixes

- [x] Fixed missing `</Link>` closing tag in `forgot-password/page.tsx:108` (pre-existing bug that blocked build)
