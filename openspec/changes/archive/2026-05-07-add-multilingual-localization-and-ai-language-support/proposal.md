## Why

SyncMind currently presents UI, transactional emails, and AI-generated outputs in English only, which blocks teams that operate primarily in Myanmar, Japanese, Vietnamese, or Khmer. We need a unified localization approach now so users can set one preferred language and see consistent language behavior across product surfaces.

## What Changes

- Add user language preference support with a fixed locale catalog: `en`, `my-MM`, `ja-JP`, `vi-VN`, `km-KH`.
- Extend settings APIs and frontend settings UI so users can view and update their saved locale preference.
- Localize frontend UI strings for V1 priority surfaces, including settings and key navigation/feedback text.
- Localize transactional email templates and subjects for custom mailables and auth verification/reset flows.
- Localize AI response content for issue suggestion and thread summarization using the saved user locale.
- Preserve structured AI response schemas and enum contracts; only human-readable content values are localized.
- Keep user-defined issue type labels unchanged and un-translated in AI outputs.

## Capabilities

### New Capabilities
- `localization-platform`: End-to-end locale management, translation catalog structure, locale fallback behavior, and language propagation rules across UI, emails, and AI.

### Modified Capabilities
- `user-settings`: Add locale preference fields to settings read/write behavior and validation.
- `ui`: Support locale-aware string rendering for prioritized V1 UI surfaces.
- `ai-assignee-suggestions`: Require AI-suggested narrative content to follow the user’s saved locale while keeping schema keys and issue-type values stable.
- `ai-thread-summarization`: Require AI-generated summary, decisions, consensus, and action items to follow the user’s saved locale while keeping schema keys stable.
- `web-auth-flows`: Localize verification and reset-related email content to the user’s saved locale where available.

## Impact

- Backend: `UserSettingsController`, AI services, mailables, mail templates, locale middleware/context helpers, and language resources.
- Frontend: settings preference UI, i18n provider/hooks, and translated string catalogs for selected V1 screens.
- APIs: user settings payload/response contract grows to include locale preference.
- Testing: add coverage for locale persistence, localized AI prompt directives, and localized email subject/body rendering.
