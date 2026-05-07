# SyncMind Current Application Capabilities

This document inventories the current SyncMind application so Google Stitch can redesign the full UI surface with awareness of implemented flows, underlying data capabilities, and partial or scaffolded features.

## Purpose

- Capture what the application currently does across authentication, projects, issues, collaboration, and AI-assisted workflows.
- Identify every meaningful screen, panel, form, and interaction state that may need redesign.
- Separate implemented UI from backend-supported or spec-defined capabilities so redesign work can cover the full intended product surface without confusing placeholders for finished features.

## Product Summary

SyncMind is a web application for team-based project and issue management.

- Backend: Laravel API with session-based authentication.
- Frontend: Next.js application with authenticated app shell, glassmorphism-inspired design, and project/issue workflows.
- Primary objects: users, projects, project members, issues, comments, issue history, AI summaries, AI suggestions.

## User Roles And Access Model

### Global access

- Unauthenticated users can access landing, login, register, and email verification flows.
- Authenticated users can access the dashboard and project/issue flows.

### Project-level roles

- Creator
  - Owns the project.
  - Can update project settings.
  - Can delete the project.
  - Can transfer ownership to another admin.
- Admin
  - Can manage project members.
  - Can create issues.
  - Can update and delete issues.
- Normal user
  - Can view projects and issues.
  - Can participate in issue discussion.
  - Some issue editing paths are restricted.

## Current Route And Screen Inventory

### Public screens

- `/`
  - Marketing-style landing page.
  - Shows sign in / create account actions when logged out.
  - Shows dashboard CTA when logged in.
- `/login`
  - Email/password login form.
  - Google login button.
  - Remember me checkbox.
  - Validation and status messaging.
- `/register`
  - Standard registration form.
  - Google onboarding continuation flow.
  - Social registration mode pre-fills and locks email.
- `/verify-email`
  - Email verification status page.
  - Loading, success, error, and redirect states.

### Authenticated screens

- `/dashboard`
  - Welcome header.
  - Project list.
  - Create new project CTA.
- `/projects/new`
  - Create project form.
- `/projects/[id]`
  - Project detail overview.
  - Project settings panel.
  - Member management panel.
  - Entry cards for Issues, Wiki placeholder, Timeline placeholder.
- `/projects/[id]/issues`
  - Issue list view.
  - Search, filters, reset, AI search mode toggle.
  - New issue CTA.
  - Issue detail slide-over trigger.
- `/projects/[id]/issues/new`
  - Create issue form.
  - AI-assisted auto-fill.
  - Duplicate detection.
  - Assignee recommendations.
- `/projects/[id]/issues/[key]`
  - Full issue detail page.
  - Rich description, comments, activity history, properties, edit/delete actions.
- `/projects/[id]/issues/[key]/edit`
  - Full-page issue edit form.

### App shell components

- Collapsible sidebar.
- Topbar with theme toggle.
- Topbar search input placeholder.
- Notification bell indicator.
- User identity block.

### Scaffolded but not fully implemented routes

- Sidebar links to `/settings` and `/help`, but those pages are not present in the current frontend route tree.

## Capability Inventory By Area

## 1. Authentication And Account Access

### Account registration

- Users can register with:
  - full name
  - email address
  - password
  - password confirmation
- Standard registration requires email verification.
- Duplicate email validation is handled.
- Validation errors are shown inline.

### Login

- Users can log in with email and password.
- Users can opt into a persistent session with Remember Me.
- CSRF cookie flow is handled before login.
- Login success redirects to dashboard.
- Login errors and validation errors are surfaced in the UI.

### Google social login

- Google sign-in is available from login and register.
- If Google email already matches an existing account, the account is linked and the user can authenticate.
- If Google email is new, the user is routed into a completion flow where:
  - email is pre-filled
  - email is read-only
  - the user sets the remaining required fields

### Email verification

