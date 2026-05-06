<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Issue;
use App\Models\Project;
use App\Models\User;
use App\Services\AIThreadSummarizationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class AIThreadSummarizationTest extends TestCase
{
    use RefreshDatabase;

    private function makeProject(User $member, string $role = 'admin'): Project
    {
        $project = Project::factory()->create([
            'creator_id' => $member->id,
            'key' => 'PROJ',
        ]);
        $project->members()->attach($member->id, ['role' => $role]);

        return $project;
    }

    public function test_can_summarize_issue_thread(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProject($user);
        $issue = Issue::factory()->create([
            'project_id' => $project->id,
            'key_number' => 1,
            'summary' => 'Test issue',
        ]);

        $fakeSummary = [
            'summary' => 'This is a test summary.',
            'decisions' => ['Decision 1'],
            'consensus' => 'Agreement reached',
            'action_items' => ['Task 1'],
        ];

        $this->mock(AIThreadSummarizationService::class, function ($mock) use ($fakeSummary) {
            $mock->shouldReceive('summarize')->once()->andReturn($fakeSummary);
        });

        $this->actingAs($user)
            ->postJson("/api/projects/{$project->id}/issues/PROJ-1/ai/summarize")
            ->assertStatus(200)
            ->assertJson([
                'data' => $fakeSummary,
                'cached' => false,
            ]);

        $this->assertTrue(Cache::has("issue_{$issue->id}_summary"));
    }

    public function test_uses_cached_summary(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProject($user);
        $issue = Issue::factory()->create([
            'project_id' => $project->id,
            'key_number' => 1,
        ]);

        $cachedData = ['summary' => 'Cached summary'];
        Cache::put("issue_{$issue->id}_summary", $cachedData);

        $this->mock(AIThreadSummarizationService::class, function ($mock) {
            $mock->shouldNotReceive('summarize');
        });

        $this->actingAs($user)
            ->postJson("/api/projects/{$project->id}/issues/PROJ-1/ai/summarize")
            ->assertStatus(200)
            ->assertJson([
                'data' => $cachedData,
                'cached' => true,
            ]);
    }

    public function test_cache_is_invalidated_on_new_comment(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProject($user);
        $issue = Issue::factory()->create(['project_id' => $project->id]);

        Cache::put("issue_{$issue->id}_summary", ['data' => 'old']);

        Comment::create([
            'issue_id' => $issue->id,
            'user_id' => $user->id,
            'content' => 'New comment',
        ]);

        $this->assertFalse(Cache::has("issue_{$issue->id}_summary"));
    }

    public function test_cache_is_invalidated_on_issue_update(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProject($user);
        $issue = Issue::factory()->create(['project_id' => $project->id]);

        Cache::put("issue_{$issue->id}_summary", ['data' => 'old']);

        $issue->update(['priority' => 'high']);

        $this->assertFalse(Cache::has("issue_{$issue->id}_summary"));
    }
}
