# SyncMind Mobile Design Prompt For Stitch

Use this document as the source prompt for a mobile redesign of SyncMind. It is written for Google Stitch or another UI generation tool, with emphasis on a native mobile product experience rather than a direct web layout translation.

## Product Summary

SyncMind is a team-based project, issue, milestone, and wiki management app with AI-assisted workflows.

- Backend: Laravel REST API.
- Web frontend: Next.js authenticated workspace.
- Mobile frontend: Android app built with Kotlin, Jetpack Compose, Hilt, Retrofit/OkHttp, Compose Navigation, and token-based authentication.
- Core objects: users, projects, project members, project invitations, issues, comments, issue history, milestones, wiki pages, user settings, AI summaries, AI suggestions.
- Primary mobile goal: help a team member quickly see work, navigate projects, manage issues, read/update project knowledge, and use AI assistance without desktop-style clutter.

## Mobile Design Direction

Design a polished native mobile app for Android first. The design should feel like a serious productivity app for project teams, not a marketing site.

- Prioritize scanability, thumb-friendly controls, and short task flows.
- Use mobile-native navigation patterns: bottom navigation, top app bars, sheets, dialogs, tabs, segmented filters, floating action buttons where appropriate.
- Avoid desktop sidebars and dense web tables.
- Keep forms broken into digestible mobile sections.
- Preserve SyncMind's light-blue brand direction, but avoid a one-note blue UI.
- Design for light and dark theme support.
- Use icons for common actions: search, filter, add, edit, delete, comments, AI, settings, members, milestones, wiki, notifications.
- Make all loading, empty, error, success, permission-denied, and destructive-confirmation states visible in the design system.

## Suggested Mobile App Structure

Recommended primary navigation:

- Projects
- Issues
- Dashboard
- Settings

Project detail should use internal tabs or sections:

- Overview
- Issues
- Milestones
- Wiki
- Members

Issue detail should support a focused mobile detail screen with:

- Summary and key
- Status and priority chips
- Assignee and due date
- Description
- Comments
- Activity/history
- AI summary panel
- Edit/delete actions gated by permissions

## User Roles And Permissions

SyncMind has global authenticated access plus project-level roles.

### Global access

- Logged-out users can access login, registration, forgot password, reset password, and email verification flows.
- Logged-in users can access projects, dashboard, global issues, settings, invitations, and project workspaces.

### Project roles

- Creator
  - Owns the project.
  - Can update project settings.
  - Can delete the project.
  - Can transfer ownership to another admin.
- Admin
  - Can manage members.
  - Can invite/add members.
  - Can create, update, and delete issues.
  - Can manage milestones and wiki content where allowed.
- Member
  - Can view assigned projects and issues.
  - Can participate in comments and project knowledge workflows.
  - Has restricted editing/admin controls.

Design permission-sensitive UI clearly. Hide or disable unavailable actions and explain restrictions when the user reaches a guarded state.

## Implemented Android Screen Inventory

The Android app currently has routes/screens for:

- Login
- Register
- Forgot password
- Reset password
- Email verification
- Project list
- Dashboard
- Global issues list
- Settings
- Public invitation accept flow
- Create project
- Project detail
- Edit project
- Project members
- Create milestone
- Edit milestone
- Create issue
- Issue detail
- Edit issue
- Wiki page detail
- Create wiki page
- Edit wiki page

Design should cover all of these as native mobile screens.

## Authentication And Account Flows

### Login

- Email/password login.
- Google sign-in callback support.
- Error and validation handling.
- Token is stored on-device and attached to API requests.
- Successful login navigates into the authenticated app.

### Registration

- Standard registration with name, email, password, and password confirmation.
- Social registration continuation mode with prefilled provider data.
- Validation and duplicate email states.

### Password recovery

- Forgot password request screen.
- Reset password screen with token/email deep link support.
- Clear success, failure, invalid token, and return-to-login states.