- Verification page supports:
  - loading state while verifying
  - success message
  - error state for invalid or expired links
  - automatic redirect to dashboard on success

### Auth session behavior

- The frontend hydrates current user state from `GET /api/user`.
- Logout is supported from the sidebar.
- Middleware currently protects dashboard routes by checking the session cookie.

## 2. Project Management

### Project creation

- Users can create a project with:
  - name
  - key
  - icon URL
  - issue types
- Project key behavior:
  - uppercase display/entry behavior
  - 2-10 character constraint in UI
  - intended as issue prefix

### Project list and discovery

- Users see projects they are involved in.
- Dashboard acts as the main project launcher.
- Project cards are part of the current dashboard experience.

### Project detail overview

- Project detail screen shows:
  - project name
  - project key badge
  - owner badge when applicable
  - project overview area
  - issue types summary
  - current user role
  - navigation entry to issues

### Project settings

- Current settings UI supports editing:
  - project name
  - issue types
- Project settings includes save state and error state.

### Project ownership lifecycle

- Creator-only danger zone supports:
  - transfer ownership to another admin
  - delete project
- Transfer flow loads eligible members into a selector.
- Delete flow uses confirmation and redirects on success.

### Project member management

- Member list shows:
  - name
  - email
  - role
  - creator/admin visual treatment
- Authorized users can:
  - add members by email
  - choose role on invite/add
  - change member role between normal and admin
  - remove members
- Self-management and creator protections are partially enforced in the UI.

### Project data supported by the backend but underexposed in current UI

- The project model supports:
  - categories
  - milestones
  - versions
- These fields are part of the broader product definition but are not fully surfaced in the current frontend forms and settings UI.

## 3. Issue Management

### Issue listing

- Issue list screen supports:
  - issue cards/list items
  - status filter
  - priority filter
  - text search by key or summary
  - reset filters action
  - AI semantic search mode toggle
  - loading skeletons
  - empty states
  - error state

### AI search mode in issue list

- Users can switch from keyword search to AI search.
- AI search behavior includes:
  - query threshold before running
  - delayed/debounced request
  - loading state while searching
  - similarity-based results
  - filtered AI results by current status/priority filters
  - distinct empty state when no relevant semantic matches are found

### Issue create flow

- Users can create issues with current form fields for:
  - summary
  - description
  - issue type
  - priority
  - assignee
  - estimated hours
  - status
- The form includes:
  - required summary
  - markdown editor for description
  - cancel and submit actions
  - inline error state
  - loading state

### Issue duplicate detection

- While creating an issue, the system checks for semantically similar issues based on the typed summary.
- Current UI behavior includes:
  - debounced lookup
  - duplicate-checking status message
  - similar issues card

### AI issue auto-fill

- Create issue form includes an `Auto-fill with AI` action.
- AI suggestion flow can suggest:
  - description
  - issue type
  - priority
  - estimated hours
  - assignee recommendations
- User-entered values are protected from being overwritten once the field has been manually touched.
- AI loading state and AI error state are surfaced.

### AI assignee recommendations

- The form can show ranked assignee suggestions.
- Each suggestion includes:
  - member name
  - reason/explanation
  - assign action
- Users can accept a suggestion into the assignee field.

### Issue edit and update

- Full-page edit screen supports updating:
  - summary
  - description
  - type
  - priority
  - status
  - assignee
  - estimated hours
  - actual hours
- Issue detail also supports a secondary inline update path through the slide-over experience.

### Issue detail page

- Full issue detail page supports:
  - issue metadata header
  - description display
  - comments thread
  - activity history
  - property sidebar
  - edit action
  - delete action
- Properties currently shown include:
  - status
  - priority
  - estimate
  - actual
  - assignee
  - creator
  - created date

### Issue detail slide-over

- Issue list can open a right-side slide-over detail experience.
- Slide-over includes:
  - issue title and key
  - description section
  - assignee summary
  - time tracking summary
  - aggregated activity timeline
  - quick update controls
  - comment composer
  - AI thread summarization trigger
  - link to full edit screen

