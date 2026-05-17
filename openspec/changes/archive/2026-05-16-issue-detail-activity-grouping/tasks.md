## 1. Create Shared Hook

- [x] 1.1 Create `frontend/src/components/issues/hooks/useActivityEntities.ts`
- [x] 1.2 Move `activityEntities` useMemo logic from `IssueDetailView:173-192` into the hook
- [x] 1.3 Add `members` parameter for assignee ID resolution (matching slider behavior)
- [x] 1.4 Add `t` parameter for i18n translation function
- [x] 1.5 Export the hook for use by both components

## 2. Update IssueDetailView

- [x] 2.1 Import and use `useActivityEntities` hook in `IssueDetailView.tsx`
- [x] 2.2 Remove the inline `activityEntities` useMemo
- [x] 2.3 Verify slider behavior unchanged (existing tests pass)
- [x] 4.1 Run slider tests to confirm behavior unchanged
- [x] 4.2 Run detail page tests to confirm new unified feed works
- [x] 4.3 Manual verification: open same issue in slider and detail page, confirm grouping looks the same