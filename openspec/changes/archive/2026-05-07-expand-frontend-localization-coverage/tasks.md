## 1. Extend i18n infrastructure

- [x] 1.1 Extend `getTranslation` in `catalog.ts` to support `{param}` token replacement with an optional `params` argument.
- [x] 1.2 Update `LocaleContext.t` signature to accept optional `params` and pass them through to `getTranslation`.
- [x] 1.3 Restructure `catalog.ts` with namespaces (`settings.*`, `auth.*`, `dashboard.*`, `issues.*`, `projects.*`, `milestones.*`, `help.*`, `landing.*`, `nav.*`, `common.*`) while preserving existing 18 keys.
- [x] 1.4 Update root `layout.tsx` to set `<html lang={locale}>` dynamically from `LocaleContext`.
- [x] 1.5 Localize Next.js metadata (`title`, `description`) for key pages (login, register, dashboard, settings, landing) per active locale.

## 2. App shell localization

- [x] 2.1 Replace hardcoded strings in `Sidebar.tsx` with `t()` keys for menu items, tooltips, aria-labels, and user info labels.
- [x] 2.2 Replace hardcoded strings in `Topbar.tsx` with `t()` keys for search placeholder, theme toggle title, dropdown menu items, and mobile menu labels.
- [x] 2.3 Replace hardcoded strings in `AuthenticatedLayout.tsx` with `t()` keys if any user-facing text exists.

## 3. Auth flow localization

- [x] 3.1 Replace hardcoded strings in `LoginForm.tsx` with `t()` keys for title, labels, placeholders, buttons, error fallbacks, and link text.
- [x] 3.2 Replace hardcoded strings in `RegisterForm.tsx` with `t()` keys for title, labels, placeholders, buttons, and validation messages.
- [x] 3.3 Replace hardcoded strings in `app/(auth)/forgot-password/page.tsx` with `t()` keys for title, labels, placeholders, buttons, and messages.
- [x] 3.4 Replace hardcoded strings in `app/(auth)/reset-password/page.tsx` with `t()` keys for title, labels, placeholders, buttons, and validation messages.
- [x] 3.5 Replace hardcoded strings in `app/(auth)/verify-email/page.tsx` with `t()` keys for title, description, and action button.
- [x] 3.6 Replace hardcoded strings in `GoogleLoginButton.tsx` with `t()` keys.

## 4. Dashboard localization

- [x] 4.1 Replace hardcoded strings in `app/dashboard/page.tsx` with `t()` keys for welcome message (using interpolation for `{name}`), subtitle, and CTA button.
- [x] 4.2 Replace hardcoded strings in `ProjectList.tsx` with `t()` keys for loading, error, and empty states.
- [x] 4.3 Replace hardcoded strings in `ProjectCard.tsx` with `t()` keys for any labels or fallback text.

## 5. Projects localization

- [x] 5.1 Replace hardcoded strings in `CreateProjectForm.tsx` with `t()` keys for labels, placeholders, buttons, and validation messages.
- [x] 5.2 Replace hardcoded strings in `ProjectSettings.tsx` with `t()` keys for settings labels, member roles, danger zone text, and action buttons.
- [x] 5.3 Replace hardcoded strings in `MemberManagement.tsx` with `t()` keys for labels, buttons, role names, and status messages.
- [x] 5.4 Replace hardcoded strings in `app/invitations/[token]/page.tsx` with `t()` keys for title, description, and action buttons.

## 6. Issues localization

- [x] 6.1 Replace hardcoded strings in `CreateIssueForm.tsx` with `t()` keys for labels, placeholders, buttons, AI suggestion text, and status messages.
- [x] 6.2 Replace hardcoded strings in `EditIssueForm.tsx` and `UpdateIssueForm.tsx` with `t()` keys.
- [x] 6.3 Replace hardcoded strings in `IssueDetailView.tsx` with `t()` keys for labels, status badges, tab names, and action buttons.
- [x] 6.4 Replace hardcoded strings in `IssueList.tsx` and `IssueListItem.tsx` with `t()` keys for filters, empty states, and status labels.
- [x] 6.5 Replace hardcoded strings in `Comments.tsx` with `t()` keys for placeholder, button, empty state, and timestamp labels.
- [x] 6.6 Replace hardcoded strings in `ChangeHistory.tsx` with `t()` keys for field names and action descriptions.
- [x] 6.7 Replace hardcoded strings in `SimilarIssuesCard.tsx` and `SummaryCard.tsx` with `t()` keys.

## 7. Milestones localization

