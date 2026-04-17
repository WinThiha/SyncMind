# SyncMind Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-17

## Active Technologies
- PHP 8.2+, Node.js 20+, TypeScript + Laravel 12, Next.js 16, TailwindCSS v4, Laravel Sanctum
- **AI Infrastructure**: 
    - **Suggestion Service**: OpenAI-compatible (via OpenRouter/openai-php)
    - **Vector Search Service**: Native Gemini REST API (gemini-embedding-001)
- PostgreSQL 16 + **pgvector** (002-project-management, semantic-issue-search)
- PHP 8.2+ (Backend), TypeScript / Node.js 20+ (Frontend) + Laravel 12, Next.js 16, TailwindCSS v4, Laravel Sanctum, Lucide React (Icons), react-markdown (AI Rendering) (003-issue-management)
- Redis (Cache/Notifications) (003-issue-management)
- TypeScript (Next.js 15+) + React, Lucide React (Icons), Framer Motion (Spring Animations), Vanilla CSS / CSS Modules (004-frontend-ui-update)
- Local Storage (Theme Persistence) (004-frontend-ui-update)
- TypeScript (Next.js 16) + React 19, Lucide React (Icons), Framer Motion (Spring Animations), Vanilla CSS / CSS Modules, TailwindCSS v4 (004-frontend-ui-update)

- PHP 8.2+ (via scoop), Node.js 20+ (via nvs), TypeScript + Laravel 12, Next.js 16, TailwindCSS v4, Laravel Sanctum, Laravel Socialite (001-user-auth)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Docker Support

The project includes a `docker-compose.yml` file to spin up the entire stack:
- **db**: PostgreSQL 16 (port 5432)
- **backend**: Laravel application (port 8000)
- **frontend**: Next.js application (port 3000)

### Usage
- `docker compose up -d`: Start the development environment.
- `docker compose down`: Stop the services.
- `docker compose ps`: Check the status of the containers.
- `docker compose logs -f [service]`: Follow the logs of a specific service.

## Code Style

PHP 8.2+ (via scoop), Node.js 20+ (via nvs), TypeScript: Follow standard conventions

## Recent Changes
- fix-embedding-dimensions: Corrected vector dimension mismatch using `outputDimensionality: 768` for native Gemini embeddings
- refactor-gemini-native-api: Refactored Vector Search Service to use native Gemini REST API instead of OpenAI compatibility layer
- semantic-issue-search: Implemented AI-driven duplicate issue detection using `pgvector` and Gemini embeddings
- sidebar-collapse: Implemented collapsible sidebar with state persistence and synchronized layout
- ai-infrastructure: Configured custom OpenAI client for AI gateway routing and service integration
- ai-issue-copilot: Integrated AI-powered issue creation assistance (backend + frontend)
- ai-assignee-suggestions: Implemented ranked AI assignee suggestions with reasoning logic
- 004-frontend-ui-update: Added TypeScript (Next.js 16) + React 19, Lucide React (Icons), Framer Motion (Spring Animations), Vanilla CSS / CSS Modules
- 004-frontend-ui-update: Added TypeScript (Next.js 15+) + React, Lucide React (Icons), Framer Motion (Spring Animations), Vanilla CSS / CSS Modules
- 003-issue-management: Added PHP 8.2+ (Backend), TypeScript / Node.js 20+ (Frontend) + Laravel 12, Next.js 16, TailwindCSS v4, Laravel Sanctum, Lucide React (Icons)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
