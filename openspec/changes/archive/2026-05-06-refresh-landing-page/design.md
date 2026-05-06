## Context

The current public homepage is implemented as a single client-rendered card with auth-aware CTAs. It confirms whether a user is signed in, but it does not explain SyncMind's implemented project, issue, and AI-assisted workflows. The redesign must fit the existing Next.js App Router frontend, reuse the current Tailwind CSS v4 and design-token setup, and avoid introducing navigation to routes that do not exist.

The change affects public presentation only. Backend APIs, authentication contracts, and authenticated application shell behavior remain unchanged. The main technical constraint is balancing a richer marketing surface with the repo's current design system so the landing page feels intentional without diverging into a separate front-end stack or unsupported content model.

## Goals / Non-Goals

**Goals:**
- Deliver a structured landing page for `/` using reusable public-facing sections instead of a single monolithic page component.
- Ensure top-level navigation links only target implemented routes or in-page anchors.
- Present SyncMind's existing capabilities accurately, with homepage copy and visual previews grounded in current product behavior.
- Reuse existing tokens, fonts, Tailwind utilities, and UI primitives where practical while allowing landing-specific styling.
- Preserve auth-aware CTAs so signed-in users are routed toward `/dashboard` and signed-out users are routed toward `/login` and `/register`.

**Non-Goals:**
- Creating new product routes such as pricing, docs, help, enterprise, or settings.
- Changing backend APIs, auth flows, or dashboard/project/issue functionality.
- Building a CMS or dynamic marketing-content management workflow.
- Redesigning authenticated application screens as part of this change.

## Decisions

### Decision: Build the homepage from dedicated landing-page sections
The landing page will be composed from focused components such as navigation, hero, product preview, feature grid, trust/security proof, final CTA, and footer. This keeps content blocks reusable and easier to revise than a single large `page.tsx` file.

Alternative considered: keep all markup in `frontend/src/app/page.tsx`.
This was rejected because the Stitch-inspired layout is substantially larger than the current page and will become hard to maintain without section-level component boundaries.

### Decision: Keep route safety as an explicit navigation rule
The public navigation model will be constrained to implemented destinations (`/`, `/login`, `/register`, `/dashboard` when signed in) plus in-page anchors. Placeholder marketing links will be excluded until corresponding routes exist.

Alternative considered: copy the reference navigation with future-facing destinations.
This was rejected because the repository already has examples of dead-link drift, and the homepage should not advertise information architecture the product cannot serve.

### Decision: Use capability-driven copy and preview content
Homepage messaging and mock product previews will be derived from current SyncMind capabilities: project setup, issue workflows, AI-assisted issue drafting, duplicate detection, assignee suggestions, and semantic search. Unsupported claims such as full real-time collaboration or enterprise collateral downloads will be omitted or reframed.

Alternative considered: use the Stitch reference copy with minimal edits.
This was rejected because it overstates current product scope and would create a misleading contract between product marketing and actual functionality.

### Decision: Add landing-page-specific styling without adding dependencies
The implementation will continue using the existing Tailwind CSS v4 stack and current design tokens. Landing-specific classes or utility groupings may be placed in a dedicated stylesheet or colocated with shared styles, but no new CSS framework or icon set will be introduced.

Alternative considered: introduce a separate styling system or copy CDN-driven reference styles directly.
This was rejected because the repo already includes Tailwind, fonts, motion, and design tokens, and adding parallel styling infrastructure would increase maintenance cost for little benefit.

### Decision: Preserve auth awareness in the landing entry point
The homepage will continue to react to authentication state, but the decision surface will move into CTA behavior and navigation state rather than a single conditional card. Signed-in users should still see a clear route to the dashboard, while signed-out users should see login and registration entry points.

Alternative considered: make the landing page fully static and remove auth-sensitive behavior.
This was rejected because the current homepage already serves as the primary post-auth return path and removing dashboard-oriented actions would regress signed-in usability.

## Risks / Trade-offs

- [Risk] A more visual landing page could drift away from the existing app shell aesthetic. → Mitigation: reuse current tokens, fonts, iconography, and button/card primitives wherever they fit, and keep deviations limited to public-marketing presentation.
- [Risk] Capability-driven copy can still accidentally imply unsupported features. → Mitigation: derive section content from the documented capability inventory and validate every CTA target against the current route tree.
- [Risk] Reusable section components may duplicate some existing UI primitives. → Mitigation: create marketing-specific wrappers only where the existing `GlassCard` and `GlassButton` components are too narrow for the new layout.
- [Risk] Auth-aware client behavior on `/` can complicate perceived performance if overused. → Mitigation: keep the landing structure lightweight and confine auth-specific state changes to nav and CTA regions.

## Migration Plan

1. Implement landing-page section components and styling primitives alongside the existing frontend structure.
2. Replace the current `/` page composition with the new landing-page assembly.
3. Validate responsive behavior, auth-aware CTAs, and route-safe navigation.
4. Roll back by restoring the prior `frontend/src/app/page.tsx` if the new public entry experience causes regressions.

## Open Questions

- Should the hero secondary action target an in-page product preview anchor or the login flow for faster activation?
- Should the public landing page maintain full light/dark adaptation from the existing theme system, or should it intentionally bias toward one presentation while still respecting current tokens?