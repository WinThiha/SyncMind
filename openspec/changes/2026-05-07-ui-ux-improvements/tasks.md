## 1. Shared Components

- [x] 1.1 Create `AppLogo` component (`src/components/ui/AppLogo.tsx`) with BrainCircuit icon, wordmark, and `sm`/`md`/`lg` size variants.
- [x] 1.2 Create `useModifierKey` hook (`src/hooks/useModifierKey.ts`) using `useSyncExternalStore` for SSR-safe platform detection.
- [x] 1.3 Use `AppLogo` in landing page nav (`LandingNav.tsx`) and footer (`LandingFooter.tsx`), replacing the "S" text placeholder.
- [x] 1.4 Make all landing page components fully responsive across mobile / tablet / desktop:
  - `LandingPage`: replace "S" loading icon with `AppLogo`; add `overflow-x-hidden`.
  - `LandingNav`: add hamburger menu (mobile dropdown) for anchor links and Sign in.
  - `LandingHero`: scale heading `text-4xl→7xl`; CTA buttons full-width on mobile; chips `grid-cols-2 lg:grid-cols-4`; hide decorative mock panel on `< lg`.
  - `LandingFeatures`: grid `sm:grid-cols-2 xl:grid-cols-3`; tighten padding at each breakpoint.
  - `LandingCta`: add Sign in ghost button for unauthenticated users; full-width buttons on mobile.
  - `LandingFooter`: padding tuned per breakpoint; footer copy condensed.

## 2. Sidebar

- [x] 2.1 Replace "S" text logo with BrainCircuit icon in `Sidebar.tsx`.
- [x] 2.2 Restore Settings nav item (icon + label) removed during prior conflict resolution.
- [x] 2.3 Add user name/email info card at the bottom of the sidebar when expanded.
- [x] 2.4 Fix collapsed logo: render only the BrainCircuit icon (as toggle button) so it is not squeezed next to the ChevronRight.

## 3. Topbar

- [x] 3.1 Add user avatar with initials and `brand-primary` styling.
- [x] 3.2 Add dropdown menu with Settings link and Logout action.
- [x] 3.3 Implement `Ctrl+K` / `⌘K` shortcut to focus the search input.
- [x] 3.4 Implement `Esc` to close dropdown or blur search.
- [x] 3.5 Add Settings link inside the dropdown.

## 4. Help Page

- [x] 4.1 Create `/help` page (`src/app/help/page.tsx`) with FAQ accordion.
- [x] 4.2 Add keyboard shortcuts reference table grouped by category.
- [x] 4.3 Add client-side search filter for shortcuts.
- [x] 4.4 Use platform-aware key labels via `useModifierKey`.

## 5. Settings Page Redesign

- [x] 5.1 Restructure layout: sidebar nav + animated content panel using `GlassCard`.
- [x] 5.2 Implement `Toggle` CSS switch component (`role="switch"`, `aria-checked`).
- [x] 5.3 Implement visual theme selector (Light/Dark/System cards with Sun/Moon/Monitor icons).
- [x] 5.4 Add `StatusBanner` component for dismissible success/error feedback.
- [x] 5.5 Group notifications into Email and In-app sections with `Toggle` switches.
- [x] 5.6 Fix duplicate `key` prop issue in `NotifRow` by renaming to `notifKey`.

## 6. Verify-Email Page Redesign

- [x] 6.1 Redesign page to use glass design system components.
- [x] 6.2 Add "Resend verification email" button in error state for authenticated users.
- [x] 6.3 Add "Log in to resend" button in error state for unauthenticated users.
- [x] 6.4 Show confirmation message after successful resend.

## 7. Edit Issue Form — milestone + due date

- [x] 7.1 Add `milestone_id` and `due_date` to `EditIssueForm` state, loader, and `updateIssue` call — these existed in `CreateIssueForm` and the `Issue` type but were absent from the edit form.
- [x] 7.2 Add "Schedule" section (Due Date + Milestone select) between Classification and Assignment sections, consistent with the design system.
- [x] 7.3 Filter milestone select to show open/in_progress milestones; keep the currently assigned closed milestone visible so it isn't silently lost.
- [x] 7.4 Show hint text when project has no milestones yet.

## 8. Register Form

- [x] 7.1 Read `invite` query param on mount and persist to `sessionStorage` as `pendingInviteToken`.
- [x] 7.2 After successful registration, redirect to `/invitations/{token}` if a pending token exists.
