<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use App\Services\AIWikiService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AIWikiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $member;

    private User $outsider;

    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
        $this->member = User::factory()->create();
        $this->outsider = User::factory()->create();

        $this->project = Project::factory()->create(['creator_id' => $this->admin->id]);
        $this->project->members()->attach($this->admin->id, ['role' => 'admin']);
        $this->project->members()->attach($this->member->id, ['role' => 'member']);
    }

    // ── chat ───────────────────────────────────────────────────────────────

    public function test_member_can_use_wiki_chat(): void
    {
        $this->mock(AIWikiService::class, function ($mock) {
            $mock->shouldReceive('chat')->once()->andReturn('Here is the answer.');
        });

        $this->actingAs($this->member)
            ->postJson("/api/projects/{$this->project->id}/wiki/ai/chat", [
                'message' => 'How do we handle auth?',
                'history' => [],
            ])
            ->assertStatus(200)
            ->assertJsonPath('answer', 'Here is the answer.');
    }

    public function test_outsider_cannot_use_wiki_chat(): void
    {
        $this->actingAs($this->outsider)
            ->postJson("/api/projects/{$this->project->id}/wiki/ai/chat", [
                'message' => 'Hello',
            ])
            ->assertStatus(403);
    }

    public function test_chat_validates_message_max_length(): void
    {
        $this->actingAs($this->member)
            ->postJson("/api/projects/{$this->project->id}/wiki/ai/chat", [
                'message' => str_repeat('a', 1001),
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['message']);
    }

    public function test_chat_message_is_required(): void
    {
        $this->actingAs($this->member)
            ->postJson("/api/projects/{$this->project->id}/wiki/ai/chat", [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['message']);
    }

    // ── draft ──────────────────────────────────────────────────────────────

    public function test_admin_can_use_wiki_draft(): void
    {
        $this->mock(AIWikiService::class, function ($mock) {
            $mock->shouldReceive('draft')->once()->andReturn('# Draft Page\n\nContent here.');
        });

        $this->actingAs($this->admin)
            ->postJson("/api/projects/{$this->project->id}/wiki/ai/draft", [
                'prompt' => 'Write a page about our auth setup',
            ])
            ->assertStatus(200)
            ->assertJsonPath('content', '# Draft Page\n\nContent here.');
    }

    public function test_member_cannot_use_wiki_draft(): void
    {
        $this->actingAs($this->member)
            ->postJson("/api/projects/{$this->project->id}/wiki/ai/draft", [
                'prompt' => 'Write something',
            ])
            ->assertStatus(403);
    }

    public function test_draft_validates_prompt_max_length(): void
    {
        $this->actingAs($this->admin)
            ->postJson("/api/projects/{$this->project->id}/wiki/ai/draft", [
                'prompt' => str_repeat('a', 501),
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['prompt']);
    }
}
