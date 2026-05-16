<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Issue;
use App\Models\IssueHistory;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardCockpitTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_dashboard(): void
    {
        $this->getJson('/api/dashboard')->assertStatus(401);
    }

    public function test_dashboard_excludes_inaccessible_projects_and_activity(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = $this->projectFor($user, 'Visible Project', 'VIS');
        $hiddenProject = $this->projectFor($otherUser, 'Hidden Project', 'HID');

        $visibleIssue = Issue::factory()->create([
            'project_id' => $project->id,
            'key_number' => 1,
            'assignee_id' => $user->id,
            'creator_id' => $user->id,
            'summary' => 'Visible issue',
        ]);
        $hiddenIssue = Issue::factory()->create([
            'project_id' => $hiddenProject->id,
            'key_number' => 1,
            'assignee_id' => $user->id,
            'creator_id' => $otherUser->id,
            'summary' => 'Hidden issue',
        ]);

        Comment::create(['issue_id' => $visibleIssue->id, 'user_id' => $user->id, 'content' => 'Visible comment']);
        Comment::create(['issue_id' => $hiddenIssue->id, 'user_id' => $otherUser->id, 'content' => 'Hidden comment']);

        $response = $this->actingAs($user)->getJson('/api/dashboard');

        $response->assertOk()
            ->assertJsonPath('data.summary.active_projects', 1)
            ->assertJsonFragment(['project_name' => 'Visible Project'])
            ->assertJsonMissing(['project_name' => 'Hidden Project'])
            ->assertJsonMissing(['summary' => 'Hidden issue']);
    }

    public function test_summary_metrics_include_assigned_open_due_soon_and_overdue_issues(): void
    {
        $user = User::factory()->create();
        $creator = User::factory()->create();
        $project = $this->projectFor($user, 'Metrics Project', 'MET');

        Issue::factory()->create([
            'project_id' => $project->id,
            'assignee_id' => $user->id,
            'creator_id' => $creator->id,
            'status' => 'open',
            'due_date' => now()->toDateString(),
        ]);
        Issue::factory()->create([
            'project_id' => $project->id,
            'assignee_id' => $user->id,
            'creator_id' => $creator->id,
            'status' => 'in_progress',
            'due_date' => now()->addDays(7)->toDateString(),
        ]);
        Issue::factory()->create([
            'project_id' => $project->id,
            'assignee_id' => $user->id,
            'creator_id' => $creator->id,
            'status' => 'open',
            'due_date' => now()->subDay()->toDateString(),
        ]);
        Issue::factory()->create([
            'project_id' => $project->id,
            'assignee_id' => $user->id,
            'creator_id' => $creator->id,
            'status' => 'closed',
            'due_date' => now()->addDay()->toDateString(),
        ]);

        $response = $this->actingAs($user)->getJson('/api/dashboard');

        $response->assertOk()
            ->assertJsonPath('data.summary.active_projects', 1)
            ->assertJsonPath('data.summary.my_open_issues', 3)
            ->assertJsonPath('data.summary.due_soon', 2)
            ->assertJsonPath('data.summary.overdue', 1);
    }

    public function test_my_work_and_upcoming_include_assigned_issues_only(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = $this->projectFor($user, 'Work Project', 'WRK');

        Issue::factory()->create([
            'project_id' => $project->id,
            'key_number' => 1,
            'assignee_id' => $user->id,
            'creator_id' => $otherUser->id,
            'summary' => 'Assigned to me',
            'status' => 'open',
            'priority' => 'high',
            'due_date' => now()->addDays(2)->toDateString(),
        ]);
        Issue::factory()->create([
            'project_id' => $project->id,
            'key_number' => 2,
            'assignee_id' => $otherUser->id,
            'creator_id' => $user->id,
            'summary' => 'Created by me only',
            'status' => 'open',
            'due_date' => now()->addDay()->toDateString(),
        ]);

        $response = $this->actingAs($user)->getJson('/api/dashboard');

        $response->assertOk()
            ->assertJsonPath('data.my_work.0.key', 'WRK-1')
            ->assertJsonPath('data.my_work.0.summary', 'Assigned to me')
            ->assertJsonPath('data.my_work.0.priority', 'high')
            ->assertJsonPath('data.my_work.0.project_name', 'Work Project')
            ->assertJsonPath('data.upcoming.0.key', 'WRK-1')
            ->assertJsonMissing(['summary' => 'Created by me only']);
    }

    public function test_project_health_progress_and_empty_project_progress(): void
    {
        $user = User::factory()->create();
        $creator = User::factory()->create();
        $project = $this->projectFor($user, 'Health Project', 'HLT');
        $emptyProject = $this->projectFor($user, 'Empty Project', 'EMP');

        Issue::factory()->create([
            'project_id' => $project->id,
            'assignee_id' => $user->id,
            'creator_id' => $creator->id,
            'status' => 'closed',
        ]);
        Issue::factory()->create([
            'project_id' => $project->id,
            'assignee_id' => $user->id,
            'creator_id' => $creator->id,
            'status' => 'open',
            'due_date' => now()->subDay()->toDateString(),
        ]);

        $response = $this->actingAs($user)->getJson('/api/dashboard');

        $response->assertOk();
        $health = collect($response->json('data.project_health'));

        $this->assertSame(50, $health->firstWhere('id', $project->id)['progress']);
        $this->assertSame(2, $health->firstWhere('id', $project->id)['issues_count']);
        $this->assertSame(1, $health->firstWhere('id', $project->id)['overdue_issues_count']);
        $this->assertSame(0, $health->firstWhere('id', $emptyProject->id)['progress']);
    }

    public function test_recent_activity_includes_comments_and_issue_history(): void
    {
        $user = User::factory()->create(['name' => 'Dashboard User']);
        $project = $this->projectFor($user, 'Activity Project', 'ACT');
        $issue = Issue::factory()->create([
            'project_id' => $project->id,
            'key_number' => 9,
            'assignee_id' => $user->id,
            'creator_id' => $user->id,
            'summary' => 'Activity issue',
        ]);

        Comment::create(['issue_id' => $issue->id, 'user_id' => $user->id, 'content' => 'Activity comment']);
        IssueHistory::create([
            'issue_id' => $issue->id,
            'user_id' => $user->id,
            'field' => 'status',
            'old_value' => 'open',
            'new_value' => 'in_progress',
        ]);

        $response = $this->actingAs($user)->getJson('/api/dashboard');

        $response->assertOk()
            ->assertJsonFragment([
                'type' => 'comment',
                'actor' => 'Dashboard User',
                'issue_key' => 'ACT-9',
                'project_name' => 'Activity Project',
            ])
            ->assertJsonFragment([
                'type' => 'history',
                'actor' => 'Dashboard User',
                'issue_key' => 'ACT-9',
                'field' => 'status',
                'old_value' => 'open',
                'new_value' => 'in_progress',
            ]);
    }

    private function projectFor(User $user, string $name, string $key): Project
    {
        $project = Project::factory()->create([
            'creator_id' => $user->id,
            'name' => $name,
            'key' => $key,
        ]);

        $project->members()->attach($user->id, ['role' => 'admin']);

        return $project;
    }
}
