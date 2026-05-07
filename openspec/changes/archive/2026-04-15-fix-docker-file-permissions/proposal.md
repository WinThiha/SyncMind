## Why

Docker creates files with UID 33 (`www-data`) inside the container, but the host user is UID 1000. This results in "Permission Denied" errors when trying to edit or delete logs, cache files, and other generated artifacts directly from the host machine or code editor.

## What Changes

- Map the Docker container's user to the host user's UID and GID in `docker-compose.yml`.
- Configure the backend and frontend services to run as the host user.
- Update environment variables to include `PUID` and `PGID` for consistency.
- Standardize file ownership in the shared volumes to match the host user.

## Capabilities

### New Capabilities
- `dev-environment`: Standardized local development environment configurations, including user mapping and volume permissions.

### Modified Capabilities
<!-- No requirement changes to existing core capabilities. -->

## Impact

- `docker-compose.yml`: Added `user:` directive and environment variables.
- `backend/.env`: Added `PUID` and `PGID` variables.
- `frontend/.env.local`: Added `PUID` and `PGID` variables.
- Local filesystem permissions in `backend/storage/`, `backend/bootstrap/cache/`, and `frontend/node_modules/`.
