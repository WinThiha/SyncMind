## Purpose
Define user preference storage, retrieval, and synchronization for SyncMind user settings.

## Requirements
### Requirement: Users can persist locale preference in settings

### Requirement: Users can persist locale preference in settings
The system SHALL allow authenticated users to view and update a locale preference in user-global settings and MUST persist it in the user settings payload.

#### Scenario: User saves a supported locale
- **WHEN** a user selects and saves one of `en`, `my-MM`, `ja-JP`, `vi-VN`, or `km-KH` in settings
- **THEN** the system persists the selected locale
- **AND** subsequent settings reads return the same value

#### Scenario: User submits unsupported locale
- **WHEN** a user submits a locale value outside the supported catalog
- **THEN** the system rejects the update with a validation error

### Requirement: Settings API includes locale in preferences contract
The system SHALL include locale in settings API `preferences` response and update contracts.

#### Scenario: Settings response includes locale
- **WHEN** an authenticated user requests settings
- **THEN** the API response includes `preferences.locale` with a supported locale or null/default behavior

#### Scenario: Settings update with locale is partial-safe
- **WHEN** a user updates locale without changing other preferences
- **THEN** the system updates locale without removing existing theme, sidebar, or notification preferences
