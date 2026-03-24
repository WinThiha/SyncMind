# Contract: ThemeContext

**Feature**: 004-frontend-ui-update
**Date**: 2026-03-24

## 1. Provider Interface

The `ThemeProvider` manages the global theme state and provides the following context:

```typescript
interface ThemeContextValue {
  theme: 'light' | 'dark';
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  performancePriority: boolean;
  setPerformancePriority: (priority: boolean) => void;
}
```

## 2. Event Lifecycle

- **`onMount`**: Read `localStorage` for `theme` and `performancePriority`. Sync with `(prefers-color-scheme: dark)` if no stored theme exists.
- **`onToggle`**: Update `localStorage` and apply the `.dark` class to the `document.documentElement`.
- **`onPerformanceChange`**: Update `localStorage` and set a `data-performance` attribute on the root element.

## 3. Storage Keys

- `syncmind-theme`: `"light" | "dark"`
- `syncmind-performance`: `"true" | "false"`
