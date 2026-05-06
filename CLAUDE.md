# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SyncMind is a full-stack web application with a decoupled architecture:
- **Backend**: Laravel 12 (PHP 8.2+) — REST API only, no Blade views served to users
- **Frontend**: Next.js 16 (TypeScript, React 19) — SPA consuming the Laravel API

The two apps run as separate processes and communicate over HTTP. The frontend sits at `http://localhost:3000`, the backend at `http://localhost:8000`. A `docker-compose.yml` at the root orchestrates all three services (db, backend, frontend); the database is PostgreSQL 16 with the `pgvector` extension enabled.

## Commands

All backend commands must be run from `backend/`, all frontend commands from `frontend/`.

### Backend (Laravel)

```bash
cd backend

# Start dev server
php artisan serve

# Run all tests
php artisan test

# Run a single test file
php artisan test tests/Feature/Auth/LoginTest.php

# Run a single test method
php artisan test --filter test_user_can_login

# Run linter (Laravel Pint)
./vendor/bin/pint

# Run linter in dry-run mode (check only)
./vendor/bin/pint --test

# Database migrations
php artisan migrate

# Fresh migration with seeders (DESTRUCTIVE — drops all tables)
php artisan migrate:fresh --seed
```

### Frontend (Next.js)

```bash
cd frontend

# Start dev server
npm run dev

# Build for production
npm run build

# Lint
npm run lint

# Run tests (Vitest)
npm test

# Run tests in watch mode
npx vitest
```

## Architecture

### Auth Flow

Authentication uses **Laravel Sanctum cookie-based sessions** (not tokens). The session cookie is named `syncmind_session` (derived from `APP_NAME`). The frontend makes CSRF-protected requests by sending `withCredentials: true` and `withXSRFToken: true` (configured globally in `frontend/src/lib/axios.ts`).

**Google OAuth** uses the `@react-oauth/google` package on the frontend, which returns a Google `access_token`. This token is POSTed to `POST /api/auth/google/callback`, where the backend verifies it directly via Socialite or the Google userinfo endpoint.

The auth state is managed globally via `frontend/src/context/AuthContext.tsx` — it hydrates by calling `GET /api/user` on mount. All protected pages check the `syncmind_session` cookie in `frontend/src/middleware.ts` for fast edge redirects (only the `/dashboard` prefix is protected).

### Routing

**Backend** (`backend/routes/api.php`):
- All routes are under `/api`
- Auth routes are grouped under `/api/auth` with `throttle:auth` (5 req/min per IP)
- Authenticated routes use `auth:sanctum` middleware
- Key resource routes: `apiResource('projects')`, `apiResource('projects.members')`, `apiResource('projects.milestones')`, `apiResource('projects.issues')` — issues use `{issue_key}` binding, not `{id}`
- Custom actions: `POST /api/projects/{project}/transfer`, `POST /api/projects/{project}/issues/{issue_key}/comments`, AI routes under `/api/projects/{project}/ai/` and `/api/projects/{project}/issues/{issue_key}/ai/`

**Frontend** (`frontend/src/app/`):
- `(auth)/` route group — login, register, verify-email pages (unauthenticated)
- `dashboard/` — protected; contains `projects/[id]/` with sub-routes for issues, members, settings, and `milestones/` (list + `[milestoneId]/` detail)

### Key Backend Conventions

