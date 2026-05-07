## Why

Locale and theme controls are currently split across settings and the authenticated shell, which makes the public landing page and app chrome inconsistent. Users need the same preference controls available from the top toolbar on both `/` and authenticated pages so they can switch language and appearance without hunting through Settings.

## What Changes

- Add a compact locale switcher to the top toolbar on the public landing page and authenticated app shell.
- Add a compact light/dark theme switcher to the top toolbar on the public landing page and authenticated app shell.
- Reuse a shared toolbar preferences component so both shells present the same interaction pattern and accessibility behavior.
- Keep locale and theme selections in sync with the existing preference state so changes apply immediately and persist across navigation.
- Preserve the existing Settings page as the full preference-management destination, not the only place where preferences can be changed.

## Capabilities

### New Capabilities
- `toolbar-preferences-controls`: Shared top-toolbar controls for locale and theme switching across the landing page and authenticated app shell.

### Modified Capabilities
- `ui`: Require the global app chrome to expose locale and theme controls in the top toolbar, with responsive behavior that remains usable on mobile and desktop.
- `landing-page`: Require the public landing header to include locale and theme controls alongside the existing acquisition actions without breaking implemented navigation or layout.
- `user-settings`: Require preference changes initiated from the top toolbar to update the same saved preference state used by Settings, so locale and theme remain consistent across sessions.

## Impact

- Frontend header components for the landing page and authenticated shell.
- Shared locale and theme preference control component(s).
- Existing preference synchronization flow between Settings, context state, and saved user settings.
- No backend API contract changes are expected if the toolbar reuses the existing user preference fields.
