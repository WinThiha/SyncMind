## Context

The V1 localization change (`add-multilingual-localization-and-ai-language-support`) built complete infrastructure: `LocaleContext`, `catalog.ts`, `LocaleResolver`, backend email/AI localization, and settings persistence. However, only the Settings page was wired with translation keys (~18 keys). All other frontend surfaces—auth forms, dashboard, issues, projects, milestones, help, landing page, and app shell—remain hardcoded in English.

The existing i18n system is intentionally lightweight: a flat keyed dictionary with English fallback, no interpolation, and no namespacing. It works for the current 18 keys but will not scale to the ~250 keys needed for full coverage.

## Goals / Non-Goals

**Goals:**
- Extend the translation catalog to cover all authenticated app surfaces and the landing page.
- Add interpolation support to `t()` for dynamic values (names, counts, search terms).
- Replace every hardcoded English string in V1-priority components with `t(key)` lookups.
- Localize Next.js `<html lang>` and page metadata per active locale.
- Generate AI translations for `my-MM`, `ja-JP`, `vi-VN`, and `km-KH`.
- Add tests verifying localized rendering and English fallback for missing keys.

**Non-Goals:**
- Replace the lightweight i18n framework with `next-intl` or `react-i18next`.
- Localize user-generated content (issue titles, comments, project names).
- Add pluralization or ICU message format support.
- Translate backend API error messages (those remain English).
- Localize the decorative mock dashboard panel inside `LandingHero` (fake demo content).

## Decisions

### 1) Extend `t()` with simple interpolation instead of replacing the i18n framework
- **Decision**: Add a second optional `params` argument to `t()`: `t(key: string, params?: Record<string, string | number>)`. Values are replaced via simple string replacement of `{key}` tokens.
- **Rationale**: Keeps the existing zero-dependency architecture. For ~250 keys without pluralization needs, a full i18n library is overkill. The V1 design already deferred this decision; we honor that deferral.
- **Alternatives considered**: Upgrade to `next-intl` — rejected because it adds a dependency and requires restructuring messages into JSON/namespace files for marginal gain at this scale.

### 2) Namespace keys by surface area
- **Decision**: Adopt a dotted namespace convention: `auth.login.title`, `dashboard.welcome`, `issues.create.summary`, `landing.hero.cta`, `nav.sidebar.dashboard`, etc.
- **Rationale**: Prevents collisions (e.g., `Type` in issues vs. auth), makes the catalog searchable, and gives AI translation prompts better context.
- **Alternatives considered**: Flat keys (`loginTitle`, `issueSummary`) — rejected because they become unmanageable past 100 keys and lose contextual grouping.

### 3) Keep catalogs in `catalog.ts` as TypeScript dictionaries
- **Decision**: Continue storing translations in `src/lib/i18n/catalog.ts` as `Record<Locale, Dictionary>` objects.
- **Rationale**: The existing TypeScript dictionary provides compile-time key references and easy English fallback. Moving to JSON files would require a build-step loader or type generation.
- **Alternatives considered**: JSON message files — rejected because the current TS catalog is already working and the team is comfortable with it.

### 4) AI-generated translations with manual spot-check
- **Decision**: Generate all non-English translations in a single batch prompt to an AI model, using the English catalog as source. Review Burmese and Khmer samples manually for rendering issues.
- **Rationale**: Fastest path to coverage. The strings are mostly UI labels and short sentences where AI performs well.
- **Alternatives considered**: Hire human translators — rejected for V2 due to cost and timeline; can be done in a future polish pass.

### 5) Help page search remains locale-aware by searching translated FAQ data
- **Decision**: When the user searches the Help page, search against the translated FAQ question/answer text in the current locale only.
- **Rationale**: A Japanese user typing Japanese search terms should match Japanese FAQs. Searching English text would return nothing.
- **Alternatives considered**: Search all locales simultaneously — rejected because it mixes languages in results and adds complexity.

### 6) Decorative landing content stays English
- **Decision**: The fake dashboard screenshot inside `LandingHero` ("Critical path triage", "Database migration deadlock...", etc.) remains untranslated.
- **Rationale**: This is demo imagery, not interactive UI. It changes with redesigns and has low user impact.

## Risks / Trade-offs

- [Catalog bloat] → Mitigation: strict namespace convention; consider splitting into per-surface dictionaries if the file exceeds 500 lines.
- [AI translation quality for marketing copy] → Mitigation: landing page copy gets a dedicated review prompt; marketing tone is explicitly included in the AI instructions.
- [Missing key fallback creates English leakage] → Mitigation: existing fallback to `catalogs.en` already handles this; add a test that asserts no JSX text nodes remain untranslated in covered components.
- [Burmese/Khmer script rendering in dense layouts] → Mitigation: visual regression check on help page FAQs and issue creation form, which have the longest strings.
- [Interpolation injection risk] → Mitigation: `params` values are user data (names, search terms) that already pass through JSX escaping; the replacement is raw string concat, not `dangerouslySetInnerHTML`.

## Migration Plan

1. Extend `getTranslation` and `LocaleContext.t` to accept optional `params`.
2. Restructure `catalog.ts` with namespaces; move existing 18 keys to `settings.*`.
3. Component-by-component sweep: replace hardcoded strings with `t(key)` or `t(key, params)`.
4. Order: app shell → auth → dashboard → projects → issues → milestones → help → landing.
5. Generate 4-language translations after English catalog is finalized.
6. Update `layout.tsx` for dynamic `html lang` and localized metadata.
7. Add frontend tests for catalog completeness, interpolation, and script rendering.
8. Run full frontend test suite and fix regressions.

## Open Questions

- Should we add a `t.raw` escape hatch for strings that must stay English (e.g., brand names, technical terms)?
- Do we need to localize the "SyncMind" product name in any locale, or keep it as a proper noun?