### Email verification

- Mobile app can open verification links through deep links.
- Verification screen should show loading, success, error, and done/return states.
- Settings also exposes resend verification for unverified accounts.

## Dashboard

Dashboard data supports:

- Summary metrics:
  - active projects
  - my open issues
  - due soon
  - overdue
- My work list.
- Upcoming work list.
- Project health list:
  - member count
  - issue count
  - overdue count
  - progress percentage
- Recent activity feed:
  - actor
  - issue key and summary
  - project context
  - field changes
  - timestamps

Mobile design should make the dashboard a fast morning briefing: compact metric cards, work lists, project health cards, and an activity timeline.

## Project Management

### Project list

- Shows projects the user belongs to.
- Project cards include name, key, icon, member count, issue count, and quick entry to project detail.
- Empty state should encourage creating or joining a project.
- Include access to settings, dashboard, global issues, and logout through mobile navigation/menu.

### Create and edit project

Project fields:

- name
- key
- icon URL or icon representation
- issue types

Backend/project model also contains categories, milestones, and versions. Design can surface these as future-ready project metadata controls where useful.

### Project detail

Project detail should act as the workspace hub.

Show:

- project name and key
- current user's role
- creator/admin/member affordances
- issue summary
- milestone summary
- wiki entry points
- member management entry point
- edit project action
- delete project action for creator/admin contexts where applicable

### Member management

Member management supports:

- list members
- show name, email, role, and optional position
- add member by email
- choose role
- set position
- change member role
- remove member
- show pending invitations
- cancel pending invitations
- transfer project ownership

Design mobile member management as a clear list with role chips, invite sheet, pending invitation section, and guarded destructive actions.

### Public invitation flow

The app supports invitation links:

- view invitation information by token
- login if needed
- accept invitation
- navigate to accepted project

Design a compact invitation acceptance screen with project context, inviter context, role, expiry/error states, and login/accept actions.

## Issue Management

### Global issues

Global issues list exists outside a single project.

Supported concepts:

- issues across projects
- project name/key context
- status, priority, due date, assignee, comments count
- issue summary cards
- AI similar issue lookup with project context
- issue summary metrics:
  - assigned to me
  - overdue
  - high priority
  - unassigned

Design this as a personal work queue with filters and project context always visible.

### Project issues

Within project detail, users can view and create project issues.

Issue fields:

- key and key number
- summary
- description
- status
- priority
- issue type
- assignee
- creator
- estimated hours
- actual hours
- due date
- milestone
- comments
- history

Supported statuses:

- open
- in progress
- resolved
- closed

Supported priorities:

- low
- normal
- high

### Create issue

Create issue form supports:

- summary
- description
- issue type
- priority
- status
- estimated hours
- due date

AI support:

- suggest issue content from summary
- suggest description, issue type, priority, estimate, and assignee recommendations
- detect similar issues/duplicates

Design this as a guided mobile form with AI assistance as an optional panel or bottom sheet. Similar issues should be visible before submit without blocking the whole form.

### Edit issue

Edit issue supports updating:

- summary
- description
- issue type
- priority
- status
- estimated hours
- actual hours
- due date

Design editable fields with clear save/cancel states and conflict/error handling.

### Issue detail

Issue detail supports:

- summary and key header
- status and priority
- issue type
- assignee and creator
- estimate and actual hours
- due date and milestone
- description
- comments
- history/activity
- edit action
- delete action
- AI thread summary

### Comments and history

Users can:

- add comments
- view comments with author and timestamp
- view issue history field changes
- see old/new value transitions

Design comments and activity as mobile-friendly tabs or a combined timeline with clear grouping.

## Milestones

Milestone support exists in the mobile app and API.

Milestone fields:

- name
- description
- start date
- due date
- status
- overdue state
- progress:
  - total issues
  - completed issues
  - percentage

Milestone actions:

