<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use App\Services\AIIssueSuggestionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AIIssueControllerTest extends TestCase
{
    use RefreshDatabase;

    private function makeProject(User $member, string $role = 'admin'): Project
    {
        $project = Project::factory()->create([
            'creator_id'  => $member->id,
            'issue_types' => ['Task', 'Bug', 'Story'],
        ]);
        $project->members()->attach($member->id, ['role' => $role]);
        return $project;
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $project = Project::factory()->create();

        $this->postJson("/api/projects/{$project->id}/ai/suggest-issue", [
            'summary' => 'Fix login bug',
        ])->assertStatus(401);
    }

    public function test_non_member_cannot_access_ai_suggest(): void
    {
        $owner   = User::factory()->create();
        $project = $this->makeProject($owner);
        $outsider = User::factory()->create();

        $this->mock(AIIssueSuggestionService::class, function ($mock) {
            $mock->shouldNotReceive('suggest');
        });

        $this->actingAs($outsider)
            ->postJson("/api/projects/{$project->id}/ai/suggest-issue", [
                'summary' => 'Fix login bug',
            ])->assertStatus(403);
    }

    public function test_summary_is_required(): void
    {
        $user    = User::factory()->create();
        $project = $this->makeProject($user);

        $this->mock(AIIssueSuggestionService::class, function ($mock) {
            $mock->shouldNotReceive('suggest');
        });

        $this->actingAs($user)
            ->postJson("/api/projects/{$project->id}/ai/suggest-issue", [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['summary']);
    }

    public function test_returns_correct_json_structure(): void
    {
        $user    = User::factory()->create(['position' => 'Backend Engineer']);
        $project = $this->makeProject($user);

        $fakeSuggestion = [
            'description'     => 'An AI-generated description.',
            'issue_type'      => 'Bug',
            'priority'        => 'high',
            'estimated_hours' => 4.0,
            'assignee_id'     => $user->id,
        ];

        $this->mock(AIIssueSuggestionService::class, function ($mock) use ($fakeSuggestion) {
            $mock->shouldReceive('suggest')->once()->andReturn($fakeSuggestion);
        });

        $this->actingAs($user)
            ->postJson("/api/projects/{$project->id}/ai/suggest-issue", [
                'summary' => 'Fix the authentication flow',
            ])
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['description', 'issue_type', 'priority', 'estimated_hours', 'assignee_id'],
            ])
            ->assertJsonPath('data.issue_type', 'Bug')
            ->assertJsonPath('data.priority', 'high')
            ->assertJsonPath('data.assignee_id', $user->id);
    }

    public function test_normal_member_can_access_ai_suggest(): void
    {
        $owner   = User::factory()->create();
        $project = $this->makeProject($owner);
        $member  = User::factory()->create();
        $project->members()->attach($member->id, ['role' => 'normal']);

        $this->mock(AIIssueSuggestionService::class, function ($mock) {
            $mock->shouldReceive('suggest')->once()->andReturn([
                'description'     => null,
                'issue_type'      => null,
                'priority'        => null,
                'estimated_hours' => null,
                'assignee_id'     => null,
            ]);
        });

        $this->actingAs($member)
            ->postJson("/api/projects/{$project->id}/ai/suggest-issue", [
                'summary' => 'Add dark mode toggle',
            ])
            ->assertStatus(200)
            ->assertJsonStructure(['data']);
    }
}
