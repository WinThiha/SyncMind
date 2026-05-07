## 1. SidebarContext

- [x] 1.1 Create `frontend/src/context/SidebarContext.tsx` with `SidebarProvider`, `useSidebar` hook, and `collapsed`/`toggle` state initialized from localStorage key `sidebar-collapsed`
- [x] 1.2 Ensure localStorage read is synchronous in the context initializer to avoid flash of wrong layout on first render

## 2. Sidebar Component

- [x] 2.1 Refactor `Sidebar.tsx` to read `collapsed` and `toggle` from `SidebarContext` instead of hardcoded `w-64`
- [x] 2.2 Add dynamic width class: `w-64` when expanded, `w-20` when collapsed, with CSS `transition: width 200ms ease`
- [x] 2.3 Add `overflow-hidden` to the sidebar when collapsed to clip text labels
- [x] 2.4 Add ChevronRight toggle button in the sidebar header row, inline with the logo. The chevron should point left (`rotate-180`) when expanded and point right (`rotate-0`) when collapsed via CSS transition. Hide the logo ("S" block) completely when collapsed so the toggle can center.
- [x] 2.5 Make nav item text labels conditionally fade: `opacity-1` when expanded, `opacity-0` + `whitespace-nowrap` when collapsed, with `transition: opacity 200ms ease`
- [x] 2.6 Remove native `title` attribute. Implement a custom, absolute-positioned floating tooltip (e.g. using a `group` class on the nav item and a `group-hover:opacity-100` on the tooltip span) that appears to the right of the icon only when collapsed.
- [x] 2.7 Hide "SyncMind" brand text when collapsed (same opacity/overflow pattern as nav labels)
- [x] 2.8 Apply same collapse behavior to the Logout button in the footer (icon-only when collapsed, label hidden, add custom tooltip).

## 3. Topbar Component

- [x] 3.1 Refactor `Topbar.tsx` to read `collapsed` from `SidebarContext` and use dynamic `left` offset: `left-64` when expanded, `left-20` when collapsed
- [x] 3.2 Add CSS `transition: left 200ms ease` to the Topbar

## 4. AuthenticatedLayout

- [x] 4.1 Wrap sidebar + topbar + content with `SidebarProvider` in `AuthenticatedLayout.tsx`
- [x] 4.2 Replace hardcoded `ml-64` on the main content wrapper with dynamic value from `SidebarContext`: `ml-64` when expanded, `ml-20` when collapsed
- [x] 4.3 Add CSS `transition: margin-left 200ms ease` to the main content wrapper

## 5. Verification

- [ ] 5.1 Verify collapsed state persists across page navigation (dashboard → projects → settings)
- [ ] 5.2 Verify collapsed state persists across browser refresh
- [ ] 5.3 Verify default state is expanded for first-time users (no localStorage key)
- [ ] 5.4 Verify all three layout elements (sidebar, topbar, content) animate in sync
- [ ] 5.5 Verify custom tooltips appear on nav icons when collapsed and don't affect layout
- [ ] 5.6 Verify the toggle button points in the correct direction (left to collapse, right to expand)
- [ ] 5.7 Run `npm run lint` and `npm run build` in frontend/ to verify no errors
