## Context

SyncMind currently has no structured localization framework in either frontend or backend. UI strings are largely hardcoded in English, custom mail templates are plain English Blade templates, and AI services use fixed English system prompts. User settings are already persisted in `users.settings` JSON, which provides a safe location for storing a locale preference without schema migration.

This change is cross-cutting across frontend rendering, backend mail generation, and AI service prompt construction. The user has specified three constraints:
- Locale source is user saved preference only.
- Issue type labels remain user-defined data and MUST NOT be translated.
- V1 scope includes UI localization, AI response localization, and email template localization.

## Goals / Non-Goals

**Goals:**
- Add a single persisted locale preference in user settings.
- Support `en`, `my-MM`, `ja-JP`, `vi-VN`, and `km-KH` with deterministic fallback to `en`.
- Localize priority frontend UI strings and maintain stable rendering for Burmese/Khmer/Japanese/Vietnamese scripts.
- Localize custom and auth-related emails using translation resources.
- Ensure AI-generated human-readable content follows the saved user locale while preserving strict JSON response schema keys.
- Preserve existing issue-type enum behavior and values as user-provided, non-translated strings.

**Non-Goals:**
- Browser/device/`Accept-Language` negotiation.
- Automatic translation of historical issue content or comments.
- Full application-wide string localization in this first pass.
- Per-project language settings.

## Decisions

### 1) Locale source of truth: `user.settings.preferences.locale`
- Decision: Persist locale under existing user settings JSON and use it as the only source for UI/API email/AI behavior.
- Rationale: Avoids schema migration and keeps language behavior account-consistent across sessions/devices.
- Alternatives considered:
  - HTTP header detection: rejected due to explicit requirement for saved preference only.
  - Separate database column: rejected for V1 because JSON settings already handles user preferences.

### 2) Canonical locale set and fallback
- Decision: Restrict locale values to `en`, `my-MM`, `ja-JP`, `vi-VN`, `km-KH`; fallback to `en` when missing/invalid.
- Rationale: Hard constraints simplify QA and translation completeness checks.
- Alternatives considered:
  - Open-ended locale values: rejected due to inconsistent coverage and higher runtime risk.

### 3) Frontend localization architecture
- Decision: Add lightweight app-level i18n dictionary/provider with typed keys for V1-priority surfaces.
- Rationale: Minimizes dependency overhead and fits current app architecture.
- Alternatives considered:
  - Introduce full third-party i18n framework immediately: deferred; possible future upgrade once key coverage expands.

### 4) Backend localization architecture for mail and API messaging
- Decision: Add Laravel translation resources (`resources/lang/<locale>/...`) and explicitly set locale in mail build path from recipient user preference where available.
- Rationale: Uses framework-native translation pipeline and supports both custom mailable templates and framework auth notifications.
- Alternatives considered:
  - Hardcoded per-locale templates without lang files: rejected due to duplication and maintenance cost.

### 5) AI localization contract
- Decision: Inject a locale directive into system prompts for issue suggestion and thread summarization:
  - localize human-readable values to saved locale
  - keep JSON schema keys unchanged
  - keep issue type values as provided by project/user inputs
- Rationale: Preserves parser and API contract stability while delivering localized output.
- Alternatives considered:
  - Post-process translation of model output: rejected for V1 complexity and extra model calls.

### 6) Rollout strategy
- Decision: Implement in vertical slices (settings persistence -> frontend text -> emails -> AI localization) with tests at each layer.
- Rationale: Reduces blast radius and provides incremental verification.

## Risks / Trade-offs

- [Incomplete translation coverage] → Mitigation: strict key inventory for V1 surfaces, fallback to `en`, and test assertions for missing keys.
- [Mixed-language AI context inputs] → Mitigation: explicit prompt instruction to output target locale while preserving source terms when necessary.
- [Font/rendering inconsistencies for Burmese/Khmer] → Mitigation: validate affected UI and email templates with representative script samples on major clients.
- [Auth email localization not honoring user preference for unauthenticated cases] → Mitigation: define fallback behavior (`en`) when no authenticated user context is available.

## Migration Plan

1. Add locale preference read/write support in settings API and frontend settings payload types.
2. Add frontend locale provider, locale selector, and V1 translated keys.
3. Add backend `resources/lang` files and wire custom mailables to translated subjects/body strings.
4. Localize auth verification/reset email content via Laravel translation files and locale resolution rules.
5. Update AI services to include locale output directives with schema stability constraints.
6. Add automated tests for settings locale persistence, translated mail outputs, and AI prompt locale directives.
7. Roll out behind normal deployment; rollback by reverting locale-aware rendering and prompt directives while retaining harmless stored locale data.

## Open Questions

- Which exact frontend pages/components are included in V1 translation key coverage beyond settings and primary navigation?
- For invitation emails to not-yet-registered users, should locale derive from inviter preference, global default, or remain English in V1?
- Should AI outputs include language tags/metadata in API responses for observability in future phases?
