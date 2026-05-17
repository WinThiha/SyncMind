## MODIFIED Requirements

### Requirement: Translation catalog covers all authenticated app surfaces and landing page
The system SHALL provide a namespaced translation catalog containing keys for the app shell, auth forms, dashboard, projects, issues, milestones, help, landing page, and AI issue draft generation surfaces. Every user-facing string in these surfaces MUST be reachable via a translation key.

#### Scenario: Korean locale is available
- **WHEN** the translation catalog is inspected
- **THEN** it contains a `ko-KR` locale option for Korean UI text
- **AND** core app surfaces return Korean strings for navigation, auth, settings, dashboard, projects, issues, milestones, help, landing, and common actions

#### Scenario: Catalog contains keys for auth surfaces
- **WHEN** the translation catalog is inspected
- **THEN** it contains keys under the `auth.*` namespace for login, register, forgot password, reset password, and verify email labels, placeholders, buttons, and error messages

#### Scenario: Catalog contains keys for issue surfaces
- **WHEN** the translation catalog is inspected
- **THEN** it contains keys under the `issues.*` namespace for create, edit, detail, list, comments, history, AI suggestion labels, and AI issue draft generation labels

#### Scenario: Catalog contains AI issue draft generation keys
- **WHEN** the translation catalog is inspected
- **THEN** it contains keys for the AI issue draft drawer or sheet title, source prompt label, source prompt placeholder, output language label, Auto language option, context hint, generate action, cancel action, loading state, success status, view source action, and error messages

#### Scenario: Catalog contains keys for landing page
- **WHEN** the translation catalog is inspected
- **THEN** it contains keys under the `landing.*` namespace for navigation, hero, features, CTA, and footer text
