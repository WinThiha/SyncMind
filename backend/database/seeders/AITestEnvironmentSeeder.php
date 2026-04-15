<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Issue;
use App\Models\IssueHistory;
use App\Models\Project;
use App\Models\ProjectIssueCounter;
use App\Models\ProjectMember;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AITestEnvironmentSeeder extends Seeder
{
    public function run(): void
    {
        $acmeProject = Project::where('key', 'ACME')->first();

        if ($acmeProject) {
            $issueIds = $acmeProject->issues()->pluck('id');
            Comment::whereIn('issue_id', $issueIds)->delete();
            IssueHistory::whereIn('issue_id', $issueIds)->delete();
            $acmeProject->issues()->delete();
            $acmeProject->members()->detach();
            $acmeProject->delete();
        }

        User::whereIn('email', ['alice@example.com', 'bob@example.com', 'charlie@example.com'])->delete();

        $personas = [
            'alice' => [
                'name' => 'Alice Anderson',
                'email' => 'alice@example.com',
                'password' => Hash::make('password'),
                'position' => 'Admin / Project Manager',
            ],
            'bob' => [
                'name' => 'Bob Barton',
                'email' => 'bob@example.com',
                'password' => Hash::make('password'),
                'position' => 'Frontend Developer',
            ],
            'charlie' => [
                'name' => 'Charlie Chen',
                'email' => 'charlie@example.com',
                'password' => Hash::make('password'),
                'position' => 'Backend Developer',
            ],
        ];

        $users = [];
        foreach ($personas as $key => $persona) {
            $users[$key] = User::create($persona);
        }

        $project = Project::create([
            'name' => 'Acme SaaS MVP',
            'key' => 'ACME',
            'icon' => 'rocket',
            'issue_types' => ['story', 'task', 'bug'],
            'categories' => ['frontend', 'backend', 'devops'],
            'milestones' => ['M1 - Foundation', 'M2 - Core Features', 'M3 - Polish'],
            'versions' => ['v0.1.0', 'v0.2.0'],
            'creator_id' => $users['alice']->id,
        ]);

        ProjectIssueCounter::create([
            'project_id' => $project->id,
            'last_number' => 7,
        ]);

        ProjectMember::create([
            'project_id' => $project->id,
            'user_id' => $users['alice']->id,
            'role' => 'admin',
        ]);

        ProjectMember::create([
            'project_id' => $project->id,
            'user_id' => $users['bob']->id,
            'role' => 'member',
        ]);

        ProjectMember::create([
            'project_id' => $project->id,
            'user_id' => $users['charlie']->id,
            'role' => 'member',
        ]);

        $issues = [
            [
                'project_id' => $project->id,
                'key_number' => 1,
                'summary' => 'Setup Laravel Backend API',
                'description' => 'Initialize the Laravel backend with authentication, project management endpoints, and database migrations for issues, comments, and history tracking.',
                'status' => 'closed',
                'priority' => 'high',
                'issue_type' => 'task',
                'assignee_id' => $users['charlie']->id,
                'creator_id' => $users['alice']->id,
                'category' => 'backend',
                'milestone' => 'M1 - Foundation',
                'version' => 'v0.1.0',
                'created_at' => '2026-03-01 09:00:00',
            ],
            [
                'project_id' => $project->id,
                'key_number' => 2,
                'summary' => 'Create React Next.js Frontend Skeleton',
                'description' => 'Scaffold the Next.js 16 frontend with TypeScript, React Compiler, and Tailwind CSS. Setup routing with App Router and implement basic layout components.',
                'status' => 'closed',
                'priority' => 'high',
                'issue_type' => 'task',
                'assignee_id' => $users['bob']->id,
                'creator_id' => $users['alice']->id,
                'category' => 'frontend',
                'milestone' => 'M1 - Foundation',
                'version' => 'v0.1.0',
                'created_at' => '2026-03-01 10:00:00',
            ],
            [
                'project_id' => $project->id,
                'key_number' => 3,
                'summary' => 'Connect Frontend to Backend API',
                'description' => 'Integrate frontend with backend API endpoints. Implement authentication flow with Laravel Sanctum, CORS configuration, and axios singleton with credential support.',
                'status' => 'closed',
                'priority' => 'high',
                'issue_type' => 'task',
                'assignee_id' => $users['bob']->id,
                'creator_id' => $users['alice']->id,
                'category' => 'frontend',
                'milestone' => 'M1 - Foundation',
                'version' => 'v0.1.0',
                'created_at' => '2026-03-03 09:00:00',
            ],
            [
                'project_id' => $project->id,
                'key_number' => 4,
                'summary' => 'Implement Issue List View',
                'description' => 'Create the main issue list view with filtering by status, priority, and assignee. Add drag-and-drop for changing status. Include search functionality.',
                'status' => 'closed',
                'priority' => 'high',
                'issue_type' => 'story',
                'assignee_id' => $users['bob']->id,
                'creator_id' => $users['alice']->id,
                'category' => 'frontend',
                'milestone' => 'M2 - Core Features',
                'version' => 'v0.1.0',
                'created_at' => '2026-03-05 09:00:00',
            ],
            [
                'project_id' => $project->id,
                'key_number' => 5,
                'summary' => 'Add Comment Threading',
                'description' => 'Implement nested comment threads on issues. Support @mentions with autocomplete. Add real-time updates via polling for now.',
                'status' => 'in_progress',
                'priority' => 'normal',
                'issue_type' => 'story',
                'assignee_id' => $users['charlie']->id,
                'creator_id' => $users['bob']->id,
                'category' => 'backend',
                'milestone' => 'M2 - Core Features',
                'version' => 'v0.2.0',
                'created_at' => '2026-03-08 14:30:00',
            ],
            [
                'project_id' => $project->id,
                'key_number' => 6,
                'summary' => 'Fix: Issue Status Not Persisting',
                'description' => 'Users report that changing issue status sometimes reverts after page refresh. Investigating race condition in concurrent update handling.',
                'status' => 'open',
                'priority' => 'high',
                'issue_type' => 'bug',
                'assignee_id' => $users['charlie']->id,
                'creator_id' => $users['bob']->id,
                'category' => 'backend',
                'milestone' => 'M2 - Core Features',
                'version' => 'v0.2.0',
                'created_at' => '2026-03-10 11:15:00',
            ],
            [
                'project_id' => $project->id,
                'key_number' => 7,
                'summary' => 'Implement AI Issue Auto-Assignment',
                'description' => 'Use AI to analyze issue descriptions and suggest or automatically assign to the most appropriate team member based on expertise and current workload.',
                'status' => 'open',
                'priority' => 'normal',
                'issue_type' => 'story',
                'assignee_id' => null,
                'creator_id' => $users['alice']->id,
                'category' => 'frontend',
                'milestone' => 'M3 - Polish',
                'version' => 'v0.2.0',
                'created_at' => '2026-03-12 16:00:00',
            ],
        ];

        $createdIssues = [];

        foreach ($issues as $issueData) {
            $createdAt = $issueData['created_at'];
            unset($issueData['created_at']);

            $issue = Issue::create($issueData);
            $issue->created_at = $createdAt;
            $issue->save();

            $createdIssues[$issueData['key_number']] = $issue;

            IssueHistory::create([
                'issue_id' => $issue->id,
                'user_id' => $issueData['creator_id'],
                'field' => 'status',
                'old_value' => null,
                'new_value' => 'open',
                'created_at' => $createdAt,
            ]);

            if ($issueData['status'] === 'closed') {
                IssueHistory::create([
                    'issue_id' => $issue->id,
                    'user_id' => $issueData['assignee_id'],
                    'field' => 'status',
                    'old_value' => 'open',
                    'new_value' => 'in_progress',
                    'created_at' => date('Y-m-d H:i:s', strtotime($createdAt) + 86400),
                ]);

                IssueHistory::create([
                    'issue_id' => $issue->id,
                    'user_id' => $issueData['assignee_id'],
                    'field' => 'status',
                    'old_value' => 'in_progress',
                    'new_value' => 'closed',
                    'created_at' => date('Y-m-d H:i:s', strtotime($createdAt) + 172800),
                ]);
            }
        }

        Comment::create([
            'issue_id' => $createdIssues[1]->id,
            'user_id' => $users['charlie']->id,
            'content' => 'Laravel backend initialized with Sanctum for authentication. All migrations running successfully.',
            'created_at' => '2026-03-01 17:00:00',
        ]);

        Comment::create([
            'issue_id' => $createdIssues[2]->id,
            'user_id' => $users['bob']->id,
            'content' => 'Next.js skeleton created with TypeScript and Tailwind configured. App Router structure in place.',
            'created_at' => '2026-03-01 18:30:00',
        ]);

        Comment::create([
            'issue_id' => $createdIssues[3]->id,
            'user_id' => $users['bob']->id,
            'content' => 'Connected frontend to backend API. Authentication flow working with Sanctum cookies.',
            'created_at' => '2026-03-03 16:00:00',
        ]);

        Comment::create([
            'issue_id' => $createdIssues[3]->id,
            'user_id' => $users['alice']->id,
            'content' => 'Great work! Please add CORS headers configuration for the API endpoints.',
            'created_at' => '2026-03-03 16:30:00',
        ]);

        Comment::create([
            'issue_id' => $createdIssues[4]->id,
            'user_id' => $users['bob']->id,
            'content' => 'Issue list view complete with filtering and search. Drag-and-drop status changes working.',
            'created_at' => '2026-03-05 18:00:00',
        ]);

        Comment::create([
            'issue_id' => $createdIssues[5]->id,
            'user_id' => $users['charlie']->id,
            'content' => 'Starting work on nested comment threading. Will support up to 3 levels of nesting.',
            'created_at' => '2026-03-08 15:00:00',
        ]);

        Comment::create([
            'issue_id' => $createdIssues[5]->id,
            'user_id' => $users['bob']->id,
            'content' => '@charlie Will the @mention autocomplete work for all project members?',
            'created_at' => '2026-03-08 15:30:00',
        ]);

        Comment::create([
            'issue_id' => $createdIssues[5]->id,
            'user_id' => $users['charlie']->id,
            'content' => '@bob Yes, it will query the project members endpoint and show suggestions as you type.',
            'created_at' => '2026-03-08 16:00:00',
        ]);

        Comment::create([
            'issue_id' => $createdIssues[6]->id,
            'user_id' => $users['charlie']->id,
            'content' => 'I can reproduce this. Looks like there\'s a race condition when updates happen in quick succession. Investigating the controller logic.',
            'created_at' => '2026-03-10 14:00:00',
        ]);

        Comment::create([
            'issue_id' => $createdIssues[6]->id,
            'user_id' => $users['bob']->id,
            'content' => 'This is happening more frequently now. Users are losing their status changes.',
            'created_at' => '2026-03-10 14:30:00',
        ]);

        Comment::create([
            'issue_id' => $createdIssues[6]->id,
            'user_id' => $users['charlie']->id,
            'content' => 'Found the issue - the update query wasn\'t using row-level locking. Adding pessimistic locking now.',
            'created_at' => '2026-03-10 17:00:00',
        ]);

        Comment::create([
            'issue_id' => $createdIssues[7]->id,
            'user_id' => $users['alice']->id,
            'content' => 'This is a key feature for improving team productivity. Looking to integrate with an AI service for natural language analysis.',
            'created_at' => '2026-03-12 16:30:00',
        ]);
    }
}
