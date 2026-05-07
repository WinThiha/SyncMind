# frontend-localization-coverage Specification

## Purpose
TBD - created by archiving change expand-frontend-localization-coverage. Update Purpose after archive.
## Requirements
### Requirement: Translation catalog covers all authenticated app surfaces and landing page
The system SHALL provide a namespaced translation catalog containing keys for the app shell, auth forms, dashboard, projects, issues, milestones, help, and landing page. Every user-facing string in these surfaces MUST be reachable via a translation key.

#### Scenario: Catalog contains keys for auth surfaces
- **WHEN** the translation catalog is inspected
- **THEN** it contains keys under the `auth.*` namespace for login, register, forgot password, reset password, and verify email labels, placeholders, buttons, and error messages

#### Scenario: Catalog contains keys for issue surfaces
- **WHEN** the translation catalog is inspected
- **THEN** it contains keys under the `issues.*` namespace for create, edit, detail, list, comments, history, and AI suggestion labels

#### Scenario: Catalog contains keys for landing page
- **WHEN** the translation catalog is inspected
- **THEN** it contains keys under the `landing.*` namespace for navigation, hero, features, CTA, and footer text

### Requirement: Translation function supports simple interpolation
The system SHALL support replacing `{param}` tokens inside translation values with runtime string or number values passed to the translation function.

#### Scenario: Interpolated welcome message
- **WHEN** the translation function is called with key `dashboard.welcome` and params `{ name: 'Jane' }`
- **THEN** the returned string contains the value of `name` in place of the `{name}` token

#### Scenario: Interpolation preserves surrounding text
- **WHEN** the translation function is called with a key whose value includes multiple param tokens
- **THEN** all tokens are replaced and the rest of the string remains unchanged

### Requirement: English fallback for missing or untranslated keys
The system SHALL fallback to the English catalog entry when a key is missing from the selected locale catalog.

#### Scenario: Key exists in English but not in Burmese
- **WHEN** the active locale is `my-MM` and a key has no Burmese translation
- **THEN** the system returns the English value for that key

#### Scenario: Key is missing from all catalogs
- **WHEN** a translation key is not present in any catalog
- **THEN** the system returns the key itself as a last-resort fallback

### Requirement: HTML lang attribute reflects active locale
The system SHALL set the root `<html>` element's `lang` attribute to the active locale code.

#### Scenario: User selects Japanese locale
- **WHEN** the active locale changes to `ja-JP`
- **THEN** the `<html>` element has `lang="ja-JP"`

#### Scenario: Default locale uses English lang
- **WHEN** no locale is selected or the locale is invalid
- **THEN** the `<html>` element has `lang="en"`

### Requirement: Page metadata is localized per locale
The system SHALL render localized `<title>` and `<meta name="description">` values for key pages based on the active locale.

#### Scenario: Login page metadata in Vietnamese
- **WHEN** the active locale is `vi-VN` and the user visits the login page
- **THEN** the page title and meta description are rendered in Vietnamese

### Requirement: Help page search searches translated content
The system SHALL filter FAQs using the translated question and answer text in the current locale.

#### Scenario: Japanese user searches Japanese FAQ
- **WHEN** the active locale is `ja-JP` and the user types a Japanese search term
- **THEN** matching Japanese FAQs are displayed

#### Scenario: Empty search shows all translated FAQs
- **WHEN** the search input is empty
- **THEN** all FAQs in the current locale are displayed

