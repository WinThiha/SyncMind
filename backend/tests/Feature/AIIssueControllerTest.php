<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use App\Services\AIIssueSearchService;
use App\Services\AIIssueSuggestionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;
use Tests\TestCase;

class AIIssueControllerTest extends TestCase
{
    use RefreshDatabase;

    private function makeProject(User $member, string $role = 'admin'): Project
    {
        $project = Project::factory()->create([
            'creator_id' => $member->id,
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
        $owner = User::factory()->create();
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

    public function test_prompt_or_summary_is_required(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProject($user);

        $this->mock(AIIssueSuggestionService::class, function ($mock) {
            $mock->shouldNotReceive('suggest');
        });

        $this->actingAs($user)
            ->postJson("/api/projects/{$project->id}/ai/suggest-issue", [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['prompt', 'summary']);
    }

    public function test_returns_correct_json_structure(): void
    {
        $user = User::factory()->create(['position' => 'Backend Engineer']);
        $project = $this->makeProject($user);

        $fakeSuggestion = [
            'summary' => 'Fix authentication flow',
            'description' => 'An AI-generated description.',
            'issue_type' => 'Bug',
            'priority' => 'high',
            'estimated_hours' => 4.0,
            'due_date' => '2026-05-24',
            'milestone_id' => null,
            'assignee_suggestions' => [
                ['assignee_id' => $user->id, 'reason' => 'Backend specialist familiar with auth'],
            ],
            'open_questions' => [],
        ];

        $this->mock(AIIssueSuggestionService::class, function ($mock) use ($fakeSuggestion) {
            $mock->shouldReceive('suggest')->once()->andReturn($fakeSuggestion);
        });

        $this->actingAs($user)
            ->postJson("/api/projects/{$project->id}/ai/suggest-issue", [
                'prompt' => 'Fix the authentication flow',
                'output_locale' => 'en',
                'current_fields' => ['summary' => ''],
            ])
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['summary', 'description', 'issue_type', 'priority', 'estimated_hours', 'due_date', 'milestone_id', 'assignee_suggestions', 'open_questions'],
            ])
            ->assertJsonPath('data.summary', 'Fix authentication flow')
            ->assertJsonPath('data.issue_type', 'Bug')
            ->assertJsonPath('data.priority', 'high')
            ->assertJsonPath('data.assignee_suggestions.0.assignee_id', $user->id)
            ->assertJsonPath('data.assignee_suggestions.0.reason', 'Backend specialist familiar with auth');
    }

    public function test_prompt_request_passes_output_locale_and_current_fields_to_service(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProject($user);

        $this->mock(AIIssueSuggestionService::class, function ($mock) use ($project, $user) {
            $mock->shouldReceive('suggest')
                ->once()
                ->withArgs(function ($actualProject, string $prompt, $actor, ?string $outputLocale, array $currentFields) use ($project, $user) {
                    return $actualProject->is($project)
                        && $prompt === 'Copied customer chat about checkout failure'
                        && $actor->is($user)
                        && $outputLocale === 'vi-VN'
                        && ($currentFields['summary'] ?? null) === 'Existing summary';
                })
                ->andReturn([
                    'summary' => 'Checkout failure',
                    'description' => 'Generated',
                    'issue_type' => 'Bug',
                    'priority' => 'high',
                    'estimated_hours' => 3.0,
                    'due_date' => null,
                    'milestone_id' => null,
                    'assignee_suggestions' => [],
                    'open_questions' => [],
                ]);
        });

        $this->actingAs($user)
            ->postJson("/api/projects/{$project->id}/ai/suggest-issue", [
                'prompt' => 'Copied customer chat about checkout failure',
                'output_locale' => 'vi-VN',
                'current_fields' => ['summary' => 'Existing summary'],
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.summary', 'Checkout failure');
    }

    public function test_normal_member_can_access_ai_suggest(): void
    {
        $owner = User::factory()->create();
        $project = $this->makeProject($owner);
        $member = User::factory()->create();
        $project->members()->attach($member->id, ['role' => 'normal']);

        $this->mock(AIIssueSuggestionService::class, function ($mock) {
            $mock->shouldReceive('suggest')->once()->andReturn([
                'summary' => null,
                'description' => null,
                'issue_type' => null,
                'priority' => null,
                'estimated_hours' => null,
                'due_date' => null,
                'milestone_id' => null,
                'assignee_suggestions' => [],
                'open_questions' => [],
            ]);
        });

        $this->actingAs($member)
            ->postJson("/api/projects/{$project->id}/ai/suggest-issue", [
                'summary' => 'Add dark mode toggle',
            ])
            ->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_returns_empty_assignee_suggestions_when_ai_returns_no_suitable_assignees(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProject($user);

        $this->mock(AIIssueSuggestionService::class, function ($mock) {
            $mock->shouldReceive('suggest')->once()->andReturn([
                'summary' => 'Refactor widget system',
                'description' => 'Something generic.',
                'issue_type' => 'Task',
                'priority' => 'normal',
                'estimated_hours' => 2.0,
                'due_date' => null,
                'milestone_id' => null,
                'assignee_suggestions' => [],
                'open_questions' => [],
            ]);
        });

        $this->actingAs($user)
            ->postJson("/api/projects/{$project->id}/ai/suggest-issue", [
                'summary' => 'Refactor the widget system',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.assignee_suggestions', []);
    }

    public function test_assignee_suggestions_filter_out_invalid_assignee_ids(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProject($user);
        $userId = $user->id;

        $this->mock(AIIssueSuggestionService::class, function ($mock) use ($userId) {
            $mock->shouldReceive('suggest')->once()->andReturn([
                'summary' => 'Fix bug',
                'description' => 'Fix the thing.',
                'issue_type' => 'Bug',
                'priority' => 'high',
                'estimated_hours' => 1.0,
                'due_date' => null,
                'milestone_id' => null,
                'assignee_suggestions' => [
                    ['assignee_id' => $userId, 'reason' => 'Valid member'],
                ],
                'open_questions' => [],
            ]);
        });

        $this->actingAs($user)
            ->postJson("/api/projects/{$project->id}/ai/suggest-issue", [
                'summary' => 'Fix the bug',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.assignee_suggestions', [
                ['assignee_id' => $userId, 'reason' => 'Valid member'],
            ]);
    }

    public function test_assignee_suggestions_are_capped_at_three_entries(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProject($user);

        $this->mock(AIIssueSuggestionService::class, function ($mock) use ($user) {
            $mock->shouldReceive('suggest')->once()->andReturn([
                'summary' => 'Big epic story',
                'description' => 'Multi-person issue.',
                'issue_type' => 'Story',
                'priority' => 'normal',
                'estimated_hours' => 8.0,
                'due_date' => null,
                'milestone_id' => null,
                'assignee_suggestions' => [
                    ['assignee_id' => $user->id, 'reason' => 'First'],
                    ['assignee_id' => $user->id, 'reason' => 'Second'],
                    ['assignee_id' => $user->id, 'reason' => 'Third'],
                ],
                'open_questions' => [],
            ]);
        });

        $this->actingAs($user)
            ->postJson("/api/projects/{$project->id}/ai/suggest-issue", [
                'summary' => 'Big epic story',
            ])
            ->assertStatus(200)
            ->assertJsonCount(3, 'data.assignee_suggestions');
    }

    public function test_member_can_access_similar_issues_and_receives_key_field(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProject($user);

        $this->mock(AIIssueSearchService::class, function ($mock) use ($project) {
            $mock->shouldReceive('findSimilar')->once()->andReturn(new Collection([
                (object) [
                    'id' => 101,
                    'project_id' => $project->id,
                    'key_number' => 7,
                    'key' => "{$project->key}-7",
                    'summary' => 'Fix login regression',
                    'status' => 'open',
                    'priority' => 'high',
                    'similarity' => 0.91,
                ],
            ]));
        });

        $this->actingAs($user)
            ->getJson("/api/projects/{$project->id}/ai/similar-issues?text=login bug")
            ->assertStatus(200)
            ->assertJsonPath('data.0.key', "{$project->key}-7")
            ->assertJsonPath('data.0.key_number', 7);
    }

    public function test_similar_issues_response_includes_non_empty_key_for_each_result(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProject($user);

        $this->mock(AIIssueSearchService::class, function ($mock) use ($project) {
            $mock->shouldReceive('findSimilar')->once()->andReturn(new Collection([
                (object) [
                    'id' => 11,
                    'project_id' => $project->id,
                    'key_number' => 1,
                    'key' => "{$project->key}-1",
                    'summary' => 'Issue one',
                    'status' => 'open',
                    'priority' => 'normal',
                    'similarity' => 0.77,
                ],
                (object) [
                    'id' => 12,
                    'project_id' => $project->id,
                    'key_number' => 2,
                    'key' => "{$project->key}-2",
                    'summary' => 'Issue two',
                    'status' => 'in_progress',
                    'priority' => 'low',
                    'similarity' => 0.73,
                ],
            ]));
        });

        $response = $this->actingAs($user)
            ->getJson("/api/projects/{$project->id}/ai/similar-issues?text=duplicate search")
            ->assertStatus(200)
            ->json('data');

        $this->assertIsArray($response);
        foreach ($response as $row) {
            $this->assertArrayHasKey('key', $row);
            $this->assertNotNull($row['key']);
            $this->assertNotSame('', trim((string) $row['key']));
        }
    }
}
