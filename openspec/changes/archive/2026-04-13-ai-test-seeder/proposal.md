## Why

To effectively test our AI generation features (e.g., auto-assigning issues, summarizing history, suggesting sub-tasks), we need a predictable, highly-connected dataset. Current factories generate random Latin gibberish and disconnected records, which leads to flaky tests and poor AI inference. We need a deterministic "Story Seeder" that creates realistic, cohesive data every time.

## What Changes

- Add a new `AITestEnvironmentSeeder` that seeds a specific, pre-defined project ("Acme SaaS MVP").
- Seed 3 specific users with defined roles: Alice (Admin/PM), Bob (Frontend), Charlie (Backend).
- Seed a chronological array of highly connected issues with realistic titles, descriptions, comments, and status history (e.g., "Setup Laravel Backend API", "Create React Next.js Frontend Skeleton").
- Ensure the seeder is deterministic (produces the exact same output on every run) to prevent flaky AI test assertions.

## Capabilities

### New Capabilities
- `ai-testing-data`: Provides structured, realistic test data specifically tailored for AI inference testing.

### Modified Capabilities


## Impact

- Adds a new seeder class to `backend/database/seeders/`.
- Potentially updates `DatabaseSeeder.php` to include or document how to run this specific seeder.
- Provides a reliable foundation for all future AI feature testing.