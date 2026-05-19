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

## 9. Android Mobile Stitch Redesign

- [x] 9.1 Replace Android default purple Material theme colors with SyncMind mobile tokens from `mobile_designs/stitch_syncmind_companion/syncmind_mobile/DESIGN.md`.
- [x] 9.2 Add shared native mobile components for top app bar, bottom navigation, cards, metrics, status chips, priority strips, search, loading, and empty states.
- [x] 9.3 Redesign Android Projects, Dashboard, Global Issues, and Settings screens using the Stitch mobile references.
- [x] 9.4 Redesign Android Login, Project Detail, Issue Detail, Milestone cards, Wiki cards, Project cards, and Issue cards to align with the same mobile visual system.
- [x] 9.5 Verify Android compile and unit-test path with `.\gradlew.bat testDebugUnitTest`.

## 10. Android Environment-Aware Builds

- [x] 10.1 Add `staging` Android build type with `.staging` application ID suffix and `-staging` version suffix.
- [x] 10.2 Generate `BuildConfig.API_BASE_URL`, `BuildConfig.WEB_BASE_URL`, and `BuildConfig.GOOGLE_WEB_CLIENT_ID` from build-specific Gradle properties/environment variables with debug/staging/release defaults.
- [x] 10.3 Move Retrofit base URL from hardcoded `Constants.BASE_URL` to generated `BuildConfig.API_BASE_URL`.
- [x] 10.4 Move Compose Navigation deep-link URI patterns from hardcoded localhost/emulator URLs to generated `BuildConfig.WEB_BASE_URL`.
- [x] 10.5 Move AndroidManifest deep-link scheme/host and cleartext policy to build-specific manifest placeholders.
- [x] 10.6 Verify debug with `.\gradlew.bat testDebugUnitTest` and staging with `.\gradlew.bat assembleStaging`.
- [x] 10.7 Keep Android auth API work and encrypted token persistence off the main thread; verify staging login with `ethan@syncmind.app` / `password` reaches the project list.