- create milestone
- edit milestone
- delete milestone
- view progress

AI milestone features:

- suggest milestone dates
- suggest dates for an existing milestone
- summarize milestone
- analyze milestone risk
- suggest issues for a milestone

Design milestone screens with timeline/progress visuals, issue relationship cues, AI insight cards, risk indicators, and edit/create flows.

## Wiki And Knowledge Base

Project wiki support exists in web, mobile, and API.

Wiki page fields:

- title
- content
- author
- last editor
- created date
- updated date

Wiki actions:

- list wiki pages within a project
- create wiki page
- view wiki page
- edit wiki page
- delete wiki page

AI wiki features:

- AI chat over project wiki context
- AI draft generation from a prompt

Design wiki as a lightweight project knowledge base. Use readable article layouts, markdown-style content presentation, edit actions, search/empty states, and AI drafting/chat panels that feel optional and useful.

## Settings

Settings supports:

- profile:
  - name
  - email
- verification:
  - email verified state
  - resend verification email
- security:
  - password credential presence
  - social login presence
  - password update
- preferences:
  - theme: system/light/dark
  - locale
  - sidebar collapsed default for web preference parity
- notifications:
  - email mentions
  - email issue assigned
  - email comment replies
  - in-app mentions
  - in-app issue assigned
  - in-app comment replies

Mobile design should group settings into Profile, Security, Preferences, and Notifications sections with clear toggles and save feedback.

## AI Features To Represent In Mobile Design

SyncMind includes several AI-assisted workflows:

- AI issue creation suggestions.
- Semantic duplicate issue detection.
- Similar issue search.
- AI assignee recommendations with reasons.
- AI thread summarization for issue discussions.
- AI milestone date suggestions.
- AI milestone summary.
- AI milestone risk analysis.
- AI suggested issues for milestones.
- AI wiki chat.
- AI wiki draft generation.

AI UI should include:

- thinking/loading state
- generated result state
- apply/accept controls
- ignore/dismiss controls
- retry/regenerate controls
- cached vs refreshed summary indication where helpful
- clear warning that AI output may need review
- graceful no-result and error states

## Localization And Theme

The product has localization infrastructure and user locale preferences.

Supported locale catalogs include:

- English
- Burmese/Myanmar
- Japanese
- Korean
- Khmer
- Vietnamese

Design should avoid text-heavy layouts that break under translation. Use flexible containers and allow labels to wrap cleanly.

Theme support:

- system
- light
- dark

Use accessible contrast in both themes.

## Critical Mobile States To Design

Cover these states explicitly:

- logged out
- login failure
- registration validation errors
- social registration continuation
- forgot/reset password success and error
- email verification loading/success/error
- empty project list
- project load error or unauthorized
- create/edit project validation errors
- member invite pending
- member add/update/remove errors
- invitation expired/invalid/already accepted
- empty global issues
- filtered no results
- issue load error/not found
- create issue AI loading/error/result
- similar issues found/no matches
- comments empty state
- history empty state
- issue delete confirmation
- milestone overdue state
- milestone AI insight loading/error/result
- wiki empty state
- wiki AI chat loading/error/result
- settings save success/error
- email unverified/resend state
- offline or network failure
- token expired/session expired

## Stitch Output Request

Create a complete mobile app design for SyncMind, optimized for Android.

Please produce:

- A cohesive mobile design system with light and dark modes.
- Primary navigation and information architecture.
- Screen designs for all implemented Android routes.
- Native mobile versions of project, issue, milestone, wiki, settings, auth, invitation, and AI workflows.
- Component states for loading, empty, error, success, disabled, permission-restricted, and destructive actions.
- Mobile-first forms for project, issue, milestone, wiki, auth, and settings flows.
- AI assistance patterns that feel trustworthy, reviewable, and easy to dismiss.

Do not design a marketing landing page as the primary output. Focus on the authenticated mobile productivity app.
