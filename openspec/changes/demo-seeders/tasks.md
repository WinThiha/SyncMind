## 1. DemoSeeder scaffolding

- [x] 1.1 Create `backend/database/seeders/DemoSeeder.php` with the class skeleton, `run()` method, and all required model imports (`User`, `Project`, `ProjectIssueCounter`, `ProjectMember`, `Milestone`, `Issue`, `IssueHistory`, `Comment`, `WikiPage`, `Hash`).
- [x] 1.2 Implement the idempotency block at the top of `run()`: find the sentinel user `ethan@syncmind.app`; if found, cascade-delete all seeded data (comments → issue histories → issues → wiki pages → milestones → project members → projects → all users with `@syncmind.app` email domain) before re-seeding.

## 2. Users (8 personas)

- [x] 2.1 Seed eight demo users with `email_verified_at = now()` and `password = Hash::make('password')`:
  - Ethan Evans (`ethan@syncmind.app`) — Engineering Lead
  - Fiona Fletcher (`fiona@syncmind.app`) — Product Manager
  - George Grant (`george@syncmind.app`) — Backend Developer
  - Hana Huang (`hana@syncmind.app`) — Frontend Developer
  - Ivan Ivanov (`ivan@syncmind.app`) — QA Engineer
  - Julia James (`julia@syncmind.app`) — UX Designer
  - Kevin Kim (`kevin@syncmind.app`) — DevOps Engineer
  - Luna Lee (`luna@syncmind.app`) — Data Engineer

## 3. Project SYNC — SyncMind Platform

- [x] 3.1 Create project `SYNC` ("SyncMind Platform") with `icon = 'layers'`, `issue_types = ['story', 'task', 'bug']`, `categories = ['backend', 'frontend', 'devops', 'design']`, `versions = ['v1.0', 'v1.1', 'v2.0']`, `creator_id = ethan`.
- [x] 3.2 Create `ProjectIssueCounter` for SYNC with `last_number = 22`.
- [x] 3.3 Add project members: Ethan (admin), Fiona (admin), George (normal), Hana (normal), Ivan (normal), Kevin (normal), Julia (normal).
- [x] 3.4 Seed four milestones for SYNC:
  - "M1 — Core Infrastructure" (`start_date = 14 weeks ago`, `due_date = 10 weeks ago`, `status = closed`)
  - "M2 — Issue & Project Workflows" (`start_date = 10 weeks ago`, `due_date = 6 weeks ago`, `status = closed`)
  - "M3 — AI Features" (`start_date = 5 weeks ago`, `due_date = 1 week ago`, `status = closed`)
  - "M4 — Performance & Polish" (`start_date = 1 week ago`, `due_date = 4 weeks from now`, `status = in_progress`)
