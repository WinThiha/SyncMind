<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use App\Models\WikiPage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WikiPageTest extends TestCase
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

    // ── index ──────────────────────────────────────────────────────────────

    public function test_member_can_list_wiki_pages(): void
    {
        WikiPage::factory()->count(3)->create(['project_id' => $this->project->id, 'author_id' => $this->admin->id]);

        $this->actingAs($this->member)
            ->getJson("/api/projects/{$this->project->id}/wiki")
            ->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_outsider_cannot_list_wiki_pages(): void
    {
        $this->actingAs($this->outsider)
            ->getJson("/api/projects/{$this->project->id}/wiki")
            ->assertStatus(403);
    }

    // ── store ──────────────────────────────────────────────────────────────

    public function test_admin_can_create_wiki_page(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/projects/{$this->project->id}/wiki", [
                'title' => 'API Conventions',
                'content' => '## Overview\nThis page describes our API conventions.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'API Conventions');

        $this->assertDatabaseHas('wiki_pages', [
            'project_id' => $this->project->id,
            'title' => 'API Conventions',
            'author_id' => $this->admin->id,
        ]);
    }

    public function test_member_cannot_create_wiki_page(): void
    {
        $this->actingAs($this->member)
            ->postJson("/api/projects/{$this->project->id}/wiki", ['title' => 'My Page'])
            ->assertStatus(403);
    }

    public function test_title_is_required_on_create(): void
    {
        $this->actingAs($this->admin)
            ->postJson("/api/projects/{$this->project->id}/wiki", ['content' => 'Some content'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    }

    // ── show ───────────────────────────────────────────────────────────────

    public function test_member_can_view_wiki_page_with_content(): void
    {
        $page = WikiPage::factory()->create([
            'project_id' => $this->project->id,
            'author_id' => $this->admin->id,
            'content' => 'Hello world',
        ]);

        $this->actingAs($this->member)
            ->getJson("/api/projects/{$this->project->id}/wiki/{$page->id}")
            ->assertStatus(200)
            ->assertJsonPath('data.content', 'Hello world');
    }

    public function test_outsider_cannot_view_wiki_page(): void
    {
        $page = WikiPage::factory()->create([
            'project_id' => $this->project->id,
            'author_id' => $this->admin->id,
        ]);

        $this->actingAs($this->outsider)
            ->getJson("/api/projects/{$this->project->id}/wiki/{$page->id}")
            ->assertStatus(403);
    }

    // ── update ─────────────────────────────────────────────────────────────

    public function test_admin_can_update_wiki_page(): void
    {
        $page = WikiPage::factory()->create([
            'project_id' => $this->project->id,
            'author_id' => $this->admin->id,
        ]);

        $this->actingAs($this->admin)
            ->patchJson("/api/projects/{$this->project->id}/wiki/{$page->id}", [
                'title' => 'Updated Title',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.title', 'Updated Title');

        $this->assertDatabaseHas('wiki_pages', [
            'id' => $page->id,
            'last_editor_id' => $this->admin->id,
        ]);
    }

    public function test_member_cannot_update_wiki_page(): void
    {
        $page = WikiPage::factory()->create([
            'project_id' => $this->project->id,
            'author_id' => $this->admin->id,
        ]);

        $this->actingAs($this->member)
            ->patchJson("/api/projects/{$this->project->id}/wiki/{$page->id}", ['title' => 'Hacked'])
            ->assertStatus(403);
    }

    // ── destroy ────────────────────────────────────────────────────────────

    public function test_admin_can_delete_wiki_page(): void
    {
        $page = WikiPage::factory()->create([
            'project_id' => $this->project->id,
            'author_id' => $this->admin->id,
        ]);

        $this->actingAs($this->admin)
            ->deleteJson("/api/projects/{$this->project->id}/wiki/{$page->id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('wiki_pages', ['id' => $page->id]);
    }

    public function test_member_cannot_delete_wiki_page(): void
    {
        $page = WikiPage::factory()->create([
            'project_id' => $this->project->id,
            'author_id' => $this->admin->id,
        ]);

        $this->actingAs($this->member)
            ->deleteJson("/api/projects/{$this->project->id}/wiki/{$page->id}")
            ->assertStatus(403);
    }
}
