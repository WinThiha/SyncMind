## ADDED Requirements

### Requirement: Host user ownership of generated files
The local development environment SHALL ensure that all files created by the application's Docker containers within shared volumes (such as `storage/logs`, `bootstrap/cache`, and `node_modules`) are owned by the host developer's UID and GID.

#### Scenario: Application log creation
- **WHEN** the Laravel backend writes a new log entry to `storage/logs/laravel.log` inside the container
- **THEN** the file on the host machine MUST be owned by the host user (UID 1000) and MUST be editable/deletable without `sudo`.

#### Scenario: Node modules installation
- **WHEN** `npm install` is run inside the frontend container via `docker compose`
- **THEN** any new files created in `frontend/node_modules/` MUST be owned by the host user on the local filesystem.
