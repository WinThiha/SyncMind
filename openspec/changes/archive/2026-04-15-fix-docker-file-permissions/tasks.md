## 1. Environment Configuration

- [x] 1.1 Add `PUID=1000` and `PGID=1000` to `backend/.env.example`
- [x] 1.2 Add `PUID=1000` and `PGID=1000` to `frontend/.env.example`
- [x] 1.3 Update current `backend/.env` with `PUID` and `PGID`
- [x] 1.4 Update current `frontend/.env.local` with `PUID` and `PGID`

## 2. Docker Compose Updates

- [x] 2.1 Update `backend` service in `docker-compose.yml` to use `user: "${PUID:-1000}:${PGID:-1000}"`
- [x] 2.2 Update `frontend` service in `docker-compose.yml` to use `user: "${PUID:-1000}:${PGID:-1000}"`
- [x] 2.3 Add `HOME: /tmp` to `environment` in `backend` service in `docker-compose.yml` to support mapped users without an entry in `/etc/passwd`

## 2.5 Entrypoint Fix (Required for non-root)

- [x] 2.5.1 Make `backend/docker-entrypoint.sh` skip chmod/chown when running as non-root user

## 3. Host-Side Permission Fixes

- [x] 3.1 Run `sudo chown -R $USER:$USER backend/storage backend/bootstrap/cache` on the host
- [x] 3.2 Run `sudo chown -R $USER:$USER frontend/node_modules` on the host

## 4. Verification

- [x] 4.1 Restart containers: `docker compose down && docker compose up -d`
- [x] 4.2 Verify log writing: `docker compose exec backend php artisan tinker --execute="Log::info('permission_test')"`
- [x] 4.3 Check host file ownership: `ls -l backend/storage/logs/laravel.log`
- [x] 4.4 Verify container tool accessibility: `docker compose exec backend composer --version`
