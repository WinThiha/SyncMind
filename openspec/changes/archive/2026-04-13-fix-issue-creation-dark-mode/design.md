## Context

The issue creation page currently has unreadable text when dark mode is enabled. The `MarkdownEditor.tsx` component is styled entirely with hardcoded light-mode Tailwind classes (`bg-white`, `text-gray-900`, `bg-gray-50`, `border-gray-200`, `text-gray-500`, etc.). When the app switches to dark mode, these colors remain static, resulting in dark text over dark backgrounds (or light text over light backgrounds) that becomes illegible. Additionally, the native `<select>` dropdown options for "Assignee" in `CreateIssueForm.tsx` inherit white text color but a light background from the OS default dropdown styling.

## Goals / Non-Goals

**Goals:**
- Make the `MarkdownEditor` component fully compatible with dark mode by using existing semantic CSS variables.
- Ensure the native `<select>` dropdown options have a readable contrast in dark mode.

**Non-Goals:**
- Complete rewrite of the Markdown Editor component.
- Replacing native `<select>` dropdowns with custom UI components (e.g., Radix UI) for this specific bug fix.

## Decisions

- **MarkdownEditor Styling**: We will replace the hardcoded gray/indigo Tailwind classes with semantic variables defined in `globals.css` (e.g., `text-foreground`, `bg-transparent`, `border-border-glow`, `text-brand-primary`). This ensures the component adapts to any theme changes automatically without requiring manual dark mode overrides (like `dark:bg-slate-900`).
- **Select Dropdown Options**: Native `<select>` elements are difficult to style consistently across browsers. The simplest and most robust fix is to explicitly apply a class like `bg-background` to the `<option>` elements, or enforce it on the `<select>` element itself so the options inherit a proper solid background, providing contrast for the light text.

## Risks / Trade-offs

- [Risk] Native `<select>` styling might still be inconsistent on some older browsers or specific operating systems (like Safari on iOS).
  → Mitigation: Apply explicit background colors to both the `<select>` and `<option>` elements and rely on browser defaults for the dropdown menu UI.