- [x] 3.5 Seed 22 issues for SYNC. For each: set `project_id`, `key_number`, `summary`, `description` (2–3 sentences), `status`, `priority`, `issue_type`, `assignee_id`, `creator_id`, `category`, `milestone_id`, and `created_at`. Set `estimated_hours` and `actual_hours` on closed/in-progress issues, `due_date` on open/in-progress issues:
  - SYNC-1: "Bootstrap Laravel API with Sanctum auth" — closed, high, task, George, M1, est 8h, act 9h
  - SYNC-2: "Configure PostgreSQL with pgvector extension" — closed, high, task, Kevin, M1, est 4h, act 4h
  - SYNC-3: "Set up Docker Compose dev environment" — closed, normal, task, Kevin, M1, est 6h, act 7h
  - SYNC-4: "Scaffold Next.js frontend with TypeScript and Tailwind" — closed, normal, task, Hana, M1, est 5h, act 5h
  - SYNC-5: "Implement user registration and login endpoints" — closed, high, story, George, M1, est 10h, act 11h
  - SYNC-6: "Google OAuth integration" — closed, normal, story, George, M2, est 6h, act 8h
  - SYNC-7: "Implement project CRUD endpoints and policies" — closed, high, story, George, M2, est 12h, act 13h
  - SYNC-8: "Build issue list view with filters and search" — closed, high, story, Hana, M2, est 14h, act 15h
  - SYNC-9: "Add drag-and-drop issue status board" — closed, normal, story, Hana, M2, est 8h, act 9h
  - SYNC-10: "Implement comment threading on issues" — closed, normal, story, George, M2, est 10h, act 10h
  - SYNC-11: "Fix: CSRF token not sent on token refresh" — closed, high, bug, George, M2, est 2h, act 3h
  - SYNC-12: "Collapsible sidebar with persisted state" — closed, normal, task, Hana, M2, est 4h, act 4h
  - SYNC-13: "Integrate OpenRouter AI client as singleton" — closed, high, task, George, M3, est 4h, act 5h
  - SYNC-14: "AI-powered issue field auto-fill" — closed, high, story, George, M3, est 16h, act 18h
  - SYNC-15: "AI assignee ranking by expertise and workload" — closed, normal, story, George, M3, est 12h, act 14h
  - SYNC-16: "Semantic duplicate issue detection with pgvector" — closed, normal, story, Hana, M3, est 10h, act 11h
  - SYNC-17: "AI comment thread summarisation endpoint" — closed, normal, story, George, M3, est 8h, act 9h
  - SYNC-18: "Fix: embedding dimension mismatch on text-embedding-3-large" — closed, high, bug, Kevin, M3, est 2h, act 2h
  - SYNC-19: "Dashboard cockpit with activity feed" — in_progress, high, story, Hana, M4, est 18h, due 2 weeks from now
  - SYNC-20: "Project settings — rename, key, icon, archival" — in_progress, normal, story, Hana, M4, est 8h, due 3 weeks from now
  - SYNC-21: "Milestone detail view with issue breakdown" — open, normal, story, null, M4, est 10h, due 3 weeks from now
  - SYNC-22: "Global search across projects and issues" — open, low, story, null, M4, est 14h, due 4 weeks from now
- [x] 3.6 Seed `IssueHistory` records for SYNC: closed issues → 3 rows (created→in_progress→closed); in_progress → 2 rows (created→in_progress); open → 1 row (created). Use `creator_id` for the creation row and `assignee_id` for subsequent rows.
- [x] 3.7 Seed comment threads for SYNC (use realistic conversational content):
  - SYNC-5 (3 comments — George notes Sanctum config done, Ethan asks about rate limiting, George confirms limiter added)
  - SYNC-11 (4 comments — Ivan reports regression, George investigates, George finds root cause, Ivan confirms fixed)
  - SYNC-14 (3 comments — Fiona shares field-mapping spec, George asks clarification on priority enum, Fiona clarifies)
  - SYNC-16 (3 comments — Ethan asks about cosine vs dot-product threshold, George explains choice, Ethan approves)
  - SYNC-19 (2 comments — Fiona shares Figma link for cockpit layout, Hana acknowledges and asks about widget order)
- [x] 3.8 Seed four wiki pages for SYNC:
  - "Architecture Overview" — authored by Ethan, edited by George; paragraph on decoupled Laravel + Next.js stack, Sanctum auth, PostgreSQL, pgvector
  - "API Authentication Guide" — authored by George; covers CSRF cookie, Sanctum session flow, XSRF header requirement, test credentials
  - "AI Services Reference" — authored by George, edited by Ethan; describes the three AI services (suggestion, search, summarisation), the `ai.client` singleton, and OpenRouter config
  - "Deployment Runbook" — authored by Kevin; covers Docker Compose services, env vars required, migration steps, and rollback procedure

## 4. Project NOVA — Nova Client Portal