### Quick update from slide-over

- Users can update issue data and post a comment from one unified composer area.
- Quick update controls include:
  - status
  - priority
  - assignee
  - estimated hours
  - actual hours

### Issue fields supported by backend beyond current primary UI exposure

- The issue API and backend validation also support:
  - category
  - milestone
  - version
- These fields are part of the product capability surface, but they are not yet prominent in the current create/edit forms.

### Issue lifecycle behavior

- Issue keys are generated per project using project key plus sequential number.
- Issues support soft deletion.
- Issue status values currently supported:
  - open
  - in_progress
  - resolved
  - closed
- Issue priority values currently supported:
  - low
  - normal
  - high

## 4. Collaboration And Activity Tracking

### Comments

- Users can add comments to issues.
- Comments support markdown authoring and markdown rendering.
- Comments list shows:
  - author name
  - timestamp
  - formatted content
- Empty state is present when there are no comments.

### Optional email notification on comment

- Comment composer on the full issue detail page includes a `Notify by Email` checkbox.
- This exposes an explicit opt-in notification behavior on comment submission.

### Change history

- The system records issue history entries for field changes.
- Current UI shows:
  - grouped history entries
  - actor identity
  - timestamp
  - field changed
  - old value to new value transitions
- Long description changes are simplified in the history display.

### Unified activity timeline

- The slide-over detail experience merges comments and history into a single chronological activity stream.
- The UI groups nearby actions from the same user into combined activity entities.

## 5. AI Features

### AI issue suggestion endpoint surfaced in UI

- Current create issue flow actively uses AI to suggest issue content.
- This is not just a backend capability; it is already part of the user workflow.

### Semantic similarity and duplicate detection

- Current product supports semantic similarity search for:
  - possible duplicates during issue creation
  - AI-powered issue search in the issue list

### AI thread summarization

- The slide-over detail experience has a `Summarize Thread` action.
- Summary UI includes:
  - loading state
  - summary overview
  - decisions list
  - action items list
  - consensus summary
  - regenerate action
  - caution text about AI accuracy

### AI and UX implications

- AI features introduce important redesign surfaces:
  - loading and thinking states
  - confidence and explanation presentation
  - duplicate warning presentation
  - apply/ignore actions
  - retry/regenerate flows
  - empty or no-suggestion states

## 6. Design System And App Shell Behaviors

### Current visual language

- Light-blue themed brand system.
- Glass cards and glass buttons.
- Rounded corners and soft borders.
- Lucide iconography.
- Motion-heavy UI with spring transitions.

### Sidebar

- Expand/collapse toggle.
- Persisted collapse state.
- Icon-only collapsed mode.
- Hover tooltips in collapsed mode.
- Navigation items for:
  - Dashboard
  - Settings placeholder
  - Help placeholder
  - Logout

### Topbar

- Search input placeholder.
- Theme toggle.
- Notification bell with dot indicator.
- User info and avatar fallback.

### Theming

- Current frontend includes a theme toggle in the topbar.
- Frontend spec also describes adaptive dark mode with local persistence.
- Theme behavior should be treated as part of the redesign scope even where implementation is still uneven across pages.

### Motion and feedback

- Buttons, panels, and layout transitions use animated states.
- Loading indicators, skeletons, and hover states are present in several areas.
- The redesign should preserve fast-feedback behavior across every interactive component.

## UI Components That Need Redesign Coverage

### Authentication components

- Landing hero card
- Login form
- Register form
- Google login button
- Verification status screen
- Inline validation and success/error alerts

### Layout components

- Sidebar
- Topbar
- Authenticated layout shell
- Page transition wrapper
- Theme toggle
- Notification entry point

### Dashboard and project components

- Project list
- Project card
- Create project form
- Project detail overview cards
- Member management list and add-member form
- Role selector
- Project settings form
- Ownership transfer selector
- Danger zone actions

