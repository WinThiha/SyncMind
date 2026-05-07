## Why

The SyncMind frontend was using raw HTML elements, placeholder "S" text as a logo, emoji-based icons, and inconsistent styling across auth pages, settings, and layout components. These changes bring the UI up to a professional, cohesive standard using the established glass design system.

## What Changes

- Replace "S" text logo with a shared `AppLogo` component (BrainCircuit icon + wordmark) used consistently across sidebar and all auth pages.
- Redesign the `Topbar` with a user avatar dropdown (initials), Settings link, keyboard shortcut to focus search (`Ctrl+K` / `⌘K`), and `Esc` to dismiss.
- Implement `useModifierKey` hook (SSR-safe via `useSyncExternalStore`) for platform-aware Ctrl vs ⌘ display.
- Add a Help page (`/help`) with FAQ accordion, searchable shortcuts list grouped by category, and platform-aware key labels.
- Completely redesign the Settings page (`/settings`) using `GlassCard` sections, CSS toggle switches, visual theme selector cards (Light/Dark/System), and `AnimatePresence` transitions.
- Redesign the verify-email page to match the design system; add a "Resend verification email" button with authenticated/unauthenticated states.
- Fix sidebar collapsed state: render only the BrainCircuit icon (as a clickable toggle) instead of stacking it next to the ChevronRight button.
- Restore Settings nav item and sidebar user info card that were removed during a prior conflict resolution.

## Capabilities

### New Capabilities
- `ui/help`: Help center page with FAQ and keyboard shortcut reference.
- `ui/app-logo`: Shared `AppLogo` component for consistent brand identity.
- `ui/modifier-key`: Platform-aware keyboard shortcut hook (`useModifierKey`).

### Modified Capabilities
- `ui`: Settings page, Topbar dropdown, Sidebar collapsed logo, verify-email page redesigned to use glass design system.

## Impact

Frontend files affected:
- `frontend/src/components/ui/AppLogo.tsx` (new)
- `frontend/src/hooks/useModifierKey.ts` (new)
- `frontend/src/app/help/page.tsx` (new)
- `frontend/src/components/layout/Sidebar.tsx`
- `frontend/src/components/layout/Topbar.tsx`
- `frontend/src/app/settings/page.tsx`
- `frontend/src/app/(auth)/verify-email/page.tsx`
- `frontend/src/components/auth/RegisterForm.tsx`
- `frontend/src/components/landing/LandingNav.tsx`
- `frontend/src/components/landing/LandingFooter.tsx`
