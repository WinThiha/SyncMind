## Why

The sidebar consumes 256px of horizontal space at all times, leaving less room for content on smaller screens. Users working on laptops or with multiple side-by-side windows need that space back. A collapsible sidebar is a standard UX pattern (Linear, Notion, GitHub) that gives users control over their workspace density.

## What Changes

- Add a collapse/expand toggle to the sidebar header that transitions the sidebar from full width (w-64, 256px) to an icon-only rail (w-16, 64px)
- Create a `SidebarContext` to manage collapsed state, accessible by Sidebar, Topbar, and AuthenticatedLayout
- Persist collapsed state to `localStorage` so it survives navigation and page refresh
- Use CSS transitions for the layout shift animation (not framer-motion) for best performance
- Update Topbar and main content area to reactively adjust their `left` and `margin-left` offsets when the sidebar collapses
- Add native `title` tooltips to icon-only nav items when collapsed
- ChevronRight icon in the sidebar header rotates 180° on collapse (already imported but unused)

## Capabilities

### New Capabilities
- `sidebar-collapse`: Covers the collapsible sidebar behavior — toggle mechanism, state management via SidebarContext, localStorage persistence, CSS transition animations, icon-only rail layout, label fade behavior, and tooltip display when collapsed.

### Modified Capabilities
- `ui`: Topbar and AuthenticatedLayout layout offsets change from static (`left-64`, `ml-64`) to reactive values driven by sidebar collapsed state.

## Impact

- `frontend/src/components/layout/Sidebar.tsx` — major refactor: add toggle button, conditional width/label classes, tooltip attributes
- `frontend/src/components/layout/Topbar.tsx` — dynamic `left` offset from SidebarContext
- `frontend/src/components/layout/AuthenticatedLayout.tsx` — dynamic `ml-64` from SidebarContext, wrap with SidebarProvider
- `frontend/src/context/SidebarContext.tsx` — new file: React context for collapsed state + localStorage persistence
- `frontend/src/app/dashboard/layout.tsx` — may need SidebarProvider wrapping
- `frontend/src/app/projects/layout.tsx` — may need SidebarProvider wrapping
