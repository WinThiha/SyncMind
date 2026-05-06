# AGENTS.md

## Test Safety Rules

> Temporary safety note (2026-05-06):
> A previous Docker test run bypassed guard assumptions and may have targeted the local DB context. Treat current Docker Laravel test flow as risky until strict guard hardening is implemented. Do not rely on partial env matching alone.

When Laravel tests are run, always clear config cache first to avoid accidentally using cached non-testing database configuration.

### Docker (preferred)

```bash
docker compose exec backend php artisan config:clear
docker compose exec backend sh -lc 'APP_ENV=testing DB_CONNECTION=pgsql DB_HOST=db DB_DATABASE=syncmind_test DB_USERNAME=syncmind DB_PASSWORD=secret php artisan test'
```

Why this is required:
- The backend container defaults to `APP_ENV=local` and `DB_DATABASE=syncmind`.
- The project safety guard in `backend/tests/TestCase.php` blocks tests unless env resolves to testing and DB name is clearly a test database.
- `phpunit.xml` values may not be sufficient on their own in this container runtime, so inject testing env vars explicitly for Docker test commands.

Pending hardening (TODO):
- Tighten `backend/tests/TestCase.php` guard to require exact test DB allowlist (e.g., `syncmind_test`) and explicit `APP_ENV=testing`.
- Add a required preflight command to print resolved runtime env + DB before running tests.

### Docker filtered test run

```bash
docker compose exec backend php artisan config:clear
docker compose exec backend sh -lc 'APP_ENV=testing DB_CONNECTION=pgsql DB_HOST=db DB_DATABASE=syncmind_test DB_USERNAME=syncmind DB_PASSWORD=secret php artisan test --filter=UserSettingsTest'
```

### Host fallback

```bash
cd backend
php artisan config:clear
php artisan test
```

Apply the same `php artisan config:clear` step before filtered test runs (`--filter`, single file, etc.).

## Frontend Commands

Run frontend npm commands in Docker container (not host), e.g.:

```bash
docker compose exec frontend npm run lint
docker compose exec frontend npm run test
```
