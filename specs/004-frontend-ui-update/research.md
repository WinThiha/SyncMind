# Research: Frontend UI Update

**Feature**: 004-frontend-ui-update
**Date**: 2026-03-24

## 1. Glassmorphism Performance & Best Practices

- **Decision**: Use `backdrop-filter: blur()` sparingly. Apply it only to high-level layout elements (Sidebars, Topbars, Modals) and small cards. Avoid layering multiple blurred elements.
- **Rationale**: `backdrop-filter` is computationally expensive as it requires a multi-pass render (sampling, blurring, compositing). Overuse can drop FPS below 60 on mid-range devices.
- **Alternatives considered**: 
    - Using pre-blurred images: Rejected as it doesn't support dynamic content.
    - Semi-transparent solid colors (no blur): This is the "degradation" fallback.

## 2. Spring Animation Configurations (Framer Motion)

- **Decision**: Use `type: "spring"` with `stiffness: 300, damping: 30, mass: 1` as the baseline.
- **Rationale**: These values provide a "fast" start with a natural, stable settle (no excessive oscillation), matching the "fast but stylish" requirement.
- **Alternatives considered**: 
    - Standard ease curves: Rejected as they feel "robotic" and less premium.
    - High stiffness (bounce): Rejected as it can be distracting in a productivity app.

## 3. Adaptive Dark Mode with Vanilla CSS

- **Decision**: Use CSS Variables defined in `:root` and a `.dark` class on the `<html>` or `<body>` tag. Persist preference in `localStorage` and synchronize with `(prefers-color-scheme: dark)`.
- **Rationale**: CSS Variables are highly efficient for theme switching as they don't require re-rendering the entire React component tree.
- **Alternatives considered**: 
    - CSS-in-JS (Styled Components): Rejected as it adds runtime overhead.
    - Tailwind Dark Mode: Rejected per user's Vanilla CSS preference.

## 4. Graceful Degradation Strategy

- **Decision**: Use a small utility script to detect `prefers-reduced-motion` and potentially a "performance mode" flag based on `navigator.hardwareConcurrency` or First Contentful Paint benchmarks.
- **Rationale**: Ensures the app remains usable and "fast" even on low-power devices by disabling expensive blurs and complex springs.
- **Implementation**: If "Performance Priority" is active, CSS will switch blurs to simple semi-transparent colors via a data-attribute (e.g., `[data-performance="low"]`).
