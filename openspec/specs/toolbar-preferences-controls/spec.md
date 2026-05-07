# toolbar-preferences-controls Specification

## Purpose
TBD - created by archiving change add-toolbar-locale-theme-switchers. Update Purpose after archive.
## Requirements
### Requirement: Shared toolbar preference controls are available on both shells
The system MUST render compact locale and theme controls in the top toolbar on the public landing page and on authenticated pages.

#### Scenario: Visitor views the landing page
- **WHEN** a visitor loads `/`
- **THEN** the landing header exposes locale and theme controls alongside the existing public navigation actions

#### Scenario: Authenticated user views the app shell
- **WHEN** an authenticated user loads a protected page
- **THEN** the authenticated topbar exposes locale and theme controls alongside the existing search and account actions

### Requirement: Toolbar preference controls remain usable on supported viewports
The system MUST keep toolbar locale and theme controls usable on mobile and desktop viewports without breaking the header layout.

#### Scenario: Visitor views the landing page on a narrow viewport
- **WHEN** the header is rendered on mobile
- **THEN** the locale and theme controls remain reachable and do not overlap the primary CTA or brand area

#### Scenario: Authenticated user views the app shell on desktop
- **WHEN** the authenticated topbar is rendered on desktop
- **THEN** the locale and theme controls fit within the existing top-right action area without forcing horizontal overflow

### Requirement: Toolbar preference changes update the active UI state immediately
The system MUST apply locale and theme changes from the toolbar immediately in the current session.

#### Scenario: User changes locale from the toolbar
- **WHEN** the user selects a new locale from the toolbar
- **THEN** the active translations update immediately across the current page and subsequent navigation

#### Scenario: User changes theme from the toolbar
- **WHEN** the user toggles light or dark mode from the toolbar
- **THEN** the active color scheme updates immediately across the current page and subsequent navigation

