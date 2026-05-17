<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Issue;
use App\Models\IssueHistory;
use App\Models\Milestone;
use App\Models\Project;
use App\Models\ProjectIssueCounter;
use App\Models\ProjectMember;
use App\Models\User;
use App\Models\WikiPage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->cleanup();
        $u = $this->seedUsers();
        $this->seedSync($u);
        $this->seedNova($u);
        $this->seedOrion($u);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function cleanup(): void
    {
        foreach (['SYNC', 'NOVA', 'ORION'] as $key) {
            $project = Project::where('key', $key)->first();
            if (! $project) {
                continue;
            }
            $issueIds = $project->issues()->withTrashed()->pluck('id');
            Comment::whereIn('issue_id', $issueIds)->delete();
            IssueHistory::whereIn('issue_id', $issueIds)->delete();
            $project->issues()->withTrashed()->forceDelete();
            WikiPage::where('project_id', $project->id)->delete();
            $project->milestones()->delete();
            $project->members()->detach();
            $project->delete();
        }
        User::where('email', 'like', '%@syncmind.app')->delete();
    }

    private function seedUsers(): array
    {
        $pw = Hash::make('password');
        $v  = now();

        return [
            'ethan'  => User::create(['name' => 'Ethan Evans',    'email' => 'ethan@syncmind.app',  'password' => $pw, 'position' => 'Engineering Lead',   'email_verified_at' => $v]),
            'fiona'  => User::create(['name' => 'Fiona Fletcher', 'email' => 'fiona@syncmind.app',  'password' => $pw, 'position' => 'Product Manager',     'email_verified_at' => $v]),
            'george' => User::create(['name' => 'George Grant',   'email' => 'george@syncmind.app', 'password' => $pw, 'position' => 'Backend Developer',   'email_verified_at' => $v]),
            'hana'   => User::create(['name' => 'Hana Huang',     'email' => 'hana@syncmind.app',   'password' => $pw, 'position' => 'Frontend Developer',  'email_verified_at' => $v]),
            'ivan'   => User::create(['name' => 'Ivan Ivanov',    'email' => 'ivan@syncmind.app',   'password' => $pw, 'position' => 'QA Engineer',         'email_verified_at' => $v]),
            'julia'  => User::create(['name' => 'Julia James',    'email' => 'julia@syncmind.app',  'password' => $pw, 'position' => 'UX Designer',         'email_verified_at' => $v]),
            'kevin'  => User::create(['name' => 'Kevin Kim',      'email' => 'kevin@syncmind.app',  'password' => $pw, 'position' => 'DevOps Engineer',     'email_verified_at' => $v]),
            'luna'   => User::create(['name' => 'Luna Lee',       'email' => 'luna@syncmind.app',   'password' => $pw, 'position' => 'Data Engineer',       'email_verified_at' => $v]),
        ];
    }

    private function createIssue(array $data): Issue
    {
        $createdAt = $data['created_at'];
        unset($data['created_at']);

        $issue = Issue::create($data);
        DB::table('issues')->where('id', $issue->id)->update(['created_at' => $createdAt]);
        $issue->created_at = $createdAt;

        return $issue;
    }

    private function seedHistory(Issue $issue): void
    {
        $ts = $issue->created_at->toDateTimeString();

        IssueHistory::create([
            'issue_id'   => $issue->id,
            'user_id'    => $issue->creator_id,
            'field'      => 'status',
            'old_value'  => null,
            'new_value'  => 'open',
            'created_at' => $ts,
        ]);

        if (in_array($issue->status, ['in_progress', 'closed'])) {
            IssueHistory::create([
                'issue_id'   => $issue->id,
                'user_id'    => $issue->assignee_id ?? $issue->creator_id,
                'field'      => 'status',
                'old_value'  => 'open',
                'new_value'  => 'in_progress',
                'created_at' => date('Y-m-d H:i:s', strtotime($ts) + 86400),
            ]);
        }

        if ($issue->status === 'closed') {
            IssueHistory::create([
                'issue_id'   => $issue->id,
                'user_id'    => $issue->assignee_id ?? $issue->creator_id,
                'field'      => 'status',
                'old_value'  => 'in_progress',
                'new_value'  => 'closed',
                'created_at' => date('Y-m-d H:i:s', strtotime($ts) + 259200),
            ]);
        }
    }

    private function addMembers(Project $project, array $u, array $members): void
    {
        foreach ($members as $m) {
            ProjectMember::create([
                'project_id' => $project->id,
                'user_id'    => $u[$m[0]]->id,
                'role'       => $m[1],
                'position'   => $m[2],
            ]);
        }
    }

    // -------------------------------------------------------------------------
    // SYNC — SyncMind Platform
    // -------------------------------------------------------------------------

    private function seedSync(array $u): void
    {
        $project = Project::create([
            'name'        => 'SyncMind Platform',
            'key'         => 'SYNC',
            'icon'        => 'layers',
            'issue_types' => ['story', 'task', 'bug'],
            'categories'  => ['backend', 'frontend', 'devops', 'design'],
            'versions'    => ['v1.0', 'v1.1', 'v2.0'],
            'creator_id'  => $u['ethan']->id,
        ]);

        ProjectIssueCounter::create(['project_id' => $project->id, 'last_number' => 22]);

        $this->addMembers($project, $u, [
            ['ethan',  'admin',  'Engineering Lead'],
            ['fiona',  'admin',  'Product Manager'],
            ['george', 'normal', 'Backend Developer'],
            ['hana',   'normal', 'Frontend Developer'],
            ['ivan',   'normal', 'QA Engineer'],
            ['kevin',  'normal', 'DevOps Engineer'],
            ['julia',  'normal', 'UX Designer'],
        ]);

        $m1 = Milestone::create(['project_id' => $project->id, 'name' => 'M1 — Core Infrastructure',       'description' => 'Foundational infrastructure: Laravel API, PostgreSQL, Docker, and Next.js skeleton.',                       'start_date' => now()->subWeeks(14)->format('Y-m-d'), 'due_date' => now()->subWeeks(10)->format('Y-m-d'), 'status' => 'closed']);
        $m2 = Milestone::create(['project_id' => $project->id, 'name' => 'M2 — Issue & Project Workflows', 'description' => 'Complete project and issue management flows including CRUD, permissions, board, and comments.',            'start_date' => now()->subWeeks(10)->format('Y-m-d'), 'due_date' => now()->subWeeks(6)->format('Y-m-d'),  'status' => 'closed']);
        $m3 = Milestone::create(['project_id' => $project->id, 'name' => 'M3 — AI Features',               'description' => 'AI-powered issue auto-fill, assignee suggestions, semantic duplicate detection, thread summarisation.', 'start_date' => now()->subWeeks(5)->format('Y-m-d'),  'due_date' => now()->subWeeks(1)->format('Y-m-d'),  'status' => 'closed']);
        $m4 = Milestone::create(['project_id' => $project->id, 'name' => 'M4 — Performance & Polish',      'description' => 'Dashboard cockpit, global search, project settings, and milestone detail view.',                       'start_date' => now()->subWeeks(1)->format('Y-m-d'),  'due_date' => now()->addWeeks(4)->format('Y-m-d'),  'status' => 'in_progress']);

        $pid = $project->id;
        $issues = [
            [1,  'Bootstrap Laravel API with Sanctum auth',                         'Initialise the Laravel 12 project with Sanctum for cookie-based session authentication. Configure CORS, session handling, and the base API structure with versioned routes.',                                                                                                                                                                                             'closed',      'high',   'task',  'george', 'ethan',  'backend',  $m1->id, 8,  9,  null,                              now()->subWeeks(13)->toDateTimeString()],
            [2,  'Configure PostgreSQL with pgvector extension',                    'Set up PostgreSQL 16 as the primary database and enable the pgvector extension. Create the initial schema migration and verify the extension is active on both dev and test databases.',                                                                                                                                                                                  'closed',      'high',   'task',  'kevin',  'ethan',  'devops',   $m1->id, 4,  4,  null,                              now()->subWeeks(13)->toDateTimeString()],
            [3,  'Set up Docker Compose dev environment',                           'Create a Docker Compose configuration that orchestrates backend, frontend, and PostgreSQL services. Include health checks, volume mounts, and an initialisation script for the test database.',                                                                                                                                                                           'closed',      'normal', 'task',  'kevin',  'ethan',  'devops',   $m1->id, 6,  7,  null,                              now()->subWeeks(13)->toDateTimeString()],
            [4,  'Scaffold Next.js frontend with TypeScript and Tailwind',          'Bootstrap the Next.js 16 project with TypeScript, React 19, Tailwind CSS v4, and App Router. Configure the axios singleton, global context providers, and the base layout components.',                                                                                                                                                                                 'closed',      'normal', 'task',  'hana',   'ethan',  'frontend', $m1->id, 5,  5,  null,                              now()->subWeeks(13)->toDateTimeString()],
            [5,  'Implement user registration and login endpoints',                 'Build the full authentication API: register, login, logout, email verification, and password reset. Integrate Laravel Sanctum cookie sessions and rewrite email verification URLs to point to the frontend.',                                                                                                                                                              'closed',      'high',   'story', 'george', 'fiona',  'backend',  $m1->id, 10, 11, null,                              now()->subWeeks(12)->toDateTimeString()],
            [6,  'Google OAuth integration',                                        'Add Google OAuth login via Laravel Socialite on the backend and @react-oauth/google on the frontend. The Google access token is POSTed to /api/auth/google/callback for server-side verification and session creation.',                                                                                                                                                  'closed',      'normal', 'story', 'george', 'fiona',  'backend',  $m2->id, 6,  8,  null,                              now()->subWeeks(9)->toDateTimeString()],
            [7,  'Implement project CRUD endpoints and policies',                   'Create the full project lifecycle: create, read, update, delete, and member management endpoints. Implement ProjectPolicy to enforce admin-only mutations and member-only reads using Laravel Gates.',                                                                                                                                                                     'closed',      'high',   'story', 'george', 'fiona',  'backend',  $m2->id, 12, 13, null,                              now()->subWeeks(9)->toDateTimeString()],
            [8,  'Build issue list view with filters and search',                   'Implement the main issue list page with filter controls for status, priority, assignee, and type. Add full-text search with debouncing and persistent filter state via URL query parameters.',                                                                                                                                                                            'closed',      'high',   'story', 'hana',   'fiona',  'frontend', $m2->id, 14, 15, null,                              now()->subWeeks(8)->toDateTimeString()],
            [9,  'Add drag-and-drop issue status board',                            'Build a Kanban-style board view using @dnd-kit for drag-and-drop status transitions. Status changes are optimistically updated on the client and synced via PATCH /api/projects/{id}/issues/{key}.',                                                                                                                                                                     'closed',      'normal', 'story', 'hana',   'fiona',  'frontend', $m2->id, 8,  9,  null,                              now()->subWeeks(8)->toDateTimeString()],
            [10, 'Implement comment threading on issues',                           'Add a threaded comment system to issues with a POST /api/projects/{id}/issues/{key}/comments endpoint. Comments support markdown and are displayed below the issue detail with user avatars and timestamps.',                                                                                                                                                              'closed',      'normal', 'story', 'george', 'fiona',  'backend',  $m2->id, 10, 10, null,                              now()->subWeeks(7)->toDateTimeString()],
            [11, 'Fix: CSRF token not sent on token refresh',                       'After a session expiry the axios instance was not re-fetching the XSRF-TOKEN cookie before retrying the original request, resulting in 419 errors on all subsequent API calls. Added a response interceptor to refresh the CSRF cookie on 419 responses.',                                                                                                               'closed',      'high',   'bug',   'george', 'ivan',   'frontend', $m2->id, 2,  3,  null,                              now()->subWeeks(7)->toDateTimeString()],
            [12, 'Collapsible sidebar with persisted state',                        'Implement a collapsible left sidebar using SidebarContext. The collapsed/expanded preference is persisted in localStorage so it survives page refreshes. Smooth CSS transitions are applied to sidebar width and label visibility.',                                                                                                                                      'closed',      'normal', 'task',  'hana',   'fiona',  'frontend', $m2->id, 4,  4,  null,                              now()->subWeeks(7)->toDateTimeString()],
            [13, 'Integrate OpenRouter AI client as singleton',                     'Bind the OpenAI-compatible client targeting OpenRouter as a singleton ai.client in AppServiceProvider::register(). Inject HTTP-Referer and X-Title headers. All AI services resolve the client via app(\'ai.client\').',                                                                                                                                                 'closed',      'high',   'task',  'george', 'ethan',  'backend',  $m3->id, 4,  5,  null,                              now()->subWeeks(4)->toDateTimeString()],
            [14, 'AI-powered issue field auto-fill',                                'Implement POST /api/projects/{id}/ai/suggest-issue which accepts a partial issue body and returns AI-generated suggestions for summary, description, priority, issue_type, and category. AIIssueSuggestionService calls the LLM with a structured prompt and returns a JSON payload.',                                                                                   'closed',      'high',   'story', 'george', 'fiona',  'backend',  $m3->id, 16, 18, null,                              now()->subWeeks(4)->toDateTimeString()],
            [15, 'AI assignee ranking by expertise and workload',                   'Extend AIIssueSuggestionService to rank project members for a given issue based on their historical contribution to similar categories and their current open-issue workload. The API returns a ranked list with reasoning text.',                                                                                                                                         'closed',      'normal', 'story', 'george', 'fiona',  'backend',  $m3->id, 12, 14, null,                              now()->subWeeks(3)->toDateTimeString()],
            [16, 'Semantic duplicate issue detection with pgvector',                'Implement AIIssueSearchService which generates text embeddings for each issue using text-embedding-3-large and stores them in the embedding vector column. On issue creation query pgvector with cosine similarity to surface potential duplicates above a 0.85 threshold.',                                                                                               'closed',      'normal', 'story', 'hana',   'ethan',  'backend',  $m3->id, 10, 11, null,                              now()->subWeeks(3)->toDateTimeString()],
            [17, 'AI comment thread summarisation endpoint',                        'Add POST /api/projects/{id}/issues/{key}/ai/summarise-thread which passes all comments in a thread to AIThreadSummarizationService. The service produces a structured summary with key decisions, action items, and open questions.',                                                                                                                                    'closed',      'normal', 'story', 'george', 'fiona',  'backend',  $m3->id, 8,  9,  null,                              now()->subWeeks(2)->toDateTimeString()],
            [18, 'Fix: embedding dimension mismatch on text-embedding-3-large',     'The pgvector column was created with 1536 dimensions but text-embedding-3-large produces 3072-dimensional vectors by default. Updated the migration and added a guard that checks dimension parity before inserting embeddings.',                                                                                                                                         'closed',      'high',   'bug',   'kevin',  'george', 'devops',   $m3->id, 2,  2,  null,                              now()->subWeeks(2)->toDateTimeString()],
            [19, 'Dashboard cockpit with activity feed',                            'Build the project dashboard cockpit page showing recent activity, open issue counts by priority, and milestone progress bars. The activity feed shows issue status changes, new comments, and member joins, polling every 30 seconds.',                                                                                                                                    'in_progress', 'high',   'story', 'hana',   'fiona',  'frontend', $m4->id, 18, null, now()->addWeeks(2)->format('Y-m-d'), now()->subWeeks(1)->toDateTimeString()],
            [20, 'Project settings — rename, key, icon, archival',                 'Implement the project settings page allowing admins to rename the project, change its key, update the icon, and archive/restore the project. Archival hides the project from the dashboard list but retains all data.',                                                                                                                                                   'in_progress', 'normal', 'story', 'hana',   'fiona',  'frontend', $m4->id, 8,  null, now()->addWeeks(3)->format('Y-m-d'), now()->subWeeks(1)->toDateTimeString()],
            [21, 'Milestone detail view with issue breakdown',                      'Create a dedicated milestone detail page showing progress percentage, overdue indicator, and a filtered issue list. Include a mini Kanban view of milestone issues by status so the team can see what is blocking milestone completion.',                                                                                                                                  'open',        'normal', 'story', null,     'fiona',  'frontend', $m4->id, 10, null, now()->addWeeks(3)->format('Y-m-d'), now()->subDays(5)->toDateTimeString()],
            [22, 'Global search across projects and issues',                        'Implement a command-palette global search (Cmd+K) that queries a dedicated GET /api/search endpoint. The endpoint returns ranked results from projects, issues, and wiki pages using PostgreSQL full-text search with ts_rank ordering.',                                                                                                                                 'open',        'low',    'story', null,     'ethan',  'backend',  $m4->id, 14, null, now()->addWeeks(4)->format('Y-m-d'), now()->subDays(4)->toDateTimeString()],
        ];

        $ci = $this->seedIssues($pid, $u, $issues);

        // Comments
        Comment::create(['issue_id' => $ci[5]->id,  'user_id' => $u['george']->id, 'created_at' => now()->subWeeks(11)->toDateTimeString(),             'content' => 'Sanctum is configured — CSRF cookie endpoint is live at /sanctum/csrf-cookie and the session driver is set to cookie. All auth routes verified working with the test suite.']);
        Comment::create(['issue_id' => $ci[5]->id,  'user_id' => $u['ethan']->id,  'created_at' => now()->subWeeks(11)->addHours(2)->toDateTimeString(), 'content' => 'Good progress. Did you add rate limiting to the login endpoint? We should throttle to 5 attempts per minute per IP to prevent brute-force attacks.']);
        Comment::create(['issue_id' => $ci[5]->id,  'user_id' => $u['george']->id, 'created_at' => now()->subWeeks(11)->addHours(4)->toDateTimeString(), 'content' => 'Yes — added the `throttle:auth` limiter in AppServiceProvider, 5 req/min per IP on all /api/auth/* routes. Login, register, and password reset are all covered.']);

        Comment::create(['issue_id' => $ci[11]->id, 'user_id' => $u['ivan']->id,   'created_at' => now()->subWeeks(6)->toDateTimeString(),              'content' => 'Reproduced in staging: after the session expires and I reload the page, the first subsequent API call gets a 419 and then the whole UI freezes. Consistent on Firefox and Chrome.']);
        Comment::create(['issue_id' => $ci[11]->id, 'user_id' => $u['george']->id, 'created_at' => now()->subWeeks(6)->addHours(1)->toDateTimeString(), 'content' => 'Looking into this. The axios instance has withXSRFToken: true set globally but it reads the cookie value at initialisation, not per-request. That could be the cause.']);
        Comment::create(['issue_id' => $ci[11]->id, 'user_id' => $u['george']->id, 'created_at' => now()->subWeeks(6)->addHours(5)->toDateTimeString(), 'content' => 'Root cause confirmed: we were not re-fetching /sanctum/csrf-cookie after a 419. Added a response interceptor that catches 419, re-fetches the CSRF cookie, then retries the original request once. Works correctly in both browsers now.']);
        Comment::create(['issue_id' => $ci[11]->id, 'user_id' => $u['ivan']->id,   'created_at' => now()->subWeeks(6)->addHours(7)->toDateTimeString(), 'content' => 'Confirmed fixed in staging. The retry logic is seamless — no visible disruption to the user. Marking as closed.']);

        Comment::create(['issue_id' => $ci[14]->id, 'user_id' => $u['fiona']->id,  'created_at' => now()->subWeeks(3)->toDateTimeString(),              'content' => 'AI field-mapping spec: summary and description should be generated from the user\'s raw input; priority should map from the LLM\'s inferred urgency (critical/urgent → high); issue_type must be one of the project\'s configured types; category must come from the project\'s category list. Return all fields so the UI can show suggestions even for fields the user already filled.']);
        Comment::create(['issue_id' => $ci[14]->id, 'user_id' => $u['george']->id, 'created_at' => now()->subWeeks(3)->addHours(2)->toDateTimeString(), 'content' => 'Got it. One clarification: should I return suggestions only for blank fields, or always return all fields so the UI can highlight when the suggestion differs from what the user typed?']);
        Comment::create(['issue_id' => $ci[14]->id, 'user_id' => $u['fiona']->id,  'created_at' => now()->subWeeks(3)->addHours(4)->toDateTimeString(), 'content' => 'Always return all fields. The UI will compare suggestion vs current value and show a diff indicator so users can selectively accept each field.']);

        Comment::create(['issue_id' => $ci[16]->id, 'user_id' => $u['ethan']->id,  'created_at' => now()->subWeeks(2)->toDateTimeString(),              'content' => 'What similarity metric are we using for the duplicate detection query — cosine or dot product? And what threshold did you settle on?']);
        Comment::create(['issue_id' => $ci[16]->id, 'user_id' => $u['george']->id, 'created_at' => now()->subWeeks(2)->addHours(3)->toDateTimeString(), 'content' => 'Using cosine similarity (<=> operator in pgvector) with a threshold of 0.85. Dot product is faster but requires unit-length vectors and our embeddings are not normalised. At 0.85 we have near-zero false positives in our test set of 200 real issues.']);
        Comment::create(['issue_id' => $ci[16]->id, 'user_id' => $u['ethan']->id,  'created_at' => now()->subWeeks(2)->addHours(5)->toDateTimeString(), 'content' => 'Makes sense. 0.85 is a safe conservative threshold for this use case. Approved — let\'s ship it.']);

        Comment::create(['issue_id' => $ci[19]->id, 'user_id' => $u['fiona']->id,  'created_at' => now()->subDays(3)->toDateTimeString(),               'content' => 'Sharing the Figma link for the cockpit layout. The activity feed goes in the right panel (roughly 30% width), issue stats and milestone progress on the left. Top bar shows project name and a quick-create issue button.']);
        Comment::create(['issue_id' => $ci[19]->id, 'user_id' => $u['hana']->id,   'created_at' => now()->subDays(2)->toDateTimeString(),               'content' => 'Got it, Figma is clear. One question: for the milestone progress widgets, should they be ordered by due_date ascending or by status (in_progress first, then open, then closed)?']);

        // Wiki pages
        WikiPage::create(['project_id' => $project->id, 'title' => 'Architecture Overview',    'author_id' => $u['ethan']->id,  'last_editor_id' => $u['george']->id, 'content' => "# Architecture Overview\n\nSyncMind is a decoupled full-stack application. The **backend** is a Laravel 12 REST API running on PHP 8.2+ with a PostgreSQL 16 database. The **frontend** is a Next.js 16 single-page application using TypeScript and React 19.\n\n## Backend\n\nThe Laravel API is served on `http://localhost:8000`. Authentication uses **Laravel Sanctum** with cookie-based sessions — no JWT tokens. The session cookie is named `syncmind_session`. CSRF protection is enforced via the `XSRF-TOKEN` cookie and `X-XSRF-TOKEN` request header.\n\nThe database is **PostgreSQL 16** with the `pgvector` extension enabled for storing and querying 1536-dimensional text embeddings used by the AI semantic search and duplicate detection features.\n\n## Frontend\n\nThe Next.js app runs on `http://localhost:3000`. All API calls go through a singleton axios instance (`src/lib/axios.ts`) with `withCredentials: true` and `withXSRFToken: true` set globally. The React Compiler is enabled, so manual `useMemo`/`useCallback` should be avoided.\n\n## Infrastructure\n\nAll three services — database, backend, and frontend — are orchestrated by Docker Compose at the project root. Run `docker compose up` to start the full stack."]);
        WikiPage::create(['project_id' => $project->id, 'title' => 'API Authentication Guide', 'author_id' => $u['george']->id, 'last_editor_id' => $u['george']->id, 'content' => "# API Authentication Guide\n\n## Session Flow\n\n1. Call `GET /sanctum/csrf-cookie` to set the `XSRF-TOKEN` cookie.\n2. Call `POST /api/auth/login` with `{email, password}` — on success the `syncmind_session` cookie is set.\n3. All subsequent authenticated requests are authorised by the session cookie. Set `withCredentials: true` on your HTTP client.\n4. Include the `X-XSRF-TOKEN` header (read from the `XSRF-TOKEN` cookie) on all state-changing requests (POST, PUT, PATCH, DELETE).\n\n## Test Credentials\n\n| Email | Password | Role |\n|---|---|---|\n| `ethan@syncmind.app` | `password` | Engineering Lead |\n| `fiona@syncmind.app` | `password` | Product Manager |\n| `george@syncmind.app` | `password` | Backend Developer |\n| `hana@syncmind.app` | `password` | Frontend Developer |\n| `ivan@syncmind.app` | `password` | QA Engineer |\n\n## Rate Limiting\n\nAll `/api/auth/*` routes are throttled to **5 requests per minute per IP**. Authenticated API routes allow 60 requests per minute per user."]);
        WikiPage::create(['project_id' => $project->id, 'title' => 'AI Services Reference',    'author_id' => $u['george']->id, 'last_editor_id' => $u['ethan']->id,  'content' => "# AI Services Reference\n\n## Client Binding\n\nAll AI services resolve the LLM client via `app('ai.client')`. The singleton is bound in `AppServiceProvider::register()` as an `OpenAI\\Client` targeting the OpenRouter gateway. `OPENAI_BASE_URI` controls the gateway URL and `OPENAI_API_KEY` holds the API key.\n\n## AIIssueSuggestionService\n\n**Endpoint:** `POST /api/projects/{id}/ai/suggest-issue`\n\nAccepts a partial issue payload and returns AI-generated suggestions for `summary`, `description`, `priority`, `issue_type`, `category`, and a ranked `assignees` list. Assignee ranking is based on each member's historical contribution to the same category and their current open-issue workload.\n\n## AIIssueSearchService\n\n**Endpoint:** `POST /api/projects/{id}/ai/search`\n\nAccepts a natural-language query and returns issues ranked by cosine similarity to the query embedding. Uses `text-embedding-3-large` and the pgvector `<=>` operator with a 0.85 similarity threshold.\n\n## AIThreadSummarizationService\n\n**Endpoint:** `POST /api/projects/{id}/issues/{key}/ai/summarise-thread`\n\nPasses all comments in an issue thread to the LLM and returns a structured summary with **key decisions**, **action items**, and **open questions**."]);
        WikiPage::create(['project_id' => $project->id, 'title' => 'Deployment Runbook',       'author_id' => $u['kevin']->id,  'last_editor_id' => $u['kevin']->id,  'content' => "# Deployment Runbook\n\n## Services\n\n| Service | Container | Port |\n|---|---|---|\n| PostgreSQL 16 | `db` | 5432 |\n| Laravel API | `backend` | 8000 |\n| Next.js | `frontend` | 3000 |\n\n## Required Environment Variables\n\n**Backend** (`.env`):\n- `APP_KEY` — generate with `php artisan key:generate`\n- `DB_HOST=db`, `DB_DATABASE=syncmind`, `DB_USERNAME=syncmind`, `DB_PASSWORD=secret`\n- `FRONTEND_URL=http://localhost:3000`\n- `OPENAI_API_KEY` — OpenRouter API key\n- `OPENAI_BASE_URI` — OpenRouter base URL\n- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`\n\n**Frontend** (`.env.local`):\n- `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000`\n- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`\n\n## Migration & Seed Steps\n\n```bash\ndocker compose exec backend php artisan migrate\ndocker compose exec backend php artisan db:seed\n```\n\n## Rollback\n\nPartial rollback: `php artisan migrate:rollback`\nFull reset (destructive): `php artisan migrate:fresh --seed`\n\n## Health Checks\n\n- Backend: `GET http://localhost:8000/api/health`\n- DB: `docker compose exec db pg_isready -U syncmind`"]);
    }

    // -------------------------------------------------------------------------
    // NOVA — Nova Client Portal
    // -------------------------------------------------------------------------

    private function seedNova(array $u): void
    {
        $project = Project::create([
            'name'        => 'Nova Client Portal',
            'key'         => 'NOVA',
            'icon'        => 'briefcase',
            'issue_types' => ['feature', 'task', 'bug', 'change-request'],
            'categories'  => ['backend', 'frontend', 'ux', 'integration'],
            'versions'    => ['MVP', 'v1.1', 'v1.2'],
            'creator_id'  => $u['fiona']->id,
        ]);

        ProjectIssueCounter::create(['project_id' => $project->id, 'last_number' => 20]);

        $this->addMembers($project, $u, [
            ['fiona',  'admin',  'Product Manager'],
            ['ethan',  'admin',  'Engineering Lead'],
            ['hana',   'normal', 'Frontend Developer'],
            ['ivan',   'normal', 'QA Engineer'],
            ['julia',  'normal', 'UX Designer'],
        ]);

        $s1 = Milestone::create(['project_id' => $project->id, 'name' => 'Sprint 1 — Discovery & Setup', 'description' => 'Stakeholder alignment, requirements workshops, design system setup, and project scaffolding.', 'start_date' => now()->subWeeks(16)->format('Y-m-d'), 'due_date' => now()->subWeeks(12)->format('Y-m-d'), 'status' => 'closed']);
        $s2 = Milestone::create(['project_id' => $project->id, 'name' => 'Sprint 2 — Core Features',     'description' => 'Authentication, dashboard analytics, data tables, and core UI components.',                  'start_date' => now()->subWeeks(12)->format('Y-m-d'), 'due_date' => now()->subWeeks(7)->format('Y-m-d'),  'status' => 'closed']);
        $s3 = Milestone::create(['project_id' => $project->id, 'name' => 'Sprint 3 — Integrations',      'description' => 'CRM REST integration, webhook receiver, PDF generation, and bulk import.',                   'start_date' => now()->subWeeks(7)->format('Y-m-d'),  'due_date' => now()->subWeeks(2)->format('Y-m-d'),  'status' => 'closed']);
        $s4 = Milestone::create(['project_id' => $project->id, 'name' => 'Sprint 4 — Polish & Launch',   'description' => 'Notifications, exports, multi-language support, accessibility audit, and UAT.',              'start_date' => now()->subWeeks(2)->format('Y-m-d'),  'due_date' => now()->addWeeks(5)->format('Y-m-d'),  'status' => 'in_progress']);

        $pid = $project->id;
        $issues = [
            [1,  'Stakeholder kick-off and requirements workshop',         'Facilitate the kick-off session with all stakeholders to gather and prioritise requirements. Produce a signed-off requirements document and a delivery timeline.',                                                                                                'closed',      'high',   'task',           'fiona',  'fiona',  'ux',          $s1->id, 8,  10, null,                              now()->subWeeks(15)->toDateTimeString()],
            [2,  'Design system setup and shared component library',       'Establish the Tailwind-based design system with shared tokens for colour, spacing, and typography. Build a component library covering buttons, inputs, modals, and data tables.',                                                                                  'closed',      'normal', 'task',           'julia',  'fiona',  'ux',          $s1->id, 12, 13, null,                              now()->subWeeks(15)->toDateTimeString()],
            [3,  'Information architecture and wireframes',                'Define the portal navigation structure and produce low-fidelity wireframes for all primary screens: dashboard, contacts, reports, and settings. Get client sign-off before moving to implementation.',                                                             'closed',      'normal', 'task',           'julia',  'fiona',  'ux',          $s1->id, 10, 10, null,                              now()->subWeeks(14)->toDateTimeString()],
            [4,  'User authentication and role management',                'Build the full authentication flow using Laravel Sanctum. Implement three roles: super-admin, manager, and viewer. Role-based access control is enforced at the policy layer.',                                                                                    'closed',      'high',   'feature',        'ethan',  'fiona',  'backend',     $s2->id, 14, 15, null,                              now()->subWeeks(11)->toDateTimeString()],
            [5,  'Dashboard analytics widgets (chart.js)',                 'Build the dashboard page with Chart.js-powered widgets: revenue trend line chart, contact growth bar chart, recent activity feed, and key metric tiles. Data is fetched from the analytics API.',                                                                  'closed',      'normal', 'feature',        'hana',   'fiona',  'frontend',    $s2->id, 16, 18, null,                              now()->subWeeks(10)->toDateTimeString()],
            [6,  'Data table with server-side filtering and pagination',   'Implement the contacts list and reports list as server-side paginated data tables. Filter controls post query params to the API. Column sorting and row selection are supported.',                                                                                  'closed',      'normal', 'feature',        'hana',   'fiona',  'frontend',    $s2->id, 10, 11, null,                              now()->subWeeks(10)->toDateTimeString()],
            [7,  'Fix: date picker locale mismatch on Safari',             'The date picker component was displaying month names in English regardless of the browser locale on Safari due to missing Intl.DateTimeFormat options. Fixed by explicitly passing the locale string to the formatter.',                                            'closed',      'high',   'bug',            'hana',   'ivan',   'frontend',    $s2->id, 3,  4,  null,                              now()->subWeeks(9)->toDateTimeString()],
            [8,  'REST API integration with client CRM (Salesforce)',      'Integrate the portal with the client\'s Salesforce CRM using the REST API. Implement OAuth2 client-credentials flow, contact sync, and deal pipeline retrieval. Handle rate limits and retry logic.',                                                             'closed',      'high',   'feature',        'ethan',  'fiona',  'integration', $s3->id, 20, 23, null,                              now()->subWeeks(6)->toDateTimeString()],
            [9,  'Webhook receiver for CRM contact sync',                  'Build a POST /api/webhooks/crm endpoint that receives Salesforce push notifications for contact create/update/delete events. Verify the HMAC signature and queue the sync job for async processing.',                                                             'closed',      'normal', 'feature',        'ethan',  'fiona',  'integration', $s3->id, 8,  9,  null,                              now()->subWeeks(5)->toDateTimeString()],
            [10, 'PDF invoice generation endpoint',                        'Implement POST /api/reports/invoice which generates a PDF invoice from a given deal record using the Browsershot / Puppeteer stack. Return the file as a downloadable response.',                                                                                  'closed',      'normal', 'feature',        'ethan',  'fiona',  'backend',     $s3->id, 6,  7,  null,                              now()->subWeeks(5)->toDateTimeString()],
            [11, 'Fix: N+1 query on contact list endpoint',                'The contact list endpoint was issuing one query per contact to load the assigned manager. Added eager loading (`with(\'manager\')`) to the repository method and confirmed query count dropped from N+1 to 2.',                                                   'closed',      'high',   'bug',            'ethan',  'ivan',   'backend',     $s3->id, 2,  2,  null,                              now()->subWeeks(4)->toDateTimeString()],
            [12, 'Change request: add bulk-import via CSV',                'Client requested the ability to bulk-import contacts from a CSV file. Implement a file upload endpoint that parses the CSV, validates each row, and queues an import job. Return a summary of imported vs failed rows.',                                           'closed',      'normal', 'change-request', 'hana',   'fiona',  'backend',     $s3->id, 10, 12, null,                              now()->subWeeks(3)->toDateTimeString()],
            [13, 'Notification centre with email digests',                 'Build a notification centre panel that surfaces in-app alerts for contact assignments, deal stage changes, and import completions. Add a daily email digest that summarises the day\'s activity per user.',                                                        'in_progress', 'normal', 'feature',        'ethan',  'fiona',  'backend',     $s4->id, 14, null, now()->addWeeks(2)->format('Y-m-d'), now()->subWeeks(1)->toDateTimeString()],
            [14, 'Export reports to PDF and XLSX',                         'Add export actions to the reports list and individual report pages. PDF export uses the existing Browsershot stack. XLSX export uses the Spout library. Both are generated synchronously for small datasets and queued for large ones.',                             'in_progress', 'normal', 'feature',        'hana',   'fiona',  'frontend',    $s4->id, 10, null, now()->addWeeks(2)->format('Y-m-d'), now()->subWeeks(1)->toDateTimeString()],
            [15, 'Multi-language support (EN / MY)',                       'Internationalise the portal for English and Malay. Extract all UI strings into locale catalogs. Implement a language switcher in the user profile settings. Backend validation messages must also be localised.',                                                  'in_progress', 'high',   'feature',        'hana',   'fiona',  'frontend',    $s4->id, 16, null, now()->addWeeks(3)->format('Y-m-d'), now()->subWeeks(1)->toDateTimeString()],
            [16, 'Accessibility audit — WCAG 2.1 AA',                     'Perform a full WCAG 2.1 AA accessibility audit across all pages. Use axe-core for automated checks and manual keyboard-navigation testing. Produce an audit report and fix all A and AA violations before launch.',                                                'open',        'high',   'task',           'ivan',   'fiona',  'ux',          $s4->id, null, null, now()->addWeeks(3)->format('Y-m-d'), now()->subDays(6)->toDateTimeString()],
            [17, 'Performance profiling and Lighthouse audit',             'Run Lighthouse audits on all primary pages and target a score of 90+ for Performance and Best Practices. Profile the API with Laravel Telescope to identify slow queries. Document findings and fixes.',                                                           'open',        'normal', 'task',           'ivan',   'ethan',  'frontend',    $s4->id, null, null, now()->addWeeks(4)->format('Y-m-d'), now()->subDays(5)->toDateTimeString()],
            [18, 'Client sign-off UAT session preparation',               'Prepare the UAT environment with demo data, a test script covering all primary user journeys, and a sign-off checklist. Schedule and facilitate the UAT session with the client\'s project sponsor.',                                                               'open',        'high',   'task',           'fiona',  'fiona',  'ux',          $s4->id, null, null, now()->addWeeks(4)->format('Y-m-d'), now()->subDays(4)->toDateTimeString()],
            [19, 'Fix: chart tooltip overflow on mobile viewport',         'Revenue trend chart tooltips overflow the right edge of the viewport on screens narrower than 420px. Fix by adjusting the Chart.js tooltip positioning callback to clamp the x position within the canvas bounds.',                                                'open',        'normal', 'bug',            null,     'ivan',   'frontend',    $s4->id, null, null, now()->addWeeks(2)->format('Y-m-d'), now()->subDays(3)->toDateTimeString()],
            [20, 'Security review and penetration test sign-off',         'Conduct a pre-launch security review covering OWASP Top 10 risks. Engage the security team for a penetration test of the authentication and CRM integration endpoints. Resolve all high and critical findings.',                                                    'open',        'high',   'task',           null,     'ethan',  'backend',     $s4->id, null, null, now()->addWeeks(5)->format('Y-m-d'), now()->subDays(2)->toDateTimeString()],
        ];

        $ci = $this->seedIssues($pid, $u, $issues);

        Comment::create(['issue_id' => $ci[4]->id,  'user_id' => $u['fiona']->id,  'created_at' => now()->subWeeks(10)->toDateTimeString(),              'content' => 'Sharing the auth spec: three roles — super-admin (full access), manager (read/write on contacts and deals), viewer (read-only). Role is set per-user in the admin panel. All permission checks go through Laravel Policies, not middleware.']);
        Comment::create(['issue_id' => $ci[4]->id,  'user_id' => $u['ethan']->id,  'created_at' => now()->subWeeks(10)->addHours(3)->toDateTimeString(), 'content' => 'Implemented using Sanctum cookie sessions — consistent with the SyncMind backend approach. Role is stored on the users table. Policies check `$user->role` directly.']);
        Comment::create(['issue_id' => $ci[4]->id,  'user_id' => $u['ivan']->id,   'created_at' => now()->subWeeks(10)->addHours(5)->toDateTimeString(), 'content' => 'Is 2FA in scope for this sprint? The original brief mentioned it but I don\'t see it in the spec.']);

        Comment::create(['issue_id' => $ci[8]->id,  'user_id' => $u['ethan']->id,  'created_at' => now()->subWeeks(5)->toDateTimeString(),              'content' => 'CRM endpoint list confirmed with client: contacts (GET/POST/PATCH), deals (GET/PATCH), pipeline stages (GET). All under /services/data/v57.0/. OAuth2 client credentials flow — client ID and secret provided by client IT team.']);
        Comment::create(['issue_id' => $ci[8]->id,  'user_id' => $u['fiona']->id,  'created_at' => now()->subWeeks(5)->addHours(2)->toDateTimeString(), 'content' => 'Do we pass the OAuth token in the Authorization header or as a query param? The Salesforce docs show both options.']);
        Comment::create(['issue_id' => $ci[8]->id,  'user_id' => $u['ethan']->id,  'created_at' => now()->subWeeks(5)->addHours(4)->toDateTimeString(), 'content' => 'Authorization: Bearer header — query param is deprecated in OAuth 2.0. Using Guzzle middleware to inject it automatically on every CRM request.']);
        Comment::create(['issue_id' => $ci[8]->id,  'user_id' => $u['fiona']->id,  'created_at' => now()->subWeeks(5)->addHours(6)->toDateTimeString(), 'content' => 'Client IT confirmed the credentials are in place and the sandbox is ready. Go ahead.']);

        Comment::create(['issue_id' => $ci[11]->id, 'user_id' => $u['ivan']->id,   'created_at' => now()->subWeeks(3)->toDateTimeString(),              'content' => 'Contacts list is taking 4–6 seconds to load with 500 contacts in staging. Running Laravel Telescope — seeing 503 queries for a single page load. Classic N+1.']);
        Comment::create(['issue_id' => $ci[11]->id, 'user_id' => $u['ethan']->id,  'created_at' => now()->subWeeks(3)->addHours(2)->toDateTimeString(), 'content' => 'Found it — the ContactRepository::index() method was missing the with(\'assignedManager\') eager load. Adding it now.']);
        Comment::create(['issue_id' => $ci[11]->id, 'user_id' => $u['ethan']->id,  'created_at' => now()->subWeeks(3)->addHours(4)->toDateTimeString(), 'content' => 'Fix deployed to staging. Query count is now 2 per page load. Load time is under 200ms for 500 contacts.']);

        Comment::create(['issue_id' => $ci[16]->id, 'user_id' => $u['ivan']->id,   'created_at' => now()->subDays(5)->toDateTimeString(),               'content' => 'Initial audit complete. Found 4 issues: (1) All form inputs missing associated labels — affects screen readers. (2) Colour contrast ratio on secondary buttons is 3.8:1 — below 4.5:1 AA minimum. (3) Modal close button has no accessible name. (4) Data table rows not keyboard-navigable.']);
        Comment::create(['issue_id' => $ci[16]->id, 'user_id' => $u['julia']->id,  'created_at' => now()->subDays(4)->toDateTimeString(),               'content' => 'For the contrast issue — are we targeting 4.5:1 for all text or only body text? The design tokens use a slightly muted secondary colour intentionally.']);
        Comment::create(['issue_id' => $ci[16]->id, 'user_id' => $u['ivan']->id,   'created_at' => now()->subDays(3)->toDateTimeString(),               'content' => 'WCAG 2.1 Level AA requires 4.5:1 for normal text and 3:1 for large text (18pt+ or 14pt bold+). The secondary button label is 14px normal weight so it needs 4.5:1. Sharing the WCAG reference: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html']);

        Comment::create(['issue_id' => $ci[18]->id, 'user_id' => $u['fiona']->id,  'created_at' => now()->subDays(3)->toDateTimeString(),               'content' => 'UAT checklist draft: (1) Login with super-admin credentials. (2) Import 10 contacts via CSV. (3) View dashboard and verify widget data. (4) Create a deal and assign to manager role. (5) Export contacts list to XLSX. (6) Verify email notification is received. Please review and add any missing scenarios.']);
        Comment::create(['issue_id' => $ci[18]->id, 'user_id' => $u['ivan']->id,   'created_at' => now()->subDays(2)->toDateTimeString(),               'content' => 'Adding two more: (7) Attempt to access an admin-only page as viewer role — verify 403 is shown. (8) Test the date picker on Safari mobile — verify locale displays correctly after the recent fix.']);

        WikiPage::create(['project_id' => $project->id, 'title' => 'Project Brief',           'author_id' => $u['fiona']->id,  'last_editor_id' => $u['fiona']->id,  'content' => "# Project Brief\n\n## Overview\n\nThe Nova Client Portal is a web-based platform commissioned by Nova Ventures Sdn Bhd to centralise their client relationship management, deal pipeline tracking, and reporting workflows. The portal replaces a collection of disparate spreadsheets and a legacy CRM interface.\n\n## Key Stakeholders\n\n| Name | Role | Organisation |\n|---|---|---|\n| David Ng | Project Sponsor | Nova Ventures |\n| Sarah Lim | Head of Sales | Nova Ventures |\n| Raj Patel | IT Manager | Nova Ventures |\n| Fiona Fletcher | Project Manager | SyncMind Team |\n\n## Success Criteria\n\n1. All contacts and deal data successfully migrated from legacy CRM.\n2. Dashboard loads in under 2 seconds with up to 1,000 contacts.\n3. WCAG 2.1 AA accessibility compliance confirmed by audit.\n4. Client sign-off achieved in UAT with no critical defects outstanding.\n\n## Delivery Timeline\n\n| Milestone | Target Date |\n|---|---|\n| Discovery & Setup complete | 12 weeks ago |\n| Core Features delivered | 7 weeks ago |\n| Integrations complete | 2 weeks ago |\n| Launch | 5 weeks from now |"]);
        WikiPage::create(['project_id' => $project->id, 'title' => 'CRM Integration Notes',   'author_id' => $u['ethan']->id,  'last_editor_id' => $u['ethan']->id,  'content' => "# CRM Integration Notes\n\n## Salesforce API\n\nWe integrate with Salesforce REST API v57.0. Base URL: `https://[instance].salesforce.com/services/data/v57.0/`.\n\n## Authentication\n\nOAuth2 client credentials flow (server-to-server). Credentials are stored in environment variables:\n- `SALESFORCE_CLIENT_ID`\n- `SALESFORCE_CLIENT_SECRET`\n- `SALESFORCE_INSTANCE_URL`\n\nThe access token is refreshed automatically using Guzzle middleware when a 401 is received.\n\n## Endpoints Used\n\n| Endpoint | Method | Purpose |\n|---|---|---|\n| `/sobjects/Contact` | GET, POST, PATCH | Contact CRUD |\n| `/sobjects/Opportunity` | GET, PATCH | Deal pipeline |\n| `/sobjects/OpportunityStage` | GET | Pipeline stage list |\n\n## Webhook Receiver\n\n`POST /api/webhooks/crm` receives Salesforce Outbound Messages. HMAC-SHA256 signature verified using `SALESFORCE_WEBHOOK_SECRET`. Events are queued as `CrmContactSyncJob` for async processing.\n\n## Rate Limits\n\nSalesforce enforces 100,000 API calls per 24-hour period per org. Our integration uses a local cache (Redis, TTL 5 min) to avoid re-fetching unchanged records."]);
        WikiPage::create(['project_id' => $project->id, 'title' => 'UX Design Decisions',     'author_id' => $u['julia']->id,  'last_editor_id' => $u['julia']->id,  'content' => "# UX Design Decisions\n\n## Component Library\n\nAll components are built on the internal Tailwind design system. We use Radix UI primitives (Dialog, DropdownMenu, Select) for accessible interactive components and wrap them with Nova-specific styling.\n\n## Colour Palette\n\n| Token | Value | Usage |\n|---|---|---|\n| `--color-primary` | `#1A56DB` | Primary actions, links |\n| `--color-secondary` | `#6B7280` | Secondary text, borders |\n| `--color-success` | `#0E9F6E` | Positive status indicators |\n| `--color-danger` | `#E02424` | Errors, destructive actions |\n| `--color-surface` | `#F9FAFB` | Page backgrounds |\n\nAll colour combinations meet WCAG 2.1 AA contrast ratio requirements (4.5:1 for normal text).\n\n## Typography Scale\n\n- Base: 16px / 1.5 line-height (Inter)\n- Headings: 24px (h1), 20px (h2), 16px (h3) — all semibold\n- Labels: 14px / 1.25 line-height\n\n## Responsive Breakpoints\n\n| Breakpoint | Viewport | Layout |\n|---|---|---|\n| `sm` | ≥640px | Single column, stacked nav |\n| `md` | ≥768px | Two-column form layouts |\n| `lg` | ≥1024px | Full sidebar + main content |\n| `xl` | ≥1280px | Wide data tables, expanded widgets |"]);
        WikiPage::create(['project_id' => $project->id, 'title' => 'QA Test Plan',             'author_id' => $u['ivan']->id,   'last_editor_id' => $u['ivan']->id,   'content' => "# QA Test Plan\n\n## Test Scope\n\nFunctional, regression, and accessibility testing for all features in scope for the Nova Client Portal launch.\n\n## Authentication Test Cases\n\n| ID | Scenario | Expected Result |\n|---|---|---|\n| AUTH-1 | Login with valid credentials | Redirect to dashboard, session cookie set |\n| AUTH-2 | Login with invalid password | 422 response, error message displayed |\n| AUTH-3 | Access protected page when unauthenticated | Redirect to login page |\n| AUTH-4 | Access admin page as viewer role | 403 Forbidden response |\n\n## Dashboard Test Cases\n\n| ID | Scenario | Expected Result |\n|---|---|---|\n| DASH-1 | Load dashboard with 500 contacts | Page loads in <2s, all widgets render |\n| DASH-2 | Revenue chart with no data | Empty state shown, no JS errors |\n\n## Export Test Cases\n\n| ID | Scenario | Expected Result |\n|---|---|---|\n| EXP-1 | Export 100 contacts to XLSX | File downloaded, all rows present |\n| EXP-2 | Export report to PDF | PDF generated with correct formatting |\n| EXP-3 | Export 10,000 rows | Job queued, download link emailed |\n\n## Regression Checklist\n\n- [ ] Date picker shows correct locale on Safari\n- [ ] Contact list loads in <200ms (N+1 fix verified)\n- [ ] Chart tooltips do not overflow on 375px viewport\n- [ ] All form inputs have associated labels (accessibility)"]);
    }

    // -------------------------------------------------------------------------
    // ORION — Orion Data Platform
    // -------------------------------------------------------------------------

    private function seedOrion(array $u): void
    {
        $project = Project::create([
            'name'        => 'Orion Data Platform',
            'key'         => 'ORION',
            'icon'        => 'database',
            'issue_types' => ['epic', 'task', 'bug', 'spike'],
            'categories'  => ['data-pipeline', 'infrastructure', 'analytics', 'governance'],
            'versions'    => ['Phase 1', 'Phase 2'],
            'creator_id'  => $u['luna']->id,
        ]);

        ProjectIssueCounter::create(['project_id' => $project->id, 'last_number' => 20]);

        $this->addMembers($project, $u, [
            ['luna',   'admin',  'Data Engineer'],
            ['kevin',  'admin',  'DevOps Engineer'],
            ['ethan',  'normal', 'Engineering Lead'],
            ['ivan',   'normal', 'QA Engineer'],
            ['george', 'normal', 'Backend Developer'],
        ]);

        $p1a = Milestone::create(['project_id' => $project->id, 'name' => 'Phase 1A — Ingestion Layer',          'description' => 'Kafka cluster, producer service, schema registry, and dead-letter queue handling.',                     'start_date' => now()->subWeeks(18)->format('Y-m-d'), 'due_date' => now()->subWeeks(12)->format('Y-m-d'), 'status' => 'closed']);
        $p1b = Milestone::create(['project_id' => $project->id, 'name' => 'Phase 1B — Transformation & Storage', 'description' => 'dbt pipelines, ClickHouse OLAP cluster, dimensional data model, and CI/CD for dbt.',                'start_date' => now()->subWeeks(12)->format('Y-m-d'), 'due_date' => now()->subWeeks(5)->format('Y-m-d'),  'status' => 'closed']);
        $p2a = Milestone::create(['project_id' => $project->id, 'name' => 'Phase 2A — Analytics & Reporting',    'description' => 'Metabase dashboards, velocity/cycle-time reports, anomaly detection, and analytics API.',           'start_date' => now()->subWeeks(5)->format('Y-m-d'),  'due_date' => now()->addWeeks(2)->format('Y-m-d'),  'status' => 'in_progress']);
        $p2b = Milestone::create(['project_id' => $project->id, 'name' => 'Phase 2B — Governance & Observability','description' => 'Data catalogue, row-level access policies, OpenTelemetry observability, and SLA alerting.',        'start_date' => now()->addWeeks(1)->format('Y-m-d'),  'due_date' => now()->addWeeks(8)->format('Y-m-d'),  'status' => 'open']);

        $pid = $project->id;
        $issues = [
            [1,  'Spike: evaluate Apache Kafka vs AWS Kinesis for event ingestion',    'Evaluate Kafka (self-hosted on Docker Compose) vs AWS Kinesis (managed) for our event ingestion layer. Assess cost, operational overhead, throughput, and replay capabilities. Produce a decision matrix and recommendation.',                                                                                     'closed',      'high',   'spike', 'luna',   'luna',   'data-pipeline',  $p1a->id, 16, 18, null,                              now()->subWeeks(17)->toDateTimeString()],
            [2,  'Bootstrap Kafka cluster on Docker Compose',                          'Set up a single-broker Kafka cluster using Bitnami images in Docker Compose. Include Zookeeper, configure topic auto-creation, and verify producer/consumer connectivity from the application container.',                                                                                                         'closed',      'high',   'task',  'kevin',  'luna',   'infrastructure', $p1a->id, 8,  9,  null,                              now()->subWeeks(16)->toDateTimeString()],
            [3,  'Implement producer service for application event stream',            'Build a Laravel service that publishes domain events (issue created, status changed, comment added) to the `syncmind.events` Kafka topic. Use the Enqueue library. Events are serialised as JSON with a schema version field.',                                                                                   'closed',      'high',   'task',  'george', 'luna',   'data-pipeline',  $p1a->id, 10, 11, null,                              now()->subWeeks(15)->toDateTimeString()],
            [4,  'Schema registry setup with Avro serialisation',                      'Deploy the Confluent Schema Registry alongside Kafka. Migrate event serialisation from JSON to Avro for schema enforcement and forward/backward compatibility. Register initial schemas for all event types.',                                                                                                      'closed',      'normal', 'task',  'luna',   'luna',   'data-pipeline',  $p1a->id, 6,  7,  null,                              now()->subWeeks(14)->toDateTimeString()],
            [5,  'Dead-letter queue handling for malformed events',                    'Create a `syncmind.events.dlq` topic and configure the consumer to route messages that fail schema validation or processing to the DLQ. Add a monitoring alert when DLQ depth exceeds 100 messages.',                                                                                                              'closed',      'normal', 'task',  'george', 'luna',   'data-pipeline',  $p1a->id, 4,  5,  null,                              now()->subWeeks(13)->toDateTimeString()],
            [6,  'Design dimensional data model (star schema)',                        'Design the star schema for the analytics warehouse: fact_events (one row per domain event), fact_issues (issue lifecycle snapshots), dim_users, dim_projects, dim_dates. Produce an ERD and get sign-off before implementation.',                                                                                  'closed',      'high',   'task',  'luna',   'luna',   'analytics',      $p1b->id, 12, 13, null,                              now()->subWeeks(11)->toDateTimeString()],
            [7,  'Implement dbt transformation pipeline — user activity',              'Build the dbt models for the user activity mart: stg_events → int_user_sessions → mart_user_activity. Models should be incremental using event_timestamp as the watermark. Include dbt tests for not-null, unique, and referential integrity.',                                                                   'closed',      'high',   'task',  'luna',   'luna',   'data-pipeline',  $p1b->id, 16, 18, null,                              now()->subWeeks(10)->toDateTimeString()],
            [8,  'Implement dbt transformation pipeline — issue metrics',              'Build the dbt models for the issue metrics mart: stg_issues → int_issue_lifecycle → mart_issue_velocity. Track cycle time (open → closed), lead time (created → closed), and throughput per project per week.',                                                                                                   'closed',      'normal', 'task',  'luna',   'luna',   'data-pipeline',  $p1b->id, 14, 15, null,                              now()->subWeeks(9)->toDateTimeString()],
            [9,  'Configure ClickHouse OLAP cluster',                                 'Deploy a single-node ClickHouse 23.x instance in Docker Compose. Create the analytics database, define MergeTree tables matching the star schema, and configure the dbt-clickhouse adapter. Verify bulk insert throughput.',                                                                                       'closed',      'normal', 'task',  'kevin',  'luna',   'infrastructure', $p1b->id, 8,  10, null,                              now()->subWeeks(9)->toDateTimeString()],
            [10, 'Fix: dbt model failing on null foreign keys',                        'The int_issue_lifecycle model was failing with a NOT NULL constraint violation because some issues in the source data have a null milestone_id. Added a COALESCE(-1) sentinel and a corresponding dim_milestones placeholder row for unassigned issues.',                                                           'closed',      'high',   'bug',   'luna',   'ivan',   'data-pipeline',  $p1b->id, 3,  3,  null,                              now()->subWeeks(8)->toDateTimeString()],
            [11, 'CI/CD pipeline for dbt — lint, test, deploy',                       'Add a GitHub Actions workflow that runs `dbt compile`, `dbt test`, and `dbt run` on every push to the dbt models directory. Lint with sqlfluff. Deploy to the staging ClickHouse instance on merge to main.',                                                                                                    'closed',      'normal', 'task',  'kevin',  'luna',   'infrastructure', $p1b->id, 6,  7,  null,                              now()->subWeeks(7)->toDateTimeString()],
            [12, 'Build project activity metrics dashboard (Metabase)',                'Create a Metabase dashboard with three sections: (1) project health summary — open/in-progress/closed issue counts; (2) team velocity — issues closed per week per member; (3) milestone burn-down. Connect to ClickHouse via the native driver.',                                                                 'in_progress', 'high',   'task',  'luna',   'luna',   'analytics',      $p2a->id, 20, null, now()->addWeeks(2)->format('Y-m-d'), now()->subWeeks(4)->toDateTimeString()],
            [13, 'Implement issue velocity and cycle-time report',                     'Build the mart_issue_velocity model and expose a GET /api/analytics/velocity endpoint that returns cycle time percentiles (p50, p75, p95) and throughput by project and date range. Consumed by the Metabase dashboard.',                                                                                          'in_progress', 'normal', 'task',  'luna',   'luna',   'analytics',      $p2a->id, 12, null, now()->addWeeks(2)->format('Y-m-d'), now()->subWeeks(3)->toDateTimeString()],
            [14, 'Real-time event count anomaly detection',                            'Implement a streaming anomaly detector on the syncmind.events topic using a sliding-window z-score model. Alert via Slack webhook when the event rate in any 5-minute window deviates by more than 3 standard deviations from the 7-day baseline.',                                                                 'in_progress', 'normal', 'spike', 'george', 'luna',   'analytics',      $p2a->id, 16, null, now()->addWeeks(3)->format('Y-m-d'), now()->subWeeks(2)->toDateTimeString()],
            [15, 'Fix: ClickHouse query timeout on large date ranges',                 'Queries spanning more than 90 days on the fact_events table are timing out at the default 10s ClickHouse query timeout. Investigating whether a materialised view or a secondary index on event_date would resolve this.',                                                                                          'open',        'high',   'bug',   'kevin',  'ivan',   'infrastructure', $p2a->id, null, null, now()->addWeeks(1)->format('Y-m-d'), now()->subWeeks(1)->toDateTimeString()],
            [16, 'Expose /api/analytics read endpoint for frontend',                  'Build a GET /api/analytics endpoint that accepts project_id and date_range query params and returns pre-aggregated metrics from ClickHouse. Used by the future dashboard cockpit integration.',                                                                                                                      'open',        'normal', 'task',  'george', 'luna',   'analytics',      $p2a->id, null, null, now()->addWeeks(2)->format('Y-m-d'), now()->subWeeks(1)->toDateTimeString()],
            [17, 'Data catalogue — field-level lineage documentation',                'Implement a data catalogue that maps each ClickHouse column back to its source field and dbt model. Expose a UI in Metabase (or a lightweight custom page) that lets analysts browse column definitions, data types, and lineage.',                                                                                  'open',        'high',   'epic',  'luna',   'luna',   'governance',     $p2b->id, null, null, now()->addWeeks(6)->format('Y-m-d'), now()->subDays(3)->toDateTimeString()],
            [18, 'Implement row-level data access policies',                          'Define and enforce row-level security on ClickHouse tables so that users can only query data belonging to projects they are members of. Implement using ClickHouse row policies and map to the Laravel project membership model.',                                                                                    'open',        'high',   'task',  'kevin',  'luna',   'governance',     $p2b->id, null, null, now()->addWeeks(6)->format('Y-m-d'), now()->subDays(2)->toDateTimeString()],
            [19, 'Set up OpenTelemetry pipeline observability',                       'Instrument the Kafka consumer, dbt runner, and ClickHouse insert path with OpenTelemetry spans. Export traces to a local Jaeger instance. Add a latency dashboard showing end-to-end event processing time from producer to warehouse.',                                                                            'open',        'normal', 'task',  'kevin',  'luna',   'infrastructure', $p2b->id, null, null, now()->addWeeks(7)->format('Y-m-d'), now()->subDays(1)->toDateTimeString()],
            [20, 'SLA alerting for stale pipeline runs',                              'Define SLAs for each dbt model run: staging models must complete within 5 minutes, mart models within 15 minutes of the Kafka offset commit. Implement a monitor that pages on-call via PagerDuty if any run exceeds its SLA.',                                                                                     'open',        'normal', 'task',  null,     'luna',   'governance',     $p2b->id, null, null, now()->addWeeks(8)->format('Y-m-d'), now()->toDateTimeString()],
        ];

        $ci = $this->seedIssues($pid, $u, $issues);

        Comment::create(['issue_id' => $ci[1]->id,  'user_id' => $u['luna']->id,   'created_at' => now()->subWeeks(16)->toDateTimeString(),              'content' => 'Evaluation matrix complete. Comparing on: cost (self-hosted vs managed), operational complexity, throughput (target 50k events/sec peak), replay capability, and ecosystem tooling. Will share the full doc shortly.']);
        Comment::create(['issue_id' => $ci[1]->id,  'user_id' => $u['kevin']->id,  'created_at' => now()->subWeeks(16)->addHours(3)->toDateTimeString(), 'content' => 'What\'s the rough cost difference? Kinesis would save us operational overhead but I want to make sure we\'re not paying 5x for convenience at this scale.']);
        Comment::create(['issue_id' => $ci[1]->id,  'user_id' => $u['luna']->id,   'created_at' => now()->subWeeks(16)->addHours(5)->toDateTimeString(), 'content' => 'At our projected 10M events/day, Kinesis costs ~$200/month vs near-zero for self-hosted Kafka on existing Docker infra. The operational overhead for a single-broker setup is manageable. Leaning toward Kafka.']);
        Comment::create(['issue_id' => $ci[1]->id,  'user_id' => $u['ethan']->id,  'created_at' => now()->subWeeks(16)->addHours(7)->toDateTimeString(), 'content' => 'Agreed — at this scale Kafka is the right call. The replay capability is also important for our backfill use cases. Go ahead with Kafka.']);

        Comment::create(['issue_id' => $ci[7]->id,  'user_id' => $u['luna']->id,   'created_at' => now()->subWeeks(9)->toDateTimeString(),              'content' => 'dbt model graph for user activity: stg_events (incremental, event_timestamp watermark) → int_user_sessions (session stitching with 30-min idle timeout) → mart_user_activity (daily aggregates per user per project). Graph looks clean, all ref() dependencies resolved correctly.']);
        Comment::create(['issue_id' => $ci[7]->id,  'user_id' => $u['kevin']->id,  'created_at' => now()->subWeeks(9)->addHours(4)->toDateTimeString(), 'content' => 'For the ClickHouse target table — what\'s the partition strategy for fact_events? Partitioning by event_date (month) seems right but want to confirm before the initial load.']);
        Comment::create(['issue_id' => $ci[7]->id,  'user_id' => $u['luna']->id,   'created_at' => now()->subWeeks(9)->addHours(7)->toDateTimeString(), 'content' => 'Updated the incremental config to use `partition_by: toYYYYMM(event_timestamp)`. Monthly partitions with ORDER BY (project_id, user_id, event_timestamp) — good for our query patterns. Tested with 5M rows, full run is 45 seconds.']);

        Comment::create(['issue_id' => $ci[10]->id, 'user_id' => $u['ivan']->id,   'created_at' => now()->subWeeks(7)->toDateTimeString(),              'content' => 'dbt test run is failing in staging: `not_null_int_issue_lifecycle_milestone_id` test is throwing 127 failures. Milestone_id is null for issues that were created before the milestone feature was added.']);
        Comment::create(['issue_id' => $ci[10]->id, 'user_id' => $u['luna']->id,   'created_at' => now()->subWeeks(7)->addHours(2)->toDateTimeString(), 'content' => 'Found the source of nulls — issues with `created_at` before the milestone_id migration date have no milestone assigned. Adding a COALESCE(milestone_id, -1) in the staging model and a sentinel row in dim_milestones for milestone_id = -1 (label: "Unassigned").']);
        Comment::create(['issue_id' => $ci[10]->id, 'user_id' => $u['luna']->id,   'created_at' => now()->subWeeks(7)->addHours(5)->toDateTimeString(), 'content' => 'Hot-fix merged and deployed. All 127 previously failing rows now route to the Unassigned milestone sentinel. All dbt tests passing in staging.']);

        Comment::create(['issue_id' => $ci[14]->id, 'user_id' => $u['george']->id, 'created_at' => now()->subWeeks(1)->toDateTimeString(),              'content' => 'Proposing a z-score approach: compute a rolling mean and standard deviation of event count per 5-minute window over the last 7 days. Alert when abs(z-score) > 3. Threshold of 3 gives us a 0.3% false positive rate.']);
        Comment::create(['issue_id' => $ci[14]->id, 'user_id' => $u['luna']->id,   'created_at' => now()->subWeeks(1)->addHours(3)->toDateTimeString(), 'content' => 'The z-score approach looks solid. What\'s the sliding window size — are you recomputing on every event or batching per minute?']);
        Comment::create(['issue_id' => $ci[14]->id, 'user_id' => $u['george']->id, 'created_at' => now()->subWeeks(1)->addHours(6)->toDateTimeString(), 'content' => 'Batching per minute to reduce computation. Each minute we emit the window count to a rolling buffer (deque of 5 values = 5-minute window), compute z-score against the 7-day baseline, and trigger the alert if the threshold is exceeded. Initial test results: 0 false positives on last week\'s data.']);

        Comment::create(['issue_id' => $ci[15]->id, 'user_id' => $u['kevin']->id,  'created_at' => now()->subDays(4)->toDateTimeString(),               'content' => 'Slow-query log excerpt (query timed out at 10.2s): `SELECT project_id, count() FROM fact_events WHERE event_date BETWEEN \'2025-01-01\' AND \'2025-12-31\' GROUP BY project_id`. Full table scan — no partition pruning happening.']);
        Comment::create(['issue_id' => $ci[15]->id, 'user_id' => $u['luna']->id,   'created_at' => now()->subDays(3)->toDateTimeString(),               'content' => 'The query is missing the toYYYYMM(event_date) partition key expression, so ClickHouse can\'t prune partitions. Short-term workaround: create a materialised view that pre-aggregates counts by project and month. Long-term: update all query patterns to include the partition key.']);

        WikiPage::create(['project_id' => $project->id, 'title' => 'Platform Architecture',     'author_id' => $u['luna']->id,  'last_editor_id' => $u['luna']->id,  'content' => "# Platform Architecture\n\n## Pipeline Overview\n\n```\nApplication Events\n      │\n      ▼\n  Kafka Broker  ─────────────────────────────────────────────────────┐\n  (syncmind.events)                                                   │\n      │                                                               │\n      ▼                                                               ▼\n Kafka Consumer                                               Dead-Letter Queue\n (Laravel)                                                    (syncmind.events.dlq)\n      │\n      ▼\n PostgreSQL (raw events table)\n      │\n      ▼\n   dbt Run\n  ┌───┴────────────────────────────────┐\n  │                                    │\n  ▼                                    ▼\n mart_user_activity            mart_issue_velocity\n  │                                    │\n  └───────────────┬────────────────────┘\n                  ▼\n           ClickHouse (OLAP)\n                  │\n                  ▼\n              Metabase\n```\n\n## Component Responsibilities\n\n| Component | Technology | Role |\n|---|---|---|\n| Event Producer | Laravel Service | Publishes domain events to Kafka |\n| Kafka Broker | Bitnami Kafka 3.x | Event streaming backbone |\n| Schema Registry | Confluent Schema Registry | Avro schema management |\n| Event Consumer | Laravel Queue Worker | Persists events to PostgreSQL |\n| Transformation | dbt Core | Staged → mart transformations |\n| OLAP Warehouse | ClickHouse 23.x | Fast analytical queries |\n| BI Layer | Metabase | Dashboards and reports |"]);
        WikiPage::create(['project_id' => $project->id, 'title' => 'dbt Model Conventions',     'author_id' => $u['luna']->id,  'last_editor_id' => $u['luna']->id,  'content' => "# dbt Model Conventions\n\n## Layer Structure\n\n| Layer | Prefix | Description |\n|---|---|---|\n| Staging | `stg_` | Direct mapping from source tables, minimal transformation |\n| Intermediate | `int_` | Business logic, joins, session stitching |\n| Mart | `mart_` | Final analytics-ready tables, used by BI tools |\n\n## Naming Rules\n\n- All models use `snake_case`.\n- Staging models: `stg_{source}_{entity}` (e.g., `stg_app_issues`)\n- Intermediate: `int_{domain}_{transformation}` (e.g., `int_issue_lifecycle`)\n- Mart: `mart_{subject_area}` (e.g., `mart_issue_velocity`)\n\n## Required Tests (all models)\n\n- `not_null` on all primary key columns\n- `unique` on all primary key columns\n- `relationships` for all foreign key columns\n\n## Incremental Strategy\n\nAll staging models use `incremental` materialisation with `event_timestamp` as the watermark:\n\n```sql\n{{ config(materialized='incremental', unique_key='event_id') }}\n\nSELECT ...\nFROM {{ source('app', 'events') }}\n{% if is_incremental() %}\nWHERE event_timestamp > (SELECT max(event_timestamp) FROM {{ this }})\n{% endif %}\n```"]);
        WikiPage::create(['project_id' => $project->id, 'title' => 'ClickHouse Schema Reference', 'author_id' => $u['kevin']->id, 'last_editor_id' => $u['kevin']->id, 'content' => "# ClickHouse Schema Reference\n\n## fact_events\n\n| Column | Type | Description |\n|---|---|---|\n| event_id | UUID | Primary key |\n| event_type | LowCardinality(String) | e.g., issue.created, comment.added |\n| project_id | UInt32 | FK → dim_projects |\n| user_id | UInt32 | FK → dim_users |\n| entity_id | UInt32 | ID of the affected entity |\n| event_timestamp | DateTime | Event time (UTC) |\n| event_date | Date | Partition key (MATERIALIZED toDate(event_timestamp)) |\n\n**Engine:** `MergeTree() PARTITION BY toYYYYMM(event_date) ORDER BY (project_id, user_id, event_timestamp)`\n\n## fact_issues\n\n| Column | Type | Description |\n|---|---|---|\n| snapshot_id | UUID | Primary key |\n| issue_id | UInt32 | FK → source issues |\n| project_id | UInt32 | FK → dim_projects |\n| assignee_id | UInt32 | FK → dim_users |\n| status | LowCardinality(String) | Snapshot status value |\n| snapshotted_at | DateTime | When this row was recorded |\n\n## dim_users\n\n| Column | Type | Description |\n|---|---|---|\n| user_id | UInt32 | Primary key |\n| name | String | Display name |\n| position | String | Job title |\n| is_active | UInt8 | 1 = active |\n\n## dim_projects\n\n| Column | Type | Description |\n|---|---|---|\n| project_id | UInt32 | Primary key |\n| name | String | Project name |\n| key | FixedString(8) | Short key (e.g., SYNC) |"]);
        WikiPage::create(['project_id' => $project->id, 'title' => 'On-Call Runbook',           'author_id' => $u['kevin']->id, 'last_editor_id' => $u['kevin']->id, 'content' => "# On-Call Runbook\n\n## Alert Descriptions\n\n| Alert | Threshold | Severity |\n|---|---|---|\n| `pipeline.dlq.depth` | DLQ > 100 messages | Warning |\n| `pipeline.dbt.sla` | dbt model run > SLA (5 min staging, 15 min mart) | Critical |\n| `clickhouse.query.timeout` | Query timeout rate > 1% in 5 min | Warning |\n| `kafka.consumer.lag` | Consumer lag > 10,000 messages | Critical |\n| `anomaly.event_rate` | Z-score > 3 on 5-min window | Warning |\n\n## Escalation Matrix\n\n| Severity | First Responder | Escalation (30 min) |\n|---|---|---|\n| Critical | On-call engineer (PagerDuty) | Kevin Kim / Luna Lee |\n| Warning | Slack #data-alerts | On-call engineer |\n\n## Common Failure Modes\n\n### DLQ Depth Alert\n1. Check consumer logs: `docker compose logs -f kafka-consumer`\n2. Inspect DLQ messages: `kafka-console-consumer --topic syncmind.events.dlq --from-beginning`\n3. Common cause: schema version mismatch. Check producer schema registry registration.\n\n### dbt SLA Breach\n1. Check dbt run logs in CI/CD.\n2. Run `dbt test` manually to find failing models.\n3. Common cause: upstream source data delayed. Check Kafka consumer lag first.\n\n### ClickHouse Query Timeout\n1. Check slow query log: `SELECT * FROM system.query_log WHERE query_duration_ms > 5000 ORDER BY event_time DESC LIMIT 10`\n2. Verify queries include partition key expression `toYYYYMM(event_date)` for full pruning.\n3. Short-term: use the pre-aggregated materialised views for heavy date-range queries."]);
    }

    // -------------------------------------------------------------------------
    // Issue creation + history helper
    // -------------------------------------------------------------------------

    private function seedIssues(int $projectId, array $u, array $rows): array
    {
        $created = [];

        foreach ($rows as $row) {
            [$keyNum, $summary, $description, $status, $priority, $issueType,
             $assigneeKey, $creatorKey, $category, $milestoneId,
             $estHours, $actHours, $dueDate, $createdAt] = $row;

            $data = [
                'project_id'       => $projectId,
                'key_number'       => $keyNum,
                'summary'          => $summary,
                'description'      => $description,
                'status'           => $status,
                'priority'         => $priority,
                'issue_type'       => $issueType,
                'assignee_id'      => $assigneeKey ? $u[$assigneeKey]->id : null,
                'creator_id'       => $u[$creatorKey]->id,
                'category'         => $category,
                'milestone_id'     => $milestoneId,
                'estimated_hours'  => $estHours,
                'actual_hours'     => $actHours,
                'due_date'         => $dueDate,
                'created_at'       => $createdAt,
            ];

            $issue = $this->createIssue($data);
            $this->seedHistory($issue);
            $created[$keyNum] = $issue;
        }

        return $created;
    }
}
