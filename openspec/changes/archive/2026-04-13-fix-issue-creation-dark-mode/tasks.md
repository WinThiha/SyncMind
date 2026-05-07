## 1. MarkdownEditor UI Fixes

- [x] 1.1 Update `MarkdownEditor.tsx` container class to use `border-border-glow` and `bg-transparent` instead of hardcoded grays.
- [x] 1.2 Update `MarkdownEditor.tsx` toolbar and tabs to use `bg-foreground/5`, `border-border-glow`, and `text-foreground` or `text-brand-primary` variants.
- [x] 1.3 Update `MarkdownEditor.tsx` textarea and preview areas to use `bg-transparent` and `text-foreground`.
- [x] 2.1 Update `CreateIssueForm.tsx` "Assignee" native select's `<option>` tags (or the select itself) to enforce a `bg-background` background for proper contrast in dark mode.
- [x] 2.2 Verify and update other `<select>` inputs in `CreateIssueForm.tsx` (like "Type" and "Priority") to ensure consistent contrast using `bg-background` for their `<option>` elements if needed.