- [x] 4.1 Create project `NOVA` ("Nova Client Portal") with `icon = 'briefcase'`, `issue_types = ['feature', 'task', 'bug', 'change-request']`, `categories = ['backend', 'frontend', 'ux', 'integration']`, `versions = ['MVP', 'v1.1', 'v1.2']`, `creator_id = fiona`.
- [x] 4.2 Create `ProjectIssueCounter` for NOVA with `last_number = 20`.
- [x] 4.3 Add project members: Fiona (admin), Ethan (admin), Hana (normal), Ivan (normal), Julia (normal).
- [x] 4.4 Seed four milestones for NOVA:
  - "Sprint 1 — Discovery & Setup" (`start_date = 16 weeks ago`, `due_date = 12 weeks ago`, `status = closed`)
  - "Sprint 2 — Core Features" (`start_date = 12 weeks ago`, `due_date = 7 weeks ago`, `status = closed`)
  - "Sprint 3 — Integrations" (`start_date = 7 weeks ago`, `due_date = 2 weeks ago`, `status = closed`)
  - "Sprint 4 — Polish & Launch" (`start_date = 2 weeks ago`, `due_date = 5 weeks from now`, `status = in_progress`)
- [x] 4.5 Seed 20 issues for NOVA:
  - NOVA-1: "Stakeholder kick-off and requirements workshop" — closed, high, task, Fiona, Sprint 1, est 8h, act 10h
  - NOVA-2: "Design system setup and shared component library" — closed, normal, task, Julia, Sprint 1, est 12h, act 13h
  - NOVA-3: "Information architecture and wireframes" — closed, normal, task, Julia, Sprint 1, est 10h, act 10h
  - NOVA-4: "User authentication and role management" — closed, high, feature, Ethan, Sprint 2, est 14h, act 15h
  - NOVA-5: "Dashboard analytics widgets (chart.js)" — closed, normal, feature, Hana, Sprint 2, est 16h, act 18h
  - NOVA-6: "Data table with server-side filtering and pagination" — closed, normal, feature, Hana, Sprint 2, est 10h, act 11h
  - NOVA-7: "Fix: date picker locale mismatch on Safari" — closed, high, bug, Hana, Sprint 2, est 3h, act 4h
  - NOVA-8: "REST API integration with client CRM (Salesforce)" — closed, high, feature, Ethan, Sprint 3, est 20h, act 23h
  - NOVA-9: "Webhook receiver for CRM contact sync" — closed, normal, feature, Ethan, Sprint 3, est 8h, act 9h
  - NOVA-10: "PDF invoice generation endpoint" — closed, normal, feature, Ethan, Sprint 3, est 6h, act 7h
  - NOVA-11: "Fix: N+1 query on contact list endpoint" — closed, high, bug, Ethan, Sprint 3, est 2h, act 2h
  - NOVA-12: "Change request: add bulk-import via CSV" — closed, normal, change-request, Hana, Sprint 3, est 10h, act 12h
  - NOVA-13: "Notification centre with email digests" — in_progress, normal, feature, Ethan, Sprint 4, est 14h, due 2 weeks from now
  - NOVA-14: "Export reports to PDF and XLSX" — in_progress, normal, feature, Hana, Sprint 4, est 10h, due 2 weeks from now
  - NOVA-15: "Multi-language support (EN / MY)" — in_progress, high, feature, Hana, Sprint 4, est 16h, due 3 weeks from now
  - NOVA-16: "Accessibility audit — WCAG 2.1 AA" — open, high, task, Ivan, Sprint 4, due 3 weeks from now
  - NOVA-17: "Performance profiling and Lighthouse audit" — open, normal, task, Ivan, Sprint 4, due 4 weeks from now
  - NOVA-18: "Client sign-off UAT session preparation" — open, high, task, Fiona, Sprint 4, due 4 weeks from now
  - NOVA-19: "Fix: chart tooltip overflow on mobile viewport" — open, normal, bug, null, Sprint 4, due 2 weeks from now
  - NOVA-20: "Security review and penetration test sign-off" — open, high, task, null, Sprint 4, due 5 weeks from now
