## Rollout Notes: User-Global Settings

Date: 2026-05-05
Change: add-user-global-settings

Update: 2026-05-06
- Added follow-up documentation scope for account UX consistency:
  - successful name updates in `/settings` must immediately update top bar identity in-session
  - email address updates remain intentionally disabled in settings for now with explicit UX messaging
- Follow-up implementation and regression coverage are tracked in `tasks.md` section 5.
- Added follow-up behavior scope for theme preference consistency:
  - saved account theme supports `light`, `dark`, and `system`
  - saved account preference is applied after authenticated startup (including fresh/private browser contexts)
  - top bar toggle persists a local override across reloads without mutating account preference until explicit save
  - `system` preference follows OS color-scheme changes live while the app is open

### Validation Summary
- `/settings` route now exists and renders in authenticated layout.
- Sidebar `Settings` item resolves to `/settings` (no 404 expected).
- Settings sections are user-global only: Account, Security, Preferences, Notifications.
- No project administration controls are exposed in `/settings`.
- UI includes explicit guardrail text directing project administration to project pages.
- Theme dropdown reflects saved account preference; global theme only changes from settings on explicit save.

### Backend/API Contract
- `GET /api/user/settings` returns profile, verification, security capability flags, preferences, and notifications.
- `PUT /api/user/settings` updates allowed profile fields and persisted settings payload.
- Theme preference contract for `preferences.theme` supports `light | dark | system`.

### Persistence
- User settings persisted in `users.settings` JSON column.
- Saved theme and default sidebar collapsed preferences are persisted in user settings.
- Local top bar theme override is persisted in browser storage and survives reloads.

### Test Artifacts Added
- Frontend: `frontend/tests/settings-page.test.tsx`
- Backend: `backend/tests/Feature/UserSettingsTest.php`

### Environment Gaps
- Frontend targeted suite passed in Docker: `docker compose exec frontend npm run test -- settings-page` (6 passing tests).
- Backend targeted suite passed in Docker (with test safety env): `docker compose exec backend php artisan config:clear` then `docker compose exec backend sh -lc 'APP_ENV=testing DB_CONNECTION=pgsql DB_HOST=db DB_DATABASE=syncmind_test DB_USERNAME=syncmind DB_PASSWORD=secret php artisan test --filter=UserSettingsTest'` (11 passing tests).
