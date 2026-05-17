## Context

SyncMind's backend is Laravel 12 with a PostgreSQL database. The seeder layer already has `AITestEnvironmentSeeder` for AI feature tests. The relevant models are: `User`, `Project`, `ProjectIssueCounter`, `ProjectMember`, `Milestone`, `Issue`, `IssueHistory`, `Comment`, and `WikiPage`.

Key constraints from the current schema:
- Issues reference milestones via `milestone_id` FK on the `milestones` table — not a string field.
- `ProjectIssueCounter` must be created for each project so the issue-key auto-increment works correctly; its `last_number` must equal the count of seeded issues.
- `Project::$fillable` includes `name`, `key`, `icon`, `issue_types`, `categories`, `versions`, `creator_id` (no `milestones` JSON column).
- `ProjectMember` pivot uses `role` (`admin` / `normal`) and `position`.
- `User::$fillable` includes `name`, `email`, `password`, `position`, `settings`. Setting `email_verified_at` ensures users are verified and can log in immediately.
- `Issue::$fillable` includes `milestone_id` (integer FK) and `due_date` (date), not old string fields.
- `WikiPage::$fillable` includes `project_id`, `title`, `content`, `author_id`, `last_editor_id`.

## Goals / Non-Goals

**Goals:**
- Seed three visually distinct projects with rich, realistic data covering all major SyncMind surfaces.
- Make every demo user login-ready with the same predictable password.
- Produce milestone progress bars that look meaningful — a mix of fully closed milestones, in-progress milestones, and one upcoming milestone per project.
- Cover all issue statuses and priorities so the issue board and filters look populated and busy.
- Include multi-participant comment threads with substantive content to demonstrate team collaboration.
- Seed wiki pages with paragraph-level content so the documentation surface looks genuinely used.
- Seed estimated and actual hours on a subset of issues so the time-tracking display is non-trivial.
- Seed due dates on a mix of issues to show overdue and upcoming deadline indicators.
- Keep the seeder idempotent and self-contained.

**Non-Goals:**
- Generating embeddings for issues or wiki pages — these are computed asynchronously by background jobs.
- Adding frontend fixtures or mocking API responses.
- Modifying any existing migration or model.
- Building a factory-based randomised seeder — this is a fixed, deterministic dataset.

## Decisions

### Decision: Three projects instead of two
Three projects gives the demo a more convincing project-list view and lets the presenter switch contexts naturally. `SYNC` is the SyncMind product team (internal software product), `NOVA` is a client delivery portal, and `ORION` is a data-platform modernisation initiative. The three flavors — product, client, and infrastructure — cover the range of use cases prospects care about.

### Decision: Eight users shared across all three projects with overlapping membership
Eight named personas (Ethan, Fiona, George, Hana, Ivan, Julia, Kevin, Luna) appear across the three projects in varying roles. This gives every dropdown and @mention picker a realistic number of options, shows cross-project membership clearly, and makes the members panel non-trivial without overwhelming the screen.

### Decision: 20+ issues per project for a dense, realistic board
Each project seeds 20–22 issues spread across all statuses. This makes the issue board look genuinely active, gives the filter controls something meaningful to narrow, and provides enough history rows for a convincing timeline view.

### Decision: Milestones created as model records with FK references
The current `Issue` model uses `milestone_id` (FK). Creating proper `Milestone` rows and assigning `milestone_id` to issues ensures the milestone detail view, progress bars, and issue filtering by milestone all work correctly during the demo.

### Decision: Idempotency via sentinel email
The seeder identifies its own data by looking for the sentinel user `demo@syncmind.app` (Ethan, who is the seed owner). On each run it deletes everything that seed created and re-seeds cleanly. This avoids duplicate data if the seeder is run more than once.

### Decision: Register in DatabaseSeeder as a documented optional call
`DatabaseSeeder` will call both `AITestEnvironmentSeeder` and `DemoSeeder` in sequence. A comment in `DatabaseSeeder` will note that each seeder is standalone and can be run individually with `php artisan db:seed --class=DemoSeeder`.

## Risks / Trade-offs

- [Risk] The `AITestEnvironmentSeeder` and `DemoSeeder` both seed specific named users. Email collisions are avoided by using completely different email domains (`@example.com` vs `@syncmind.app`).
- [Risk] Hard-coded dates in a demo seeder age poorly. Mitigation: issue `created_at` and milestone dates are written relative to `now()` where it matters for "overdue" or "upcoming" presentation, and as fixed past dates where chronological narrative is needed.
- [Risk] `ProjectIssueCounter::last_number` must exactly equal the number of issues seeded per project. Mitigation: count issue arrays explicitly and set `last_number` to match.

## Migration Plan

1. Create `DemoSeeder` with all data inline.
2. Update `DatabaseSeeder` to call `DemoSeeder` after `AITestEnvironmentSeeder`.
3. Run `php artisan db:seed --class=DemoSeeder` to verify the seeder executes without errors.
4. Manually walk through the demo flow: log in as each persona, view projects, issues, milestones, wiki, and comments.

## Open Questions

- Should the `DemoSeeder` be excluded from `DatabaseSeeder` by default (called only manually) to avoid slowing down `migrate:fresh --seed` during development? Currently planned to include it, but an environment guard could be added if needed.
