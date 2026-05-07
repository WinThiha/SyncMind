## Context

The app currently has two separate chrome surfaces: `LandingNav` for the public homepage and `Topbar` for authenticated pages. Theme support already has global context and persistence, but locale selection is still centered in the Settings page. The result is that users cannot change language or theme from the same place they interact with the product header on both shells.

This change is cross-cutting because the same preference controls need to appear in two header implementations with different layouts, and locale changes must stay in sync with the existing preference state used by Settings.

## Goals / Non-Goals

**Goals:**
- Expose locale and light/dark theme controls in the top toolbar on both the landing page and authenticated pages.
- Keep the controls compact enough to fit the existing header layouts on desktop and mobile.
- Reuse shared preference logic so toolbar changes update the active app state immediately.
- Preserve Settings as the fuller preference-management surface.

**Non-Goals:**
- Redesign the overall landing page or authenticated shell navigation.
- Change backend auth or user-settings contracts.
- Replace the current theme or locale context architecture.
- Add new preference types beyond locale and theme.

## Decisions

### 1) Use a shared toolbar preferences component rather than duplicating header-specific controls
- **Decision**: Factor locale and theme controls into a shared component and mount it from both `LandingNav` and `Topbar`.
- **Rationale**: The controls should behave consistently across both shells, and duplicating control logic would increase the chance of layout and persistence drift.
- **Alternatives considered**: Two separate controls implemented directly in each header. Rejected because the interactions are identical enough to justify a shared component.

### 2) Prefer compact controls over a full-width settings launcher
- **Decision**: Keep the controls small and toolbar-native, using a compact dropdown or button group rather than a large settings entry point.
- **Rationale**: The landing header already competes with branding and acquisition CTAs, and the authenticated topbar already competes with search and account controls.
- **Alternatives considered**: A single "Preferences" menu. Rejected because it adds an extra click for the two most common global preferences.

### 3) Synchronize locale changes through the existing preference state
- **Decision**: Locale changes from the toolbar should update the active `LocaleContext` immediately and write through to the same saved preference state used by Settings when the user is authenticated.
- **Rationale**: Locale should behave like theme: fast feedback in the current session, with persistence across navigation and reloads.
- **Alternatives considered**: Session-only locale switching. Rejected because it would feel inconsistent with theme and would not survive refreshes.

### 4) Reuse the existing theme context and preference sync flow
- **Decision**: Theme controls should call the existing `ThemeContext` APIs and keep the current persistence behavior intact.
- **Rationale**: The app already has working theme state, local override handling, and saved preference sync. Reusing that path avoids regressions.
- **Alternatives considered**: A new toolbar-specific theme state. Rejected because it would duplicate existing behavior.

### 5) Make the toolbar responsive by collapsing secondary affordances on narrow viewports
- **Decision**: If space becomes tight on mobile, the preference controls should compress before the primary navigation actions do.
- **Rationale**: The landing header and authenticated topbar both have more important actions than preference switching, but the preferences still need to stay reachable.
- **Alternatives considered**: Hide the controls entirely on mobile. Rejected because the change would lose the requested top-toolbar access.

## Risks / Trade-offs

- [Header crowding] → Mitigation: use compact, icon-first controls and collapse labels at smaller breakpoints.
- [Locale persistence race during auth hydration] → Mitigation: keep local toolbar state in sync with the current context immediately, then apply saved preference after the user settings load.
- [Native select styling inconsistencies] → Mitigation: prefer a shared control pattern with explicit foreground/background classes and test both light and dark modes.
- [Landing/auth header divergence] → Mitigation: one shared component and one shared preference contract, mounted in two shells.

## Migration Plan

1. Add a shared toolbar preferences component for locale and theme.
2. Mount the component in `LandingNav` and `Topbar`.
3. Wire locale selection into the existing locale preference state so it persists like theme.
4. Keep Settings as the longer-form preference editor and verify it stays in sync after toolbar changes.
5. Validate responsive behavior on landing and authenticated layouts.
6. Run frontend tests and fix any layout or accessibility regressions.

## Open Questions

- Should locale labels show short codes, native language names, or both?
- On mobile, should the controls remain separate buttons or collapse into a compact overflow menu?
- Should the landing header show the current locale/theme state as text, icon, or both?