- [x] 4.6 Seed `IssueHistory` records for NOVA issues (same rules as SYNC).
- [x] 4.7 Seed comment threads for NOVA:
  - NOVA-4 (3 comments — Fiona shares auth spec, Ethan notes Sanctum token approach, Ivan asks about 2FA scope)
  - NOVA-8 (4 comments — Ethan posts CRM endpoint list, Fiona asks about auth header format, Ethan clarifies OAuth2, Fiona confirms client approved)
  - NOVA-11 (3 comments — Ivan reports slow contact list, Ethan finds eager-load missing, Ethan confirms fix deployed)
  - NOVA-16 (3 comments — Ivan posts initial audit findings (4 issues), Julia asks about colour contrast targets, Ivan shares WCAG reference)
  - NOVA-18 (2 comments — Fiona drafts UAT checklist, client stakeholder note from Fiona)
- [x] 4.8 Seed four wiki pages for NOVA:
  - "Project Brief" — authored by Fiona; scope, key stakeholders, success criteria, and delivery timeline overview
  - "CRM Integration Notes" — authored by Ethan; Salesforce API endpoints, OAuth2 flow, webhook payload schema, rate limits
  - "UX Design Decisions" — authored by Julia; component library choices, colour palette, typography scale, responsive breakpoints
  - "QA Test Plan" — authored by Ivan; test scope, manual test cases for auth/dashboard/export flows, regression checklist

## 5. Project ORION — Data Platform Modernisation

- [x] 5.1 Create project `ORION` ("Orion Data Platform") with `icon = 'database'`, `issue_types = ['epic', 'task', 'bug', 'spike']`, `categories = ['data-pipeline', 'infrastructure', 'analytics', 'governance']`, `versions = ['Phase 1', 'Phase 2']`, `creator_id = luna`.
- [x] 5.2 Create `ProjectIssueCounter` for ORION with `last_number = 20`.
- [x] 5.3 Add project members: Luna (admin), Kevin (admin), Ethan (normal), Ivan (normal), George (normal).
- [x] 5.4 Seed four milestones for ORION:
  - "Phase 1A — Ingestion Layer" (`start_date = 18 weeks ago`, `due_date = 12 weeks ago`, `status = closed`)
  - "Phase 1B — Transformation & Storage" (`start_date = 12 weeks ago`, `due_date = 5 weeks ago`, `status = closed`)
  - "Phase 2A — Analytics & Reporting" (`start_date = 5 weeks ago`, `due_date = 2 weeks from now`, `status = in_progress`)
  - "Phase 2B — Governance & Observability" (`start_date = 1 week from now`, `due_date = 8 weeks from now`, `status = open`)
- [x] 5.5 Seed 20 issues for ORION:
  - ORION-1: "Spike: evaluate Apache Kafka vs AWS Kinesis for event ingestion" — closed, high, spike, Luna, Phase 1A, est 16h, act 18h
  - ORION-2: "Bootstrap Kafka cluster on Docker Compose" — closed, high, task, Kevin, Phase 1A, est 8h, act 9h
  - ORION-3: "Implement producer service for application event stream" — closed, high, task, George, Phase 1A, est 10h, act 11h
  - ORION-4: "Schema registry setup with Avro serialisation" — closed, normal, task, Luna, Phase 1A, est 6h, act 7h
  - ORION-5: "Dead-letter queue handling for malformed events" — closed, normal, task, George, Phase 1A, est 4h, act 5h
  - ORION-6: "Design dimensional data model (star schema)" — closed, high, task, Luna, Phase 1B, est 12h, act 13h
  - ORION-7: "Implement dbt transformation pipeline — user activity" — closed, high, task, Luna, Phase 1B, est 16h, act 18h
  - ORION-8: "Implement dbt transformation pipeline — issue metrics" — closed, normal, task, Luna, Phase 1B, est 14h, act 15h
  - ORION-9: "Configure ClickHouse OLAP cluster" — closed, normal, task, Kevin, Phase 1B, est 8h, act 10h
  - ORION-10: "Fix: dbt model failing on null foreign keys" — closed, high, bug, Luna, Phase 1B, est 3h, act 3h
  - ORION-11: "CI/CD pipeline for dbt — lint, test, deploy" — closed, normal, task, Kevin, Phase 1B, est 6h, act 7h
  - ORION-12: "Build project activity metrics dashboard (Metabase)" — in_progress, high, task, Luna, Phase 2A, est 20h, due 2 weeks from now
  - ORION-13: "Implement issue velocity and cycle-time report" — in_progress, normal, task, Luna, Phase 2A, est 12h, due 2 weeks from now
  - ORION-14: "Real-time event count anomaly detection" — in_progress, normal, spike, George, Phase 2A, est 16h, due 3 weeks from now
  - ORION-15: "Fix: ClickHouse query timeout on large date ranges" — open, high, bug, Kevin, Phase 2A, due 1 week from now
  - ORION-16: "Expose /api/analytics read endpoint for frontend" — open, normal, task, George, Phase 2A, due 2 weeks from now
  - ORION-17: "Data catalogue — field-level lineage documentation" — open, high, epic, Luna, Phase 2B, due 6 weeks from now
  - ORION-18: "Implement row-level data access policies" — open, high, task, Kevin, Phase 2B, due 6 weeks from now
  - ORION-19: "Set up OpenTelemetry pipeline observability" — open, normal, task, Kevin, Phase 2B, due 7 weeks from now
  - ORION-20: "SLA alerting for stale pipeline runs" — open, normal, task, null, Phase 2B, due 8 weeks from now
