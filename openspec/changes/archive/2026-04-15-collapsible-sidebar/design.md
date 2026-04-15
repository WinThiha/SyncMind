## Context

The current layout uses a fixed-width sidebar (`w-64`, 256px) with three hardcoded coupling points: the sidebar's own width, the Topbar's `left-64` offset, and the main content's `ml-64` margin. The sidebar is always expanded — there is no way for users to reclaim that horizontal space. The project already uses framer-motion for micro-interactions, but this is a layout-level animation better suited to CSS transitions.

Current file structure:
- `Sidebar.tsx` — fixed `w-64`, renders logo + nav items with labels
- `Topbar.tsx` — fixed `left-64`
- `AuthenticatedLayout.tsx` — orchestrates sidebar + topbar + content with `ml-64`
- Layout wrappers (`dashboard/layout.tsx`, `projects/layout.tsx`) delegate to `AuthenticatedLayout`

The `ChevronRight` icon is imported in `Sidebar.tsx` but unused — suggesting this feature was anticipated.

## Goals / Non-Goals

**Goals:**
- Allow users to collapse the sidebar to an icon-only rail (64px wide) and expand it back
- Persist the collapsed preference across page navigation and refresh
- Animate the transition smoothly with CSS transitions (not framer-motion) for optimal performance
- Maintain consistent layout across Sidebar, Topbar, and main content area
- Provide discoverable tooltips when the sidebar is collapsed

**Non-Goals:**
- Keyboard shortcuts for toggling (deferred to future change)
- Mobile-responsive sidebar behavior (overlay pattern) — desktop-only for now
- Backend persistence of sidebar preference (localStorage is sufficient)
- Custom styled tooltip components (native `title` is sufficient for now)
- Multiple sidebar widths or user-configurable width

## Decisions

### 1. State management: React Context (SidebarContext)

**Choice:** Create a `SidebarContext` with `collapsed` boolean and `toggle` function.

**Alternatives considered:**
- Parent state in `AuthenticatedLayout` — couples auth logic with UI state, awkward prop threading if toggle ever moves
- CSS custom properties (`--sidebar-width`) — two sources of truth (React + CSS), can't animate custom properties reliably, framer-motion can't target them
- Zustand/external store — overkill for a single boolean

**Rationale:** Context is the lightest option that allows any descendant (Sidebar, Topbar, or future components) to read and write the collapsed state without prop drilling. The re-render cost is negligible — collapse happens on user click, not on every frame.

### 2. Animation: CSS transitions, not framer-motion

**Choice:** Use `transition: width 200ms ease, margin-left 200ms ease, left 200ms ease` on the three layout elements.

**Alternatives considered:**
- `framer-motion` `animate={{ width }}` — JS-driven, triggers layout recalc every frame, no benefit over CSS for a one-shot animation
- `transform: translateX()` — doesn't actually resize the sidebar, complex coordination with margin adjustments
- `@property` + CSS custom property animation — poor browser support

**Rationale:** This is a user-initiated, one-shot layout shift — exactly what CSS transitions are optimized for. The browser can offload the interpolation and avoid JS main-thread work entirely.

### 3. Label behavior: overflow-hidden + opacity fade

**Choice:** When collapsed, the sidebar applies `overflow-hidden` and label `<span>` elements get `opacity-0` with a transition. No width animation on individual text elements.

**Rationale:** Animating text width is janky (sub-pixel rendering, reflow per character). Clipping via `overflow-hidden` on the parent and fading opacity gives a clean visual transition without layout thrashing.

### 4. Toggle placement and Sidebar Width

**Choice:** The collapsed sidebar width is `w-20` (80px) to provide sufficient room for the icons and padding (`p-4` or 16px) without squishing. The ChevronRight icon sits inline in the sidebar header row, to the right of the logo. 
- In expanded state: `[Logo] SyncMind [<]` (pointing left to indicate collapse). 
- In collapsed state: `[>]` (pointing right to indicate expand, logo is hidden). 

**Rationale:** The `w-20` width provides the necessary 44px for navigation items (24px padding + 20px icon) plus the 32px of overall sidebar padding. Hiding the logo when collapsed ensures the toggle button is centered and has adequate space. The chevron directions are intuitive to the action they perform.

### 5. Persistence: localStorage

**Choice:** Read `sidebar-collapsed` from localStorage on initial render, write on every toggle.

**Rationale:** No backend API needed for a UI preference. localStorage survives refresh and navigation. The initial read happens synchronously in the context initializer to avoid a flash of wrong layout.

### 6. Tooltips: Custom Floating UI

**Choice:** Use custom, absolute-positioned tooltips that appear on hover when the sidebar is collapsed, instead of native HTML `title` attributes.

**Rationale:** Native `title` attributes are slow to appear and look disconnected from the application's UI. Custom tooltips provide immediate feedback and a modern SaaS feel that matches the rest of the application.

### 7. Provider placement: AuthenticatedLayout

**Choice:** `SidebarProvider` wraps the entire authenticated layout content (Sidebar + Topbar + main).

**Rationale:** Keeps the provider close to its consumers. Both dashboard and projects layouts already delegate to `AuthenticatedLayout`, so no changes needed to the route-level layouts.

## Risks / Trade-offs

- **[Flash of wrong layout on first load]** → Mitigate by reading localStorage synchronously in the context initializer, before the first render. The default is expanded (no localStorage key), so first-time users see the full sidebar — no flash.
- **[Transition jank on low-end devices]** → CSS transitions are GPU-friendly, but `width` changes trigger layout reflow. The 200ms duration is short enough that it won't feel sluggish even if a frame drops. If needed, can switch to `transform` approach later.
- **[Context re-render scope]** → All consumers re-render on toggle. Only 3 components (Sidebar, Topbar, AuthenticatedLayout) consume the context, and toggle is infrequent. Acceptable.
- **[Future mobile layout]** → The icon-only rail doesn't work well on small screens. This design is desktop-only. A future change would need an overlay pattern for mobile. The `SidebarContext` is agnostic to this — it can be extended with a `mode: 'rail' | 'overlay'` later.
