## 1. Locale foundation and settings contract

- [x] 1.1 Add backend validation and persistence for `preferences.locale` with supported values `en`, `my-MM`, `ja-JP`, `vi-VN`, `km-KH` and English fallback behavior.
- [x] 1.2 Extend frontend settings API types and settings state to include `preferences.locale`.
- [x] 1.3 Add locale selector controls in Settings > Preferences and wire save/load behavior.
- [x] 1.4 Add backend/frontend tests for locale persistence, invalid locale rejection, and partial preference updates.

## 2. Frontend localization framework and V1 strings

- [x] 2.1 Implement frontend locale dictionary/provider utilities with typed key access and English fallback.
- [x] 2.2 Add translation catalogs for `en`, `my-MM`, `ja-JP`, `vi-VN`, and `km-KH` for V1-priority UI strings.
- [x] 2.3 Replace hardcoded V1-priority settings/navigation/feedback strings with localized key lookups.
- [x] 2.4 Validate script rendering for Burmese/Khmer/Japanese/Vietnamese and add focused frontend tests.

## 3. Email localization

- [x] 3.1 Add Laravel language resources under `resources/lang/<locale>` for email copy, including subjects and shared labels.
- [x] 3.2 Refactor custom mailables (`ProjectInvitationMail`, `MemberAddedMail`, `IssueCommentNotification`) and related Blade/Markdown templates to use translation keys.
- [x] 3.3 Configure auth verification/reset email localization to respect saved user locale and fallback to English when unresolved.
- [x] 3.4 Add tests for localized custom-email subjects/bodies and auth-email locale behavior.

## 4. AI response localization

- [x] 4.1 Add locale resolution helper for authenticated requests using saved user preference only.
- [x] 4.2 Update `AIIssueSuggestionService` prompt policy to localize `description` and `assignee_suggestions.reason` by locale while preserving schema keys.
- [x] 4.3 Update `AIThreadSummarizationService` prompt policy to localize `summary`, `decisions`, `consensus`, and `action_items` values while preserving schema keys.
- [x] 4.4 Enforce non-translation of user-defined issue type labels and add regression tests for schema/key stability across locales.

## 5. Integration, QA, and rollout readiness

- [x] 5.1 Add end-to-end integration checks covering locale selection -> localized UI/email/AI behavior path.
- [x] 5.2 Run backend and frontend automated test suites with Docker-safe commands and resolve regressions.
- [x] 5.3 Document V1 locale coverage, fallback behavior, and known limitations in project docs.
