## ADDED Requirements

### Requirement: Locale catalog and fallback behavior
The system SHALL support the locale catalog `en`, `my-MM`, `ja-JP`, `vi-VN`, and `km-KH` and MUST fallback to `en` whenever a locale is absent or invalid.

#### Scenario: Saved locale is valid
- **WHEN** a user has a saved locale value in the supported catalog
- **THEN** the system uses that locale for localized UI text, emails, and AI output directives

#### Scenario: Saved locale is missing or invalid
- **WHEN** a user has no saved locale or an unsupported locale value
- **THEN** the system falls back to `en`

### Requirement: User saved locale is the only locale source
The system SHALL use only the authenticated user’s saved locale preference as the locale source and MUST NOT override behavior using request headers or browser/device language.

#### Scenario: Request provides a different browser language
- **WHEN** browser or request locale differs from the user’s saved locale
- **THEN** the system continues using the saved locale for localization behavior

#### Scenario: No authenticated user context
- **WHEN** localization is required without an authenticated user context
- **THEN** the system uses default locale `en`
