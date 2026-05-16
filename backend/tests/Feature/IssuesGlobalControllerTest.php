<?php

namespace Tests\Feature;

use App\Models\Issue;
use App\Models\Project;
use App\Models\User;
use App\Services\AIIssueSearchService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;
use Tests\TestCase;

class IssuesGlobalControllerTest extends TestCase
{
    use RefreshDatabase;

    private function makeProjectWithMember(User $member, string $role = 'admin'): Project
    {
        $project = Project::factory()->create([
            'creator_id' => $member->id,
            'issue_types' => ['Task', 'Bug', 'Story'],
        ]);
        $project->members()->attach($member->id, ['role' => $role]);

        return $project;
    }

    private function makeIssue(Project $project, array $attrs = []): Issue
    {
        return Issue::factory()->create(array_merge([
            'project_id' => $project->id,
            'summary' => 'Test issue',
            'status' => 'open',
            'priority' => 'normal',
            'issue_type' => 'Task',
        ], $attrs));
    }

    public function test_unauthenticated_request_is_rejected_for_index(): void
    {
        $this->getJson('/api/issues')->assertStatus(401);
    }

    public function test_unauthenticated_request_is_rejected_for_summary(): void
    {
        $this->getJson('/api/issues/summary')->assertStatus(401);
    }

    public function test_unauthenticated_request_is_rejected_for_similar(): void
    {
        $this->getJson('/api/issues/ai/similar?project_id=1&text=test')->assertStatus(401);
    }

    public function test_index_returns_issues_across_all_projects(): void
    {
        $user = User::factory()->create();
        $projectA = $this->makeProjectWithMember($user);
        $projectB = $this->makeProjectWithMember($user);

        $issueA = $this->makeIssue($projectA, ['summary' => 'Issue in project A']);
        $issueB = $this->makeIssue($projectB, ['summary' => 'Issue in project B']);

        $this->actingAs($user)
            ->getJson('/api/issues')
            ->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_index_filters_by_project_id(): void
    {
        $user = User::factory()->create();
        $projectA = $this->makeProjectWithMember($user);
        $projectB = $this->makeProjectWithMember($user);

        $issueA = $this->makeIssue($projectA, ['summary' => 'Issue in project A']);
        $issueB = $this->makeIssue($projectB, ['summary' => 'Issue in project B']);

        $this->actingAs($user)
            ->getJson("/api/issues?project_id={$projectA->id}")
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $issueA->id);
    }

