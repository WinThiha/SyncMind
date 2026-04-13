## ADDED Requirements

### Requirement: AI Test Environment Seeder
The system SHALL provide a dedicated seeder named `AITestEnvironmentSeeder` that populates the database with a deterministic, realistic project state.

#### Scenario: Running the seeder
- **WHEN** a developer or automated test executes `php artisan db:seed --class=AITestEnvironmentSeeder`
- **THEN** the database is populated with the "Acme SaaS MVP" project, specific test users (Alice, Bob, Charlie), and an interconnected set of issues, comments, and issue histories.
- **THEN** the seeded data is identical on every execution.