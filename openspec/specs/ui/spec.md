## Purpose
Define UI chrome, component layout, and shared interface conventions for SyncMind surfaces.
## Requirements
### Requirement: Localized UI text rendering for V1 surfaces
The system SHALL render localized UI strings for V1-priority authenticated surfaces based on the saved user locale and MUST fallback to English keys when translations are unavailable.

#### Scenario: User with Japanese locale opens settings
- **WHEN** a user with saved locale `ja-JP` opens `/settings`
- **THEN** section labels, action labels, status messages, and helper text on V1-priority settings surfaces are rendered in Japanese

#### Scenario: Translation key missing in selected locale
- **WHEN** a required UI key is missing in the selected locale catalog
- **THEN** the system renders the English fallback string for that key

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

### Requirement: All V1-priority UI surfaces render via the locale-aware catalog
The system SHALL replace every hardcoded English user-facing string in the app shell, dashboard, projects, issues, milestones, and help surfaces with a translation key lookup.

#### Scenario: Sidebar navigation labels are localized
- **WHEN** the active locale is non-English
- **THEN** sidebar menu items (Dashboard, Settings, Help, Logout) and tooltips render in the selected locale

#### Scenario: Topbar search placeholder is localized
- **WHEN** the active locale is non-English
- **THEN** the topbar search input placeholder renders in the selected locale

#### Scenario: Issue creation form labels are localized
- **WHEN** the active locale is non-English
- **THEN** issue creation form labels (Summary, Description, Type, Priority, Estimate, Assignee, Due Date, Milestone) and button text render in the selected locale

#### Scenario: Empty states and error messages are localized
- **WHEN** a list or page displays an empty state or error message
- **THEN** the message renders via the translation catalog

#### Scenario: No untranslated JSX text nodes remain in covered components
- **WHEN** covered components are inspected for raw English text nodes
- **THEN** every user-facing string is produced by a `t(key)` or `t(key, params)` call

