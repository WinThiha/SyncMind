## Why

The recent implementation of the collapsible sidebar has several visual bugs and alignment issues (label visibility, layout overlap, and icon misalignment) that degrade the user experience and visual polish of the application. Fixing these ensures a professional and seamless UI transition between collapsed and expanded states.

## What Changes

- Fix sidebar menu items labels visibility by correcting the Tailwind opacity class (from `opacity-1` to `opacity-100`).
- Synchronize sidebar width with Topbar and Main content offsets when collapsed (standardizing on `w-20`, `left-20`, and `ml-20` instead of a mix with `16`).
- Fix navigation container flex behavior to maintain vertical stacking of menu items in collapsed mode.
- Correct alignment and spacing for the Logout button icon when collapsed by properly handling the invisible label text and gap.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `ui`: Refine visual and layout requirements for the collapsible navigation components to ensure pixel-perfect alignment and transitions.

## Impact

This change affects the core layout components of the frontend:
- `frontend/src/components/layout/Sidebar.tsx`
- `frontend/src/components/layout/Topbar.tsx`
- `frontend/src/components/layout/AuthenticatedLayout.tsx`
