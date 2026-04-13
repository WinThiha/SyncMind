# Data Model: Frontend UI Update

**Feature**: 004-frontend-ui-update
**Date**: 2026-03-24

## 1. UI Theme & Preference State

This state is persisted in `localStorage` and managed via a React Context.

- **`isDarkMode`**: Boolean. Toggles the `.dark` class on the root HTML element.
- **`performancePriority`**: Boolean. Automatically detected or manually toggled. When true, blurs and complex animations are simplified.
- **`activeTheme`**: String. Primary brand color (default: "light-blue").

## 2. Design System Tokens (CSS Variables)

These tokens are used to implement the Glassmorphism and "light blue" theme consistently.

### Base Colors
- `--brand-primary`: Light blue (#3B82F6 or similar).
- `--bg-surface`: The translucent glass background.
- `--border-glow`: Subtle glow effect for card borders.

### Surface States (Light vs Dark)
- `--glass-blur`: 10px - 16px.
- `--glass-transparency`: 0.1 - 0.7 depending on depth.

## 3. Component Interaction Model

- **Primary Button**: Uses spring transitions on hover and active states.
- **Navigation Sidebar**: Glassmorphic panel with localized blur.
- **Issue Card**: Hover elevation via soft glowing borders and depth (z-index).