### Issue components

- Issue list toolbar
- Issue list item
- Issue skeleton
- Slide-over issue detail panel
- Full issue detail page
- Issue properties cards
- Create issue form
- Edit issue form
- Inline update form
- Similar issues card
- Assignee suggestion cards
- Comments list and composer
- Change history cards
- Summary card
- Markdown editor and markdown renderer

### Shared UI primitives

- GlassCard
- GlassButton
- Loading overlay
- SkeletonCard

## Important UI States To Account For In Redesign

- Logged out vs logged in home state
- Standard registration vs social registration continuation
- Email verification loading/success/error
- Empty project list
- Project load failure or unauthorized access
- Member add/update/remove error states
- Creator-only actions vs admin-only actions vs member read-only states
- Empty issue list
- Filtered no-results state
- AI search too-short query state
- AI search loading state
- AI search no-match state
- Create issue loading state
- AI suggestion loading/error state
- Duplicate detection loading/no-results/results state
- Issue detail loading and not-found states
- No comments state
- No history state
- Thread summary loading/error/display state
- Delete and transfer confirmation states
- Collapsed vs expanded sidebar
- Theme toggle state

## Underlying Data That The Redesign May Need To Surface More Completely

### User

- id
- name
- email
- email verification status
- social login relationship
- position is referenced in AI-related specifications and should be considered for future profile/admin UX even if not surfaced in the current UI

### Project

- id
- name
- key
- icon
- issue types
- categories
- milestones
- versions
- creator
- members and roles

### Issue

- key and numeric sequence
- summary
- description
- status
- priority
- issue type
- assignee
- creator
- estimated hours
- actual hours
- category
- milestone
- version
- comments
- history
- semantic similarity score in AI search contexts

### AI summary payload

- summary
- decisions
- consensus
- action items

## Backend-Supported UX Behaviors Worth Reflecting In Design

- Session-based authenticated experience.
- Project membership-based access restrictions.
- Creator-only destructive actions.
- Admin-controlled team management.
- Sequential issue identifiers.
- Soft delete lifecycle for issues.
- AI caching and regeneration pattern for thread summaries.
- Semantic relevance scoring for AI search and duplicate detection.

## Gaps, Placeholders, And Partial Features

- Settings and Help are present in sidebar navigation but do not have implemented pages.
- Topbar search input is present but not wired to real search behavior.
- Notification bell is present as a visual entry point but not connected to a visible notification center.
- Project categories, milestones, and versions exist in the data model but are not fully surfaced in current forms.
- Issue category, milestone, and version are supported in backend validation but are not prominent in current issue forms.
- Some public/auth pages still use older visual styling patterns compared to the newer glass UI.
- Theme behavior exists conceptually and partially in UI, but consistency across all screens should be treated as redesign work.

## Recommended Scope For Stitch

Stitch should redesign the application as a complete product surface rather than only the currently polished pages.

### Minimum redesign scope

- Public auth screens
- Authenticated shell
- Dashboard
- Project creation and project detail
- Member management
- Project settings and danger zone
- Issue list
- Issue slide-over detail panel
- Issue full detail page
- Issue create/edit/update flows
- Comments, history, and AI summary experiences

### Extended redesign scope

- Notification center concept
- Settings page concept
- Help/support page concept
- More complete project metadata management for categories, milestones, and versions
- More complete issue metadata forms for category, milestone, and version
- User profile and position-management concepts to support AI assignee reasoning

## Notes For Stitch Prompting

If this inventory is used as input for Google Stitch, the redesign prompt should explicitly mention:

- project management app with team collaboration
- public auth plus authenticated workspace shell
- creator/admin/member permission-sensitive UI
- issue list, issue detail, comments, activity history, AI summary
- AI-assisted issue creation with duplicate detection and smart assignee recommendations
- collapsible sidebar, topbar, theme toggle, notifications, search
- need for complete responsive coverage and all loading, empty, error, and success states
