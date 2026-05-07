# Localization V1

## Supported Locales

- `en` (default fallback)
- `my-MM` (Myanmar/Burmese)
- `ja-JP` (Japanese)
- `vi-VN` (Vietnamese)
- `km-KH` (Khmer/Cambodia)

## Source of Truth

- Locale is resolved from `user.settings.preferences.locale`.
- Header or browser language negotiation is intentionally out of scope for V1.
- Missing/invalid locale falls back to `en`.

## V1 Coverage

- User settings API exposes and validates `preferences.locale`.
- Settings > Preferences includes a language selector.
- Settings page consumes localization keys through `LocaleContext`.
- AI issue suggestion and thread summarization prompts include locale directives.
- AI response schemas remain stable; only human-readable values are localized.
- User-defined issue type labels are never translated.
- Custom emails are localized:
  - Project invitation
  - Member added
  - Issue comment notification
- Auth emails are localized:
  - Email verification notification
  - Password reset notification

## Known Limitations

- Frontend translation catalogs are intentionally sparse in V1 and default to English for unspecified keys.
- Not all product screens are localized in V1.
- Invitation emails to non-registered users currently use inviter locale context as best-available signal.

## Test Notes

- Backend tests should be run with explicit testing env vars in Docker and config cache cleared first.
- Focused tests covering locale persistence, localized AI prompt directives, and localized email output are included.
