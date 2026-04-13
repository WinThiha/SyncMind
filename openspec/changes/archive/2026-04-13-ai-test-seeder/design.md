## Context

To test our AI features effectively, we need deterministic and highly cohesive data in our database. Relying on Faker results in random text that provides poor context for inference models testing.

## Goals / Non-Goals

**Goals:**
- Provide a consistent, realistic project dataset for AI features to analyze.
- Establish a timeline of events (history, comments) to test conversational inference.
- Ensure the seeder is deterministic across environments.

**Non-Goals:**
- Replace the existing random `DatabaseSeeder.php` entirely (it's still useful for load testing).
- Create a complex schema migration (we will use the existing tables).

## Decisions

- **Hardcoded array of data vs Factory configuration:** We will use a hardcoded multidimensional array (the "Story") inside `AITestEnvironmentSeeder`. This guarantees exact relationships (like Bob commenting on Charlie's issue) which is difficult to guarantee with Factories without excessive state management.
- **Specific Personas:** Users will be explicitly defined (Alice: PM, Bob: Frontend, Charlie: Backend) to test AI assignment logic.
- **Chronological Seeding:** `IssueHistory` and `Comment` records will be inserted in a specific order to establish a coherent timeline.

## Risks / Trade-offs

- [Risk] Hardcoded seeder data may become outdated if the database schema changes significantly.
  - Mitigation: The seeder should be updated alongside schema changes. We will add a test to verify the seeder runs without exceptions.