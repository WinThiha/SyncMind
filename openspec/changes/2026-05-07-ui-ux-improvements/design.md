## Design Decisions

### AppLogo Component
A single `AppLogo` component (`src/components/ui/AppLogo.tsx`) encapsulates the BrainCircuit icon and "SyncMind" wordmark with size variants (`sm`, `md`, `lg`). All auth pages and the sidebar consume it. This ensures the brand mark is never duplicated as ad-hoc markup.

### Sidebar Collapsed State
When collapsed (`w-20`), the ChevronRight toggle and the BrainCircuit icon cannot both fit (combined width exceeds 80px). The fix: in collapsed mode, only the BrainCircuit icon is rendered — it doubles as the toggle button. In expanded mode, the logo+wordmark sits on the left and the ChevronRight collapse button on the right.

### Topbar User Dropdown
The avatar shows up to 2 initials from the user's name with `brand-primary` styling. The dropdown includes a Settings link and a Logout action, positioned `right-0` so it never clips off-screen. `Esc` closes the dropdown or blurs the search input depending on which is active.

### useModifierKey Hook
Uses `useSyncExternalStore` (not `useState` + `useEffect`) to read `navigator.platform` safely on the client without causing SSR hydration mismatches or triggering the `react-hooks/set-state-in-effect` linter rule. The server snapshot returns `false` (non-Mac), matching the default.

### Settings Page Layout
Four sections (Account, Security, Preferences, Notifications) rendered in a left-nav + right-panel layout using `GlassCard`. Section switching uses `AnimatePresence` with a slide-in animation. A `StatusBanner` component (dismissible, `AnimatePresence`-driven) replaces raw alert divs.

Key sub-components:
- `Toggle`: CSS-only switch (`role="switch"`, `aria-checked`) — no third-party dependency.
- Theme selector: three visual cards (Sun/Moon/Monitor icons) replacing a `<select>`.
- `NotifRow`: renders each notification toggle with its label; the React `key` prop is kept separate from the component's `notifKey` prop to avoid conflicts.

### Help Page
Sections: Getting Started, Managing Projects, Issues, and Keyboard Shortcuts. The shortcuts table lists all shortcuts grouped by category. Search filters all shortcuts client-side. The FAQ uses an accordion pattern (one open at a time). No external FAQ library — pure React state.

### Verify-Email Page
In the error state, if the user is authenticated, a "Resend verification email" button calls `POST /api/auth/email/verification-notification`. If not authenticated, a "Log in to resend" button redirects to `/login`. A `resent` boolean state shows a confirmation message after successful resend.
