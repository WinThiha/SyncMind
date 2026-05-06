# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SyncMind is a full-stack web application with a decoupled architecture:
- **Backend**: Laravel 12 (PHP 8.2+) — REST API only, no Blade views served to users
- **Frontend**: Next.js 16 (TypeScript, React 19) — SPA consuming the Laravel API

The two apps run as separate processes and communicate over HTTP. The frontend sits at `http://localhost:3000`, the backend at `http://localhost:8000`.

## Commands

All backend commands must be run from `backend/`, all frontend commands from `frontend/`.

### Docker-First Test Execution

When Docker services are available, always run tests inside containers instead of the host environment.

> Temporary safety note (2026-05-06): a prior Docker Laravel test execution bypassed expected guard assumptions and may have affected local DB context. Keep Docker Laravel test runs in a caution state until strict guard hardening is added in code.

```bash
# Frontend tests
docker compose exec frontend npm run test

# Backend tests
docker compose exec backend php artisan config:clear
docker compose exec backend sh -lc 'APP_ENV=testing DB_CONNECTION=pgsql DB_HOST=db DB_DATABASE=syncmind_test DB_USERNAME=syncmind DB_PASSWORD=secret php artisan test'
```

Important: this repository has a runtime safety guard in `backend/tests/TestCase.php` that blocks tests when Laravel resolves `APP_ENV=local` or a non-test DB name. In this Docker setup, container defaults are typically `APP_ENV=local` and `DB_DATABASE=syncmind`, so injecting testing env vars inline is required for safe execution.

Pending hardening:
- Require exact DB allowlist match (for example `syncmind_test`) in `backend/tests/TestCase.php`.
- Require explicit testing env match and preflight output of resolved runtime env + DB before any test run.

Only fall back to host commands if containers are unavailable.

### Backend (Laravel)

```bash
cd backend

# Start dev server
php artisan serve

# Run all tests
php artisan config:clear
php artisan test

# Run a single test file
php artisan config:clear
php artisan test tests/Feature/Auth/LoginTest.php

# Run a single test method
php artisan config:clear
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
```

## Architecture

### Auth Flow

Authentication uses **Laravel Sanctum cookie-based sessions** (not tokens). The frontend makes CSRF-protected requests by sending `withCredentials: true` and `withXSRFToken: true` (configured globally in `frontend/src/lib/axios.ts`).

**Google OAuth** uses the `@react-oauth/google` package on the frontend, which returns a Google `access_token`. This token is POSTed to `POST /api/auth/google/callback`, where the backend verifies it directly via Socialite or the Google userinfo endpoint.

The auth state is managed globally via `frontend/src/context/AuthContext.tsx` — it hydrates by calling `GET /api/user` on mount. All protected pages check `laravel_session` cookie in `frontend/src/middleware.ts` for fast edge redirects.

### Routing

**Backend** (`backend/routes/api.php`):
- All routes are under `/api`
- Auth routes are grouped under `/api/auth` with `throttle:auth` (5 req/min per IP)
- Authenticated routes use `auth:sanctum` middleware

**Frontend** (`frontend/src/app/`):
- `(auth)/` route group — login, register, verify-email pages (unauthenticated)
- `dashboard/` — protected; middleware redirects to `/login` if no session cookie

### Key Backend Conventions

- **Controllers** live in `app/Http/Controllers/Auth/` — one controller per auth concern
- **Observers** are registered in `AppServiceProvider::boot()` — `UserObserver` auto-deletes linked social accounts when a user's email changes
- **Rate limiting** is defined in `AppServiceProvider`: `auth` limiter (5/min), `api` limiter (60/min)
- **Email verification URLs** are rewritten in `AppServiceProvider` to point to the frontend (`app.frontend_url`), not the backend
- `SocialAccount` model stores provider links (`provider_name`, `provider_id`, `provider_email`) with a `belongsTo User`

### Key Frontend Conventions

- All API calls go through the singleton axios instance at `src/lib/axios.ts` — never create a new axios instance
- `NEXT_PUBLIC_BACKEND_URL` env var controls the API base URL (defaults to `http://localhost:8000`)
- React Compiler is enabled (`reactCompiler: true` in `next.config.ts`) — avoid manual `useMemo`/`useCallback` unless there's a specific reason

### Environment

Backend `.env` requires: `FRONTEND_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, database credentials (PostgreSQL).

Frontend `.env.local` requires: `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

## SpecKit Feature Workflow

New features follow a structured spec-first workflow using commands in `.gemini/commands/`:

1. `/speckit.specify` — creates a git branch + `specs/{number}-{name}/spec.md`
2. `/speckit.plan` — generates `plan.md`, `research.md`, `data-model.md`, `contracts/`
3. `/speckit.tasks` — generates `tasks.md` with dependency-ordered task list
4. `/speckit.implement` — executes tasks from `tasks.md` phase by phase

Feature artifacts live in `specs/{number}-{feature-name}/`. When implementing tasks, mark completed items `[X]` in `tasks.md`.

All features must comply with the project constitution at `.specify/memory/constitution.md` (v1.0.0) — key gates: professional testing, API documentation in `contracts/`, no secrets in code.