- **Controllers** live in `app/Http/Controllers/Auth/` — one controller per auth concern; feature controllers (`IssueController`, `ProjectController`, `ProjectMemberController`, `MilestoneController`, `CommentController`, `AIIssueController`) sit directly in `app/Http/Controllers/`
- **Observers** are registered in `AppServiceProvider::boot()` — `UserObserver`, `IssueObserver`, and `CommentObserver` handle side effects; `UserObserver` auto-deletes linked social accounts when email changes; `IssueObserver` dispatches `GenerateIssueEmbeddingJob` for semantic search
- **Rate limiting** is defined in `AppServiceProvider`: `auth` limiter (5/min), `api` limiter (60/min)
- **Email verification URLs** are rewritten in `AppServiceProvider` to point to the frontend (`app.frontend_url`), not the backend
- **Policies** (`IssuePolicy`, `ProjectPolicy`, `MilestonePolicy`) are registered via `Gate::policy()` in `AppServiceProvider`
- `SocialAccount` model stores provider links (`provider_name`, `provider_id`, `provider_email`) with a `belongsTo User`
- `ProjectIssueCounter` tracks per-project issue key sequences — never set issue keys manually
- `IssueHistory` is an audit trail model written by `IssueObserver` on any field change
- `ProjectMember` is a pivot model with a `role` field (`admin` / `normal`)
- **AI client** is bound as a singleton `ai.client` in `AppServiceProvider::register()` — an `OpenAI\Client` with custom `HTTP-Referer` and `X-Title` headers. All AI services resolve it via `app('ai.client')`, never `new OpenAI()`
- **AI Services** in `app/Services/`: `AIIssueSuggestionService` (field auto-fill + assignee ranking), `AIIssueSearchService` (semantic similarity via pgvector embeddings), `AIThreadSummarizationService` (comment thread summaries)
- Issue embeddings are stored as a vector column; the `pgvector` extension must be enabled (migration `2026_04_17_063105_enable_vector_extension.php`)
- `Milestone` model has `start_date`, `due_date`, `status`, and computed `progress` / `is_overdue` attributes; issues link to milestones via `milestone_id` FK (not a string field)

### Key Frontend Conventions

- All API calls go through the singleton axios instance at `src/lib/axios.ts` — never create a new axios instance
- `NEXT_PUBLIC_BACKEND_URL` env var controls the API base URL (defaults to `http://localhost:8000`)
- React Compiler is enabled (`reactCompiler: true` in `next.config.ts`) — avoid manual `useMemo`/`useCallback` unless there's a specific reason
- Global context providers beyond `AuthContext`: `ThemeContext` (dark mode, via `useTheme()`) and `SidebarContext` (sidebar collapse state) — both are in `frontend/src/context/`

### Environment

Backend `.env` requires: `FRONTEND_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `OPENAI_API_KEY`, `OPENAI_BASE_URI` (for OpenRouter or similar gateways), database credentials (PostgreSQL).

Frontend `.env.local` requires: `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

## Feature Workflow

### OpenSpec (current workflow)

Newer changes use the OpenSpec workflow. Artifacts live in `openspec/changes/{change-name}/` and `openspec/specs/{capability}/`. The active in-progress change is `openspec/changes/schedule-tracker/` (structured milestones with dates and issue due dates).

- `/opsx:explore` — think through a problem before proposing
- `/opsx:propose` — create a new change with `proposal.md`, `design.md`, `tasks.md`, and per-capability `specs/`
- `/opsx:apply` — implement tasks from `tasks.md`; mark completed items `[x]`
- `/opsx:archive` — finalize a completed change (moves to `openspec/changes/archive/`)

### SpecKit (legacy workflow)

Earlier features used SpecKit commands in `.gemini/commands/`. Artifacts live in `specs/{number}-{feature-name}/`:

1. `/speckit.specify` — creates git branch + `specs/{number}-{name}/spec.md`
2. `/speckit.plan` — generates `plan.md`, `research.md`, `data-model.md`, `contracts/`
3. `/speckit.tasks` — generates `tasks.md`
4. `/speckit.implement` — executes tasks phase by phase

### Git Branching

Per the project constitution (`.specify/memory/constitution.md` v1.1.0): feature branches MUST branch from `develop`; merge flow is `feature_branch → develop`. Code MUST NOT be merged into `master` without an explicit command.

All features must comply with the constitution — key gates: professional testing, API documentation in `contracts/`, no secrets in code.
