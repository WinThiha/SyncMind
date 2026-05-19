## Why

The application currently has only a technical test seeder (`AITestEnvironmentSeeder`) built for AI inference validation. It seeds one small project with three users and seven issues — enough for testing, but far too sparse and narrow to make a strong impression on a client during a live demo. We need a dedicated demo seeder that populates the system with credible, varied, and visually rich data across multiple projects, teams, milestones, wiki pages, and comment threads so every major surface of SyncMind looks fully active when the demo begins.

## What Changes

- Add a `DemoSeeder` class under `backend/database/seeders/` that seeds a complete, polished dataset covering all key features of SyncMind.
- Seed three projects with distinct flavors: a software product team (`SYNC`), a client delivery portal (`NOVA`), and a data-platform modernisation initiative (`ORION`).
- Seed eight named users with defined roles, positions, and verified accounts — all accessible with the password `password`.
- Seed four milestones per project as proper `Milestone` model records, with realistic start/due dates and a mix of `closed`, `in_progress`, and `open` statuses.
- Seed 20–22 issues per project (62 total) covering all statuses, all priorities, and all issue types, with `milestone_id` FK references, `estimated_hours`, `actual_hours`, and `due_date` set where relevant.
- Seed issue history records for every issue so the timeline view shows a convincing lifecycle.
- Seed multi-participant comment threads (4–5 threads per project) with substantive, domain-specific conversation content.
- Seed four wiki pages per project with paragraph-level content so the documentation surface looks genuinely used.
- Make the seeder idempotent: re-running it cleans up its own data before re-seeding, identified by a sentinel user email (`demo@syncmind.app`).
- Register the seeder in `DatabaseSeeder` as an optional call alongside the existing `AITestEnvironmentSeeder`.

## Capabilities

### New Capabilities
- `demo-data`: A deterministic, client-ready demo dataset covering users, projects, milestones, issues, comments, issue history, and wiki pages across two realistic projects.

### Modified Capabilities
- `dev-environment`: `DatabaseSeeder` is updated to include `DemoSeeder` as a documented, optional seeder invocation.

## Impact

- Adds `backend/database/seeders/DemoSeeder.php`.
- Updates `backend/database/seeders/DatabaseSeeder.php` to document and optionally call `DemoSeeder`.
- No schema changes, no migrations, no frontend changes.
- The seeder is safe to run in development and staging; it must never be called in production (guarded by a comment and a documented precaution in the seeder itself).