    public function test_index_filters_by_status(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProjectWithMember($user);

        $openIssue = $this->makeIssue($project, ['status' => 'open']);
        $closedIssue = $this->makeIssue($project, ['status' => 'closed']);

        $this->actingAs($user)
            ->getJson("/api/issues?status=open")
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $openIssue->id);
    }

    public function test_index_filters_by_priority(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProjectWithMember($user);

        $highIssue = $this->makeIssue($project, ['priority' => 'high']);
        $normalIssue = $this->makeIssue($project, ['priority' => 'normal']);

        $this->actingAs($user)
            ->getJson("/api/issues?priority=high")
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $highIssue->id);
    }

    public function test_index_filters_by_assignee_me(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProjectWithMember($user);

        $assignedIssue = $this->makeIssue($project, ['assignee_id' => $user->id]);
        $unassignedIssue = $this->makeIssue($project, ['assignee_id' => null]);

        $this->actingAs($user)
            ->getJson("/api/issues?assignee=me")
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $assignedIssue->id);
    }

    public function test_index_filters_by_assignee_unassigned(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProjectWithMember($user);

        $assignedIssue = $this->makeIssue($project, ['assignee_id' => $user->id]);
        $unassignedIssue = $this->makeIssue($project, ['assignee_id' => null]);

        $this->actingAs($user)
            ->getJson("/api/issues?assignee=unassigned")
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $unassignedIssue->id);
    }

    public function test_index_filters_by_search(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProjectWithMember($user);

        $matchingIssue = $this->makeIssue($project, ['summary' => 'Login redirects incorrectly']);
        $otherIssue = $this->makeIssue($project, ['summary' => 'Add export feature']);

        $this->actingAs($user)
            ->getJson('/api/issues?search=login')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $matchingIssue->id);
    }

    public function test_index_does_not_return_issues_from_other_projects(): void
    {
        $user = User::factory()->create();
        $outsider = User::factory()->create();

        $userProject = $this->makeProjectWithMember($user);
        $outsiderProject = $this->makeProjectWithMember($outsider);

        $userIssue = $this->makeIssue($userProject, ['summary' => 'User issue']);
        $outsiderIssue = $this->makeIssue($outsiderProject, ['summary' => 'Outsider issue']);

        $this->actingAs($user)
            ->getJson('/api/issues')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $userIssue->id);
    }

    public function test_summary_returns_counts_across_all_projects(): void
    {
        $user = User::factory()->create();
        $projectA = $this->makeProjectWithMember($user);
        $projectB = $this->makeProjectWithMember($user);

        $this->makeIssue($projectA, ['assignee_id' => $user->id, 'status' => 'open', 'priority' => 'high']);
        $this->makeIssue($projectA, ['assignee_id' => $user->id, 'status' => 'open']);
        $this->makeIssue($projectA, ['assignee_id' => null, 'status' => 'open']);
        $this->makeIssue($projectB, ['assignee_id' => null, 'status' => 'open']);

        $this->actingAs($user)
            ->getJson('/api/issues/summary')
            ->assertStatus(200)
            ->assertJsonPath('data.project_name', 'All projects')
            ->assertJsonPath('data.assigned_to_me', 2)
            ->assertJsonPath('data.unassigned', 2)
            ->assertJsonPath('data.high_priority', 1);
    }

    public function test_summary_filters_by_project_id(): void
    {
        $user = User::factory()->create();
        $projectA = $this->makeProjectWithMember($user);
        $projectB = $this->makeProjectWithMember($user);

        $this->makeIssue($projectA, ['assignee_id' => $user->id, 'status' => 'open', 'priority' => 'high']);
        $this->makeIssue($projectB, ['assignee_id' => $user->id, 'status' => 'open']);

        $this->actingAs($user)
            ->getJson("/api/issues/summary?project_id={$projectA->id}")
            ->assertStatus(200)
            ->assertJsonPath('data.project_name', $projectA->name)
            ->assertJsonPath('data.assigned_to_me', 1)
            ->assertJsonPath('data.high_priority', 1);
    }

    public function test_summary_returns_overdue_count(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProjectWithMember($user);

        $this->makeIssue($project, [
            'assignee_id' => $user->id,
            'status' => 'open',
            'due_date' => now()->subDay()->toDateString(),
        ]);
        $this->makeIssue($project, [
            'assignee_id' => $user->id,
            'status' => 'open',
            'due_date' => now()->addDay()->toDateString(),
        ]);

        $this->actingAs($user)
            ->getJson('/api/issues/summary')
            ->assertStatus(200)
            ->assertJsonPath('data.overdue', 1);
    }

    public function test_similar_requires_project_id(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)
            ->getJson('/api/issues/ai/similar?text=test')
            ->assertStatus(422);
    }

    public function test_similar_requires_text(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProjectWithMember($user);

        $this->actingAs($user)
            ->getJson("/api/issues/ai/similar?project_id={$project->id}")
            ->assertStatus(422);
    }

    public function test_non_member_cannot_access_similar(): void
    {
        $owner = User::factory()->create();
        $outsider = User::factory()->create();
        $project = $this->makeProjectWithMember($owner);

        $this->actingAs($outsider)
            ->getJson("/api/issues/ai/similar?project_id={$project->id}&text=test")
            ->assertStatus(403);
    }

    public function test_similar_returns_results(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProjectWithMember($user);
        $issue = $this->makeIssue($project, [
            'summary' => 'Login redirects incorrectly after verification',
            'description' => 'Users are redirected to wrong page after email verification.',
        ]);

        $this->mock(AIIssueSearchService::class, function ($mock) use ($issue, $project) {
            $mockIssue = (object) [
                'id' => $issue->id,
                'project_id' => $issue->project_id,
                'key' => 'SYNC-1',
                'full_key' => 'SYNC-1',
                'summary' => $issue->summary,
                'description' => $issue->description,
                'status' => $issue->status,
                'priority' => $issue->priority,
                'issue_type' => $issue->issue_type,
                'due_date' => $issue->due_date,
                'updated_at' => $issue->updated_at,
                'comments_count' => 0,
                'similarity' => 0.85,
                'project' => $project,
                'assignee' => $issue->assignee,
                'assignee_id' => $issue->assignee_id,
            ];
            $result = new Collection([$mockIssue]);
            $mock->shouldReceive('findSimilar')
                ->andReturn($result);
        });

        $this->actingAs($user)
            ->getJson("/api/issues/ai/similar?project_id={$project->id}&text=login redirect broken")
            ->assertStatus(200)
            ->assertJsonPath('data.0.similarity', 0.85);
    }
}