- [x] 7.1 Replace hardcoded strings in `CreateMilestoneForm.tsx` with `t()` keys for labels, placeholders, buttons, and validation messages.
- [x] 7.2 Replace hardcoded strings in `EditMilestoneForm.tsx` with `t()` keys including the delete confirmation dialog.
- [x] 7.3 Replace hardcoded strings in `MilestoneTimeline.tsx`, `MilestoneCard.tsx`, and `MilestoneProgress.tsx` with `t()` keys for status labels and progress text.
- [x] 7.4 Replace hardcoded strings in `app/projects/[id]/milestones/page.tsx` with `t()` keys for section titles and empty states.

## 8. Help localization

- [x] 8.1 Restructure `app/help/page.tsx` quick-start data, feature cards, and FAQ data to be locale-aware (select the correct translation set based on active locale).
- [x] 8.2 Replace hardcoded strings in help page headers, search placeholder, empty states, and support cards with `t()` keys.
- [x] 8.3 Update help page search to filter against translated FAQ text in the current locale instead of hardcoded English.
- [x] 8.4 Replace hardcoded strings in keyboard shortcuts section with `t()` keys.

## 9. Landing page localization

- [x] 9.1 Replace hardcoded strings in `LandingNav.tsx` with `t()` keys for nav links, auth buttons, mobile menu, and greeting text (using interpolation for `{name}`).
- [x] 9.2 Replace hardcoded strings in `LandingHero.tsx` with `t()` keys for kicker, headline, description, CTAs, and capability chip labels.
- [x] 9.3 Replace hardcoded strings in `LandingFeatures.tsx` with `t()` keys for section header and feature titles/descriptions.
- [x] 9.4 Replace hardcoded strings in `LandingCta.tsx` with `t()` keys for kicker, headline, description, and buttons.
- [x] 9.5 Replace hardcoded strings in `LandingFooter.tsx` with `t()` keys for tagline, nav links, auth buttons, and copyright.

## 10. Translation generation and validation

- [ ] 10.1 Generate AI translations for all new English keys into `my-MM`, `ja-JP`, `vi-VN`, and `km-KH` catalogs. (English catalog ready with ~200 keys; use AI to translate all non-English catalogs)
- [ ] 10.2 Spot-check Burmese and Khmer translations for rendering issues in long-form text (help FAQs, landing descriptions).
- [ ] 10.3 Verify that every non-English catalog has an entry for every English key (completeness check).

## 11. Testing

- [x] 11.1 Add frontend unit tests for `getTranslation` interpolation (param replacement, missing params, multiple params).
- [x] 11.2 Add frontend tests verifying `html lang` updates when locale changes.
- [x] 11.3 Add frontend tests for key surfaces (auth form, issue create, dashboard) rendering in a non-English locale with English fallback assertions.
- [x] 11.4 Add frontend tests for script rendering (Burmese, Khmer, Japanese, Vietnamese) in localized components.
- [x] 11.5 Add frontend test verifying help page search filters translated FAQ content correctly.
- [x] 11.6 Run full frontend test suite (`docker compose exec frontend npm run test`) and resolve regressions.
- [x] 11.7 Run full backend test suite (`docker compose exec backend php artisan test`) to ensure no backend regressions from frontend-only changes.

## 12. Final QA and documentation

- [x] 12.1 Audit all covered components for any remaining hardcoded English JSX text nodes.
- [x] 12.2 Document the translation key naming convention and interpolation API in project docs.
- [x] 12.3 Update the V1 localization change documentation to reference the expanded coverage.

### Translation Key Naming Convention

All keys follow dotted namespace convention: `<surface>.<section>.<specific>`.

| Namespace | Purpose |
|-----------|---------|
| `nav.*` | App shell (sidebar, topbar) |
| `settings.*` | User settings page |
| `auth.*` | Login, register, forgot/reset password, verify email, Google auth |
| `dashboard.*` | Dashboard page |
| `projects.*` | Project list, create, settings, members, invitations |
| `issues.*` | Issue create, edit, detail, list, comments, history, search |
| `milestones.*` | Milestone create, edit, timeline, cards, progress |
| `help.*` | Help center (quick-start, features, FAQ, shortcuts) |
| `landing.*` | Landing page (nav, hero, features, CTA, footer) |
| `common.*` | Shared labels (save, cancel, delete, loading, user) |

### Interpolation API

```ts
// In any component:
const { t } = useLocale()

// Static key:
t('nav.sidebar.dashboard')   // → "Dashboard"

// With params:
t('dashboard.welcome', { name: 'Jane' })  // → "Welcome back, Jane"
t('help.searchResults', { query: 'bugs' }) // → 'Results for "bugs"'

// Fallback chain: current locale → English → key itself
```

### Translation Generation

The English catalog at `frontend/src/lib/i18n/catalog.ts` contains ~200 keys.
Non-English catalogs (`my-MM`, `ja-JP`, `vi-VN`, `km-KH`) currently spread `{ ...en }` as fallback.
Use AI to translate the `en` object into each locale, then replace the spread with the translated values.
