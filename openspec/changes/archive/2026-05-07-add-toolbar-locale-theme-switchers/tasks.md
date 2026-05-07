## 1. Shared Toolbar Controls

- [x] 1.1 Create a shared toolbar preferences component that exposes locale and theme controls with accessible labels and keyboard support.
- [x] 1.2 Add or revise translation keys needed for toolbar locale/theme labels, button text, and compact helper copy.
- [x] 1.3 Define responsive behavior for the shared controls so they remain compact on mobile and readable on desktop.

## 2. Landing Header Integration

- [x] 2.1 Mount the shared toolbar preferences component in `LandingNav`.
- [x] 2.2 Reflow the landing header action cluster so locale/theme controls do not crowd the existing acquisition CTAs.
- [x] 2.3 Verify the landing header still renders only implemented destinations and remains responsive with the new controls.

## 3. Authenticated Toolbar Integration

- [x] 3.1 Mount the shared toolbar preferences component in `Topbar`.
- [x] 3.2 Position the controls so they fit with search, theme, and user-menu actions without causing overflow or collision.
- [x] 3.3 Verify authenticated layout behavior still respects sidebar offsets and topbar alignment after the new controls are added.

## 4. Preference State Synchronization

- [x] 4.1 Extend locale state handling so toolbar locale changes update the active `LocaleContext` immediately.
- [x] 4.2 Synchronize toolbar-driven locale changes with the saved user preference used by Settings so the selection persists across sessions.
- [x] 4.3 Reuse the existing theme persistence path so toolbar theme changes continue to follow the current saved preference and local override rules.
- [x] 4.4 Ensure the Settings page reflects the current locale and theme after toolbar-driven changes.

## 5. Validation

- [x] 5.1 Add or update frontend tests for landing header rendering with locale and theme controls.
- [x] 5.2 Add or update frontend tests for authenticated topbar rendering with locale and theme controls.
- [x] 5.3 Add or update tests for locale and theme persistence after toolbar interaction, navigation, and reload.
- [x] 5.4 Run the frontend test suite and fix regressions introduced by the toolbar controls.
