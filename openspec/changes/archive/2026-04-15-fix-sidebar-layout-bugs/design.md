## Context

The current collapsible sidebar implementation has several small but impactful visual discrepancies:
1. **Width Mismatch:** The Sidebar collapses to `w-20` (80px), but the Topbar and Main Content offset only by `16` units (64px), causing a 16px overlap.
2. **Opacity Bug:** Menu labels are set to `opacity-1` (1% opacity) instead of `opacity-100` when expanded.
3. **Flex Layout:** The navigation container loses its vertical stacking orientation when collapsed.
4. **Logout Misalignment:** The logout icon is off-center because the invisible text and its gap are still pushing it aside.

## Goals / Non-Goals

**Goals:**
- Synchronize Sidebar, Topbar, and Content offsets to exactly 80px (`20` units) in collapsed mode.
- Ensure menu labels are fully visible (`opacity-100`) in expanded mode.
- Maintain a vertical stack of icons in the navigation when collapsed.
- Center-align the Logout icon in the footer when collapsed.

**Non-Goals:**
- Changing the overall color scheme or theme.
- Adding new navigation items.
- Modifying the underlying `SidebarContext` logic (state management is correct).

## Decisions

### 1. Standardize on unit `20` (80px)
- **Rationale:** 80px provides enough room for standard Lucide icons with comfortable padding. 64px (`16` units) feels too cramped for this specific design.
- **Implementation:** Update `Topbar.tsx` to use `left-20` and `AuthenticatedLayout.tsx` to use `ml-20` when `collapsed` is true.

### 2. Vertical Nav Stack
- **Rationale:** The current conditional `flex items-center` in `Sidebar.tsx` defaults to `flex-row`.
- **Implementation:** Remove the conditional `flex items-center` on the `<nav>` element. The items are already in a vertical stack via `space-y-1`.

### 3. Logout Alignment Fix
- **Rationale:** Even with `opacity-0`, the label text and the `gap-3` between the icon and text occupy space.
- **Implementation:** Conditionally set `gap-0` when collapsed, or wrap the label in a container that collapses its width to `0` and `overflow-hidden`.

## Risks / Trade-offs

- **[Risk] Animation Jitter:** If the transition duration or easing differs between the sidebar width and the content margin, the layout will look "unstable" during the 200ms transition.
- **[Mitigation]:** Ensure all three components (`Sidebar`, `Topbar`, `AuthenticatedLayout`) use `duration-200` and `ease` for their respective transitions.
