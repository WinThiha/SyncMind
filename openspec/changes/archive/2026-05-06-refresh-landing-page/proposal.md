## Why

The current home page is a minimal auth-aware splash screen that does not communicate the scope of SyncMind's project, issue, and AI-assisted workflows. A richer landing page is needed now so the public entry point reflects the product that already exists, while avoiding misleading navigation and marketing claims that the application cannot currently support.

## What Changes

- Replace the current single-card home page with a structured landing page composed of reusable public-facing sections.
- Add a public navigation pattern that links only to implemented destinations or in-page anchors.
- Reframe homepage content around current SyncMind capabilities such as project management, issue workflows, AI issue assistance, and semantic search.
- Introduce landing-page-specific styling primitives that work with the existing Tailwind v4 setup and shared design tokens.
- Preserve auth-aware behavior so signed-out users see login and registration calls to action while signed-in users can move directly to the dashboard.

## Capabilities

### New Capabilities
- `landing-page`: Public homepage structure, navigation rules, reusable sections, and capability-driven marketing content for the SyncMind entry experience.

### Modified Capabilities

## Impact

- Affected code: `frontend/src/app/page.tsx`, public-facing components under `frontend/src/components/`, and landing-page-specific styling under `frontend/src/styles/` or shared global tokens.
- Affected systems: Next.js public route rendering, auth-aware CTA behavior, existing frontend design system components, and homepage content sourced from current application capabilities.
- Dependencies: Reuses the existing Tailwind CSS v4 setup, current font stack, and existing glassmorphism/light-blue brand tokens where appropriate.