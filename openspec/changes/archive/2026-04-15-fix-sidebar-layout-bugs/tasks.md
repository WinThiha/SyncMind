## 1. Sidebar Component Fixes

- [x] 1.1 Correct label visibility class in `Sidebar.tsx`: replace `opacity-1` with `opacity-100` when expanded.
- [x] 1.2 Fix navigation vertical stacking in `Sidebar.tsx`: remove the conditional `flex items-center` from the `<nav>` tag to maintain the vertical column of icons.
- [x] 1.3 Centrally align Logout icon in `Sidebar.tsx`: conditionally set `gap-0` when collapsed and ensure the label container does not reserve space.

## 2. Layout Synchronization

- [x] 2.1 Update `Topbar.tsx`: change the collapsed state `left` offset from `left-16` to `left-20` (80px).
- [x] 2.2 Update `AuthenticatedLayout.tsx`: change the collapsed state `margin-left` from `ml-16` to `ml-20` (80px).

## 3. Verification

- [x] 3.1 Verify that the Sidebar and Topbar no longer overlap when collapsed.
- [x] 3.2 Verify that navigation labels are fully visible when expanded.
- [x] 3.3 Verify that navigation icons are vertically stacked when collapsed.
- [x] 3.4 Verify that the Logout icon is perfectly centered when collapsed.
