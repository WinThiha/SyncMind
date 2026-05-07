## ADDED Requirements

### Requirement: Localized UI text rendering for V1 surfaces
The system SHALL render localized UI strings for V1-priority authenticated surfaces based on the saved user locale and MUST fallback to English keys when translations are unavailable.

#### Scenario: User with Japanese locale opens settings
- **WHEN** a user with saved locale `ja-JP` opens `/settings`
- **THEN** section labels, action labels, status messages, and helper text on V1-priority settings surfaces are rendered in Japanese

#### Scenario: Translation key missing in selected locale
- **WHEN** a required UI key is missing in the selected locale catalog
- **THEN** the system renders the English fallback string for that key

### Requirement: Users can select locale from preferences UI
The system SHALL provide a locale selector in user settings preferences and SHALL reflect the saved locale as the selected value.

#### Scenario: Locale selector shows saved value
- **WHEN** a user opens settings with a previously saved locale
- **THEN** the locale selector displays that locale as the active selection

#### Scenario: Locale update applies on next render cycle
- **WHEN** a user saves a new locale in preferences
- **THEN** subsequent UI renders use the newly saved locale without requiring re-authentication