- [x] 5.6 Seed `IssueHistory` records for ORION issues (same rules as SYNC).
- [x] 5.7 Seed comment threads for ORION:
  - ORION-1 (4 comments — Luna posts evaluation matrix, Kevin asks about cost, Luna shares Kinesis pricing concern, Ethan recommends Kafka)
  - ORION-7 (3 comments — Luna shares dbt model graph, Kevin flags partitioning strategy, Luna updates incremental config)
  - ORION-10 (3 comments — Ivan reports test failure in staging, Luna finds null FK source, Luna confirms hot-fix merged)
  - ORION-14 (3 comments — George proposes z-score threshold, Luna asks about window size, George shares initial results)
  - ORION-15 (2 comments — Kevin posts slow-query log excerpt, Luna suggests materialised view workaround)
- [x] 5.8 Seed four wiki pages for ORION:
  - "Platform Architecture" — authored by Luna; event ingestion → Kafka → dbt → ClickHouse → Metabase pipeline diagram in ASCII, component responsibilities
  - "dbt Model Conventions" — authored by Luna; naming conventions, staging/intermediate/mart layer rules, test requirements, incremental strategy
  - "ClickHouse Schema Reference" — authored by Kevin; table definitions for fact_issues, fact_events, dim_users, dim_projects with column types and sort keys
  - "On-Call Runbook" — authored by Kevin; alert descriptions, escalation matrix, common failure modes and remediation steps

## 6. DatabaseSeeder update

- [x] 6.1 Update `backend/database/seeders/DatabaseSeeder.php` to call `DemoSeeder::class` after `AITestEnvironmentSeeder::class`, with a comment explaining both seeders are idempotent and can be run individually (`php artisan db:seed --class=DemoSeeder`).

## 7. Verification

- [x] 7.1 Run `docker compose exec backend php artisan db:seed --class=DemoSeeder` and confirm no exceptions are thrown.
- [x] 7.2 Run the seeder a second time and confirm idempotency — no duplicate records, no constraint violations.
- [x] 7.3 Log in as `ethan@syncmind.app` / `password`: verify SYNC and NOVA appear in project list, check issue board shows all statuses, open a milestone detail and verify progress percentage, open a wiki page.
- [x] 7.4 Log in as `luna@syncmind.app` / `password`: verify ORION appears, check milestone Phase 2A shows in-progress issues, open a comment thread.
- [x] 7.5 Confirm `ProjectIssueCounter.last_number` matches the seeded issue count for each project (22, 20, 20).
